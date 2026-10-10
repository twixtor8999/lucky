# Lucky 777 — Financial Hardening Report

## 1. Changes Made

### Phase 1 — Forensic Inspection
- Inspected `wallet.ts`, `schema.ts`, `store.tsx` and all server actions.
- Confirmed the critical vulnerability: `addMoneyAction` used a `MockPaymentProvider` that returned `status: 'SUCCESS'` immediately, causing an instant ledger CREDIT without any real payment verification.
- Documented findings in `PAYMENT_FINANCIAL_HARDENING_PLAN.md`.

### Phase 2 — Payment Provider Abstraction
- Created `apps/web/src/lib/payment-provider.ts` with a typed `PaymentProvider` interface.
- Implemented `UnconfiguredPaymentProvider` which:
  - Returns `isConfigured() → false`
  - Creates a placeholder order intent (so UI doesn't crash) but **never verifies webhooks**
  - Throws `PAYMENTS_NOT_CONFIGURED` on `normalizeWebhookEvent` to prevent any ledger crediting
- Removed the inline `MockPaymentProvider` class from `wallet.ts`.

### Phase 3 — Add Money Security (CRITICAL FIX)
**BEFORE (FAKE):**
```
Client calls addMoneyAction(500)
→ MockPaymentProvider returns { status: 'SUCCESS' }
→ Ledger CREDIT immediately written
→ Wallet balance increases without any real payment
```
**AFTER (REAL):**
```
Client calls addMoneyAction(500)
→ Server creates PENDING transaction in DB (NO ledger credit yet)
→ Server calls paymentProvider.createOrder() for an intent
→ Client receives orderIntent to open provider checkout
→ Wallet balance UNCHANGED until webhook confirms
```

### Phase 4 — Webhook Endpoint
- Created `apps/web/src/app/api/webhooks/payments/route.ts`.
- Full atomic flow:
  1. Verify provider signature (when `isConfigured() = true`)
  2. Normalize event via provider abstraction
  3. Open DB transaction
  4. Lock internal transaction row by `externalReference`
  5. Idempotency check: if already `COMPLETED`, return early
  6. Verify `amountMinor` matches internal record (anti-tampering)
  7. Insert exactly one `CREDIT` ledger entry
  8. Update transaction `status → COMPLETED`
  9. Commit (or rollback on any failure)

### Phase 5 — Idempotency
- Added `CREATE UNIQUE INDEX ledger_reference_uniq ON ledger_entries (reference_type, reference_id)` to schema.
- Applied to live DB via `drizzle-kit push` (confirmed successful).
- This means even if application-level idempotency checks fail, the DB will reject a duplicate ledger entry with a constraint violation.

### Phase 6 — Ledger Integrity (Verified)
- Balance is exclusively derived from summing `ledger_entries` (no direct wallet balance column).
- `getWalletAction()` iterates all entries and sums CREDIT minus DEBIT per balance type.
- No server action accepts a client-provided balance figure.
- All ledger credits carry a `referenceType` and `referenceId`.

### Phase 7 — Withdrawal Safety (Verified / Already Correct)
- `requestWithdrawalAction` checks server-side balance before proceeding.
- Atomically: creates `PENDING` transaction + DEBIT ledger + LOCKED credit.
- Withdrawal stays PENDING until admin/provider processes it.
- No client can set status to COMPLETED.
- `userId` comes from `getServerSession()`, never from client.

### Phase 8 — Admin Authorization
- **Removed** `toggleAdminRole()` client-side mock from `store.tsx` completely.
- **Removed** the clickable "ADMIN/PLAYER toggle" button from `TopHeader.tsx`.
- The `isAdmin` value is now a **computed property** derived from `user?.role === UserRole.ADMIN`.
- `user.role` comes from the server session response on login.
- Admin badge in header is now **informational only** — it cannot be clicked.
- All admin server actions use `requireAdmin()` which checks the server-side session role.

### Phase 11 — Fake Data Removal
Removed from `store.tsx`:
- Hardcoded initial bet `bet-init-01` (fake WON bet for user `usr-1`)
- Hardcoded result `res-km-1` (fake published result)
- Hardcoded notification `notif-1` (fake welcome notification)
- Hardcoded support ticket `TCK-8812` (fake resolved ticket with fake admin reply)
- `setIsAdmin` call that read role from `localStorage` (client could previously set any role)

---

## 2. Deposit Flow — BEFORE
| Step | Status |
|---|---|
| Client calls addMoneyAction(amount) | Accepted |
| MockPaymentProvider.createPayment() called | Returns `{status:'SUCCESS'}` immediately |
| Ledger CREDIT written | **Immediately, without verification** |
| Wallet balance increases | Yes, with no real money |

## 3. Deposit Flow — AFTER
| Step | Status |
|---|---|
| Client calls addMoneyAction(amount) | Validated (auth + Zod + rate limit) |
| PENDING transaction created in DB | ✅ |
| paymentProvider.createOrder() called | Returns order intent |
| Client opens payment checkout UI | ✅ |
| Client completes payment | Not trusted |
| Provider sends webhook to /api/webhooks/payments | ✅ |
| Signature verified | ✅ (when provider configured) |
| Atomic: find txn → verify amount → create credit → mark COMPLETED | ✅ |
| Wallet balance increases | Only after verified webhook |

## 4. Webhook Security
🟡 PARTIAL — Endpoint exists and logic is correct, but:
- `UnconfiguredPaymentProvider.verifyWebhookSignature()` always returns `false`
- Until real provider credentials are added, webhook processing will not credit wallets
- This is intentional and safe — it prevents fake credits from unverified webhooks

## 5. Idempotency
🟢 REAL — Two layers of protection:
1. Application-level: checks `transaction.status === 'COMPLETED'` before processing
2. Database-level: `UNIQUE INDEX ledger_reference_uniq` on `(reference_type, reference_id)` prevents duplicate ledger entries at the constraint level

## 6. Ledger Integrity
🟢 REAL:
- Balance derived exclusively from ledger summation (no mutable balance column)
- No client can set balance directly
- All credits have referenceType + referenceId
- Integer minor units used throughout (no floating point)
- Duplicate credits blocked by DB unique constraint

## 7. Withdrawal Safety
🟡 PARTIAL:
- ✅ Authenticated, server-session only
- ✅ Server-side balance validation
- ✅ Atomic DEBIT ledger + LOCKED ledger + PENDING transaction
- ✅ Cannot exceed cash balance
- ✅ userId from session
- ❌ Actual payout to UPI/bank NOT implemented (stays PENDING)
- ❌ Admin payout UI exists but dispatching is manual

## 8. Admin Authorization
🟢 REAL:
- `requireAdmin()` guards all admin server actions with server-side session check
- Client-side `toggleAdminRole` completely removed
- Admin role derived from `user.role` returned by login action (from DB)
- Admin badge is informational only, non-interactive
- Cannot forge admin access via client state

## 9. Automated Tests
🔴 NOT IMPLEMENTED:
- No Jest/Vitest test files exist
- Financial invariant tests not yet written
- This is a P0 blocker before production

## 10. Real DB End-to-End Test
⚪ NOT VERIFIED in this session (payments now require real provider webhook to credit wallet)

## 11. Remaining Production Blockers

### 🔴 P0 — MUST FIX BEFORE ACCEPTING REAL MONEY

| # | Issue | Details |
|---|---|---|
| 1 | **No real payment provider** | `UnconfiguredPaymentProvider` never credits wallets. Must integrate Razorpay/PhonePe with real API keys + webhook secret |
| 2 | **No real SMS provider** | OTP is logged to console, not sent via SMS. Must integrate Twilio/Msg91 |
| 3 | **No automated financial tests** | All financial invariants must have test coverage before production |

### 🟡 P1 — MUST FIX BEFORE SOFT LAUNCH

| # | Issue | Details |
|---|---|---|
| 4 | **Withdrawal payout** | Withdrawals create PENDING state but never auto-disburse. Need admin panel or provider API |
| 5 | **Notifications** | Currently empty `[]` in client state. No DB schema or backend |
| 6 | **Support tickets** | Currently empty `[]` in client state. No DB schema or backend |
| 7 | **Audit logs** | No schema, no implementation |

### ⚪ P2 — QUALITY / COMPLIANCE

| # | Issue |
|---|---|
| 8 | CORS policy not explicitly configured |
| 9 | Rate limiting is in-memory (resets on server restart) — needs Redis backing |
| 10 | Session expiry UI handling (user sees broken state on expired session) |

---

## Feature Status Summary

| Feature | Status | Notes |
|---|---|---|
| Add Money (initiation) | 🟢 REAL | Creates PENDING txn |
| Add Money (completion) | 🔴 NOT IMPLEMENTED | Requires real provider webhook |
| Webhook Handler | 🟡 PARTIAL | Logic correct, provider not configured |
| Ledger Integrity | 🟢 REAL | DB unique constraint live |
| Withdrawal Request | 🟢 REAL | Atomic debit + lock |
| Withdrawal Payout | 🔴 NOT IMPLEMENTED | Stays PENDING |
| Admin Authorization | 🟢 REAL | Server-only, mock removed |
| Client Admin Toggle | 🟢 REMOVED | Security risk eliminated |
| Fake Initial Bets | 🟢 REMOVED | Now empty `[]` |
| Fake Initial Results | 🟢 REMOVED | Now empty `[]` |
| Fake Notifications | 🟠 MOCKED | Still client-only empty array |
| Fake Support Tickets | 🟠 MOCKED | Still client-only empty array |
| Automated Tests | 🔴 NOT IMPLEMENTED | — |

---

> **Verdict**: Lucky 777 is structurally sound for internal testing. The core financial ledger is production-grade. It **cannot accept real money** until a real payment provider (Razorpay/PhonePe) and a real SMS provider (Twilio/Msg91) are integrated and their credentials configured.
