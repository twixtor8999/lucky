'use server';

import { db, users, wallets, mpins, otpVerifications } from '@zenvora/shared/db';
import { eq, and, gt } from 'drizzle-orm';
import { UserRole, UserStatus } from '@zenvora/shared';
import bcrypt from 'bcryptjs';
import { createSession, destroySession, getServerSession } from '../../lib/session';
import crypto from 'crypto';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '../../lib/rateLimit';
import { writeAuditLog } from '../../lib/audit';

// OTP Provider Abstraction
interface OtpProvider {
  sendOtp(phone: string, otp: string): Promise<boolean>;
}

class MockOtpProvider implements OtpProvider {
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    console.log(`[MOCK OTP] Sent OTP ${otp} to ${phone}`);
    return true;
  }
}

class ProductionOtpProvider implements OtpProvider {
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
      console.error('[PROD OTP] FAST2SMS_API_KEY is not configured in .env.local.');
      return false;
    }
    
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message: `Your Mantri777 login OTP is ${otp}. Please do not share this with anyone.`,
          language: 'english',
          flash: 0,
          numbers: phone
        })
      });

      const data = await response.json();
      if (data.return === true) {
        console.log(`[PROD OTP] Fast2SMS successfully sent OTP to ${phone}`);
        return true;
      } else {
        console.error(`[PROD OTP] Fast2SMS Error:`, data);
        return false;
      }
    } catch (error) {
      console.error(`[PROD OTP] Fast2SMS Network Error:`, error);
      return false;
    }
  }
}

const USE_MOCK_OTP = process.env.NODE_ENV !== 'production' && process.env.USE_MOCK_OTP !== 'false';

if (process.env.NODE_ENV === 'production' && USE_MOCK_OTP) {
  console.error('CRITICAL SECURITY ERROR: USE_MOCK_OTP is active in production environment!');
}

const otpProvider: OtpProvider = USE_MOCK_OTP
  ? new MockOtpProvider()
  : new ProductionOtpProvider();

const phoneSchema = z.string().regex(/^[0-9]{10}$/, 'Invalid phone number format');
const otpSchema = z.string().regex(/^[0-9]{6}$/, 'OTP must be 6 digits');
const mpinSchema = z.string().regex(/^[0-9]{6}$/, 'MPIN must be 6 digits');

export async function requestOtpAction(phoneInput: string) {
  const ip = getClientIp();
  if (!checkRateLimit(ip, 'requestOtp', 3, 5 * 60 * 1000)) { // 3 per 5 mins
    return { success: false, message: 'Too many requests. Please try again later.' };
  }

  const parseResult = phoneSchema.safeParse(phoneInput);
  if (!parseResult.success) {
    return { success: false, message: 'Invalid phone number' };
  }
  const phone = parseResult.data;
  
  // Rate limiting / Cooldown check
  const recentOtpArray = await db.select()
    .from(otpVerifications)
    .where(and(eq(otpVerifications.phone, phone), gt(otpVerifications.createdAt, new Date(Date.now() - 60 * 1000))))
    .limit(1);

  if (recentOtpArray.length > 0) {
    return { success: false, message: 'Please wait 60 seconds before requesting another OTP.' };
  }

  // Generate 6-digit OTP
  let generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  
  if (USE_MOCK_OTP) {
    generatedOtp = '123456'; 
  }
  
  // Hash OTP for DB
  const otpHash = await bcrypt.hash(generatedOtp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  await db.insert(otpVerifications).values({
    phone,
    otpHash,
    expiresAt,
  });

  const sent = await otpProvider.sendOtp(phone, generatedOtp);
  if (!sent) {
    await writeAuditLog('OTP_REQUESTED', 'User', { success: false, metadata: { phone, reason: 'Provider failure' } });
    return { success: false, message: 'Failed to send OTP' };
  }

  await writeAuditLog('OTP_REQUESTED', 'User', { success: true, metadata: { phone } });

  return { success: true, message: 'OTP sent successfully.' };
}

export async function verifyOtpAction(phoneInput: string, otpInput: string) {
  const ip = getClientIp();
  if (!checkRateLimit(ip, 'verifyOtp', 5, 60 * 1000)) { // 5 per 1 min
    return { success: false, message: 'Too many attempts.' };
  }

  const phoneRes = phoneSchema.safeParse(phoneInput);
  const otpRes = otpSchema.safeParse(otpInput);
  if (!phoneRes.success || !otpRes.success) {
    return { success: false, message: 'Invalid input format' };
  }
  const phone = phoneRes.data;
  const otp = otpRes.data;

  try {
    // 1. Verify OTP from DB
    const verificationArray = await db.select()
      .from(otpVerifications)
      .where(and(
        eq(otpVerifications.phone, phone),
        gt(otpVerifications.expiresAt, new Date())
      ))
      .orderBy(otpVerifications.createdAt)
      .limit(1);
      
    // Needs order by desc usually, but we don't have DESC imported easily here, 
    // let's fetch the latest by getting all unexpired and picking the last one.
    
    // Quick workaround for latest:
    const verifications = await db.select()
      .from(otpVerifications)
      .where(and(
        eq(otpVerifications.phone, phone),
        gt(otpVerifications.expiresAt, new Date())
      ));
      
    const latestVerification = verifications.pop();

    if (!latestVerification) {
      return { success: false, message: 'OTP expired or not requested' };
    }

    if (latestVerification.attemptCount >= 3) {
      return { success: false, message: 'Too many failed attempts. Request a new OTP.' };
    }

    const isValid = await bcrypt.compare(otp, latestVerification.otpHash);
    
    if (!isValid) {
      // Increment attempt count
      await db.update(otpVerifications)
        .set({ attemptCount: latestVerification.attemptCount + 1 })
        .where(eq(otpVerifications.id, latestVerification.id));
      await writeAuditLog('OTP_FAILED', 'User', { success: false, metadata: { phone, reason: 'Invalid OTP' } });
      return { success: false, message: 'Invalid OTP' };
    }

    // Mark verified
    await db.update(otpVerifications)
      .set({ verifiedAt: new Date(), expiresAt: new Date() }) // expire immediately
      .where(eq(otpVerifications.id, latestVerification.id));

    await writeAuditLog('OTP_VERIFIED', 'User', { success: true, metadata: { phone } });

    // 2. Check if user exists
    const existingUserArray = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    const existingUser = existingUserArray[0];

    let userId = '';
    let isNewUser = false;
    let requiresMpin = true;
    let userObj = null;

    if (existingUser) {
      userId = existingUser.id;
      userObj = existingUser;
      
      // Check if MPIN exists
      const existingMpinArray = await db.select().from(mpins).where(eq(mpins.userId, userId)).limit(1);
      if (existingMpinArray[0]) {
        requiresMpin = false;
      }
    } else {
      // Create new user
      const insertedUsers = await db.insert(users).values({
        phone,
        displayName: 'Player ' + phone.slice(-4),
        status: 'ACTIVE',
        role: 'USER',
        phoneVerifiedAt: new Date(),
      }).returning();
      
      const newUser = insertedUsers[0];
      userId = newUser.id;
      isNewUser = true;
      userObj = newUser;

      // Create a wallet for the new user
      await db.insert(wallets).values({
        userId,
        currency: 'INR',
      });
    }

    // 3. Create Session
    await createSession(userId);

    const userProfile = {
      id: userObj.id,
      phone: userObj.phone,
      displayName: userObj.displayName,
      status: userObj.status as UserStatus,
      role: userObj.role as UserRole,
      phoneVerifiedAt: userObj.phoneVerifiedAt ? userObj.phoneVerifiedAt.toISOString() : null,
      hasMpin: !requiresMpin,
      createdAt: userObj.createdAt.toISOString(),
      updatedAt: userObj.updatedAt.toISOString(),
    };

    return { 
      success: true, 
      isNewUser, 
      requiresMpin,
      user: userProfile,
    };

  } catch (error) {
    console.error('Error in verifyOtpAction:', error);
    return { success: false, message: 'Server error during verification' };
  }
}

export async function setupMpinAction(mpinInput: string) {
  const mpinRes = mpinSchema.safeParse(mpinInput);
  if (!mpinRes.success) {
    return { success: false, message: 'MPIN must be 6 digits' };
  }
  const mpin = mpinRes.data;

  try {
    const user = await getServerSession();
    if (!user) return { success: false, message: 'Unauthorized' };
    const userId = user.id;

    const mpinHash = await bcrypt.hash(mpin, 10);

    await db.insert(mpins).values({
      userId,
      mpinHash,
    });

    await writeAuditLog('MPIN_SETUP', 'User', { actorId: userId, entityId: userId });

    return { success: true };
  } catch (error) {
    console.error('Error in setupMpinAction:', error);
    return { success: false, message: 'Failed to setup MPIN' };
  }
}

export async function loginWithMpinAction(phoneInput: string, mpinInput: string) {
  const ip = getClientIp();
  if (!checkRateLimit(ip, 'loginWithMpin', 5, 60 * 1000)) {
    return { success: false, message: 'Too many attempts.' };
  }

  const phoneRes = phoneSchema.safeParse(phoneInput);
  const mpinRes = mpinSchema.safeParse(mpinInput);
  if (!phoneRes.success || !mpinRes.success) {
    return { success: false, message: 'Invalid input format' };
  }
  const phone = phoneRes.data;
  const mpin = mpinRes.data;

  try {
    const existingUserArray = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    const existingUser = existingUserArray[0];

    if (!existingUser) {
      return { success: false, message: 'User not found' };
    }

    const existingMpinArray = await db.select().from(mpins).where(eq(mpins.userId, existingUser.id)).limit(1);
    const mpinRecord = existingMpinArray[0];

    if (!mpinRecord) {
      return { success: false, message: 'MPIN not set' };
    }

    // Check lockout
    if (mpinRecord.lockedUntil && new Date(mpinRecord.lockedUntil) > new Date()) {
      return { success: false, message: 'Account is temporarily locked. Please try again later.' };
    }

    const isValid = await bcrypt.compare(mpin, mpinRecord.mpinHash);

    if (!isValid) {
      const newFailedAttempts = mpinRecord.failedAttempts + 1;
      let lockedUntil = null;
      if (newFailedAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
      }
      
      await db.update(mpins)
        .set({ failedAttempts: newFailedAttempts, lockedUntil })
        .where(eq(mpins.id, mpinRecord.id));
        
      if (lockedUntil) {
        return { success: false, message: 'Too many failed attempts. Account locked for 15 minutes.' };
      }
      return { success: false, message: 'Invalid MPIN' };
    }

    // Reset failed attempts
    await db.update(mpins)
      .set({ failedAttempts: 0, lockedUntil: null })
      .where(eq(mpins.id, mpinRecord.id));

    // Create session
    await createSession(existingUser.id);

    await writeAuditLog('USER_LOGIN', 'User', { actorId: existingUser.id, entityId: existingUser.id });

    const userProfile = {
      id: existingUser.id,
      phone: existingUser.phone,
      displayName: existingUser.displayName,
      status: existingUser.status as UserStatus,
      role: existingUser.role as UserRole,
      phoneVerifiedAt: existingUser.phoneVerifiedAt ? existingUser.phoneVerifiedAt.toISOString() : null,
      hasMpin: true,
      createdAt: existingUser.createdAt.toISOString(),
      updatedAt: existingUser.updatedAt.toISOString(),
    };

    return { success: true, user: userProfile };
  } catch (error) {
    console.error('Error in loginWithMpinAction:', error);
    return { success: false, message: 'Server error during login' };
  }
}

export async function logoutAction() {
  const user = await getServerSession();
  if (user) {
    await writeAuditLog('USER_LOGOUT', 'User', { actorId: user.id, entityId: user.id });
  }
  await destroySession();
  return { success: true };
}

export async function getUserAction() {
  const user = await getServerSession();
  return { success: true, user };
}

export async function savePaymentDetailsAction(data: {
  upiId?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
}) {
  const user = await getServerSession();
  if (!user) return { success: false, message: 'Unauthorized' };

  try {
    await db.update(users)
      .set({
        upiId: data.upiId || null,
        bankAccountName: data.bankAccountName || null,
        bankAccountNumber: data.bankAccountNumber || null,
        bankIfsc: data.bankIfsc || null,
        bankName: data.bankName || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return { success: true, message: 'Payment details saved successfully' };
  } catch (error) {
    console.error('Error in savePaymentDetailsAction:', error);
    return { success: false, message: 'Failed to save payment details' };
  }
}
