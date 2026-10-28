'use server';

import { cookies } from 'next/headers';
import { db, bets, users, markets, results, wallets, transactions, ledgerEntries } from '@zenvora/shared/db';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { getServerSession } from '../../lib/session';

async function checkAdminAuth() {
  const authCookie = cookies().get('admin_auth');
  if (authCookie?.value === 'authenticated') return true;
  const user = await getServerSession();
  if (user?.role === 'ADMIN') return true;
  throw new Error('Unauthorized');
}

// Standard market multipliers (Balanced 15% Platform Margin)
const MULTIPLIERS: Record<string, number> = {
  SINGLE_ANK: 8.5,
  JODI: 85,
  SINGLE_PATTI: 130,
  DOUBLE_PATTI: 260,
  TRIPLE_PATTI: 650,
  HALF_SANGAM: 850,
  FULL_SANGAM: 8500,
};

export async function getWinningBetsPendingPayout() {
  await checkAdminAuth();

  // 1. Fetch all ACTIVE bets joined with users and markets
  const activeBets = await db.select({
    id: bets.id,
    userId: bets.userId,
    marketId: bets.marketId,
    betTypeCode: bets.betTypeCode,
    selection: bets.selection,
    session: bets.session,
    amountMinor: bets.amountMinor,
    placedAt: bets.placedAt,
    userPhone: users.phone,
    marketName: markets.name,
  })
  .from(bets)
  .leftJoin(users, eq(bets.userId, users.id))
  .leftJoin(markets, eq(bets.marketId, markets.id))
  .where(eq(bets.status, 'ACTIVE'));

  // 2. Fetch all results
  const allResults = await db.select().from(results).where(eq(results.status, 'PUBLISHED'));

  // 3. Evaluate winners in memory
  const winners = [];

  for (const bet of activeBets) {
    const betDate = new Date(bet.placedAt).toISOString().split('T')[0];
    const result = allResults.find(r => r.marketId === bet.marketId && r.resultDate === betDate);
    
    if (!result) continue; // No result published yet for this market on this day

    let isWinner = false;

    if (bet.betTypeCode === 'SINGLE_ANK') {
      if (bet.session === 'OPEN' && bet.selection === result.openAnk) isWinner = true;
      if (bet.session === 'CLOSE' && bet.selection === result.closeAnk) isWinner = true;
    } 
    else if (bet.betTypeCode === 'JODI') {
      const resultJodi = `${result.openAnk}${result.closeAnk}`;
      if (bet.selection === resultJodi) isWinner = true;
    }
    else if (bet.betTypeCode === 'SINGLE_PATTI' || bet.betTypeCode === 'DOUBLE_PATTI' || bet.betTypeCode === 'TRIPLE_PATTI') {
      if (bet.session === 'OPEN' && bet.selection === result.openPatti) isWinner = true;
      if (bet.session === 'CLOSE' && bet.selection === result.closePatti) isWinner = true;
    }
    else if (bet.betTypeCode === 'HALF_SANGAM') {
      const [openPatti, closeAnk] = bet.selection.split('-');
      if (openPatti === result.openPatti && closeAnk === result.closeAnk) isWinner = true;
      const [openAnk, closePatti] = bet.selection.split('-'); // Reverse half sangam check
      if (openAnk === result.openAnk && closePatti === result.closePatti) isWinner = true;
    }
    else if (bet.betTypeCode === 'FULL_SANGAM') {
      const [openPatti, closePatti] = bet.selection.split('-');
      if (openPatti === result.openPatti && closePatti === result.closePatti) isWinner = true;
    }

    if (isWinner) {
      const multiplier = MULTIPLIERS[bet.betTypeCode] || 1;
      const winAmount = bet.amountMinor * multiplier;
      winners.push({
        ...bet,
        multiplier,
        winAmount,
        resultValue: result.resultValue
      });
    }
  }

  return winners;
}

export async function processPayout(betId: string, winAmount: number, userId: string) {
  await checkAdminAuth();

  try {
    await db.transaction(async (tx: any) => {
      // 1. Mark bet as WON
      await tx.update(bets)
        .set({ status: 'WON', settledAt: new Date() })
        .where(eq(bets.id, betId));

      // 2. Get wallet
      const wallet = await tx.query.wallets.findFirst({
        where: eq(wallets.userId, userId)
      });
      let walletId = wallet?.id;
      if (!wallet) {
        const [newWallet] = await tx.insert(wallets).values({ userId }).returning();
        walletId = newWallet.id;
      }

      // 3. Create transaction
      const [txn] = await tx.insert(transactions).values({
        userId,
        type: 'BET_WON',
        amountMinor: winAmount,
        status: 'COMPLETED',
        reference: betId
      }).returning();

      // 4. Create ledger entry
      await tx.insert(ledgerEntries).values({
        walletId: walletId!,
        transactionId: txn.id,
        entryType: 'CREDIT',
        balanceType: 'CASH',
        amountMinor: winAmount,
        referenceType: 'BET',
        referenceId: betId,
        description: `Winnings for Bet #${betId.substring(0, 8)}`
      });
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markBetAsLost(betId: string) {
  await checkAdminAuth();

  try {
    await db.update(bets)
      .set({ status: 'LOST', settledAt: new Date() })
      .where(eq(bets.id, betId));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
