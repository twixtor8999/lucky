import { users, transactions, ledgerEntries, wallets, mpins, bets, results, markets, marketSchedules, otpVerifications, bonusCampaigns, bonusClaims, deposits } from '../packages/shared/src/db/schema';
import { db } from '../packages/shared/src/db/index';
import { eq } from 'drizzle-orm';
import { requestOtpAction, verifyOtpAction, setupMpinAction, loginWithMpinAction } from '../apps/web/src/app/actions/auth';
import { claimWelcomeBonusAction, getWalletAction, requestWithdrawalAction } from '../apps/web/src/app/actions/wallet';
import { getMarketsAction, seedMarketsAction } from '../apps/web/src/app/actions/markets';
import { placeBetAction, publishResultAction, getBetHistoryAction } from '../apps/web/src/app/actions/betting';

// Mock cookies and headers for getServerSession and rateLimit to work
import * as headersMod from 'next/headers';
import crypto from 'crypto';

let sessionCookieValue = '';

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
    if (name === 'lucky777_session') return { value: sessionCookieValue };
    return undefined;
  },
  set: (name: string, value: string, options: any) => {
    if (name === 'lucky777_session') sessionCookieValue = value;
  },
  delete: (name: string) => {
    if (name === 'lucky777_session') sessionCookieValue = '';
  }
});

const getDbCounts = async () => {
  return {
    users: (await db.select().from(users)).length,
    transactions: (await db.select().from(transactions)).length,
    ledger: (await db.select().from(ledgerEntries)).length,
    bets: (await db.select().from(bets)).length,
  };
};

async function runTest() {
  console.log('--- STARTING DATABASE TEST ---');
  
  // Clean DB
  console.log('Cleaning database...');
  await db.delete(bets);
  await db.delete(results);
  await db.delete(ledgerEntries);
  await db.delete(transactions);
  await db.delete(deposits);
  await db.delete(bonusClaims);
  await db.delete(wallets);
  await db.delete(mpins);
  await db.delete(otpVerifications);
  await db.delete(users);

  let counts = await getDbCounts();
  console.log('Initial DB state:', counts);

  const phone = '9998887776';

  // 1. Request OTP
  console.log('\n[1] Request OTP');
  // Need to force mock OTP environment variable for test
  process.env.USE_MOCK_OTP = 'true';
  const reqRes = await requestOtpAction(phone);
  console.log('OTP Request:', reqRes);

  // 2. Verify OTP
  console.log('\n[2] Verify OTP');
  const verRes = await verifyOtpAction(phone, '774422');
  console.log('OTP Verify:', verRes);

  // 3. Setup MPIN
  console.log('\n[3] Setup MPIN');
  const mpinRes = await setupMpinAction('123456');
  console.log('MPIN Setup:', mpinRes);

  // 4. Session / Login
  console.log('\n[4] Session / Login');
  const loginRes = await loginWithMpinAction(phone, '123456');
  console.log('Login:', loginRes.success ? 'Success' : loginRes.message);

  // 5. Bonus Claim
  console.log('\n[5] Claim Welcome Bonus');
  const bonusRes = await claimWelcomeBonusAction();
  console.log('Bonus Claim:', bonusRes);

  // 6. Wallet Check
  console.log('\n[6] Check Wallet');
  const walletRes = await getWalletAction();
  console.log('Wallet:', walletRes.balances);

  // 7. Market Check
  console.log('\n[7] Get Markets');
  await seedMarketsAction(); // Ensure seeded
  const marketRes = await getMarketsAction();
  const openMarket = marketRes.markets?.find(m => m.status === 'OPEN');
  console.log('Found open market:', openMarket?.name);

  // 8. Place Bet
  console.log('\n[8] Place Bet');
  if (openMarket) {
    const betRes = await placeBetAction({
      marketId: openMarket.id,
      amount: 50,
      betType: 'SINGLE_DIGIT',
      digitSelection: '7',
    });
    console.log('Place Bet:', betRes);
  } else {
    console.log('No open market to place bet!');
  }

  // 9. Check Wallet After Bet
  console.log('\n[9] Wallet After Bet');
  const walletAfterBet = await getWalletAction();
  console.log('Wallet:', walletAfterBet.balances);

  // Final DB Check
  console.log('\n--- FINAL DATABASE STATE ---');
  counts = await getDbCounts();
  console.log('Final DB state:', counts);
  
  const allLedger = await db.select().from(ledgerEntries);
  console.log('\nLedger Entries:');
  allLedger.forEach(l => console.log(`  ${l.entryType} ${l.balanceType} ${l.amountMinor} (Ref: ${l.referenceType})`));

  process.exit(0);
}

runTest().catch(console.error);
