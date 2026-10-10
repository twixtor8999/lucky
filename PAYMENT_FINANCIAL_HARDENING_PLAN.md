# PAYMENT FINANCIAL HARDENING PLAN

## 1. Current Deposit Flow
The existing `addMoneyAction` in `wallet.ts` uses a `MockPaymentProvider` that simulates immediate payment success. It trusts the client-initiated server action and immediately writes a `COMPLETED` transaction and a `CREDIT` ledger entry. This is highly vulnerable to exploitation as it bypasses any real payment verification.

## 2. Current Withdrawal Flow
The `requestWithdrawalAction` checks for a minimum balance (₹500) and ensures sufficient cash balance before proceeding. It creates a `PENDING` transaction and debits the ledger appropriately. This flow is structurally sound for an MVP as it locks the funds (via debit) and leaves the payout execution to an external admin/provider sync process.

## 3. Every Place Balance Can Change
Balance mathematically changes via inserts to the `ledger_entries` table. There are NO direct updates to a "balance" column in the `wallets` table.

## 4. Every Place Ledger Entries Can Be Created
- `addMoneyAction` (CASH CREDIT)
- `requestWithdrawalAction` (CASH DEBIT)
- `claimWelcomeBonusAction` (BONUS CREDIT)
- `placeBetAction` (CASH/BONUS DEBIT)
- `publishResultAction` (CASH CREDIT upon WIN)

## 5. Every Place Transactions Can Change State
- `addMoneyAction`: Instantly set to `COMPLETED`
- `requestWithdrawalAction`: Instantly set to `PENDING`
- `placeBetAction`: Instantly set to `COMPLETED` (for the bet placement fee)
- `publishResultAction`: Creates a `BET_WON` `COMPLETED` transaction.
- There is currently no webhook mechanism updating a `PENDING` transaction to `COMPLETED`.

## 6. Current Vulnerabilities
- **Critical Payment Bypass**: The system instantly trusts `addMoneyAction` and creates ledger credits.
- **Missing Webhook Validation**: There is no provider-to-server webhook endpoint to handle asynchronous payment success confirmations.
- **Idempotency Weakness**: `ledgerEntries` lacks a robust unique constraint on `(referenceType, referenceId)` to prevent duplicate webhook processing.
- **Mock Provider Dependency**: The app explicitly calls `MockPaymentProvider` in production code paths.

## 7. Required Idempotency Protections
- Ensure `transactions.idempotencyKey` is strictly enforced.
- Ensure webhook handlers utilize a database-level transaction lock (or atomic `UPDATE ... WHERE status = 'PENDING'`) to prevent double-crediting.

## 8. Required Payment-Provider Integration Boundary
An abstract `PaymentProvider` interface is required:
- `createOrder(amount: number, currency: string, receipt: string): Promise<OrderIntent>`
- `verifyWebhookSignature(payload: string, signature: string): boolean`
- `extractWebhookEvent(payload: any): NormalizedPaymentEvent`

The `addMoneyAction` must transition to only generating a `PENDING` transaction and an `OrderIntent`. Actual ledger credits must only occur in the newly created webhook endpoint (`/api/webhooks/payments`).
