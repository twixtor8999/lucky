'use server';

import { db, bets, transactions, ledgerEntries, wallets, results, markets } from '@zenvora/shared/db';
import { eq, and, gte } from 'drizzle-orm';
import { PlaceBetRequest, BetTypeCode, BetTypeRule } from '@zenvora/shared';
import { getServerSession, requireAdmin } from '../../lib/session';
import { getWalletAction } from './wallet';
import { getMarketsAction } from './markets';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '../../lib/rateLimit';
import { writeAuditLog } from '../../lib/audit';

// For MVP, we mirror the BET_RULES on the server to prevent client spoofing
const SERVER_BET_RULES: Record<BetTypeCode, Pick<BetTypeRule, 'multiplier' | 'minAmount' | 'maxAmount'>> = {
  [BetTypeCode.SINGLE_ANK]: { multiplier: 8.5, minAmount: 50, maxAmount: 1000 },
  [BetTypeCode.JODI]: { multiplier: 85, minAmount: 50, maxAmount: 300 },
  [BetTypeCode.SINGLE_PATTI]: { multiplier: 130, minAmount: 10, maxAmount: 100 },
  [BetTypeCode.DOUBLE_PATTI]: { multiplier: 260, minAmount: 10, maxAmount: 50 },
  [BetTypeCode.TRIPLE_PATTI]: { multiplier: 650, minAmount: 10, maxAmount: 20 },
  [BetTypeCode.HALF_SANGAM]: { multiplier: 850, minAmount: 10, maxAmount: 10 },
  [BetTypeCode.FULL_SANGAM]: { multiplier: 8500, minAmount: 10, maxAmount: 10 },
};

const placeBetSchema = z.object({
  marketId: z.string().uuid(),
  betType: z.nativeEnum(BetTypeCode),
  selection: z.string().min(1).max(10),
  session: z.enum(['OPEN', 'CLOSE']).optional(),
  amount: z.number().positive(),
  idempotencyKey: z.string().min(1),
});

export async function placeBetAction(reqInput: PlaceBetRequest) {
  const ip = getClientIp();
  if (!checkRateLimit(ip, 'placeBet', 10, 60 * 1000)) { // 10 bets per minute
    return { success: false, message: 'Too many bets placed' };
  }

  const reqRes = placeBetSchema.safeParse(reqInput);
  if (!reqRes.success) {
    return { success: false, message: 'Invalid bet request format' };
  }
  const req = reqRes.data;

  try {
    const user = await getServerSession();
    if (!user) return { success: false, message: 'Unauthorized' };

    const rule = SERVER_BET_RULES[req.betType];
    if (!rule) {
      return { success: false, message: 'Invalid bet type' };
    }

    if (req.amount < rule.minAmount || req.amount > rule.maxAmount) {
      return { success: false, message: `Amount must be between ₹${rule.minAmount} and ₹${rule.maxAmount}` };
    }

    // Validate Market Status Server-Side
    const marketsData = await getMarketsAction();
    const market = marketsData.markets?.find(m => m.id === req.marketId);
    
    if (!market) {
      return { success: false, message: 'Market not found' };
    }
    if (market.status !== 'OPEN') {
      return { success: false, message: 'Market is closed' };
    }

    // Enforce Daily Betting Limit (Max ₹5,000 per user per day)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayBets = await db
      .select({ amount: bets.amountMinor })
      .from(bets)
      .where(
        and(
          eq(bets.userId, user.id),
          gte(bets.placedAt, startOfToday)
        )
      );

    const totalStakedToday = todayBets.reduce((sum, b) => sum + Number(b.amount), 0);
    if (totalStakedToday + req.amount > 5000) {
      const remainingLimit = Math.max(0, 5000 - totalStakedToday);
      return {
        success: false,
        message: `Daily betting limit of ₹5,000 reached. You have wagered ₹${totalStakedToday} today. Remaining limit: ₹${remainingLimit}.`
      };
    }

    // Prevent duplicate stacking on the exact same number in the same session
    const existingSameBet = await db
      .select({ id: bets.id })
      .from(bets)
      .where(
        and(
          eq(bets.userId, user.id),
          eq(bets.marketId, req.marketId),
          eq(bets.betTypeCode, req.betType),
          eq(bets.selection, req.selection),
          eq(bets.session, req.session || 'OPEN'),
          eq(bets.status, 'ACTIVE')
        )
      )
      .limit(1);

    if (existingSameBet.length > 0) {
      return {
        success: false,
        message: `You already have an active bet on number ${req.selection} in this session. Duplicate bets on the same number are restricted.`
      };
    }

    // Validate Balance Server-Side
    const walletData = await getWalletAction();
    if (!walletData.success || !walletData.balances) {
      return { success: false, message: 'Failed to load wallet' };
    }

    if (walletData.balances.totalBalance < req.amount) {
      return { success: false, message: 'Insufficient balance' };
    }

    const potentialWin = Math.round(req.amount * rule.multiplier);
    const refNo = 'ZEN-' + Math.floor(100000 + Math.random() * 900000);

    const walletArray = await db.select().from(wallets).where(eq(wallets.userId, user.id)).limit(1);
    const wallet = walletArray[0];

    // Determine which balance to debit (Cash vs Bonus logic can be complex, for MVP we just check if cash is enough, else use bonus)
    let amountToDebitFromCash = 0;
    let amountToDebitFromBonus = 0;
    if (walletData.balances.cashBalance >= req.amount) {
      amountToDebitFromCash = req.amount;
    } else {
      amountToDebitFromCash = walletData.balances.cashBalance;
      amountToDebitFromBonus = req.amount - amountToDebitFromCash;
    }

    let betId = '';

    // Atomic transaction for Bet Placement
    await db.transaction(async (tx) => {
      // 1. Create Bet Transaction Record
      const insertedTxn = await tx.insert(transactions).values({
        userId: user.id,
        type: 'BET_PLACED' as any,
        status: 'COMPLETED' as any,
        amountMinor: req.amount,
        currency: 'INR',
        idempotencyKey: req.idempotencyKey,
      }).returning();
      const txnRecord = insertedTxn[0];

      // 2. Debit Ledger
      if (amountToDebitFromCash > 0) {
        await tx.insert(ledgerEntries).values({
          walletId: wallet.id,
          transactionId: txnRecord.id,
          entryType: 'DEBIT' as any,
          balanceType: 'CASH' as any,
          amountMinor: amountToDebitFromCash,
          currency: 'INR',
          referenceType: 'BET',
          referenceId: refNo,
        });
      }
      
      if (amountToDebitFromBonus > 0) {
        await tx.insert(ledgerEntries).values({
          walletId: wallet.id,
          transactionId: txnRecord.id,
          entryType: 'DEBIT' as any,
          balanceType: 'BONUS' as any,
          amountMinor: amountToDebitFromBonus,
          currency: 'INR',
          referenceType: 'BET',
          referenceId: refNo,
        });
      }

      // 3. Insert Bet Record
      const insertedBet = await tx.insert(bets).values({
        userId: user.id,
        marketId: req.marketId,
        betTypeCode: req.betType,
        selection: req.selection,
        session: req.session || null,
        amountMinor: req.amount,
        status: 'ACTIVE' as any,
        idempotencyKey: req.idempotencyKey,
      }).returning();

      betId = insertedBet[0].id;
    });

    await writeAuditLog('BET_PLACED', 'Bet', { actorId: user.id, entityId: betId, metadata: { amount: req.amount, marketId: req.marketId, betType: req.betType } });

    return { 
      success: true, 
      refNo, 
      potentialWin,
      betId
    };

  } catch (error: any) {
    console.error('Error in placeBetAction:', error);
    await writeAuditLog('BET_PLACEMENT_FAILED', 'Bet', { success: false });
    if (error.code === '23505') { // Unique constraint violation (idempotency key)
      return { success: false, message: 'Bet already placed' };
    }
    return { success: false, message: 'Failed to place bet' };
  }
}

function evaluateBet(
  bet: any,
  openAnk: string,
  closeAnk: string,
  openPatti: string,
  closePatti: string
): boolean {
  if (bet.betTypeCode === BetTypeCode.SINGLE_ANK) {
    if (bet.session === 'OPEN') return bet.selection === openAnk;
    if (bet.session === 'CLOSE') return bet.selection === closeAnk;
  }
  if (bet.betTypeCode === BetTypeCode.JODI) {
    return bet.selection === `${openAnk}${closeAnk}`;
  }
  if (
    bet.betTypeCode === BetTypeCode.SINGLE_PATTI ||
    bet.betTypeCode === BetTypeCode.DOUBLE_PATTI ||
    bet.betTypeCode === BetTypeCode.TRIPLE_PATTI
  ) {
    if (bet.session === 'OPEN') return bet.selection === openPatti;
    if (bet.session === 'CLOSE') return bet.selection === closePatti;
  }
  if (bet.betTypeCode === BetTypeCode.HALF_SANGAM) {
    // Selection format usually: "OpenAnk-ClosePatti" or "OpenPatti-CloseAnk"
    const [part1, part2] = bet.selection.split('-');
    if (part1.length === 1) {
      return part1 === openAnk && part2 === closePatti;
    } else {
      return part1 === openPatti && part2 === closeAnk;
    }
  }
  if (bet.betTypeCode === BetTypeCode.FULL_SANGAM) {
    const [p1, p2] = bet.selection.split('-');
    return p1 === openPatti && p2 === closePatti;
  }
  return false;
}

export async function publishResultAction(
  marketId: string,
  openPatti: string,
  openAnk: string,
  closeAnk: string,
  closePatti: string
) {
  try {
    const admin = await requireAdmin();

    const displayVal = `${openPatti || '***'}-${openAnk || '*'}${closeAnk || '*'}-${closePatti || '***'}`;
    const resultDate = new Date().toISOString().split('T')[0];
    
    let resultId = '';
    let settledBetsCount = 0;
    let totalPayout = 0;

    await db.transaction(async (tx) => {
      // 1. Insert Result
      const insertedResult = await tx.insert(results).values({
        marketId,
        resultDate,
        openPatti,
        openAnk,
        closeAnk,
        closePatti,
        resultValue: displayVal,
        status: 'PUBLISHED',
        publishedBy: admin.id,
      }).returning();
      
      resultId = insertedResult[0].id;
      
      // Update market status
      await tx.update(markets).set({ status: 'CLOSED' as any }).where(eq(markets.id, marketId));

      // Fetch ACTIVE bets
      const activeBets = await tx.select().from(bets).where(
        and(
          eq(bets.marketId, marketId),
          eq(bets.status, 'ACTIVE')
        )
      );

      for (const bet of activeBets) {
        const isWin = evaluateBet(bet, openAnk, closeAnk, openPatti, closePatti);
        
        if (isWin) {
          const rule = SERVER_BET_RULES[bet.betTypeCode as BetTypeCode];
          const payoutAmount = Math.round(bet.amountMinor * rule.multiplier);

          // Update Bet
          await tx.update(bets).set({ 
            status: 'WON' as any,
            settledAt: new Date(),
          }).where(eq(bets.id, bet.id));

          // Get Wallet
          const walletArray = await tx.select().from(wallets).where(eq(wallets.userId, bet.userId)).limit(1);
          const wallet = walletArray[0];

          // Create Ledger Entry
          const refNo = 'WIN-' + Math.floor(100000 + Math.random() * 900000);
          
          const insertedTxn = await tx.insert(transactions).values({
            userId: bet.userId,
            type: 'BET_WON' as any,
            status: 'COMPLETED' as any,
            amountMinor: payoutAmount,
            currency: 'INR',
          }).returning();

          await tx.insert(ledgerEntries).values({
            walletId: wallet.id,
            transactionId: insertedTxn[0].id,
            entryType: 'CREDIT' as any,
            balanceType: 'CASH' as any,
            amountMinor: payoutAmount,
            currency: 'INR',
            referenceType: 'BET_WIN',
            referenceId: bet.id,
          });

          totalPayout += payoutAmount;
        } else {
          await tx.update(bets).set({ 
            status: 'LOST' as any,
            settledAt: new Date(),
          }).where(eq(bets.id, bet.id));
        }
        settledBetsCount++;
      }
    });
    
    await writeAuditLog('RESULT_PUBLISHED', 'Market', { actorId: admin.id, entityId: marketId, metadata: { resultId, displayVal, settledBetsCount, totalPayout } });

    return { success: true, resultId, settledBetsCount, totalPayout };
  } catch (error: any) {
    console.error('Error in publishResultAction:', error);
    await writeAuditLog('ADMIN_ACTION', 'Market', { success: false, metadata: { action: 'PUBLISH_RESULT_FAILED' } });
    return { success: false, message: 'Failed to publish result' };
  }
}
