'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { db, appSettings, users, wallets, transactions, ledgerEntries, deposits, markets, results, notifications, bets } from '@zenvora/shared/db';
import { eq, and, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getServerSession } from '../../lib/session';
import { writeAuditLog } from '../../lib/audit';

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

async function verifyAdminAuth() {
  let authCookieValue: string | undefined;
  try {
    authCookieValue = cookies().get('admin_auth')?.value;
  } catch {
    authCookieValue = (globalThis as any).__TEST_ADMIN_AUTH__;
  }

  if (authCookieValue === 'authenticated') {
    const adminUser = await db.select({ id: users.id }).from(users).where(eq(users.role, 'ADMIN')).limit(1);
    return { isAuthorized: true, adminId: adminUser[0]?.id || null };
  }

  const sessionUser = await getServerSession();
  if (sessionUser && sessionUser.role === 'ADMIN') {
    return { isAuthorized: true, adminId: sessionUser.id };
  }

  return { isAuthorized: false, adminId: null };
}

function maskBankNumber(acc?: string | null): string {
  if (!acc || acc.trim() === '') return 'Not Provided';
  const clean = acc.trim();
  if (clean.length <= 4) return 'XXXX ' + clean;
  return 'XXXX XXXX ' + clean.slice(-4);
}

export async function getPendingDeposits(statusFilter?: 'ALL' | 'PENDING' | 'COMPLETED' | 'REJECTED') {
  const auth = await verifyAdminAuth();
  if (!auth.isAuthorized) throw new Error('Unauthorized');

  const baseQuery = db.select({
    id: deposits.id,
    amount: deposits.amountMinor,
    actualAmount: deposits.actualAmountMinor,
    utr: deposits.utr,
    status: deposits.status,
    adminNote: deposits.adminNote,
    rejectionReason: deposits.rejectionReason,
    requestedAt: deposits.requestedAt,
    verifiedAt: deposits.verifiedAt,
    processedAt: deposits.processedAt,
    user: {
      id: users.id,
      phone: users.phone,
      displayName: users.displayName,
      upiId: users.upiId,
      bankAccountName: users.bankAccountName,
      bankAccountNumber: users.bankAccountNumber,
      bankIfsc: users.bankIfsc,
      bankName: users.bankName,
    }
  })
  .from(deposits)
  .leftJoin(users, eq(deposits.userId, users.id));

  let results;
  if (!statusFilter || statusFilter === 'PENDING') {
    results = await baseQuery.where(eq(deposits.status, 'PENDING')).orderBy(desc(deposits.requestedAt));
  } else if (statusFilter === 'ALL') {
    results = await baseQuery.orderBy(desc(deposits.requestedAt));
  } else {
    results = await baseQuery.where(eq(deposits.status, statusFilter as any)).orderBy(desc(deposits.requestedAt));
  }

  return results.map(dep => ({
    ...dep,
    user: dep.user ? {
      ...dep.user,
      maskedBankAccount: maskBankNumber(dep.user.bankAccountNumber),
    } : null,
  }));
}

export async function approveDeposit(
  depositId: string, 
  actualAmount: number, 
  confirmedUtr?: string,
  adminNote?: string
) {
  const auth = await verifyAdminAuth();
  if (!auth.isAuthorized) return { success: false, error: 'Unauthorized. Admin access required.' };

  if (!Number.isFinite(actualAmount) || actualAmount <= 0) {
    return { success: false, error: 'Actual amount received must be greater than ₹0.' };
  }

  try {
    const result = await db.transaction(async (tx: any) => {
      // 1. Lock/fetch deposit
      const deposit = await tx.query.deposits.findFirst({
        where: eq(deposits.id, depositId)
      });

      if (!deposit) throw new Error('Deposit request not found.');
      if (deposit.status !== 'PENDING') throw new Error('Deposit has already been processed or is no longer pending.');

      // 2. Validate UTR confirmation if provided
      if (confirmedUtr && confirmedUtr.trim()) {
        if (confirmedUtr.trim().toUpperCase() !== deposit.utr.trim().toUpperCase()) {
          throw new Error('Entered UTR does not match the deposit reference.');
        }
      }

      // 3. Atomically update deposit status (prevent concurrent double-approval)
      const updated = await tx.update(deposits)
        .set({ 
          status: 'COMPLETED', 
          actualAmountMinor: actualAmount,
          adminNote: adminNote?.trim() || 'Payment verified in bank statement.',
          verifiedAt: new Date(),
          processedAt: new Date(),
          processedBy: auth.adminId || null,
        })
        .where(and(eq(deposits.id, depositId), eq(deposits.status, 'PENDING')))
        .returning();

      if (updated.length === 0) {
        throw new Error('Deposit was already processed by another request.');
      }

      // 4. Find or create user wallet
      const wallet = await tx.query.wallets.findFirst({
        where: eq(wallets.userId, deposit.userId)
      });
      let walletId = wallet?.id;
      if (!wallet) {
        const [newWallet] = await tx.insert(wallets).values({ userId: deposit.userId, currency: 'INR' }).returning();
        walletId = newWallet.id;
      }

      // 5. Update or insert transaction record
      await tx.update(transactions)
        .set({
          status: 'COMPLETED',
          amountMinor: actualAmount,
          completedAt: new Date(),
        })
        .where(and(
          eq(transactions.userId, deposit.userId),
          eq(transactions.externalReference, deposit.utr),
          eq(transactions.type, 'DEPOSIT')
        ));

      // 6. Insert Authoritative CASH CREDIT Ledger Entry
      await tx.insert(ledgerEntries).values({
        walletId: walletId!,
        entryType: 'CREDIT',
        balanceType: 'CASH',
        amountMinor: actualAmount,
        currency: 'INR',
        referenceType: 'DEPOSIT',
        referenceId: deposit.id,
      });

      // 7. Insert Real User Notification
      await tx.insert(notifications).values({
        userId: deposit.userId,
        type: 'DEPOSIT_APPROVED',
        title: '💰 Deposit Verified & Credited!',
        body: `Your ₹${actualAmount.toLocaleString()} deposit (UTR: ${deposit.utr}) has been verified and credited to your wallet.`
      });

      return { success: true, deposit };
    });

    // 8. Write Audit Logs
    await writeAuditLog('DEPOSIT_APPROVED', 'Deposit', {
      actorId: auth.adminId || undefined,
      entityId: depositId,
      metadata: {
        requestedAmount: result.deposit.amountMinor,
        verifiedAmount: actualAmount,
        utr: result.deposit.utr,
        adminNote: adminNote?.trim(),
      }
    });

    await writeAuditLog('WALLET_CREDIT_FROM_DEPOSIT', 'Ledger', {
      actorId: auth.adminId || undefined,
      entityId: depositId,
      metadata: {
        userId: result.deposit.userId,
        amount: actualAmount,
      }
    });

    return { success: true, message: 'Deposit verified and credited successfully.' };
  } catch (error: any) {
    console.error('Error approving deposit:', error);
    return { success: false, error: error.message || 'Failed to approve deposit' };
  }
}

export async function rejectDeposit(depositId: string, reason: string) {
  const auth = await verifyAdminAuth();
  if (!auth.isAuthorized) return { success: false, error: 'Unauthorized. Admin access required.' };

  if (!reason || reason.trim() === '') {
    return { success: false, error: 'A rejection reason is required.' };
  }

  try {
    const result = await db.transaction(async (tx: any) => {
      const updated = await tx.update(deposits)
        .set({ 
          status: 'REJECTED', 
          rejectionReason: reason.trim(),
          processedAt: new Date(),
          processedBy: auth.adminId || null,
        })
        .where(and(eq(deposits.id, depositId), eq(deposits.status, 'PENDING')))
        .returning();

      if (updated.length === 0) {
        throw new Error('Deposit is no longer pending or has already been processed.');
      }

      const deposit = updated[0];

      await tx.update(transactions)
        .set({ 
          status: 'REJECTED', 
          completedAt: new Date() 
        })
        .where(and(
          eq(transactions.userId, deposit.userId),
          eq(transactions.externalReference, deposit.utr),
          eq(transactions.type, 'DEPOSIT')
        ));

      // Real User Notification
      await tx.insert(notifications).values({
        userId: deposit.userId,
        type: 'DEPOSIT_REJECTED',
        title: '❌ Deposit Request Rejected',
        body: `Your deposit request for ₹${deposit.amountMinor} (UTR: ${deposit.utr}) was rejected. Reason: ${reason.trim()}`
      });

      return { success: true, deposit };
    });

    await writeAuditLog('DEPOSIT_REJECTED', 'Deposit', {
      actorId: auth.adminId || undefined,
      entityId: depositId,
      metadata: {
        amount: result.deposit.amountMinor,
        utr: result.deposit.utr,
        reason: reason.trim(),
      }
    });

    return { success: true, message: 'Deposit rejected.' };
  } catch (error: any) {
    console.error('Error rejecting deposit:', error);
    return { success: false, error: error.message || 'Failed to reject deposit' };
  }
}

export async function getAllMarkets() {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  const allMarkets = await db.select().from(markets).orderBy(markets.createdAt);
  const allResults = await db.select().from(results).orderBy(desc(results.resultDate), desc(results.createdAt));

  return allMarkets.map(m => {
    const latestRes = allResults.find(r => r.marketId === m.id);
    return {
      ...m,
      currentResult: latestRes ? {
        id: latestRes.id,
        resultDate: latestRes.resultDate,
        resultValue: latestRes.resultValue,
        openPatti: latestRes.openPatti,
        openAnk: latestRes.openAnk,
        closeAnk: latestRes.closeAnk,
        closePatti: latestRes.closePatti,
        status: latestRes.status,
      } : null
    };
  });
}


export async function publishOpenResult(marketId: string, resultDate: string, openPatti: string) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  try {
    // Automatically calculate Open Ank from Open Patti
    const sum = openPatti.split('').reduce((a, b) => a + parseInt(b, 10), 0);
    const openAnk = (sum % 10).toString();
    const resultValue = `${openPatti}-${openAnk}-***`;

    const existing = await db.select().from(results)
      .where(and(eq(results.marketId, marketId), eq(results.resultDate, resultDate)))
      .limit(1);

    if (existing[0]) {
      await db.update(results).set({
        resultValue,
        openPatti,
        openAnk,
        status: 'OPEN_PUBLISHED',
        updatedAt: new Date()
      }).where(eq(results.id, existing[0].id));
    } else {
      await db.insert(results).values({
        marketId,
        resultDate,
        resultValue,
        openPatti,
        openAnk,
        status: 'OPEN_PUBLISHED',
        publishedAt: new Date(),
      });
    }

    revalidatePath('/');
    return { success: true, openAnk, resultValue };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function publishCloseResult(marketId: string, resultDate: string, closePatti: string) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  try {
    const existingResult = await db.select().from(results)
      .where(and(eq(results.marketId, marketId), eq(results.resultDate, resultDate)))
      .limit(1);

    const existing = existingResult[0];

    if (!existing || existing.status !== 'OPEN_PUBLISHED') {
      throw new Error('You must publish the Open Result first before publishing the Close Result.');
    }

    // Automatically calculate Close Ank from Close Patti
    const sum = closePatti.split('').reduce((a, b) => a + parseInt(b, 10), 0);
    const closeAnk = (sum % 10).toString();
    
    // Jodi is just OpenAnk + CloseAnk
    const jodi = `${existing.openAnk}${closeAnk}`;
    const resultValue = `${existing.openPatti}-${jodi}-${closePatti}`;

    await db.update(results).set({
      closePatti,
      closeAnk,
      resultValue,
      status: 'PUBLISHED',
      updatedAt: new Date()
    }).where(eq(results.id, existing.id));

    revalidatePath('/');
    return { success: true, closeAnk, jodi };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// For Starline (format: XXX-X) and Jackpot (format: XXX) — single publish, no close session
export async function publishSingleResult(
  marketId: string,
  resultDate: string,
  patti: string,
  marketType: 'starline' | 'jackpot'
) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  try {
    let resultValue: string;
    let openAnk: string | undefined;

    if (marketType === 'starline') {
      // Starline: XXX-X (patti dash ank)
      const sum = patti.split('').reduce((a, b) => a + parseInt(b, 10), 0);
      openAnk = (sum % 10).toString();
      resultValue = `${patti}-${openAnk}`;
    } else {
      // Jackpot: XXX (just the 3-digit patti)
      resultValue = patti;
    }

    // Check if result already exists for this market+date (allow re-publishing)
    const existing = await db.select().from(results)
      .where(and(eq(results.marketId, marketId), eq(results.resultDate, resultDate)))
      .limit(1);

    if (existing[0]) {
      // Update existing
      await db.update(results).set({
        openPatti: patti,
        openAnk: openAnk ?? null,
        resultValue,
        status: 'PUBLISHED',
        updatedAt: new Date(),
      }).where(eq(results.id, existing[0].id));
    } else {
      // Insert new
      await db.insert(results).values({
        marketId,
        resultDate,
        resultValue,
        openPatti: patti,
        openAnk: openAnk ?? null,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      });
    }

    revalidatePath('/');
    return { success: true, resultValue };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function getMarketCategoryHelper(name: string): 'main' | 'starline' | 'jackpot' {
  const n = name.toLowerCase();
  if (n.includes('starline')) return 'starline';
  if (n.includes('jackpot')) return 'jackpot';
  return 'main';
}

export async function getAdminBidsData() {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  const allMarkets = await db.select().from(markets);
  const marketsWithCategory = allMarkets.map(m => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    category: getMarketCategoryHelper(m.name),
  }));

  const allBets = await db.select({
    id: bets.id,
    userId: bets.userId,
    marketId: bets.marketId,
    betTypeCode: bets.betTypeCode,
    selection: bets.selection,
    session: bets.session,
    amountMinor: bets.amountMinor,
    status: bets.status,
    placedAt: bets.placedAt,
    userPhone: users.phone,
    marketName: markets.name,
  })
  .from(bets)
  .leftJoin(users, eq(bets.userId, users.id))
  .leftJoin(markets, eq(bets.marketId, markets.id))
  .orderBy(desc(bets.placedAt));

  const formattedBets = allBets.map(b => {
    const marketName = b.marketName || 'Unknown Market';
    const category = getMarketCategoryHelper(marketName);
    return {
      id: b.id,
      userId: b.userId,
      userPhone: b.userPhone || 'Anonymous',
      marketId: b.marketId,
      marketName,
      category,
      betTypeCode: b.betTypeCode,
      selection: b.selection,
      session: b.session || 'OPEN',
      amount: Number(b.amountMinor),
      status: b.status,
      placedAt: b.placedAt ? new Date(b.placedAt).toISOString() : new Date().toISOString(),
    };
  });

  return {
    success: true,
    markets: marketsWithCategory,
    bets: formattedBets,
  };
}

export async function seedDemoBidsAction() {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  const allUsers = await db.select().from(users).limit(5);
  const allMarkets = await db.select().from(markets);

  if (allUsers.length === 0 || allMarkets.length === 0) {
    return { success: false, error: 'Users or markets not found' };
  }

  const mainMarkets = allMarkets.filter(m => getMarketCategoryHelper(m.name) === 'main');
  const starlineMarkets = allMarkets.filter(m => getMarketCategoryHelper(m.name) === 'starline');
  const jackpotMarkets = allMarkets.filter(m => getMarketCategoryHelper(m.name) === 'jackpot');

  const targetMain = mainMarkets[0] || allMarkets[0];
  const targetStarline = starlineMarkets[0] || allMarkets[0];
  const targetJackpot = jackpotMarkets[0] || allMarkets[0];

  const sampleBids = [
    // Main market bids
    { market: targetMain, type: 'SINGLE_ANK', selection: '7', session: 'OPEN', amount: 200 },
    { market: targetMain, type: 'SINGLE_ANK', selection: '7', session: 'OPEN', amount: 500 },
    { market: targetMain, type: 'SINGLE_ANK', selection: '3', session: 'OPEN', amount: 100 },
    { market: targetMain, type: 'SINGLE_ANK', selection: '8', session: 'CLOSE', amount: 300 },
    { market: targetMain, type: 'JODI', selection: '74', session: 'OPEN', amount: 150 },
    { market: targetMain, type: 'SINGLE_PATTI', selection: '179', session: 'OPEN', amount: 50 },
    
    // Starline bids
    { market: targetStarline, type: 'SINGLE_ANK', selection: '9', session: 'OPEN', amount: 400 },
    { market: targetStarline, type: 'SINGLE_ANK', selection: '9', session: 'OPEN', amount: 200 },
    { market: targetStarline, type: 'SINGLE_ANK', selection: '2', session: 'OPEN', amount: 100 },
    { market: targetStarline, type: 'SINGLE_PATTI', selection: '450', session: 'OPEN', amount: 100 },

    // Jackpot bids
    { market: targetJackpot, type: 'SINGLE_PATTI', selection: '789', session: 'OPEN', amount: 250 },
    { market: targetJackpot, type: 'SINGLE_PATTI', selection: '789', session: 'OPEN', amount: 500 },
    { market: targetJackpot, type: 'SINGLE_PATTI', selection: '345', session: 'OPEN', amount: 100 },
    { market: targetJackpot, type: 'TRIPLE_PATTI', selection: '777', session: 'OPEN', amount: 150 },
  ];

  for (let i = 0; i < sampleBids.length; i++) {
    const item = sampleBids[i];
    const user = allUsers[i % allUsers.length];

    await db.insert(bets).values({
      userId: user.id,
      marketId: item.market.id,
      betTypeCode: item.type,
      selection: item.selection,
      session: item.session,
      amountMinor: item.amount,
      status: 'ACTIVE',
      idempotencyKey: `demo-bid-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      placedAt: new Date(Date.now() - (i * 15 * 60 * 1000)),
    });
  }

  revalidatePath('/super-secret-admin/dashboard');
  return { success: true, count: sampleBids.length };
}
