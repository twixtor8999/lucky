import { NextRequest, NextResponse } from 'next/server';
import { db, transactions, ledgerEntries, wallets } from '@zenvora/shared/db';
import { eq } from 'drizzle-orm';
import { paymentProvider } from '../../../../lib/payment-provider';
import { writeAuditLog } from '../../../../lib/audit';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-provider-signature') || '';

    if (paymentProvider.isConfigured()) {
      if (!paymentProvider.verifyWebhookSignature(rawBody, signature)) {
        return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    
    let event;
    try {
      event = paymentProvider.normalizeWebhookEvent(payload);
    } catch (e: any) {
      if (e.message === 'PAYMENTS_NOT_CONFIGURED') {
        return NextResponse.json({ success: false, message: 'Payments not configured' }, { status: 400 });
      }
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    if (event.status !== 'SUCCESS') {
      // Just acknowledge for non-success events
      return NextResponse.json({ success: true, message: 'Acknowledged non-success event' });
    }

    const result = await db.transaction(async (tx) => {
      // Find internal transaction using provider reference
      const txnArray = await tx.select().from(transactions).where(
        eq(transactions.externalReference, event.providerOrderId)
      ).limit(1);

      const txn = txnArray[0];

      if (!txn) {
        throw new Error('Transaction not found');
      }

      // Idempotency check
      if (txn.status === 'COMPLETED') {
        return 'ALREADY_PROCESSED';
      }

      // Verify amount (protect against amount tampering on provider side)
      if (txn.amountMinor !== event.amountMinor) {
        throw new Error('Amount mismatch');
      }

      // Find wallet
      const walletArray = await tx.select().from(wallets).where(eq(wallets.userId, txn.userId)).limit(1);
      const wallet = walletArray[0];

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Create ledger credit
      await tx.insert(ledgerEntries).values({
        walletId: wallet.id,
        transactionId: txn.id,
        entryType: 'CREDIT' as any,
        balanceType: 'CASH' as any,
        amountMinor: txn.amountMinor,
        currency: 'INR',
        referenceType: 'DEPOSIT',
        referenceId: event.providerPaymentId,
      });

      // Mark transaction SUCCESS
      await tx.update(transactions)
        .set({ status: 'COMPLETED' as any, completedAt: new Date() })
        .where(eq(transactions.id, txn.id));

      await writeAuditLog('DEPOSIT_COMPLETED', 'Transaction', { actorId: txn.userId, entityId: txn.id, metadata: { amount: txn.amountMinor } });

      return 'PROCESSED';
    });

    return NextResponse.json({ success: true, message: result });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
