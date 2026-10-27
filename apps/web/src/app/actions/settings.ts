'use server';

import { cookies } from 'next/headers';
import { db, appSettings, systemSettings, deposits } from '@zenvora/shared/db';
import { eq, gte, and } from 'drizzle-orm';

export interface UpiAccount {
  id: string;
  upiId: string;
  payeeName: string;
  dailyTxnLimit: number;
  active: boolean;
  bankName?: string;
  usedToday?: number;
  status?: 'HEALTHY' | 'NEAR_LIMIT' | 'LIMIT_REACHED' | 'PAUSED';
}

function parsePool(rawJson: string | null | undefined): UpiAccount[] {
  if (!rawJson) return [];
  try {
    const parsed = JSON.parse(rawJson);
    if (Array.isArray(parsed)) {
      // Filter out any mock/legacy placeholder IDs
      return parsed.filter(item => 
        item && 
        typeof item.upiId === 'string' && 
        !item.upiId.includes('lucky777.desk') &&
        !item.upiId.includes('owner@upi')
      );
    }
  } catch (e) {
    // Ignore invalid JSON
  }
  return [];
}

export async function getGlobalSettings() {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  const settings = await db.select().from(appSettings).where(eq(appSettings.id, 'global')).limit(1);
  
  if (settings.length === 0) {
    return {
      id: 'global',
      supportNumber: '',
      upiId: '',
      upiQrCodeUrl: '',
      welcomeBonusAmount: 100,
      minDepositAmount: 500,
      minWithdrawalAmount: 300,
    };
  }

  // If existing upiId is a mock, clean it
  const cleanUpiId = (settings[0].upiId && (settings[0].upiId.includes('lucky777.desk') || settings[0].upiId === 'owner@upi'))
    ? ''
    : settings[0].upiId;

  return {
    ...settings[0],
    upiId: cleanUpiId || '',
  };
}

export async function updateGlobalSettings(data: any) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  try {
    const existing = await db.select().from(appSettings).where(eq(appSettings.id, 'global')).limit(1);
    
    if (existing.length === 0) {
      await db.insert(appSettings).values({
        id: 'global',
        adminPassword: 'Admin@123',
        ...data,
        updatedAt: new Date()
      });
    } else {
      await db.update(appSettings)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(appSettings.id, 'global'));
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAdminPassword(newPassword: string) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  try {
    const existing = await db.select().from(appSettings).where(eq(appSettings.id, 'global')).limit(1);
    if (existing.length === 0) {
      await db.insert(appSettings).values({
        id: 'global',
        adminPassword: newPassword,
        updatedAt: new Date()
      });
    } else {
      await db.update(appSettings).set({ adminPassword: newPassword, updatedAt: new Date() }).where(eq(appSettings.id, 'global'));
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Multi-UPI Pool Management (Option C: Counter + Auto-Failover)
 */
export async function getUpiPoolAction() {
  try {
    const authCookie = cookies().get('admin_auth');
    if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

    const appSet = (await db.select().from(appSettings).where(eq(appSettings.id, 'global')).limit(1))[0];
    const rawPool = parsePool(appSet?.upiQrCodeUrl);

    if (rawPool.length === 0) {
      return {
        success: true,
        pool: [],
        totalCapacity: 0,
        totalUsedToday: 0,
      };
    }

    // Query today's deposits to calculate usage count per UPI ID
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayDeposits = await db
      .select({ adminNote: deposits.adminNote })
      .from(deposits)
      .where(gte(deposits.requestedAt, startOfToday));

    const pool: UpiAccount[] = rawPool.map((acc, index) => {
      const count = todayDeposits.filter(d => 
        d.adminNote && d.adminNote.toLowerCase().includes(acc.upiId.toLowerCase())
      ).length;

      let status: 'HEALTHY' | 'NEAR_LIMIT' | 'LIMIT_REACHED' | 'PAUSED' = 'HEALTHY';
      if (!acc.active) {
        status = 'PAUSED';
      } else if (count >= acc.dailyTxnLimit) {
        status = 'LIMIT_REACHED';
      } else if (count >= acc.dailyTxnLimit - 3) {
        status = 'NEAR_LIMIT';
      }

      return {
        ...acc,
        usedToday: count,
        status,
      };
    });

    const totalCapacity = pool.filter(p => p.active).reduce((sum, p) => sum + p.dailyTxnLimit, 0);
    const totalUsedToday = pool.reduce((sum, p) => sum + (p.usedToday || 0), 0);

    return {
      success: true,
      pool,
      totalCapacity,
      totalUsedToday,
    };
  } catch (err: any) {
    console.error('Failed to get UPI pool:', err);
    return {
      success: false,
      error: err.message,
      pool: [],
      totalCapacity: 0,
      totalUsedToday: 0,
    };
  }
}

export async function saveUpiPoolAction(pool: UpiAccount[]) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  try {
    const jsonString = JSON.stringify(pool);
    const firstActive = pool.find(p => p.active);
    const primaryUpiId = firstActive ? firstActive.upiId : (pool[0]?.upiId || '');

    const existing = await db.select().from(appSettings).where(eq(appSettings.id, 'global')).limit(1);
    if (existing.length === 0) {
      await db.insert(appSettings).values({
        id: 'global',
        upiId: primaryUpiId,
        upiQrCodeUrl: jsonString,
        updatedAt: new Date(),
      });
    } else {
      await db.update(appSettings)
        .set({
          upiId: primaryUpiId,
          upiQrCodeUrl: jsonString,
          updatedAt: new Date(),
        })
        .where(eq(appSettings.id, 'global'));
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Dedicated Action: Directly Add a New UPI Account & Persist to DB
 */
export async function addUpiAccountAction(account: {
  upiId: string;
  payeeName: string;
  bankName?: string;
  dailyTxnLimit?: number;
}) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  const cleanUpi = (account.upiId || '').trim().toLowerCase();
  if (!cleanUpi || !cleanUpi.includes('@')) {
    return { success: false, error: 'Please enter a valid UPI ID with @' };
  }

  const cleanName = (account.payeeName || '').trim() || 'Mantri777 Gateway';
  const cleanBank = (account.bankName || '').trim() || 'UPI Bank';
  const limit = Math.max(1, Number(account.dailyTxnLimit) || 20);

  try {
    const appSet = (await db.select().from(appSettings).where(eq(appSettings.id, 'global')).limit(1))[0];
    const currentPool = parsePool(appSet?.upiQrCodeUrl);

    // Prevent duplicate UPI ID
    if (currentPool.some(p => p.upiId.toLowerCase() === cleanUpi)) {
      return { success: false, error: 'This UPI ID is already registered in the pool.' };
    }

    const newAccount: UpiAccount = {
      id: 'upi_' + Date.now(),
      upiId: cleanUpi,
      payeeName: cleanName,
      bankName: cleanBank,
      dailyTxnLimit: limit,
      active: true,
      usedToday: 0,
      status: 'HEALTHY',
    };

    const updatedPool = [...currentPool, newAccount];
    const saveRes = await saveUpiPoolAction(updatedPool);
    if (!saveRes.success) return saveRes;

    return { success: true, pool: updatedPool, newAccount };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Dedicated Action: Toggle Active Status
 */
export async function toggleUpiAccountAction(id: string) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  try {
    const appSet = (await db.select().from(appSettings).where(eq(appSettings.id, 'global')).limit(1))[0];
    const currentPool = parsePool(appSet?.upiQrCodeUrl);

    const updatedPool = currentPool.map(acc => {
      if (acc.id === id) {
        return { ...acc, active: !acc.active };
      }
      return acc;
    });

    await saveUpiPoolAction(updatedPool);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Dedicated Action: Delete UPI Account
 */
export async function deleteUpiAccountAction(id: string) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  try {
    const appSet = (await db.select().from(appSettings).where(eq(appSettings.id, 'global')).limit(1))[0];
    const currentPool = parsePool(appSet?.upiQrCodeUrl);
    const updatedPool = currentPool.filter(acc => acc.id !== id);

    await saveUpiPoolAction(updatedPool);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Dedicated Action: Update Daily Limit
 */
export async function updateUpiLimitAction(id: string, newLimit: number) {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  try {
    const appSet = (await db.select().from(appSettings).where(eq(appSettings.id, 'global')).limit(1))[0];
    const currentPool = parsePool(appSet?.upiQrCodeUrl);

    const updatedPool = currentPool.map(acc => {
      if (acc.id === id) {
        return { ...acc, dailyTxnLimit: Math.max(1, newLimit) };
      }
      return acc;
    });

    await saveUpiPoolAction(updatedPool);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Option C Failover Assignment:
 * Picks the first active UPI ID that has NOT reached its dailyTxnLimit.
 * If all active accounts hit their limit, fails over to the least-overflown active account.
 */
export async function getAssignedUpiForDeposit() {
  try {
    const appSet = (await db.select().from(appSettings).where(eq(appSettings.id, 'global')).limit(1))[0];
    const pool = parsePool(appSet?.upiQrCodeUrl);

    // If pool is empty, check if single admin upiId is set
    if (pool.length === 0) {
      const singleUpi = appSet?.upiId;
      if (singleUpi && !singleUpi.includes('lucky777.desk') && singleUpi !== 'owner@upi') {
        return {
          hasUpi: true,
          upiId: singleUpi,
          payeeName: 'Mantri777 Official Gateway',
          bankName: 'UPI Gateway',
          dailyTxnLimit: 20,
          usedToday: 0,
        };
      }
      return {
        hasUpi: false,
        upiId: '',
        payeeName: '',
        bankName: '',
        dailyTxnLimit: 0,
        usedToday: 0,
      };
    }

    const activePool = pool.filter(p => p.active);
    if (activePool.length === 0) {
      return {
        hasUpi: false,
        upiId: '',
        payeeName: '',
        bankName: '',
        dailyTxnLimit: 0,
        usedToday: 0,
      };
    }

    // Query today's deposits count
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayDeposits = await db
      .select({ adminNote: deposits.adminNote })
      .from(deposits)
      .where(gte(deposits.requestedAt, startOfToday));

    // Calculate usage for each active account
    const accountsWithUsage = activePool.map((acc) => {
      const count = todayDeposits.filter(d => 
        d.adminNote && d.adminNote.toLowerCase().includes(acc.upiId.toLowerCase())
      ).length;

      return {
        ...acc,
        usedToday: count,
        availableSlots: Math.max(0, acc.dailyTxnLimit - count),
      };
    });

    // 1. Option C: Find the first active account that has available slots
    const availableAccount = accountsWithUsage.find(a => a.availableSlots > 0);

    if (availableAccount) {
      return {
        hasUpi: true,
        upiId: availableAccount.upiId,
        payeeName: availableAccount.payeeName,
        bankName: availableAccount.bankName || 'UPI Bank',
        dailyTxnLimit: availableAccount.dailyTxnLimit,
        usedToday: availableAccount.usedToday,
      };
    }

    // 2. If all active accounts reached their daily limit, failover to the one with lowest overage
    accountsWithUsage.sort((a, b) => a.usedToday - b.usedToday);
    const fallback = accountsWithUsage[0];
    return {
      hasUpi: true,
      upiId: fallback.upiId,
      payeeName: fallback.payeeName,
      bankName: fallback.bankName || 'UPI Bank',
      dailyTxnLimit: fallback.dailyTxnLimit,
      usedToday: fallback.usedToday,
      limitReachedFallback: true,
    };
  } catch (err) {
    return {
      hasUpi: false,
      upiId: '',
      payeeName: '',
      bankName: '',
      dailyTxnLimit: 0,
      usedToday: 0,
    };
  }
}

export async function getPublicSettings() {
  try {
    const appSet = (await db.select().from(appSettings).where(eq(appSettings.id, 'global')).limit(1))[0];
    const sysSet = (await db.select().from(systemSettings).limit(1))[0];
    
    // Dynamically assign healthy UPI ID via Option C
    const assignedUpi = await getAssignedUpiForDeposit();

    return {
      supportNumber: appSet?.supportNumber || sysSet?.supportWhatsapp || '+919380347013',
      hasUpi: assignedUpi.hasUpi,
      ownerUpiId: assignedUpi.upiId,
      ownerName: assignedUpi.payeeName || 'Mantri777 Gateway',
      bankName: assignedUpi.bankName || 'UPI Bank',
      usedToday: assignedUpi.usedToday,
      dailyTxnLimit: assignedUpi.dailyTxnLimit,
      welcomeBonusAmount: appSet?.welcomeBonusAmount || 100,
      minDepositAmount: appSet?.minDepositAmount || 100,
      minWithdrawalAmount: appSet?.minWithdrawalAmount || 500,
      depositEnabled: sysSet ? sysSet.depositEnabled : true,
      withdrawalEnabled: sysSet ? sysSet.withdrawalEnabled : true,
    };
  } catch (err) {
    return {
      supportNumber: '+919380347013',
      hasUpi: false,
      ownerUpiId: '',
      ownerName: '',
      bankName: '',
      usedToday: 0,
      dailyTxnLimit: 0,
      welcomeBonusAmount: 100,
      minDepositAmount: 100,
      minWithdrawalAmount: 500,
      depositEnabled: true,
      withdrawalEnabled: true,
    };
  }
}
