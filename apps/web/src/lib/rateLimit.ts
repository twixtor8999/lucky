// Simple in-memory rate limiter for MVP
// In production, this should be backed by Redis (e.g., Upstash)

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

const rateLimiter = new Map<string, RateLimitTracker>();

export function checkRateLimit(ip: string, actionName: string, maxRequests: number, windowMs: number): boolean {
  const key = `${ip}:${actionName}`;
  const now = Date.now();

  const record = rateLimiter.get(key);

  if (!record) {
    rateLimiter.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (now > record.resetAt) {
    rateLimiter.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export function getClientIp() {
  // In Next.js Server Actions, we can use headers() to get the IP.
  const { headers } = require('next/headers');
  const forwardedFor = headers().get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return headers().get('x-real-ip') || '127.0.0.1';
}
