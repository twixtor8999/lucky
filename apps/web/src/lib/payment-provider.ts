export interface OrderIntent {
  providerOrderId: string;
  amountMinor: number;
  currency: string;
  receiptId: string;
}

export interface NormalizedPaymentEvent {
  providerOrderId: string;
  providerPaymentId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  amountMinor: number;
  currency: string;
  rawEvent: any;
}

export interface PaymentProvider {
  isConfigured(): boolean;
  createOrder(amountMinor: number, currency: string, receiptId: string): Promise<OrderIntent>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
  normalizeWebhookEvent(payload: any): NormalizedPaymentEvent;
}

// Dummy provider used when actual secrets are missing.
// It explicitly REJECTS operations to prevent fake crediting.
export class UnconfiguredPaymentProvider implements PaymentProvider {
  isConfigured() {
    return false;
  }

  async createOrder(amountMinor: number, currency: string, receiptId: string): Promise<OrderIntent> {
    // We return a mock intent just so the UI doesn't crash, but it can never be verified.
    return {
      providerOrderId: `unconfigured_order_${Date.now()}`,
      amountMinor,
      currency,
      receiptId,
    };
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    return false; // NEVER verify webhooks when not configured
  }

  normalizeWebhookEvent(payload: any): NormalizedPaymentEvent {
    throw new Error('PAYMENTS_NOT_CONFIGURED');
  }
}

// In the future, implement RazorpayProvider or PhonePeProvider here.
// For now, we export the safe Unconfigured provider.

export const paymentProvider: PaymentProvider = new UnconfiguredPaymentProvider();
