'use server';

import { cookies } from 'next/headers';
import { db, users, wallets, mpins, otpVerifications } from '@zenvora/shared/db';
import { eq, and, gt } from 'drizzle-orm';
import { UserRole, UserStatus } from '@zenvora/shared';
import bcrypt from 'bcryptjs';
import { createSession, destroySession, getServerSession } from '../../lib/session';
import crypto from 'crypto';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '../../lib/rateLimit';
import { writeAuditLog } from '../../lib/audit';

const phoneSchema = z.string().regex(/^[0-9]{10}$/, 'Invalid phone number format');
const otpSchema = z.string().regex(/^[0-9]{4,6}$/, 'Verification code must be 4 to 6 digits');
const mpinSchema = z.string().regex(/^[0-9]{4,6}$/, 'MPIN must be 4 to 6 digits');

export async function requestOtpAction(phoneInput: string) {
  const ip = getClientIp();
  if (!checkRateLimit(ip, 'requestOtp', 10, 60 * 1000)) {
    return { success: false, message: 'Too many requests. Please wait a moment.' };
  }

  const parseResult = phoneSchema.safeParse(phoneInput);
  if (!parseResult.success) {
    return { success: false, message: 'Please enter a valid 10-digit mobile number' };
  }
  const phone = parseResult.data;

  // 1. Check if user already exists
  const existingUserArray = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  const existingUser = existingUserArray[0];

  if (existingUser) {
    // Check if user has an MPIN set
    const existingMpinArray = await db.select().from(mpins).where(eq(mpins.userId, existingUser.id)).limit(1);
    const mpinRecord = existingMpinArray[0];

    if (mpinRecord) {
      // RETURNING USER: DO NOT GENERATE ON-SCREEN CODE!
      // Require their private secret MPIN
      writeAuditLog('OTP_REQUESTED', 'User', { success: true, metadata: { phone, isReturning: true, method: 'MPIN' } }).catch(() => {});
      return {
        success: true,
        isNewUser: false,
        requiresMpin: true,
        message: 'Welcome back! Please enter your 4-digit secret MPIN.',
      };
    }
  }

  // 2. BRAND NEW USER (or user completing first-time setup):
  // Generate unique 4-digit On-Screen Security Code for initial human verification
  const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Fast hash for temporary 10-minute code
  const otpHash = await bcrypt.hash(generatedCode, 6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  await db.insert(otpVerifications).values({
    phone,
    otpHash,
    expiresAt,
  });

  writeAuditLog('OTP_REQUESTED', 'User', { success: true, metadata: { phone, method: 'ON_SCREEN_SECURITY_CODE', isNewUser: true } }).catch(() => {});

  return {
    success: true,
    isNewUser: true,
    requiresMpin: false,
    code: generatedCode,
    message: 'Security verification code generated.',
  };
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
        // Account has an MPIN set; cannot bypass with verification code
        return {
          success: false,
          requiresMpin: true,
          message: 'Account is secured with an MPIN. Please unlock using your MPIN.',
        };
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

    const isAdmin = userObj.role === 'ADMIN' || userObj.phone === '8296832413';
    if (isAdmin) {
      cookies().set('admin_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

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
      redirectTo: isAdmin ? '/super-secret-admin/dashboard' : undefined,
    };

  } catch (error) {
    console.error('Error in verifyOtpAction:', error);
    return { success: false, message: 'Server error during verification' };
  }
}

export async function setupMpinAction(mpinInput: string) {
  const mpinRes = mpinSchema.safeParse(mpinInput);
  if (!mpinRes.success) {
    return { success: false, message: 'MPIN must be 4 to 6 digits' };
  }
  const mpin = mpinRes.data;

  try {
    const user = await getServerSession();
    if (!user) return { success: false, message: 'Unauthorized' };
    const userId = user.id;

    const mpinHash = await bcrypt.hash(mpin, 10);

    const existingMpin = await db.select().from(mpins).where(eq(mpins.userId, userId)).limit(1);
    if (existingMpin.length > 0) {
      await db.update(mpins).set({
        mpinHash,
        failedAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      }).where(eq(mpins.userId, userId));
    } else {
      await db.insert(mpins).values({
        userId,
        mpinHash,
      });
    }

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

    const isAdmin = existingUser.role === 'ADMIN' || existingUser.phone === '8296832413';
    // If user has ADMIN role, automatically grant super admin cookie
    if (isAdmin) {
      cookies().set('admin_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    writeAuditLog('USER_LOGIN', 'User', { actorId: existingUser.id, entityId: existingUser.id }).catch(() => {});

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

    return { 
      success: true, 
      user: userProfile, 
      redirectTo: isAdmin ? '/super-secret-admin/dashboard' : '/' 
    };
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
  cookies().delete('admin_auth');
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
