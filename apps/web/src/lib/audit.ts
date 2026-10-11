'use server';

import { db, auditLogs } from '@zenvora/shared/db';

export type AuditAction =
  | 'USER_REGISTER'
  | 'USER_LOGIN'
  | 'USER_LOGIN_FAILED'
  | 'USER_LOGOUT'
  | 'MPIN_SETUP'
  | 'MPIN_FAILED'
  | 'MPIN_LOCKED'
  | 'OTP_REQUESTED'
  | 'OTP_VERIFIED'
  | 'OTP_FAILED'
  | 'BONUS_CLAIMED'
  | 'BONUS_CLAIM_FAILED'
  | 'DEPOSIT_INITIATED'
  | 'DEPOSIT_CREATED'
  | 'DEPOSIT_APPROVED'
  | 'DEPOSIT_REJECTED'
  | 'WALLET_CREDIT_FROM_DEPOSIT'
  | 'DEPOSIT_COMPLETED'
  | 'BET_PLACED'
  | 'BET_PLACEMENT_FAILED'
  | 'RESULT_PUBLISHED'
  | 'SETTLEMENT_COMPLETED'
  | 'WITHDRAWAL_REQUESTED'
  | 'WITHDRAWAL_FAILED'
  | 'ADMIN_ACTION';

export interface AuditMetadata {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Writes an immutable audit log entry.
 * Never throws — audit failures must never break the main flow.
 * Never logs sensitive data (MPIN, OTP, secrets, tokens).
 */
export async function writeAuditLog(
  action: AuditAction,
  entityType: string,
  options: {
    actorId?: string;
    entityId?: string;
    success?: boolean;
    metadata?: AuditMetadata;
  } = {}
): Promise<void> {
  try {
    const { actorId, entityId, success = true, metadata = {} } = options;

    // Never log any of these fields — filter them if accidentally passed
    const safe = { ...metadata };
    delete (safe as any).mpin;
    delete (safe as any).otp;
    delete (safe as any).password;
    delete (safe as any).token;
    delete (safe as any).secret;
    delete (safe as any).mpinHash;
    delete (safe as any).otpHash;

    await db.insert(auditLogs).values({
      actorId: actorId || null,
      action: `${action}:${success ? 'SUCCESS' : 'FAILURE'}`,
      entityType,
      entityId: entityId || null,
      metadata: JSON.stringify(safe),
    });
  } catch (err) {
    // Audit log failure must never crash the application
    console.error('[AUDIT] Failed to write audit log:', err);
  }
}
