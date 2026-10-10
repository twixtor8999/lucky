'use server';

import { cookies } from 'next/headers';
import { db, withdrawals, users, wallets, transactions, ledgerEntries } from '@zenvora/shared/db';
import { eq, desc } from 'drizzle-orm';

export async function getPendingWithdrawals() {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  const pendingWithdrawals = await db.select({
    id: withdrawals.id,
    amount: withdrawals.amountMinor,
    requestedAt: withdrawals.requestedAt,
    user: {
      id: users.id,
      phone: users.phone,
    }
  })
  .from(withdrawals)
  .leftJoin(users, eq(withdrawals.userId, users.id))
  .where(eq(withdrawals.status, 'PENDING'))
  .orderBy(desc(withdrawals.requestedAt));

  return pendingWithdrawals;
}

export async function approveWithdrawal(withdrawalId: string, utrReference: string) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  try {
    await db.transaction(async (tx: any) => {
      // 1. Get withdrawal request
      const request = await tx.query.withdrawals.findFirst({
        where: eq(withdrawals.id, withdrawalId)
      });
      if (!request || request.status !== 'PENDING') throw new Error('Invalid withdrawal request.');

      // 2. Mark as completed
      await tx.update(withdrawals)
        .set({ 
          status: 'COMPLETED', 
          providerReference: utrReference,
          processedAt: new Date() 
        })
        .where(eq(withdrawals.id, withdrawalId));

      // Note: We assume the user's wallet was already DEBITED when they made the request.
      // If we are not debiting upon request, we would debit it here.
      // In a strict financial system, making a withdrawal request moves funds to a "LOCKED" state or debits it.
      // Since we don't have the user side built yet, we will assume it was debited upon request.
      
      // We log the transaction as completed.
      await tx.insert(transactions).values({
        userId: request.userId,
        type: 'WITHDRAWAL',
        amountMinor: request.amountMinor,
        status: 'COMPLETED',
        reference: utrReference
      });
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectWithdrawal(withdrawalId: string, reason: string) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  try {
    await db.transaction(async (tx: any) => {
      const request = await tx.query.withdrawals.findFirst({
        where: eq(withdrawals.id, withdrawalId)
      });
      if (!request || request.status !== 'PENDING') throw new Error('Invalid withdrawal request.');

      // 1. Mark as rejected
      await tx.update(withdrawals)
        .set({ 
          status: 'REJECTED', 
          providerReference: reason, // Store reason here
          processedAt: new Date() 
        })
        .where(eq(withdrawals.id, withdrawalId));

      // 2. Refund the wallet
      const wallet = await tx.query.wallets.findFirst({
        where: eq(wallets.userId, request.userId)
      });
      let walletId = wallet?.id;
      if (!wallet) {
        const [newWallet] = await tx.insert(wallets).values({ userId: request.userId }).returning();
        walletId = newWallet.id;
      }

      // 3. Create transaction
      const [txn] = await tx.insert(transactions).values({
        userId: request.userId,
        type: 'ADMIN_ADJUSTMENT',
        amountMinor: request.amountMinor,
        status: 'COMPLETED',
        description: `Refund for rejected withdrawal: ${reason}`
      }).returning();

      // 4. Create ledger entry
      await tx.insert(ledgerEntries).values({
        walletId: walletId!,
        transactionId: txn.id,
        entryType: 'CREDIT',
        balanceType: 'CASH',
        amountMinor: request.amountMinor,
        referenceType: 'WITHDRAWAL',
        referenceId: withdrawalId,
        description: `Refund for rejected withdrawal: ${reason}`
      });
    });
      
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
