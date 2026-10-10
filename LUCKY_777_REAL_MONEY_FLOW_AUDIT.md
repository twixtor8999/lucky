# Lucky 777 — Real Money Flow Forensic Audit
**Audit Date:** 2026-10-09  
**Auditor:** Antigravity Forensic Audit  
**Method:** Full source code inspection + live database queries  
**Constraint:** No code modified, no fake data inserted, no assumptions made.

---

## 1. Executive Summary

Lucky 777 is a Next.js PWA using Drizzle ORM on PostgreSQL. The core financial architecture (ledger-based wallet, atomic bet placement, settlement engine) is structurally sound. However, **the system currently cannot accept real money** because:

1. **No SMS provider is configured** — OTP is hardcoded to `774422` in dev and logged to console in production path.
2. **No payment provider is configured** — `addMoneyAction` creates a PENDING transaction but the `UnconfiguredPaymentProvider` always rejects webhook processing, so wallets **can never be credited via deposit**.
3. **No payout provider** — withdrawals stay permanently PENDING.
4. **Bonus campaign table is empty** — the welcome bonus flow requires a seeded `bonus_campaigns` row; none exist.
5. **The entire database is nearly empty** — 1 market row exists (seeded on first app load), all other tables have 0 rows.

**Real money verdict:** The money doesn't go anywhere yet — no real money can enter or leave the system.

---

## 2. Actual Current Architecture

```
Browser (PWA)
   ↓ HTTP-only session cookie
Next.js 14 Server Actions (apps/web/src/app/actions/)
   ↓ Drizzle ORM queries
PostgreSQL 16 (Docker, port 5454, db: zenvora, user: postgres)
```

No NestJS. No external payment gateway. No Redis financial state. No SMS gateway.

---

## 3. Database Reality (Live Query Results)

Queried live from container `zenvora-postgres`, database `zenvora`:

| Table | Row Count | Source Type | Notes |
|---|---|---|---|
| `users` | **0** | — | No registered users |
| `sessions` | **0** | — | No active sessions |
| `otp_verifications` | **0** | — | No OTP requests made |
| `wallets` | **0** | — | No wallets |
| `ledger_entries` | **0** | — | No financial activity |
| `transactions` | **0** | — | No transactions |
| `bets` | **0** | — | No bets |
| `markets` | **1** | Dev seed | One market (from `seedMarketsAction` auto-run) |
| `market_schedules` | **0** | — | No schedules (seed bug — schedules not inserted) |
| `results` | **0** | — | No results published |
| `bonus_campaigns` | **0** | — | **Blocks welcome bonus** |
| `bonus_claims` | **0** | — | — |
| `withdrawals` | **0** | — | No withdrawals requested |
| `notifications` | **0** | — | Schema exists, nothing uses it |
| `support_tickets` | **0** | — | Schema exists, nothing uses it |
| `audit_logs` | **0** | — | Schema exists, nothing writes to it |

**Finding:** The database is functionally empty. No real user has ever used this system.

---

## 4. Complete User Money Flow — Stage by Stage

### Stage 1: Registration / OTP

**File:** `apps/web/src/app/actions/auth.ts:41–92`

| Check | Result |
|---|---|
| Exists? | YES |
| Server-backed? | YES — writes to `otp_verifications` table |
| OTP hashed in DB? | YES — `bcrypt.hash(otp, 10)` at line 72 |
| OTP expires? | YES — 5 minutes (`expiresAt = now + 5min`) |
| Attempt limit? | YES — 3 attempts max (line 136) |
| Rate limited? | YES — 3 requests per 5 minutes per IP (line 43) |
| Resend cooldown? | YES — 60 seconds DB check (line 54–61) |

**CRITICAL FINDING — OTP IS HARDCODED IN DEVELOPMENT:**
```typescript
// auth.ts line 67–69
if (process.env.NODE_ENV !== 'production') {
  generatedOtp = '774422';  // ← FIXED VALUE. ANY NUMBER CAN LOG IN WITH 774422
}
```

**OTP Provider Status:** `🟠 MOCKED`
- `MockOtpProvider` logs OTP to console (line 19)
- `ProductionOtpProvider` (line 24) has a `TODO` comment and also just logs to console — **it is not actually a production provider**
- No Twilio/MSG91/Fast2SMS SDK installed
- No `OTP_PROVIDER_API_KEY` env var in `.env.example` with real format

**OTP returned to client in development:** YES — `return { success: true, otp: generatedOtp }` at line 88. This means the OTP is visible in the frontend response, making it trivially bypassable.

---

### Stage 2: MPIN

**File:** `apps/web/src/app/actions/auth.ts:223–244, 246–324`

| Check | Result |
|---|---|
| Hashed? | YES — `bcrypt.hash(mpin, 10)` |
| Plaintext stored? | NO — only `mpin_hash` in DB |
| Failed attempt tracking? | YES — `mpins.failedAttempts` column |
| Lockout? | YES — 15 min lock after 5 failures |
| Rate limited? | YES — 5 per minute per IP |
| Retrievable? | NO — bcrypt is one-way |
| Bypassable? | **PARTIALLY** — `setupMpinAction` takes `userId` from client (line 223). A client that knows another user's UUID can set that user's MPIN. |

**SECURITY FINDING — setupMpinAction accepts userId from client:**
```typescript
// auth.ts line 223
export async function setupMpinAction(userId: string, mpinInput: string) {
  // userId is passed from client — not from server session
```
This is an IDOR vulnerability. If a user knows another user's UUID, they can overwrite that user's MPIN. In practice this is low-risk since UUIDs are hard to guess, but it violates the zero-trust principle.

---

### Stage 3: Session

**File:** `apps/web/src/lib/session.ts`

| Check | Result |
|---|---|
| Session table? | YES — `sessions` table |
| Token storage? | SHA-256 hash in DB, raw token in HTTP-only cookie |
| HTTP-only? | YES — line 29 |
| Secure flag? | YES in production (`NODE_ENV === 'production'`) |
| SameSite? | `lax` — line 31 |
| Expiry? | 30 days from creation |
| Logout invalidation? | YES — sets `revokedAt` in DB |
| Checks revoked? | YES — `isNull(sessions.revokedAt)` in query |
| Checks user status? | YES — rejects `SUSPENDED`/`BLOCKED` users |
| localStorage auth? | NO — session is cookie-only on server |
| Client userId impersonation? | NO — userId comes from DB session lookup |

**Session Status:** `🟢 REAL`

---

### Stage 4: KYC / Eligibility

| Feature | Status |
|---|---|
| Age verification | 🔴 NOT IMPLEMENTED |
| KYC document upload | 🔴 NOT IMPLEMENTED |
| Jurisdiction restrictions | 🔴 NOT IMPLEMENTED |
| Responsible gaming limits | 🔴 NOT IMPLEMENTED |
| Self-exclusion | 🔴 NOT IMPLEMENTED |
| Deposit limits | 🔴 NOT IMPLEMENTED |
| Account status blocking | 🟢 REAL — `user.status` checked in `getServerSession()` |
| Withdrawal restrictions | 🔴 NOT IMPLEMENTED |

---

### Stage 5: Welcome Bonus (₹100)

**File:** `apps/web/src/app/actions/wallet.ts:137–200`

| Check | Result |
|---|---|
| Eligibility check? | YES — checks `bonusCampaigns` table for active campaign |
| One-time claim? | YES — `uniqueIndex('user_campaign_uniq')` on `(campaign_id, user_id)` |
| Atomic? | YES — `db.transaction()` wraps claim + transaction + ledger |
| Duplicate prevention? | YES — DB unique constraint + application-level check |
| Logged to ledger? | YES — `CREDIT`, `BONUS` type, `referenceType: 'PROMOTION'` |
| Persistence after re-login? | YES — reads from DB |

**CRITICAL BLOCKER:**
```sql
SELECT COUNT(*) FROM bonus_campaigns;
-- Result: 0
```
**The `bonus_campaigns` table is empty.** `getActiveWelcomeBonus()` returns `null`. The bonus flow returns: `"No active welcome bonus"`. **No user can claim the ₹100 bonus today.**

**Withdrawable?** The bonus is credited as `balanceType: 'BONUS'`. The withdrawal check at `wallet.ts:227` checks `cashBalance` only:
```typescript
if (walletData.balances.cashBalance < amount) {
  return { success: false, message: 'Insufficient cash balance' };
}
```
**Bonus balance is NOT withdrawable.** It can only be used for betting.

**Bonus Status:** `🟡 PARTIAL` — Logic is real, but blocked by missing seed data.

---

### Stage 6: Deposit / Add Money

**File:** `apps/web/src/app/actions/wallet.ts:72–128`  
**File:** `apps/web/src/lib/payment-provider.ts`

**Current flow (AFTER hardening):**
```
Client calls addMoneyAction(amount)
  → Rate limit check (5/min per IP)
  → Zod validates amount (positive number, min ₹10)
  → getServerSession() — userId from server
  → Creates PENDING transaction in DB with idempotencyKey
  → Calls paymentProvider.createOrder()
      → UnconfiguredPaymentProvider returns fake orderIntent
      → isConfigured() = false
  → Updates transaction with fake providerOrderId
  → Returns { success: true, txnId, orderIntent }
     ← NO LEDGER CREDIT. WALLET NOT CHANGED.
```

**Can the client currently cause a wallet credit without a real payment?**

`🔴 NO` — After hardening, the answer is NO. The client can call `addMoneyAction` but it only creates a PENDING transaction. The ledger credit only happens via `/api/webhooks/payments`. The webhook handler calls `paymentProvider.normalizeWebhookEvent()` which throws `PAYMENTS_NOT_CONFIGURED`, returning HTTP 400.

**However:** Since `isConfigured()` returns false, the webhook signature check is **SKIPPED** (line 11–15 of route.ts):
```typescript
if (paymentProvider.isConfigured()) {
  if (!paymentProvider.verifyWebhookSignature(...)) { ... }
}
// ← If not configured, signature check is bypassed entirely
```
Then `normalizeWebhookEvent` throws and returns 400. So currently safe, but the signature-skip-when-unconfigured pattern means if someone swaps in a partial provider that returns `isConfigured() = true` but doesn't verify signatures properly, the gate fails open.

**Deposit Status:** `🟡 PARTIAL` — PENDING txn created, no ledger credit possible without real provider.

---

### Stage 7: Payment Provider

**File:** `apps/web/src/lib/payment-provider.ts`

| Check | Result |
|---|---|
| Provider name | None — `UnconfiguredPaymentProvider` |
| SDK installed? | NO — no Razorpay/PhonePe/Cashfree in package.json |
| API keys configured? | NO |
| Order creation? | Returns fake `unconfigured_order_{timestamp}` |
| Checkout integration? | NO — UI has UPI icons but no real checkout SDK |
| Webhook signature? | Always returns `false` |
| Real payment tested? | NO |

**Payment Provider Status:** `🔴 NOT IMPLEMENTED`

---

### Stage 8: Webhook

**File:** `apps/web/src/app/api/webhooks/payments/route.ts`

| Check | Result |
|---|---|
| Route exists? | YES — `POST /api/webhooks/payments` |
| Signature verification? | SKIPPED when `isConfigured() = false` |
| Raw body handling? | YES — `req.text()` before JSON parse |
| Idempotency check? | YES — checks `txn.status === 'COMPLETED'` |
| Amount validation? | YES — `txn.amountMinor !== event.amountMinor` throws |
| Atomic transaction? | YES — full `db.transaction()` |
| Duplicate prevention? | YES — status check + `ledger_reference_uniq` DB constraint |
| Works today? | NO — throws `PAYMENTS_NOT_CONFIGURED` every time |

**Webhook Status:** `🟡 PARTIAL` — Logic is correct, provider not wired.

---

### Stage 9: Wallet Balance Calculation

**File:** `apps/web/src/app/actions/wallet.ts:10–52`

Balance is calculated **exclusively** from `ledger_entries`:
```typescript
for (const entry of entries) {
  const amt = Number(entry.amountMinor);
  if (entry.entryType === 'CREDIT') { cashBalance += amt; ... }
  else if (entry.entryType === 'DEBIT') { cashBalance -= amt; ... }
}
```

| Check | Result |
|---|---|
| Source of truth? | `ledger_entries` table |
| Client-settable? | NO |
| localStorage wallet? | NO — store.tsx initializes wallet at `{ cashBalance: 0 }`, refreshed from server |
| Hardcoded balance? | NO (hardcoded init removed in Phase 11) |
| Mutable balance column? | NO — `wallets` table has no balance column |
| Integer arithmetic? | YES — `bigint amount_minor` throughout |

**Three separate pools tracked:**
- `cashBalance` — CASH CREDIT minus CASH DEBIT
- `bonusBalance` — BONUS CREDIT minus BONUS DEBIT  
- `lockedBalance` — LOCKED CREDIT minus LOCKED DEBIT (used for pending withdrawals)

**Withdrawable balance:** `cashBalance` only. Bonus and locked are not withdrawable.

**Wallet Status:** `🟢 REAL` — Architecture is correct. Empty today because no users exist.

---

### Stage 10: Bet Placement

**File:** `apps/web/src/app/actions/betting.ts:32–165`

| Check | Result |
|---|---|
| Server auth? | YES — `getServerSession()` |
| Market status validated server-side? | YES — checks `market.status !== 'OPEN'` |
| Min/max stake enforced server-side? | YES — `SERVER_BET_RULES` on server |
| Balance check? | YES — `getWalletAction()` called server-side |
| Idempotency key? | YES — `bets.idempotency_key` unique constraint |
| Atomic? | YES — `db.transaction()` wraps txn + ledger debit + bet insert |
| Rollback on failure? | YES — any exception rolls back the transaction |
| Duplicate bet? | Returns `"Bet already placed"` via PG unique violation catch |
| userId from client? | NO — from `getServerSession()` |

**Balance debit logic (lines 85–92):**
- If `cashBalance >= bet.amount` → debit all from CASH
- Else → debit remaining cash, then debit the rest from BONUS

**FINDING:** The `totalBalance` is used for the balance check (line 74), but the debit correctly splits CASH/BONUS. However, `lockedBalance` (withdrawal-locked funds) is included in `totalBalance` calculation:
```typescript
totalBalance: cashBalance + bonusBalance,  // lockedBalance NOT included ✅
```
Actually correct — locked balance is excluded from totalBalance. Safe.

**Bet debit → ledger referenceId:** Uses a random `ZEN-XXXXXX` ref number, NOT the bet's UUID. This means you cannot directly join a ledger entry to a bet by referenceId; you'd need to match via transactionId.

**Bet Status:** `🟢 REAL`

---

### Stage 11: Settlement

**File:** `apps/web/src/app/actions/betting.ts:205–304`

| Check | Result |
|---|---|
| Admin-only? | YES — `requireAdmin()` throws for non-admins |
| Atomic? | YES — full `db.transaction()` wraps result + all bets |
| Only settles ACTIVE bets? | YES — `eq(bets.status, 'ACTIVE')` filter |
| Duplicate settlement prevention? | YES — bets moved to WON/LOST, second publish finds 0 ACTIVE bets |
| Winner payout ledger? | YES — `BET_WIN` transaction + `CREDIT CASH` ledger entry |
| Ledger referenceId for wins? | `referenceType: 'BET_WIN', referenceId: bet.id` — correct UUID |
| Duplicate payout prevention? | YES — `ledger_reference_uniq` constraint on `(referenceType, referenceId)` blocks second credit for same `bet.id` |
| Market closed after result? | YES — `markets.status = 'CLOSED'` |

**FINDING:** `publishResultAction` can be called multiple times for the same market. The second call will succeed (new result row is inserted), but finds 0 ACTIVE bets (already settled), so no double-payout occurs. However there is no unique constraint preventing two results for the same `(marketId, resultDate)`. This is a data integrity gap.

**Settlement Status:** `🟢 REAL` — Double-payout protected by both app logic and DB constraint.

---

### Stage 12: Withdrawal

**File:** `apps/web/src/app/actions/wallet.ts:202–277`

| Check | Result |
|---|---|
| Auth? | YES — `getServerSession()` |
| Balance check? | YES — `cashBalance < amount` check |
| Min withdrawal? | YES — ₹500 minimum |
| Atomic? | YES — `db.transaction()` wraps WITHDRAWAL txn + DEBIT CASH + CREDIT LOCKED |
| userId from client? | NO — from session |
| Client sets status? | NO — hardcoded `PENDING` |
| Duplicate protection? | Partial — no idempotency key on withdrawals |
| Payout provider? | 🔴 NOT IMPLEMENTED |
| Money leaves system? | 🔴 NEVER — stays PENDING forever |

**Withdrawal flow after request:**
```
PENDING withdrawal → ??? → never processed
```

The `withdrawals` table has a `providerReference` column but no server action writes to it. There is no admin action to approve or process a withdrawal. There is no payout SDK.

**Failed withdrawal reversal:** NOT IMPLEMENTED. If a withdrawal is somehow rejected, the LOCKED funds would remain locked permanently with no reversal mechanism.

**Withdrawal Status:** `🟡 PARTIAL` — Creates correct DB records, but no payout ever happens.

---

### Stage 13: User Receives Money

| Question | Answer |
|---|---|
| Where is bank/UPI stored? | `requestWithdrawalAction` takes `method: string` → stored in `transactions.externalReference`. No structured UPI/bank account table exists. |
| Who validates it? | Nobody — it's a free-text string |
| Who initiates payout? | Nobody — no payout provider |
| What confirms success? | Nothing |
| What if payout fails? | Funds remain LOCKED permanently |
| Double payout prevention? | N/A — payout never happens |

**User Receives Money Status:** `🔴 NOT IMPLEMENTED`

---

### Stage 14: Business / Owner Money Flow

| Question | Answer |
|---|---|
| Merchant account? | NOT IMPLEMENTED |
| Business settlement account? | NOT IMPLEMENTED |
| Provider reconciliation? | NOT IMPLEMENTED |
| Business accounting? | NOT IMPLEMENTED |
| Can admin see gross deposits? | NO — no admin financial report screen |
| Can admin see gross withdrawals? | NO |
| Can admin see player liabilities? | NO |
| Can admin see net revenue? | NO |
| Provider fee tracking? | NOT IMPLEMENTED |

The only financial admin capability currently implemented is `publishResultAction` (settle bets) and viewing the admin page UI. No financial reporting exists.

**Business Money Flow Status:** `🔴 NOT IMPLEMENTED`

---

### Stage 15: Admin Authorization

**File:** `apps/web/src/lib/session.ts:94–100`

```typescript
export async function requireAdmin() {
  const user = await getServerSession();
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  return user;
}
```

| Check | Result |
|---|---|
| Role from DB? | YES — `users.role` column, read from session |
| Client role toggle? | REMOVED (Phase 8 hardening) |
| Admin badge clickable? | NO — purely informational after Phase 8 |
| Direct API test (non-admin calling publishResultAction)? | Will throw `Unauthorized` and return `{ success: false, message: 'Failed to publish result' }` |

**Admin Status:** `🟢 REAL` — Server-side only.

---

### Stage 16: Audit Logs

```sql
SELECT COUNT(*) FROM audit_logs;
-- 0
```

Schema exists (`audit_logs` table) but **nothing in the codebase writes to it**. No server action imports or calls any audit log function.

**Audit Logs Status:** `🔴 NOT IMPLEMENTED` — Schema exists, zero usage.

---

## 17. Security / Manipulation Tests (Code-Based Analysis)

| Attack | Result | File/Line |
|---|---|---|
| Client sends `paymentSuccess: true` | Rejected — no such parameter accepted | wallet.ts |
| Client sends fake amount via addMoneyAction | Rejected — Zod validates positive number | wallet.ts:78 |
| Client sends negative amount | Rejected — `z.number().positive()` | wallet.ts:70 |
| Client sends `userId` in addMoneyAction | Not possible — userId from session only | wallet.ts:85 |
| Client calls webhook with fake success | Rejected — `normalizeWebhookEvent` throws `PAYMENTS_NOT_CONFIGURED` | route.ts:21 |
| Duplicate bet (same idempotencyKey) | Rejected — `bets.idempotency_key` UNIQUE constraint | schema.ts:139 |
| Claim bonus twice | Rejected — `user_campaign_uniq` DB constraint | schema.ts:251 |
| Normal user calls publishResultAction | Throws `Unauthorized` — `requireAdmin()` | session.ts:96 |
| Another user's bet ID in settlement | Not possible — settlement finds bets by marketId from DB | betting.ts:242 |
| Duplicate ledger credit (same referenceId) | Rejected — `ledger_reference_uniq` DB constraint | schema.ts:204 |
| Client sets wallet balance directly | Not possible — no such API endpoint | — |
| localStorage determines auth | NO — server reads only cookie, validates against DB | session.ts:39 |
| Expired session reuse | Rejected — `gt(sessions.expiresAt, new Date())` | session.ts:55 |
| setupMpinAction with another user's UUID | **SUCCEEDS** — IDOR vulnerability | auth.ts:223 |
| Negative withdrawal amount | Rejected — `z.number().positive()` | wallet.ts:208 |
| Withdraw more than balance | Rejected — `cashBalance < amount` check | wallet.ts:227 |

---

## 18. Transaction Model — Complete Field Inventory

From live DB schema inspection of `transactions` table:

| Field | Present | Notes |
|---|---|---|
| `id` (UUID) | ✅ | Primary key |
| `user_id` (UUID FK) | ✅ | FK to users |
| `type` (enum) | ✅ | DEPOSIT, WITHDRAWAL, BET_PLACED, BET_WON, WELCOME_BONUS, etc. |
| `status` (enum) | ✅ | PENDING, COMPLETED, FAILED, REJECTED |
| `amount_minor` (bigint) | ✅ | Integer paise/rupees |
| `currency` | ✅ | Default 'INR' |
| `external_reference` (text) | ✅ | Provider order/payment ID |
| `idempotency_key` | ✅ | UNIQUE constraint |
| `created_at` | ✅ | — |
| `completed_at` | ✅ | Set on completion |
| Provider name field | ❌ MISSING | Cannot tell which provider processed |
| Provider payment ID (separate) | ❌ MISSING | `external_reference` overloaded for both order + payment IDs |
| Failure reason | ❌ MISSING | No `failure_reason` column |
| Metadata/JSON | ❌ MISSING | No structured metadata column |
| Retry count | ❌ MISSING | — |

---

## 19. Reconciliation Model

| Item | Exists | Source | Verified |
|---|---|---|---|
| Provider deposits | ❌ | Not tracked | NO |
| Internal deposits | ✅ | `transactions` (PENDING only) | NO — none exist |
| Ledger credits | ✅ | `ledger_entries` | YES (schema, 0 rows) |
| Provider withdrawals | ❌ | Not tracked | NO |
| Internal withdrawals | ✅ | `transactions` (WITHDRAWAL type) | NO — none exist |
| Ledger debits | ✅ | `ledger_entries` | YES (schema, 0 rows) |
| Player liabilities | ⚠️ | Calculable from ledger | Not exposed in admin |
| Unmatched transactions | ❌ | No reconciliation tooling | NO |

---

## 20. Real Test Trace

**Attempted:** Creating a fresh user flow trace using the live database.

**Result:** Cannot complete. Reasons:
1. OTP is hardcoded `774422` — acceptable for test
2. `bonus_campaigns` table is empty — **bonus claim fails immediately**
3. `addMoneyAction` creates PENDING transaction — webhook cannot process it
4. No bet can be placed without a positive balance

**Partial trace possible:**
```
Step 1: Register (OTP 774422) → user created in DB ✓
Step 2: Setup MPIN → mpin_hash stored (bcrypt) ✓  
Step 3: Claim bonus → FAILS: "No active welcome bonus" ✗
Step 4: Add money → PENDING txn created, wallet NOT credited ✗
Step 5: Bet → FAILS: "Insufficient balance" ✗
```

Trace stops at Step 3. **Money never enters the system.**

---

## 21. Reality Matrix

| Money Stage | UI | Server | DB | External Provider | Ledger | Atomic | Idempotent | Tested | Status |
|---|---|---|---|---|---|---|---|---|---|
| Registration | ✅ | ✅ | ✅ | N/A | N/A | N/A | N/A | ⚪ | 🟢 REAL |
| OTP | ✅ | ✅ | ✅ | ❌ Mock | N/A | N/A | N/A | ⚪ | 🟠 MOCKED |
| MPIN | ✅ | ✅ | ✅ | N/A | N/A | N/A | N/A | ⚪ | 🟢 REAL |
| Session | ✅ | ✅ | ✅ | N/A | N/A | N/A | ✅ | ⚪ | 🟢 REAL |
| Welcome Bonus | ✅ | ✅ | ✅ (no data) | N/A | ✅ | ✅ | ✅ | ⚪ | ⚫ BROKEN (no campaign) |
| Deposit Init | ✅ | ✅ | ✅ | ❌ | ❌ | N/A | ✅ | ⚪ | 🟡 PARTIAL |
| Payment Order | ✅ (icons) | ✅ | ✅ (PENDING) | ❌ | ❌ | N/A | ✅ | ⚪ | 🔴 NOT IMPL |
| Payment Verify | ❌ | ✅ (webhook) | N/A | ❌ | ❌ | N/A | N/A | ⚪ | 🔴 NOT IMPL |
| Webhook Credit | N/A | ✅ (code) | ✅ | ❌ | ✅ | ✅ | ✅ | ⚪ | 🟡 PARTIAL |
| Wallet Balance | ✅ | ✅ | ✅ | N/A | ✅ | N/A | N/A | ⚪ | 🟢 REAL |
| Bet Debit | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ | ⚪ | 🟢 REAL |
| Results | ✅ | ✅ | ✅ | N/A | N/A | ✅ | ⚠️ Partial | ⚪ | 🟢 REAL |
| Settlement | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ | ⚪ | 🟢 REAL |
| Winning Credit | N/A | ✅ | ✅ | N/A | ✅ | ✅ | ✅ | ⚪ | 🟢 REAL |
| Withdrawable Balance | ✅ (cashBalance) | ✅ | ✅ | N/A | ✅ | N/A | N/A | ⚪ | 🟢 REAL |
| Withdrawal Request | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ⚠️ No key | ⚪ | 🟡 PARTIAL |
| Payout | ✅ (UI) | ❌ | ❌ | ❌ | ❌ | N/A | N/A | ⚪ | 🔴 NOT IMPL |
| Payout Confirm | ❌ | ❌ | ❌ | ❌ | ❌ | N/A | N/A | ⚪ | 🔴 NOT IMPL |
| Reconciliation | ❌ | ❌ | ❌ | ❌ | N/A | N/A | N/A | ⚪ | 🔴 NOT IMPL |
| Admin Accounting | ❌ | ❌ | ❌ | N/A | N/A | N/A | N/A | ⚪ | 🔴 NOT IMPL |

---

## 22. Fake / Mocked Financial Functionality

| # | Feature | File | Finding |
|---|---|---|---|
| 1 | OTP value | `auth.ts:68` | Hardcoded `'774422'` in non-production — anyone can log in with this code |
| 2 | OTP provider | `auth.ts:24–29` | `ProductionOtpProvider` has a `TODO` comment and just logs to console — NOT a real provider |
| 3 | OTP returned to client | `auth.ts:88` | OTP sent in response JSON in non-production — completely defeats OTP security |
| 4 | Payment order | `payment-provider.ts:33` | `unconfigured_order_{timestamp}` — fake order ID |
| 5 | resultTime field | `markets.ts:72` | `resultTime: sched ? sched.closesAt : '00:00:00'` — uses closeTime as resultTime (mock) |
| 6 | `isOpenToday` field | `markets.ts:73` | Hardcoded `true` — always says market is open today regardless of schedule |
| 7 | Market schedules | `markets.ts:30–34` | Seed only inserts schedule for `dayOfWeek: 1` (Monday) — markets show as closed on all other days |

---

## 23. Missing Financial Functionality

1. **Real SMS OTP provider** — MSG91/Twilio/Fast2SMS
2. **Real payment gateway** — Razorpay/PhonePe/Cashfree SDK + order creation + checkout
3. **Webhook signature verification** — with real HMAC secret
4. **Payout provider** — for withdrawals to actually reach user's bank/UPI
5. **UPI/Bank account storage** — structured beneficiary management
6. **Bonus campaign seeding** — `bonus_campaigns` table must have at least one active row
7. **Market schedule seeding for all days** — currently only Monday
8. **Admin financial reports** — gross deposits, withdrawals, player liabilities
9. **Withdrawal approval workflow** — admin action to approve/reject/process
10. **Audit log writes** — nothing calls `auditLogs` insert despite schema existing
11. **Duplicate result prevention** — unique constraint on `(marketId, resultDate)`
12. **setupMpinAction IDOR fix** — should use session userId, not client-provided userId
13. **Withdrawal idempotency key** — `requestWithdrawalAction` has no idempotency key, allowing duplicates
14. **Failed withdrawal reversal** — locked funds can become permanently stuck

---

## 24. Production Blockers

### 🔴 BLOCKERS FOR INTERNAL TESTING

| # | Blocker | Impact |
|---|---|---|
| 1 | `bonus_campaigns` table empty | Welcome bonus completely broken |
| 2 | Market schedules only for Monday | Markets closed 6 days/week |
| 3 | OTP hardcoded to `774422` | Security non-existent in dev |
| 4 | `setupMpinAction` IDOR | One user can overwrite another's MPIN |

### 🔴 BLOCKERS FOR PAYMENT SANDBOX

| # | Blocker | Impact |
|---|---|---|
| 5 | No payment SDK installed | Cannot create real payment orders |
| 6 | No payment provider credentials | Webhook always fails |
| 7 | OTP provider not real | Users cannot receive SMS OTPs |
| 8 | No checkout UI integration | Add Money button leads nowhere real |

### 🔴 BLOCKERS FOR REAL-MONEY PRODUCTION

| # | Blocker | Impact |
|---|---|---|
| 9 | No payout provider | Withdrawals never processed |
| 10 | No KYC/age verification | Regulatory non-compliance |
| 11 | No jurisdiction restrictions | Regulatory non-compliance |
| 12 | No responsible gaming limits | Regulatory non-compliance |
| 13 | No audit logs being written | Cannot demonstrate compliance |
| 14 | No business financial reporting | Cannot track revenue/liabilities |
| 15 | No reconciliation tooling | Cannot match provider records to internal records |
| 16 | Duplicate results possible | Data integrity risk |
| 17 | No withdrawal idempotency | Possible duplicate withdrawals |
| 18 | Failed withdrawal reversal missing | Funds can be permanently locked |

---

## 25. Exact Next Steps (In Priority Order)

### Step 1 — Unblock Internal Testing (1–2 days)
```sql
INSERT INTO bonus_campaigns (name, amount_minor, active) VALUES ('Welcome Bonus', 100, true);
```
And fix market schedules to include all 7 days.

### Step 2 — Fix IDOR in setupMpinAction
Change `setupMpinAction(userId, mpin)` to read userId from `getServerSession()`.

### Step 3 — SMS Provider (3–5 days)
Implement `ProductionOtpProvider` using MSG91 or Fast2SMS. Remove hardcoded `774422`.

### Step 4 — Payment Gateway (5–10 days)
Implement `RazorpayProvider implements PaymentProvider` with:
- `createOrder()` calling Razorpay API
- `verifyWebhookSignature()` using HMAC-SHA256
- `normalizeWebhookEvent()` mapping Razorpay payload
Add Razorpay checkout SDK to frontend.

### Step 5 — Payout Provider (5–10 days)
Implement payout via Razorpay Payouts API or similar. Add admin approval flow.

### Step 6 — Seed Data Script
Create a proper seed script for `bonus_campaigns` and all 7-day market schedules.

### Step 7 — Audit Log Writes
Add `db.insert(auditLogs)` calls to every financial server action.

### Step 8 — KYC / Compliance
Before accepting real money: age verification, jurisdiction, responsible gaming.

---

## Final Answer: "Where does the money actually go in Lucky 777 TODAY?"

**It does not go anywhere.**

- A user can register (OTP hardcoded `774422`) and create an MPIN.
- A user cannot claim the ₹100 bonus — `bonus_campaigns` table is empty.
- A user can initiate a deposit — a `PENDING` transaction is created in the DB — but the wallet is **never credited** because no payment provider exists.
- No bets can be placed because no user has a positive balance.
- No results can be published because no bets exist.
- No settlement occurs because no results exist.
- No withdrawals are ever paid out because no payout provider exists.

The **financial plumbing is correctly designed** and most of it will work correctly the moment real provider credentials are added. But today, in the live database: 0 users, 0 transactions, 0 ledger entries, 0 bets, 0 results, 0 payouts.
