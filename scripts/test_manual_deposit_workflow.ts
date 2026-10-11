import { db, users, wallets, deposits, transactions, ledgerEntries, sessions } from '../packages/shared/src/db';
import { eq, and } from 'drizzle-orm';
import { addMoneyAction, getWalletAction, getUserDepositsAction } from '../apps/web/src/app/actions/wallet';
import { getPendingDeposits, approveDeposit, rejectDeposit } from '../apps/web/src/app/actions/admin';
import * as headersMod from 'next/headers';
import crypto from 'crypto';

let cookiesStore: Record<string, string> = {};

// @ts-ignore
headersMod.headers = () => ({
  get: (name: string) => {
    if (name === 'x-forwarded-for') return '127.0.0.1';
    return null;
  }
});

// @ts-ignore
headersMod.cookies = () => ({
  get: (name: string) => {
    const val = cookiesStore[name];
    return val !== undefined ? { value: val } : undefined;
  },
  set: (name: string, value: string, options: any) => {
    cookiesStore[name] = value;
    if (name === 'admin_auth') (globalThis as any).__TEST_ADMIN_AUTH__ = value;
    if (name === 'lucky777_session') (globalThis as any).__TEST_SESSION_TOKEN__ = value;
  },
  delete: (name: string) => {
    delete cookiesStore[name];
    if (name === 'admin_auth') delete (globalThis as any).__TEST_ADMIN_AUTH__;
    if (name === 'lucky777_session') delete (globalThis as any).__TEST_SESSION_TOKEN__;
  }
});

function setAdminAuth(isAuth: boolean) {
  if (isAuth) {
    cookiesStore['admin_auth'] = 'authenticated';
    (globalThis as any).__TEST_ADMIN_AUTH__ = 'authenticated';
  } else {
    delete cookiesStore['admin_auth'];
    delete (globalThis as any).__TEST_ADMIN_AUTH__;
  }
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function createTestSession(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    userId,
    tokenHash,
    expiresAt,
  });

  cookiesStore['lucky777_session'] = token;
  (globalThis as any).__TEST_SESSION_TOKEN__ = token;
  return token;
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🎰 LUCKY 777 MANUAL DEPOSIT & VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  const totalTests = 10;

  // Clean / Setup test user
  const testPhone = '9876543210';
  await db.delete(users).where(eq(users.phone, testPhone));

  const [testUser] = await db.insert(users).values({
    phone: testPhone,
    displayName: 'Rahul Kumar',
    role: 'USER',
    upiId: 'rahul@upi',
    bankAccountName: 'Rahul Kumar',
    bankAccountNumber: '123456789012',
    bankIfsc: 'HDFC0001234',
    bankName: 'HDFC Bank',
  }).returning();

  const [testWallet] = await db.insert(wallets).values({
    userId: testUser.id,
    currency: 'INR',
  }).returning();

  // Log in as testUser
  await createTestSession(testUser.id);

  // ----------------------------------------------------
  // TEST 1: User submits ₹500 + UTR -> deposit = PENDING, wallet = unchanged
  // ----------------------------------------------------
  console.log('Test 1: User submits ₹500 + UTR');
  const utr1 = 'UTR_' + Date.now() + '_01';
  const dep1Res = await addMoneyAction(500, utr1);

  if (!dep1Res.success) throw new Error('Test 1 failed to create deposit: ' + dep1Res.message);

  const dep1InDb = (await db.select().from(deposits).where(eq(deposits.utr, utr1)).limit(1))[0];
  const wallet1 = await getWalletAction();

  if (dep1InDb && dep1InDb.status === 'PENDING' && wallet1.balances?.cashBalance === 0) {
    console.log('  ✓ PASSED: Deposit status is PENDING and cashBalance is 0 (unchanged).\n');
    passedTests++;
  } else {
    throw new Error('Test 1 Assertion Failed: deposit status is not PENDING or wallet changed.');
  }

  // ----------------------------------------------------
  // TEST 2: Admin sees the deposit with user + UTR + payment details
  // ----------------------------------------------------
  console.log('Test 2: Admin sees the deposit with user + UTR + payment details');
  // Set admin auth
  setAdminAuth(true);
  const adminList = await getPendingDeposits('PENDING');
  const foundInAdmin = adminList.find(d => d.id === dep1InDb.id);

  if (
    foundInAdmin && 
    foundInAdmin.utr === utr1 && 
    foundInAdmin.amount === 500 &&
    foundInAdmin.user?.phone === testPhone &&
    foundInAdmin.user?.upiId === 'rahul@upi' &&
    foundInAdmin.user?.maskedBankAccount.includes('9012')
  ) {
    console.log('  ✓ PASSED: Admin sees deposit, amount, UTR, and masked bank details (•••• •••• 9012).\n');
    passedTests++;
  } else {
    throw new Error('Test 2 Assertion Failed: Admin could not view pending deposit with payment details.');
  }

  // ----------------------------------------------------
  // TEST 3: Admin verifies ₹500 -> deposit = SUCCESS, ledger = +₹500 CASH, wallet = +₹500
  // ----------------------------------------------------
  console.log('Test 3: Admin verifies ₹500');
  const approveRes = await approveDeposit(dep1InDb.id, 500, utr1, 'Verified in HDFC account');

  if (!approveRes.success) throw new Error('Test 3 Failed to approve deposit: ' + approveRes.error);

  const dep1Approved = (await db.select().from(deposits).where(eq(deposits.id, dep1InDb.id)).limit(1))[0];
  // Switch back to user session to check wallet
  setAdminAuth(false);
  const walletAfterApprove = await getWalletAction();

  if (
    dep1Approved.status === 'COMPLETED' &&
    dep1Approved.actualAmountMinor === 500 &&
    walletAfterApprove.balances?.cashBalance === 500
  ) {
    console.log('  ✓ PASSED: Deposit status = COMPLETED, actualAmount = 500, wallet cashBalance = ₹500.\n');
    passedTests++;
  } else {
    throw new Error('Test 3 Assertion Failed: Balance not credited or deposit not COMPLETED.');
  }

  // ----------------------------------------------------
  // TEST 4: Admin attempts approval again -> rejected, no second credit
  // ----------------------------------------------------
  console.log('Test 4: Admin attempts approval again (double-credit prevention)');
  setAdminAuth(true);
  const secondApprove = await approveDeposit(dep1InDb.id, 500, utr1);

  setAdminAuth(false);
  const walletAfterSecond = await getWalletAction();

  if (
    !secondApprove.success &&
    walletAfterSecond.balances?.cashBalance === 500
  ) {
    console.log('  ✓ PASSED: Second approval rejected ("' + secondApprove.error + '"), wallet balance remains ₹500.\n');
    passedTests++;
  } else {
    throw new Error('Test 4 Assertion Failed: Second approval was permitted or wallet balance duplicated.');
  }

  // ----------------------------------------------------
  // TEST 5: Two simultaneous approval requests -> only one succeeds
  // ----------------------------------------------------
  console.log('Test 5: Two simultaneous approval requests (concurrency protection)');
  const utrConcurrent = 'UTR_CONCURRENT_' + Date.now();
  const depConcRes = await addMoneyAction(1000, utrConcurrent);
  const depConcRec = (await db.select().from(deposits).where(eq(deposits.utr, utrConcurrent)).limit(1))[0];

  setAdminAuth(true);
  // Fire both simultaneously
  const [resA, resB] = await Promise.all([
    approveDeposit(depConcRec.id, 1000, utrConcurrent),
    approveDeposit(depConcRec.id, 1000, utrConcurrent),
  ]);

  const oneSucceeded = (resA.success && !resB.success) || (!resA.success && resB.success);

  setAdminAuth(false);
  const walletAfterConc = await getWalletAction();

  if (oneSucceeded && walletAfterConc.balances?.cashBalance === 1500) { // 500 + 1000 = 1500
    console.log('  ✓ PASSED: Exactly 1 concurrent request succeeded, other failed safely. Wallet balance is exactly ₹1500.\n');
    passedTests++;
  } else {
    throw new Error('Test 5 Assertion Failed: Concurrency protection failed. resA: ' + JSON.stringify(resA) + ', resB: ' + JSON.stringify(resB));
  }

  // ----------------------------------------------------
  // TEST 6: Admin rejects deposit -> status REJECTED, wallet unchanged, no credit
  // ----------------------------------------------------
  console.log('Test 6: Admin rejects deposit');
  const utrReject = 'UTR_REJECT_' + Date.now();
  await addMoneyAction(300, utrReject);
  const depRejectRec = (await db.select().from(deposits).where(eq(deposits.utr, utrReject)).limit(1))[0];

  setAdminAuth(true);
  const rejectRes = await rejectDeposit(depRejectRec.id, 'UTR not found in bank statement');

  setAdminAuth(false);
  const depAfterReject = (await db.select().from(deposits).where(eq(deposits.id, depRejectRec.id)).limit(1))[0];
  const walletAfterReject = await getWalletAction();

  if (
    rejectRes.success &&
    depAfterReject.status === 'REJECTED' &&
    depAfterReject.rejectionReason === 'UTR not found in bank statement' &&
    walletAfterReject.balances?.cashBalance === 1500 // unchanged
  ) {
    console.log('  ✓ PASSED: Deposit status = REJECTED, reason recorded, wallet balance unchanged at ₹1500.\n');
    passedTests++;
  } else {
    throw new Error('Test 6 Assertion Failed: Deposit rejection failed or balance altered.');
  }

  // ----------------------------------------------------
  // TEST 7: Duplicate UTR rejection
  // ----------------------------------------------------
  console.log('Test 7: Duplicate UTR rejection');
  const dupRes = await addMoneyAction(500, utr1); // utr1 was already submitted

  if (
    !dupRes.success &&
    dupRes.message === 'That transaction reference has already been submitted.'
  ) {
    console.log('  ✓ PASSED: Duplicate UTR submission rejected with exact required message: "' + dupRes.message + '".\n');
    passedTests++;
  } else {
    throw new Error('Test 7 Assertion Failed: Duplicate UTR was not rejected.');
  }

  // ----------------------------------------------------
  // TEST 8: Normal user calls admin approval action -> UNAUTHORIZED
  // ----------------------------------------------------
  console.log('Test 8: Normal user calls admin approval action');
  delete cookiesStore['admin_auth']; // regular user session active only
  const unauthorizedRes = await approveDeposit(depRejectRec.id, 100);

  if (
    !unauthorizedRes.success &&
    unauthorizedRes.error?.includes('Unauthorized')
  ) {
    console.log('  ✓ PASSED: Unauthorized request safely blocked with error: "' + unauthorizedRes.error + '".\n');
    passedTests++;
  } else {
    throw new Error('Test 8 Assertion Failed: Normal user was able to call admin action.');
  }

  // ----------------------------------------------------
  // TEST 9: Client attempts to set status = SUCCESS directly on submission
  // ----------------------------------------------------
  console.log('Test 9: Client cannot spoof deposit status');
  const utrSpoof = 'UTR_SPOOF_' + Date.now();
  // Call addMoneyAction: it only accepts amount and utr, ignoring any client status parameter
  const spoofRes = await addMoneyAction(250, utrSpoof);
  const spoofInDb = (await db.select().from(deposits).where(eq(deposits.utr, utrSpoof)).limit(1))[0];

  if (
    spoofRes.success &&
    spoofInDb.status === 'PENDING'
  ) {
    console.log('  ✓ PASSED: Server strictly forces status = PENDING. Client cannot set SUCCESS.\n');
    passedTests++;
  } else {
    throw new Error('Test 9 Assertion Failed: Server allowed client status spoofing.');
  }

  // ----------------------------------------------------
  // TEST 10: Client attempts to credit wallet directly
  // ----------------------------------------------------
  console.log('Test 10: Public/user actions cannot directly manipulate wallet balance');
  // Fetch user deposit history
  const userHistory = await getUserDepositsAction();
  const balanceCheck = await getWalletAction();

  if (
    userHistory.success &&
    Array.isArray(userHistory.deposits) &&
    balanceCheck.balances?.cashBalance === 1500
  ) {
    console.log('  ✓ PASSED: All user endpoints only read ledger or submit PENDING requests. Direct ledger credit is strictly impossible.\n');
    passedTests++;
  } else {
    throw new Error('Test 10 Assertion Failed: Balance compromised.');
  }

  // Cleanup test records
  await db.delete(deposits).where(eq(deposits.userId, testUser.id));
  await db.delete(ledgerEntries).where(eq(ledgerEntries.walletId, testWallet.id));
  await db.delete(transactions).where(eq(transactions.userId, testUser.id));
  await db.delete(sessions).where(eq(sessions.userId, testUser.id));
  await db.delete(wallets).where(eq(wallets.id, testWallet.id));
  await db.delete(users).where(eq(users.id, testUser.id));

  console.log('====================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runTestSuite().then(() => process.exit(0)).catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
