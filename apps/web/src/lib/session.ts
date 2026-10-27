import { cookies } from 'next/headers';
import { db, sessions, users } from '@zenvora/shared/db';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { UserRole, UserStatus } from '@zenvora/shared';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'mantri777_session';
const LEGACY_COOKIE_NAME = 'lucky777_session';

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function createSession(userId: string) {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(sessions).values({
    userId,
    tokenHash,
    expiresAt,
  });

  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

export async function getServerSession() {
  let token: string | undefined;
  try {
    token = cookies().get(SESSION_COOKIE_NAME)?.value || cookies().get(LEGACY_COOKIE_NAME)?.value;
  } catch {
    token = (globalThis as any).__TEST_SESSION_TOKEN__;
  }
  if (!token) return null;

  const tokenHash = hashToken(token);

  const result = await db
    .select({
      user: users,
      session: sessions,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        gt(sessions.expiresAt, new Date()),
        isNull(sessions.revokedAt)
      )
    )
    .limit(1);

  if (!result || result.length === 0) {
    return null;
  }

  const { user } = result[0];

  if (user.status !== 'ACTIVE') {
    return null;
  }

  return {
    id: user.id,
    phone: user.phone,
    displayName: user.displayName,
    status: user.status as UserStatus,
    role: user.role as UserRole,
    phoneVerifiedAt: user.phoneVerifiedAt ? user.phoneVerifiedAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function destroySession() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value || cookies().get(LEGACY_COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await db.update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.tokenHash, tokenHash));
  }
  cookies().delete(SESSION_COOKIE_NAME);
  cookies().delete(LEGACY_COOKIE_NAME);
}

export async function requireAdmin() {
  const user = await getServerSession();
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  return user;
}
