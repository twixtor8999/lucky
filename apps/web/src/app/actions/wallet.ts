'use server';

import { db, wallets, transactions, ledgerEntries, bonusCampaigns, bonusClaims, systemSettings, deposits, users } from '@zenvora/shared/db';
import { eq, and, desc } from 'drizzle-orm';
import { getServerSession } from '../../lib/session';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '../../lib/rateLimit';
import { paymentProvider } from '../../lib/payment-provider';
import { writeAuditLog } from '../../lib/audit';

export async function getWalletAction() {
  const user = await getServerSession();
  if (!user) return { success: false, message: 'Unauthorized' };

  const walletArray = await db.select().from(wallets).where(eq(wallets.userId, user.id)).limit(1);
  let wallet = walletArray[0];

  if (!wallet) {
    // Should have been created on signup, but fallback
    const inserted = await db.insert(wallets).values({ userId: user.id, currency: 'INR' }).returning();
    wallet = inserted[0];
  }

  // Calculate authoritative balance from ledger
  const entries = await db.select().from(ledgerEntries).where(eq(ledgerEntries.walletId, wallet.id));

  let cashBalance = 0;
  let bonusBalance = 0;
  let lockedBalance = 0;

  for (const entry of entries) {
    const amt = Number(entry.amountMinor);
    if (entry.entryType === 'CREDIT') {
      if (entry.balanceType === 'CASH') cashBalance += amt;
      else if (entry.balanceType === 'BONUS') bonusBalance += amt;
      else if (entry.balanceType === 'LOCKED') lockedBalance += amt;
    } else if (entry.entryType === 'DEBIT') {
      if (entry.balanceType === 'CASH') cashBalance -= amt;
      else if (entry.balanceType === 'BONUS') bonusBalance -= amt;
      else if (entry.balanceType === 'LOCKED') lockedBalance -= amt;
    }
  }

  return {
    success: true,
    balances: {
      totalBalance: cashBalance + bonusBalance,
      cashBalance,
      bonusBalance,
      lockedBalance,
    }
  };
}

export async function getTransactionHistoryAction(page = 1, limit = 20) {
  const user = await getServerSession();
  if (!user) return { success: false, message: 'Unauthorized' };

  const offset = (page - 1) * limit;

  const txns = await db.select()
    .from(transactions)
    .where(eq(transactions.userId, user.id))
    .orderBy(desc(transactions.createdAt))
    .limit(limit)
    .offset(offset);

  return { success: true, transactions: txns };
}

const amountSchema = z.number().positive();

export async function addMoneyAction(amountInput: number, utr: string) {
  const ip = getClientIp();
  if (!checkRateLimit(ip, 'addMoney', 5, 60 * 1000)) {
    return { success: false, message: 'Too many requests' };
  }

  const amtRes = amountSchema.safeParse(amountInput);
  if (!amtRes.success) {
    return { success: false, message: 'Invalid amount' };
  }
  const amount = amtRes.data;

  if (!utr || typeof utr !== 'string' || utr.trim() === '') {
    return { success: false, message: 'Invalid UTR/Reference number' };
  }

  const cleanUtr = utr.trim().toUpperCase();
  if (cleanUtr.length < 6 || cleanUtr.length > 50) {
    return { success: false, message: 'UTR must be between 6 and 50 characters' };
  }

  try {
    const user = await getServerSession();
    if (!user) return { success: false, message: 'Unauthorized' };

    if (amount < 10) {
      return { success: false, message: 'Minimum deposit is ₹10' };
    }

    const settingsArr = await db.select().from(systemSettings).limit(1);
    const settings = settingsArr[0];
    if (settings && !settings.depositEnabled) {
      return { success: false, message: 'Deposits are currently disabled' };
    }

    const walletArray = await db.select().from(wallets).where(eq(wallets.userId, user.id)).limit(1);
    const wallet = walletArray[0];
    if (!wallet) return { success: false, message: 'Wallet not found' };

    const result = await db.transaction(async (tx) => {
      // Check for duplicate UTR globally
      const existingUtr = await tx.select().from(deposits).where(eq(deposits.utr, cleanUtr)).limit(1);
      if (existingUtr.length > 0) {
        throw new Error('DUPLICATE_UTR');
      }

      // Create deposit request (PENDING status, never credit wallet directly)
      const insertedDeposit = await tx.insert(deposits).values({
        userId: user.id,
        amountMinor: amount,
        status: 'PENDING' as any,
        utr: cleanUtr,
        requestedAt: new Date(),
      }).returning();
      
      const depositRec = insertedDeposit[0];

      // Create unified transaction record (PENDING)
      const insertedTxn = await tx.insert(transactions).values({
        userId: user.id,
        type: 'DEPOSIT' as any,
        status: 'PENDING' as any,
        amountMinor: amount,
        currency: 'INR',
        externalReference: cleanUtr,
        idempotencyKey: 'DEP_' + depositRec.id,
      }).returning();

      return { txnId: insertedTxn[0].id, depositId: depositRec.id, deposit: depositRec };
    });

    await writeAuditLog('DEPOSIT_CREATED', 'Deposit', { 
      actorId: user.id, 
      entityId: result.depositId, 
      metadata: { amount, utr: cleanUtr } 
    });

    return { 
      success: true, 
      txnId: result.txnId, 
      depositId: result.depositId,
      deposit: {
        id: result.deposit.id,
        amount: result.deposit.amountMinor,
        utr: result.deposit.utr,
        status: 'PENDING',
        requestedAt: result.deposit.requestedAt,
      },
      message: 'Your payment is waiting for verification. Your wallet will be credited after the payment is verified.'
    };
  } catch (error: any) {
    console.error('Error in addMoneyAction:', error);
    if (error.message === 'DUPLICATE_UTR' || error.code === '23505') {
      return { success: false, message: 'That transaction reference has already been submitted.' };
    }
    return { success: false, message: 'Failed to submit deposit request' };
  }
}

export async function getUserDepositsAction() {
  const user = await getServerSession();
  if (!user) return { success: false, message: 'Unauthorized', deposits: [] };

  try {
    const list = await db.select({
      id: deposits.id,
      amount: deposits.amountMinor,
      status: deposits.status,
      utr: deposits.utr,
      actualAmount: deposits.actualAmountMinor,
      adminNote: deposits.adminNote,
      rejectionReason: deposits.rejectionReason,
      requestedAt: deposits.requestedAt,
      verifiedAt: deposits.verifiedAt,
      processedAt: deposits.processedAt,
    })
    .from(deposits)
    .where(eq(deposits.userId, user.id))
    .orderBy(desc(deposits.requestedAt));

    return { success: true, deposits: list };
  } catch (err: any) {
    console.error('Error in getUserDepositsAction:', err);
    return { success: false, message: 'Failed to fetch deposits', deposits: [] };
  }
}

export async function getUserPaymentDetailsAction() {
  const user = await getServerSession();
  if (!user) return { success: false, message: 'Unauthorized', details: null };

  try {
    const u = await db.select({
      upiId: users.upiId,
      bankAccountName: users.bankAccountName,
      bankAccountNumber: users.bankAccountNumber,
      bankIfsc: users.bankIfsc,
      bankName: users.bankName,
      displayName: users.displayName,
      phone: users.phone,
    }).from(users).where(eq(users.id, user.id)).limit(1);

    return { success: true, details: u[0] || null };
  } catch (err: any) {
    console.error('Error in getUserPaymentDetailsAction:', err);
    return { success: false, message: 'Failed to fetch payment details', details: null };
  }
}

export async function getActiveWelcomeBonus() {
  const campaigns = await db.select().from(bonusCampaigns).where(
    eq(bonusCampaigns.active, true)
  ).limit(1);
  return campaigns[0] || null;
}

export async function claimWelcomeBonusAction() {
  const ip = getClientIp();
  if (!checkRateLimit(ip, 'claimBonus', 3, 60 * 1000)) {
    return { success: false, message: 'Too many requests' };
  }

  try {
    const user = await getServerSession();
    if (!user) return { success: false, message: 'Unauthorized' };

    const campaign = await getActiveWelcomeBonus();
    if (!campaign) {
      // Fallback for MVP if not seeded
      return { success: false, message: 'No active welcome bonus' };
    }

    const existingClaim = await db.select().from(bonusClaims).where(
      and(eq(bonusClaims.userId, user.id), eq(bonusClaims.campaignId, campaign.id))
    ).limit(1);

    if (existingClaim.length > 0) {
      return { success: false, message: 'Welcome bonus already claimed' };
    }

    const walletArray = await db.select().from(wallets).where(eq(wallets.userId, user.id)).limit(1);
    const wallet = walletArray[0];

    await db.transaction(async (tx) => {
      await tx.insert(bonusClaims).values({
        userId: user.id,
        campaignId: campaign.id,
        amountMinor: campaign.amountMinor,
      });

      const insertedTxn = await tx.insert(transactions).values({
        userId: user.id,
        type: 'WELCOME_BONUS' as any,
        status: 'COMPLETED' as any,
        amountMinor: campaign.amountMinor,
        currency: 'INR',
      }).returning();
      
      const txnRecord = insertedTxn[0];

      await tx.insert(ledgerEntries).values({
        walletId: wallet.id,
        transactionId: txnRecord.id,
        entryType: 'CREDIT' as any,
        balanceType: 'BONUS' as any,
        amountMinor: campaign.amountMinor,
        currency: 'INR',
        referenceType: 'PROMOTION',
      });
    });

    await writeAuditLog('BONUS_CLAIMED', 'Bonus', { actorId: user.id, metadata: { amount: campaign.amountMinor, campaignId: campaign.id } });

    return { success: true, amount: campaign.amountMinor };
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      return { success: false, message: 'Bonus already claimed' };
    }
    console.error('Error in claimWelcomeBonusAction:', error);
    await writeAuditLog('BONUS_CLAIM_FAILED', 'Bonus', { success: false });
    return { success: false, message: 'Failed to claim bonus' };
  }
}

export async function requestWithdrawalAction(amountInput: number, method: string, idempotencyKey: string) {
  const ip = getClientIp();
  if (!checkRateLimit(ip, 'withdrawMoney', 3, 60 * 1000)) {
    return { success: false, message: 'Too many requests' };
  }

  const amtRes = amountSchema.safeParse(amountInput);
  if (!amtRes.success) {
    return { success: false, message: 'Invalid amount' };
  }
  const amount = amtRes.data;

  try {
    const user = await getServerSession();
    if (!user) return { success: false, message: 'Unauthorized' };

    if (amount < 500) {
      return { success: false, message: 'Minimum withdrawal is ₹500' };
    }

    const walletData = await getWalletAction();
    if (!walletData.success || !walletData.balances) {
      return { success: false, message: 'Failed to load wallet' };
    }

    if (walletData.balances.cashBalance < amount) {
      return { success: false, message: 'Insufficient cash balance' };
    }

    const walletArray = await db.select().from(wallets).where(eq(wallets.userId, user.id)).limit(1);
    const wallet = walletArray[0];

    const txnId = 'WTH-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    await db.transaction(async (tx) => {
      const insertedTxn = await tx.insert(transactions).values({
        userId: user.id,
        type: 'WITHDRAWAL' as any,
        status: 'PENDING' as any,
        amountMinor: amount,
        currency: 'INR',
        externalReference: method,
        idempotencyKey,
      }).returning();
      
      const txnRecord = insertedTxn[0];

      await tx.insert(ledgerEntries).values([
        {
          walletId: wallet.id,
          transactionId: txnRecord.id,
          entryType: 'DEBIT' as any,
          balanceType: 'CASH' as any,
          amountMinor: amount,
          currency: 'INR',
          referenceType: 'WITHDRAWAL_LOCK',
          referenceId: txnId,
        },
        {
          walletId: wallet.id,
          transactionId: txnRecord.id,
          entryType: 'CREDIT' as any,
          balanceType: 'LOCKED' as any,
          amountMinor: amount,
          currency: 'INR',
          referenceType: 'WITHDRAWAL_LOCK',
          referenceId: txnId,
        }
      ]);
    });

    await writeAuditLog('WITHDRAWAL_REQUESTED', 'Transaction', { actorId: user.id, entityId: txnId, metadata: { amount, method } });

    return { success: true, txnId, message: 'Withdrawal requested successfully' };
  } catch (error: any) {
    console.error('Error in requestWithdrawalAction:', error);
    await writeAuditLog('WITHDRAWAL_FAILED', 'Transaction', { success: false });
    if (error.code === '23505') {
      return { success: false, message: 'Withdrawal already requested' };
    }
    return { success: false, message: 'Failed to request withdrawal' };
  }
}
