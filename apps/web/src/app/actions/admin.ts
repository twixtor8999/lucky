'use server';

import { cookies } from 'next/headers';
import { db, appSettings, users, wallets, transactions, ledgerEntries, deposits, markets, results } from '@zenvora/shared/db';
import { eq, and, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function loginAdmin(password: string) {
  try {
    const settings = await db.query.appSettings.findFirst({ where: eq(appSettings.id, 'global') });
    const actualPassword = settings?.adminPassword || 'Admin@123';
    
    if (password === actualPassword) {
      cookies().set('admin_auth', 'authenticated', { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });
      return { success: true };
    }
    return { success: false, error: 'Invalid password' };
  } catch (err) {
    // Fallback if DB table doesn't exist yet
    if (password === 'Admin@123') {
      cookies().set('admin_auth', 'authenticated', { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });
      return { success: true };
    }
    return { success: false, error: 'Invalid password' };
  }
}

export async function logoutAdmin() {
  cookies().delete('admin_auth');
  redirect('/super-secret-admin');
}

export async function getUsersWithWallets() {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  const allUsers = await db.select({
    id: users.id,
    phone: users.phone,
    createdAt: users.createdAt,
    welcomeBonusStatus: users.welcomeBonusStatus,
    upiId: users.upiId,
    bankAccountName: users.bankAccountName,
    bankAccountNumber: users.bankAccountNumber,
    bankIfsc: users.bankIfsc,
    bankName: users.bankName,
    // Note: To get balance, we'd need to aggregate ledgerEntries, 
    // but for the admin table we'll return 0 and fetch it live if needed
  })
  .from(users)
  .orderBy(desc(users.createdAt));

  return allUsers.map(u => ({ ...u, balance: 0 }));
}

export async function confirmWelcomeBonusPayment(
  userId: string, 
  actualAmount: number,
  paymentMethod: string,
  utr: string,
  note?: string
) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  try {
    await db.transaction(async (tx: any) => {
      // Verify not already paid
      const userRec = await tx.query.users.findFirst({
        where: eq(users.id, userId)
      });
      if (!userRec) throw new Error('User not found');
      if (userRec.welcomeBonusStatus === 'PAID') throw new Error('Bonus already paid');

      // 1. Get user wallet
      const wallet = await tx.query.wallets.findFirst({
        where: eq(wallets.userId, userId)
      });
      
      let walletId = wallet?.id;

      // Create wallet if doesn't exist
      if (!wallet) {
        const [newWallet] = await tx.insert(wallets)
          .values({ userId })
          .returning();
        walletId = newWallet.id;
      }

      // 2. Create transaction record
      const [txn] = await tx.insert(transactions)
        .values({
          userId,
          type: 'WELCOME_BONUS',
          amountMinor: actualAmount,
          status: 'COMPLETED',
          externalReference: utr,
        })
        .returning();

      // 3. Create ledger entry
      await tx.insert(ledgerEntries)
        .values({
          walletId: walletId!,
          transactionId: txn.id,
          entryType: 'CREDIT',
          balanceType: 'BONUS',
          amountMinor: actualAmount,
          referenceType: 'TRANSACTION',
          referenceId: txn.id,
          description: `Admin Manual Bonus - ${paymentMethod} (${utr}) ${note ? '- '+note : ''}`
        });

      // 4. Mark user as paid
      await tx.update(users)
        .set({ welcomeBonusStatus: 'PAID', updatedAt: new Date() })
        .where(eq(users.id, userId));
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Failed to credit bonus:', error);
    return { success: false, error: error.message || 'Failed to credit bonus.' };
  }
}

export async function getPendingDeposits() {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  const pendingDeposits = await db.select({
    id: deposits.id,
    amount: deposits.amountMinor,
    utr: deposits.utr,
    requestedAt: deposits.requestedAt,
    user: {
      id: users.id,
      phone: users.phone,
    }
  })
  .from(deposits)
  .leftJoin(users, eq(deposits.userId, users.id))
  .where(eq(deposits.status, 'PENDING'))
  .orderBy(desc(deposits.requestedAt));

  return pendingDeposits;
}

export async function approveDeposit(depositId: string, actualAmount: number, adminUserId?: string) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  try {
    await db.transaction(async (tx: any) => {
      // 1. Get deposit
      const deposit = await tx.query.deposits.findFirst({
        where: eq(deposits.id, depositId)
      });
      if (!deposit || deposit.status !== 'PENDING') throw new Error('Invalid deposit request.');

      // 2. Mark as completed and record actual amount
      await tx.update(deposits)
        .set({ 
          status: 'COMPLETED', 
          actualAmountMinor: actualAmount,
          verifiedAt: new Date(),
          processedAt: new Date() 
        })
        .where(eq(deposits.id, depositId));

      // 3. Update wallet
      const wallet = await tx.query.wallets.findFirst({
        where: eq(wallets.userId, deposit.userId)
      });
      let walletId = wallet?.id;
      if (!wallet) {
        const [newWallet] = await tx.insert(wallets).values({ userId: deposit.userId }).returning();
        walletId = newWallet.id;
      }

      // 4. Create transaction
      const [txn] = await tx.insert(transactions).values({
        userId: deposit.userId,
        type: 'DEPOSIT',
        amountMinor: actualAmount,
        status: 'COMPLETED',
        externalReference: deposit.utr
      }).returning();

      await tx.insert(ledgerEntries).values({
        walletId: walletId!,
        transactionId: txn.id,
        entryType: 'CREDIT',
        balanceType: 'CASH',
        amountMinor: actualAmount,
        referenceType: 'DEPOSIT',
        referenceId: deposit.id,
        description: `Deposit via UTR: ${deposit.utr}`
      });
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectDeposit(depositId: string, reason: string) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  try {
    await db.update(deposits)
      .set({ 
        status: 'REJECTED', 
        rejectionReason: reason,
        processedAt: new Date() 
      })
      .where(eq(deposits.id, depositId));
      
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllMarkets() {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  return await db.select().from(markets).orderBy(markets.createdAt);
}


export async function publishOpenResult(marketId: string, resultDate: string, openPatti: string) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  try {
    // Automatically calculate Open Ank from Open Patti
    const sum = openPatti.split('').reduce((a, b) => a + parseInt(b, 10), 0);
    const openAnk = (sum % 10).toString();
    const resultValue = `${openPatti}-${openAnk}-***`;

    await db.insert(results).values({
      marketId,
      resultDate,
      resultValue,
      openPatti,
      openAnk,
      status: 'OPEN_PUBLISHED',
      publishedAt: new Date(),
    });

    return { success: true, openAnk };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function publishCloseResult(marketId: string, resultDate: string, closePatti: string) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  try {
    const existingResult = await db.query.results.findFirst({
      where: and(eq(results.marketId, marketId), eq(results.resultDate, resultDate))
    });

    if (!existingResult || existingResult.status !== 'OPEN_PUBLISHED') {
      throw new Error('You must publish the Open Result first before publishing the Close Result.');
    }

    // Automatically calculate Close Ank from Close Patti
    const sum = closePatti.split('').reduce((a, b) => a + parseInt(b, 10), 0);
    const closeAnk = (sum % 10).toString();
    
    // Jodi is just OpenAnk + CloseAnk
    const jodi = `${existingResult.openAnk}${closeAnk}`;
    const resultValue = `${existingResult.openPatti}-${jodi}-${closePatti}`;

    await db.update(results).set({
      closePatti,
      closeAnk,
      resultValue,
      status: 'PUBLISHED',
      updatedAt: new Date()
    }).where(eq(results.id, existingResult.id));

    return { success: true, closeAnk, jodi };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

