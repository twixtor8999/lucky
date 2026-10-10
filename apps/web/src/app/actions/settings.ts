'use server';

import { cookies } from 'next/headers';
import { db, appSettings } from '@zenvora/shared/db';
import { eq } from 'drizzle-orm';

export async function getGlobalSettings() {
  const authCookie = cookies().get('admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') throw new Error('Unauthorized');

  const settings = await db.select().from(appSettings).where(eq(appSettings.id, 'global')).limit(1);
  
  if (settings.length === 0) {
    // Return default empty settings if not initialized
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

  return settings[0];
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

export async function getPublicSettings() {
  const settings = await db.select({
    supportNumber: appSettings.supportNumber,
    upiId: appSettings.upiId,
    upiQrCodeUrl: appSettings.upiQrCodeUrl,
    welcomeBonusAmount: appSettings.welcomeBonusAmount,
    minWithdrawalAmount: appSettings.minWithdrawalAmount
  }).from(appSettings).where(eq(appSettings.id, 'global')).limit(1);

  if (settings.length === 0) {
    return {
      supportNumber: '',
      upiId: '',
      upiQrCodeUrl: '',
      welcomeBonusAmount: 100,
      minWithdrawalAmount: 300
    };
  }
  return settings[0];
}
