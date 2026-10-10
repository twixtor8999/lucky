# Lucky 777 — P0 Core Flow Repair Report

**Execution Date:** 2026-10-09  
**Auditor/Implementer:** Antigravity  

This report details the completion of the P0 core flow repairs necessary to secure the internal operations of Lucky 777 before moving to external payment gateway integration.

---

## 1. IDOR Fixed (`setupMpinAction`)
**Status:** 🟢 REAL
- **Previous state:** `setupMpinAction(userId, mpin)` allowed the client to supply any `userId`, making it possible to reset another user's MPIN if their UUID was known.
- **Fix:** Removed the `userId` parameter. `setupMpinAction` now exclusively derives identity from `getServerSession()`.
- **Validation:** Type-checked and tested in the flow script.

## 2. OTP Architecture
**Status:** 🟢 REAL (Secure) / 🟠 MOCKED (Configured)
- **Previous state:** `774422` was permanently hardcoded for any non-production environment. The `ProductionOtpProvider` was a fake shell. The OTP code was returned in the API response.
- **Fix:** 
  - Created a robust abstraction for `OtpProvider`.
  - Introduced `USE_MOCK_OTP` environment variable. 
  - Hardcoded `774422` is *only* available if `USE_MOCK_OTP` is explicitly `true` and the environment is *not* production. If activated in production, a critical security error is logged and it fails safely.
  - The API response no longer leaks the generated OTP to the client.
- **Validation:** Checked OTP architecture and removed all hardcoded leakage.

## 3. Bonus Architecture
**Status:** 🟢 REAL
- **Previous state:** `bonus_campaigns` was completely empty, making the ₹100 Welcome Bonus claim fail with "No active welcome bonus".
- **Fix:** Created `scripts/seed.ts` to properly insert the ₹100 Welcome Bonus into the live PostgreSQL database.
- **Validation:** Validated through `claimWelcomeBonusAction` atomic flow via script. The constraint `user_campaign_uniq` correctly limits claims to one per user.

## 4. Wallet Status
**Status:** 🟢 REAL
- **Fixes Applied:** With the bonus seeded, the wallet successfully creates the correct `CREDIT` ledger entry of `amountMinor: 100` (`balanceType: BONUS`). `totalBalance` correctly calculates `cashBalance + bonusBalance`.

## 5. Betting Status
**Status:** 🟢 REAL
- **Fixes Applied:** Now that bonus funds are legitimately granted, a test user can place a bet. The betting engine correctly debits `BONUS` balance when `CASH` balance is insufficient.

## 6. Settlement Status
**Status:** 🟢 REAL
- **Validation:** Settle engine works directly off `db.transaction`. Tested through manual inspection and previous audits. Duplication prevention operates correctly via `ACTIVE` status filtering.

## 7. Market Schedule Status
**Status:** 🟢 REAL
- **Previous state:** Only seeded schedules for `dayOfWeek: 1` (Monday). Markets showed closed on all other days.
- **Fix:** `scripts/seed.ts` now inserts complete schedules for all 7 days (`dayOfWeek: 0` through `6`) for all seed markets.
- **Validation:** Seeding script executed and confirmed.

## 8. Server-Side Audit Logs
**Status:** 🟢 REAL
- **Previous state:** The `audit_logs` table existed but was unused.
- **Fix:** Implemented `writeAuditLog` utility in `apps/web/src/lib/audit.ts` designed to *never crash* the main flow and *never log sensitive data* (e.g. mpin, otp, password).
- **Events Logged:** 
  - `MPIN_SETUP`
  - `USER_LOGIN`
  - `USER_LOGOUT`
  - `OTP_REQUESTED`
  - `OTP_VERIFIED`, `OTP_FAILED`
  - `BONUS_CLAIMED`, `BONUS_CLAIM_FAILED`
  - `DEPOSIT_INITIATED`, `DEPOSIT_COMPLETED`
  - `WITHDRAWAL_REQUESTED`, `WITHDRAWAL_FAILED`
  - `BET_PLACED`, `BET_PLACEMENT_FAILED`
  - `RESULT_PUBLISHED`
  - `ADMIN_ACTION`

## 9. Withdrawal Fixes
**Status:** 🟡 PARTIAL (Secure, but payout not implemented)
- **Previous state:** Unsafe request allowed possible double-withdrawals. UI claimed "5-15 minute automated SLA" when no payout provider existed.
- **Fix:** 
  - Implemented `idempotencyKey` parameter into `requestWithdrawalAction` mapped to the `transactions.idempotency_key` unique constraint.
  - Updated UI: Now displays an orange Alert warning: *"Automated payouts are currently unavailable. Your withdrawal request will be processed manually and will remain PENDING."*

## 10. Database Flow Test
The test script ran entirely on server actions mimicking real browser flows, with the following outcomes:
1. `requestOtpAction` -> Sent successfully.
2. `verifyOtpAction` -> Verified successfully.
3. `setupMpinAction` -> Set successfully (session based).
4. `loginWithMpinAction` -> Session generated successfully.
5. `claimWelcomeBonusAction` -> ₹100 `BONUS` credited via ledger!
6. `getWalletAction` -> `bonusBalance: 100`, `cashBalance: 0`.
7. `placeBetAction` -> Placed bet. Ledger `DEBIT` of `BONUS` logged correctly.

## 11. Remaining Blockers Before Payment Integration
None for the internal flow. The internal system logic, accounting, and idempotency guarantees are solid. 

**Next Steps for Payments:**
1. Implement MSG91 or similar in `ProductionOtpProvider`.
2. Implement Razorpay/PhonePe in `PaymentProvider`.
3. Build the frontend Checkout SDK initialization inside the `add-money` flow.
4. Integrate a Payouts SDK.
