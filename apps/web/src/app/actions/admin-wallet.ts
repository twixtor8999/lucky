'use server';

import { db, deposits, withdrawals, transactions, ledgerEntries, wallets, users } from '@zenvora/shared/db';
import { eq, and, desc } from 'drizzle-orm';
import { getServerSession } from '../../lib/session';
import { writeAuditLog } from '../../lib/audit';

async function verifyAdmin() {
  const user = await getServerSession();
  if (!user || user.role !== 'ADMIN') {
    return null;
  }
  return user;
}

export async function approveDepositAction(
  depositId: string, 
  actualAmount?: number, 
  confirmedUtr?: string, 
  adminNote?: string
) {
  const admin = await verifyAdmin();
  if (!admin) return { success: false, message: 'Unauthorized. Admin access required.' };

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Verify deposit exists and is pending
      const depositArr = await tx.select().from(deposits).where(eq(deposits.id, depositId)).limit(1);
      const deposit = depositArr[0];
      
      if (!deposit) throw new Error('Deposit not found');
      if (deposit.status !== 'PENDING') throw new Error('Deposit is already processed');

      const verifiedAmt = Number.isFinite(actualAmount) && (actualAmount as number) > 0 
        ? (actualAmount as number) 
        : deposit.amountMinor;

      if (confirmedUtr && confirmedUtr.trim()) {
        if (confirmedUtr.trim().toUpperCase() !== deposit.utr.trim().toUpperCase()) {
          throw new Error('Entered UTR does not match the deposit reference.');
        }
      }

      // 2. Find associated wallet
      const walletArr = await tx.select().from(wallets).where(eq(wallets.userId, deposit.userId)).limit(1);
      const wallet = walletArr[0];
      if (!wallet) throw new Error('User wallet not found');

      // 3. Mark deposit COMPLETED with verified amount and admin note
      const updated = await tx.update(deposits)
        .set({ 
          status: 'COMPLETED' as any, 
          actualAmountMinor: verifiedAmt,
          adminNote: adminNote?.trim() || 'Payment verified in bank statement.',
          verifiedAt: new Date(),
          processedAt: new Date(), 
          processedBy: admin.id 
        })
        .where(and(eq(deposits.id, deposit.id), eq(deposits.status, 'PENDING' as any)))
        .returning();

      if (updated.length === 0) {
        throw new Error('Deposit was already processed by another request.');
      }

      // 4. Mark transaction COMPLETED
      await tx.update(transactions)
        .set({ 
          status: 'COMPLETED' as any, 
          amountMinor: verifiedAmt,
          completedAt: new Date() 
        })
        .where(and(eq(transactions.externalReference, deposit.utr), eq(transactions.type, 'DEPOSIT' as any)));

      // 5. Credit Wallet Ledger
      await tx.insert(ledgerEntries).values({
        walletId: wallet.id,
        entryType: 'CREDIT' as any,
        balanceType: 'CASH' as any,
        amountMinor: verifiedAmt,
        currency: 'INR',
        referenceType: 'DEPOSIT',
        referenceId: deposit.id,
      });

      return { success: true, deposit, verifiedAmt };
    });

    await writeAuditLog('DEPOSIT_APPROVED', 'Deposit', { 
      actorId: admin.id, 
      entityId: depositId, 
      metadata: { 
        requestedAmount: result.deposit.amountMinor, 
        verifiedAmount: result.verifiedAmt, 
        utr: result.deposit.utr,
        adminNote: adminNote?.trim(),
      } 
    });

    return { success: true, message: 'Deposit verified and credited successfully.' };
  } catch (error: any) {
    console.error('Error approving deposit:', error);
    return { success: false, message: error.message || 'Failed to approve deposit' };
  }
}

export async function rejectDepositAction(depositId: string, reason: string) {
  const admin = await verifyAdmin();
  if (!admin) return { success: false, message: 'Unauthorized' };

  try {
    const result = await db.transaction(async (tx) => {
      const depositArr = await tx.select().from(deposits).where(eq(deposits.id, depositId)).limit(1);
      const deposit = depositArr[0];
      
      if (!deposit) throw new Error('Deposit not found');
      if (deposit.status !== 'PENDING') throw new Error('Deposit is already processed');

      await tx.update(deposits)
        .set({ status: 'REJECTED' as any, processedAt: new Date(), processedBy: admin.id, rejectionReason: reason })
        .where(eq(deposits.id, deposit.id));

      await tx.update(transactions)
        .set({ status: 'REJECTED' as any, completedAt: new Date() })
        .where(and(eq(transactions.externalReference, deposit.utr), eq(transactions.type, 'DEPOSIT' as any)));

      return { success: true };
    });

    await writeAuditLog('ADMIN_ACTION', 'Deposit', { actorId: admin.id, entityId: depositId, metadata: { action: 'REJECT', reason } });

    return { success: true, message: 'Deposit rejected.' };
  } catch (error: any) {
    console.error('Error rejecting deposit:', error);
    return { success: false, message: error.message || 'Failed to reject deposit' };
  }
}

export async function getPendingDepositsAction() {
  const admin = await verifyAdmin();
  if (!admin) return { success: false, message: 'Unauthorized' };

  const pending = await db.select({
    id: deposits.id,
    amountMinor: deposits.amountMinor,
    utr: deposits.utr,
    requestedAt: deposits.requestedAt,
    user: {
      phone: users.phone,
      displayName: users.displayName
    }
  })
  .from(deposits)
  .leftJoin(users, eq(users.id, deposits.userId))
  .where(eq(deposits.status, 'PENDING' as any))
  .orderBy(desc(deposits.requestedAt));

  return { success: true, data: pending };
}

export async function approveWithdrawalAction(withdrawalId: string, payoutUtr: string) {
  const admin = await verifyAdmin();
  if (!admin) return { success: false, message: 'Unauthorized' };

  if (!payoutUtr || payoutUtr.trim() === '') return { success: false, message: 'Payout UTR is required' };

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Verify withdrawal exists and is pending
      const wArr = await tx.select().from(withdrawals).where(eq(withdrawals.id, withdrawalId)).limit(1);
      const w = wArr[0];
      
      if (!w) throw new Error('Withdrawal not found');
      if (w.status !== 'PENDING') throw new Error('Withdrawal is already processed');

      // 2. Find associated wallet
      const walletArr = await tx.select().from(wallets).where(eq(wallets.userId, w.userId)).limit(1);
      const wallet = walletArr[0];
      if (!wallet) throw new Error('User wallet not found');

      // 3. Mark withdrawal SUCCESS
      await tx.update(withdrawals)
        .set({ status: 'COMPLETED' as any, processedAt: new Date(), providerReference: payoutUtr.trim() })
        .where(eq(withdrawals.id, w.id));

      // 4. Mark transaction COMPLETED
      await tx.update(transactions)
        .set({ status: 'COMPLETED' as any, completedAt: new Date(), externalReference: payoutUtr.trim() })
        .where(and(eq(transactions.userId, w.userId), eq(transactions.amountMinor, w.amountMinor), eq(transactions.type, 'WITHDRAWAL' as any), eq(transactions.status, 'PENDING' as any)));

      // 5. Finalize reservation: DEBIT the LOCKED balance
      await tx.insert(ledgerEntries).values({
        walletId: wallet.id,
        entryType: 'DEBIT' as any,
        balanceType: 'LOCKED' as any,
        amountMinor: w.amountMinor,
        currency: 'INR',
        referenceType: 'MANUAL_UPI_WITHDRAWAL',
        referenceId: w.id,
      });

      return { success: true, withdrawal: w };
    });

    await writeAuditLog('ADMIN_ACTION', 'Withdrawal', { actorId: admin.id, entityId: withdrawalId, metadata: { action: 'MARK_PAID', utr: payoutUtr } });

    return { success: true, message: 'Withdrawal marked as paid.' };
  } catch (error: any) {
    console.error('Error approving withdrawal:', error);
    return { success: false, message: error.message || 'Failed to approve withdrawal' };
  }
}

export async function rejectWithdrawalAction(withdrawalId: string, reason: string) {
  const admin = await verifyAdmin();
  if (!admin) return { success: false, message: 'Unauthorized' };

  try {
    const result = await db.transaction(async (tx) => {
      const wArr = await tx.select().from(withdrawals).where(eq(withdrawals.id, withdrawalId)).limit(1);
      const w = wArr[0];
      
      if (!w) throw new Error('Withdrawal not found');
      if (w.status !== 'PENDING') throw new Error('Withdrawal is already processed');

      const walletArr = await tx.select().from(wallets).where(eq(wallets.userId, w.userId)).limit(1);
      const wallet = walletArr[0];

      await tx.update(withdrawals)
        .set({ status: 'REJECTED' as any, processedAt: new Date(), providerReference: reason })
        .where(eq(withdrawals.id, w.id));

      await tx.update(transactions)
        .set({ status: 'REJECTED' as any, completedAt: new Date() })
        .where(and(eq(transactions.userId, w.userId), eq(transactions.amountMinor, w.amountMinor), eq(transactions.type, 'WITHDRAWAL' as any), eq(transactions.status, 'PENDING' as any)));

      // Release reservation: DEBIT LOCKED, CREDIT CASH
      await tx.insert(ledgerEntries).values([
        {
          walletId: wallet.id,
          entryType: 'DEBIT' as any,
          balanceType: 'LOCKED' as any,
          amountMinor: w.amountMinor,
          currency: 'INR',
          referenceType: 'WITHDRAWAL_REJECTED',
          referenceId: w.id,
        },
        {
          walletId: wallet.id,
          entryType: 'CREDIT' as any,
          balanceType: 'CASH' as any,
          amountMinor: w.amountMinor,
          currency: 'INR',
          referenceType: 'WITHDRAWAL_REJECTED',
          referenceId: w.id,
        }
      ]);

      return { success: true };
    });

    await writeAuditLog('ADMIN_ACTION', 'Withdrawal', { actorId: admin.id, entityId: withdrawalId, metadata: { action: 'REJECT', reason } });

    return { success: true, message: 'Withdrawal rejected and funds restored.' };
  } catch (error: any) {
    console.error('Error rejecting withdrawal:', error);
    return { success: false, message: error.message || 'Failed to reject withdrawal' };
  }
}

export async function getPendingWithdrawalsAction() {
  const admin = await verifyAdmin();
  if (!admin) return { success: false, message: 'Unauthorized' };

  const pending = await db.select({
    id: withdrawals.id,
    amountMinor: withdrawals.amountMinor,
    requestedAt: withdrawals.requestedAt,
    user: {
      phone: users.phone,
      displayName: users.displayName
    }
  })
  .from(withdrawals)
  .leftJoin(users, eq(users.id, withdrawals.userId))
  .where(eq(withdrawals.status, 'PENDING' as any))
  .orderBy(desc(withdrawals.requestedAt));

  return { success: true, data: pending };
}
