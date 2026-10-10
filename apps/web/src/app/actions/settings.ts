'use server';

import { db, systemSettings } from '@zenvora/shared/db';
import { getServerSession } from '../../lib/session';

export async function getSystemSettingsAction() {
  const settings = await db.select().from(systemSettings).limit(1);
  
  if (settings.length === 0) {
    // Return safe defaults if not initialized
    return {
      success: true,
      settings: {
        ownerUpiId: 'owner@upi',
        ownerName: 'Lucky 777',
        depositEnabled: true,
        withdrawalEnabled: true,
        minWithdrawalMinor: 500,
        maxWithdrawalMinor: 50000,
        manualProcessing: true,
      }
    };
  }

  return { success: true, settings: settings[0] };
}
