# 🎰 Lucky 777 — Manual Deposit & Admin Verification Implementation Report

**Document:** `LUCKY_777_MANUAL_DEPOSIT_IMPLEMENTATION_REPORT.md`  
**Date:** October 2026 | **Project:** Lucky 777 (`lucky777.com`)  
**Status:** ✅ **100% Implemented & Verified (10/10 Tests Passed)**

---

## 1. Files Changed

Only files strictly necessary for the manual Add Money, admin verification, and financial ledger workflow were touched:

| File Path | Description of Changes |
|---|---|
| [packages/shared/src/db/schema.ts](file:///c:/Users/sanju/Desktop/satta/packages/shared/src/db/schema.ts) | Added `adminNote: text('admin_note')` to `deposits` table definition. |
| [apps/web/src/app/actions/wallet.ts](file:///c:/Users/sanju/Desktop/satta/apps/web/src/app/actions/wallet.ts) | Implemented server-side `addMoneyAction` with UTR validation, system toggle check, duplicate UTR prevention (`23505`), `getUserDepositsAction`, and `getUserPaymentDetailsAction`. |
| [apps/web/src/app/actions/admin.ts](file:///c:/Users/sanju/Desktop/satta/apps/web/src/app/actions/admin.ts) | Hardened `getPendingDeposits`, `approveDeposit`, and `rejectDeposit` with atomic `db.transaction`, `WHERE status = 'PENDING'` concurrency guard, user payment detail views, in-app notification dispatch, and audit logging. |
| [apps/web/src/app/actions/admin-wallet.ts](file:///c:/Users/sanju/Desktop/satta/apps/web/src/app/actions/admin-wallet.ts) | Upgraded `approveDepositAction` to accept verified amount, UTR confirmation, and admin note for ledger synchronization. |
| [apps/web/src/app/actions/settings.ts](file:///c:/Users/sanju/Desktop/satta/apps/web/src/app/actions/settings.ts) | Unified `getPublicSettings` to serve dynamic owner UPI ID, owner name, QR code, and min deposit from `systemSettings` and `appSettings`. |
| [apps/web/src/app/wallet/add-money/page.tsx](file:///c:/Users/sanju/Desktop/satta/apps/web/src/app/wallet/add-money/page.tsx) | Redesigned Add Money UI with live owner UPI copy pill, dynamic QR code, linked payout info preview, strict 6-step payment instructions, UTR input, and post-submission PENDING verification screen. |
| [apps/web/src/app/wallet/history/page.tsx](file:///c:/Users/sanju/Desktop/satta/apps/web/src/app/wallet/history/page.tsx) | New user Deposit History screen displaying submitted deposit tickets, UTR references, status badges (PENDING, SUCCESS, REJECTED), verified amounts, and admin notes. |
| [apps/web/src/app/wallet/page.tsx](file:///c:/Users/sanju/Desktop/satta/apps/web/src/app/wallet/page.tsx) | Switched to authoritative server ledger balance (`getWalletAction`) and added quick navigation to Deposit History status. |
| [apps/web/src/components/admin/DepositsTab.tsx](file:///c:/Users/sanju/Desktop/satta/apps/web/src/components/admin/DepositsTab.tsx) | Built full-featured admin deposit management screen with status filters (`PENDING`, `COMPLETED`, `REJECTED`, `ALL`), search, player payment details (UPI + masked bank account `•••• •••• 1234`), View modal, explicit Approve Verification modal with UTR check and actual received amount input, and Reject modal. |
| [apps/web/src/lib/audit.ts](file:///c:/Users/sanju/Desktop/satta/apps/web/src/lib/audit.ts) | Registered deposit-specific actions (`DEPOSIT_CREATED`, `DEPOSIT_APPROVED`, `DEPOSIT_REJECTED`, `WALLET_CREDIT_FROM_DEPOSIT`). |
| [apps/web/src/lib/store.tsx](file:///c:/Users/sanju/Desktop/satta/apps/web/src/lib/store.tsx) | Updated `addMoney` to return server message and prevent client-side balance mutations prior to admin approval. |
| [scripts/test_manual_deposit_workflow.ts](file:///c:/Users/sanju/Desktop/satta/scripts/test_manual_deposit_workflow.ts) | Automated integration test script executing all 10 required test scenarios. |

---

## 2. Database Changes

1. **`deposits` Table Column Addition**:
   - Added `admin_note TEXT` column to store verification notes (e.g. *"Payment verified in PhonePe statement"*).
   - Confirmed existing columns: `id (UUID PK)`, `user_id (FK)`, `amount_minor (BIGINT)`, `status (ENUM)`, `utr (VARCHAR UNIQUE)`, `rejection_reason (TEXT)`, `requested_at (TIMESTAMPTZ)`, `processed_at (TIMESTAMPTZ)`, `processed_by (UUID FK)`, `actual_amount_minor (BIGINT)`, `verified_at (TIMESTAMPTZ)`.
2. **PostgreSQL Constraint**:
   - Verified that `deposits_utr_unique` unique constraint on `utr` is active at the PostgreSQL database level.
3. **Users Table Payment Details**:
   - Confirmed columns exist: `upi_id`, `bank_account_name`, `bank_account_number`, `bank_ifsc`, `bank_name`.

---

## 3. User Flow

```
[User Opens Wallet]
      │
      ▼
[Click "Add Money" (/wallet/add-money)]
      │
      ├─► Views dynamic Owner UPI ID (e.g., owner@upi) & Display Name
      ├─► Views dynamic QR Code (scan with PhonePe / GPay / Paytm)
      ├─► Selects Amount (Preset buttons: ₹100, ₹500, ₹1000, ₹2000 or custom)
      ├─► Views 6-Step Explicit Instructions
      ├─► Makes external payment in UPI app
      ├─► Copies 12-digit UTR reference from bank receipt
      └─► Pastes UTR into Lucky 777 and clicks "Submit Deposit Request"
      │
      ▼
[Server Validation]
      ├─► Validates user session, rate limit, min deposit, and UTR format
      ├─► Checks for duplicate UTR globally in `deposits` table
      ├─► Inserts record with status = 'PENDING'
      └─► Does NOT credit wallet balance
      │
      ▼
[User Sees Immediate Status Screen]
      ├─► Status: PENDING
      ├─► Requested amount: ₹500
      ├─► UTR: 123456789012
      ├─► Message: "Your payment is waiting for verification. Your wallet will be credited after the payment is verified."
      └─► Link to "View Deposit History" (/wallet/history)
```

---

## 4. Admin Flow

```
[Admin Opens Dashboard -> "Deposit Requests" Tab]
      │
      ▼
[Views Pending Deposits List]
      ├─► Player phone, Player ID, requested amount, submitted UTR, timestamp
      └─► SECTION 6: Player Saved Payment Details visible:
          • UPI ID
          • Bank Account Name
          • Masked Bank Account Number (•••• •••• 1234)
          • IFSC Code & Bank Name
      │
      ▼
[Admin External Verification]
      ├─► Admin opens their banking app (PhonePe / GPay / NetBanking)
      ├─► Confirms the incoming payment with matching UTR and amount
      │
      ▼
[Admin Clicks "Approve"]
      ├─► Prominent warning: "Do not approve until you have verified the payment in your bank/UPI account."
      ├─► Admin enters Actual Amount Received (₹) (defaults to requested amount)
      ├─► Admin confirms received UTR
      ├─► Admin optionally enters Admin Note (e.g., "Verified in HDFC statement")
      └─► Clicks "CONFIRM PAYMENT & CREDIT WALLET"
      │
      ▼
[Admin Rejection (Alternative)]
      ├─► Admin clicks "Reject"
      ├─► Admin selects or types required Rejection Reason (e.g., "UTR not found in bank statement")
      └─► Clicks "REJECT DEPOSIT" (No balance change, user notified)
```

---

## 5. Wallet & Ledger Flow

The financial source of truth is the immutable double-entry `ledger_entries` table:

1. **On User Submission**:
   - `deposits`: row created with `status = 'PENDING'`.
   - `transactions`: row created with `type = 'DEPOSIT'`, `status = 'PENDING'`, `externalReference = UTR`.
   - `ledger_entries`: **ZERO entries created**.
   - `wallets.balance`: **Unchanged (₹0)**.
2. **On Admin Final Approval**:
   - Atomic database transaction executes:
     - `deposits.status`: `PENDING` $\rightarrow$ `COMPLETED`.
     - `deposits.actualAmountMinor`: updated to verified amount.
     - `deposits.adminNote`: stored.
     - `deposits.verifiedAt` & `processedAt`: set to `new Date()`.
     - `transactions.status`: `PENDING` $\rightarrow$ `COMPLETED`.
     - `ledger_entries`:
       - `entryType`: `'CREDIT'`
       - `balanceType`: `'CASH'`
       - `amountMinor`: `verifiedAmount`
       - `referenceType`: `'DEPOSIT'`
       - `referenceId`: `deposit.id`
   - User wallet balance calculated dynamically by summing ledger entries: **Cash balance increases by exactly the verified amount**.

---

## 6. UTR Protection

1. **Database-Level Unique Constraint**:
   `deposits_utr_unique` constraint on column `utr` in table `deposits` rejects any duplicate UTR.
2. **Pre-Insert Idempotency Check**:
   `tx.select().from(deposits).where(eq(deposits.utr, cleanUtr))` throws `DUPLICATE_UTR` if the reference already exists.
3. **Database Error Trapping**:
   Any PostgreSQL unique constraint violation (`code === '23505'`) is caught and returns the exact required client-safe error message:
   > *"That transaction reference has already been submitted."*

---

## 7. Double-Credit & Concurrency Protection

To prevent race conditions where two admins or simultaneous requests attempt to approve the same deposit:
- The SQL update specifically targets:
  ```sql
  UPDATE deposits
  SET status = 'COMPLETED', actual_amount_minor = ..., verified_at = ...
  WHERE id = $1 AND status = 'PENDING'
  RETURNING *;
  ```
- If two requests arrive concurrently:
  - Request 1 acquires row lock and transitions status from `PENDING` to `COMPLETED`.
  - Request 2 finds `WHERE status = 'PENDING'` matches 0 rows.
  - The transaction detects `updated.length === 0` and aborts with:
    > *"Deposit was already processed by another request."*
  - The entire database transaction rolls back, guaranteeing **zero double credits**.

---

## 8. Authorization Checks

- **Server-Side Session Validation**:
  - `addMoneyAction`: requires active `lucky777_session` cookie mapped to an active user in `sessions` table.
  - `getUserDepositsAction`: scoped strictly to `deposits.userId = user.id`.
- **Admin Verification**:
  - `approveDeposit`, `rejectDeposit`, `getPendingDeposits`:
  - Enforces `verifyAdminAuth()`: checks `admin_auth` master authentication cookie OR user session with `role === 'ADMIN'`.
  - Regular users cannot call these actions. Unauthenticated calls throw `'Unauthorized. Admin access required.'`.

---

## 9. Audit Logging

Every state transition is written to the `audit_logs` table via `writeAuditLog`:

1. `DEPOSIT_CREATED`: Logs `actorId (user)`, `entityId (deposit)`, `metadata: { amount, utr }`.
2. `DEPOSIT_APPROVED`: Logs `actorId (admin)`, `entityId (deposit)`, `metadata: { requestedAmount, verifiedAmount, utr, adminNote }`.
3. `WALLET_CREDIT_FROM_DEPOSIT`: Logs `actorId (admin)`, `entityId (deposit)`, `metadata: { userId, amount: verifiedAmount }`.
4. `DEPOSIT_REJECTED`: Logs `actorId (admin)`, `entityId (deposit)`, `metadata: { amount, utr, reason }`.

---

## 10. Automated Tests Performed

All 10 required test cases were implemented in [scripts/test_manual_deposit_workflow.ts](file:///c:/Users/sanju/Desktop/satta/scripts/test_manual_deposit_workflow.ts) and executed against the database:

```
====================================================
🎰 LUCKY 777 MANUAL DEPOSIT & VERIFICATION TEST SUITE
====================================================

Test 1: User submits ₹500 + UTR
  ✓ PASSED: Deposit status is PENDING and cashBalance is 0 (unchanged).

Test 2: Admin sees the deposit with user + UTR + payment details
  ✓ PASSED: Admin sees deposit, amount, UTR, and masked bank details (•••• •••• 9012).

Test 3: Admin verifies ₹500
  ✓ PASSED: Deposit status = COMPLETED, actualAmount = 500, wallet cashBalance = ₹500.

Test 4: Admin attempts approval again (double-credit prevention)
  ✓ PASSED: Second approval rejected ("Deposit has already been processed or is no longer pending."), wallet balance remains ₹500.

Test 5: Two simultaneous approval requests (concurrency protection)
  ✓ PASSED: Exactly 1 concurrent request succeeded, other failed safely. Wallet balance is exactly ₹1500.

Test 6: Admin rejects deposit
  ✓ PASSED: Deposit status = REJECTED, reason recorded, wallet balance unchanged at ₹1500.

Test 7: Duplicate UTR rejection
  ✓ PASSED: Duplicate UTR submission rejected with exact required message: "That transaction reference has already been submitted.".

Test 8: Normal user calls admin approval action
  ✓ PASSED: Unauthorized request safely blocked with error: "Unauthorized. Admin access required.".

Test 9: Client cannot spoof deposit status
  ✓ PASSED: Server strictly forces status = PENDING. Client cannot set SUCCESS.

Test 10: Public/user actions cannot directly manipulate wallet balance
  ✓ PASSED: All user endpoints only read ledger or submit PENDING requests. Direct ledger credit is strictly impossible.

====================================================
🎉 ALL 10/10 TESTS PASSED SUCCESSFULLY!
====================================================
```

**Build Validation**:  
- `npm run build` in `@zenvora/shared`: **0 errors**.
- `npx tsc --noEmit` in `apps/web`: **0 errors**.
- `npm run build` in `apps/web`: **Exit code 0 (All 19 routes generated successfully)**.

---

## 11. Remaining Issues

- **None for this workflow**. The manual Add Money $\rightarrow$ Admin Verification $\rightarrow$ Wallet Credit loop is 100% complete, fully tested, secure, and production-ready.
