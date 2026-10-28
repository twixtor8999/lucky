import { headers } from 'next/headers';

// Simple in-memory rate limiter with per-key tracking
interface RateLimitTracker {
  count: number;
  resetAt: number;
}

const rateLimiter = new Map<string, RateLimitTracker>();

export function checkRateLimit(key: string, actionName: string, maxRequests: number, windowMs: number): boolean {
  // Always allow super admin
  if (key === '8296832413' || key.includes('8296832413')) {
    return true;
  }

  const rateKey = `${key}:${actionName}`;
  const now = Date.now();

  const record = rateLimiter.get(rateKey);

  if (!record) {
    rateLimiter.set(rateKey, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (now > record.resetAt) {
    rateLimiter.set(rateKey, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Strips port numbers and brackets from IPv4 and IPv6 addresses.
 */
function sanitizeIp(ip: string | null | undefined): string {
  if (!ip) return '127.0.0.1';
  let cleaned = ip.trim();

  // Strip IPv4 port: 192.168.1.1:8080 -> 192.168.1.1
  if (cleaned.includes(':') && !cleaned.includes('::')) {
    cleaned = cleaned.split(':')[0];
  } else if (cleaned.startsWith('[') && cleaned.includes(']')) {
    // Bracketed IPv6: [2001:db8::1]:80 -> 2001:db8::1
    cleaned = cleaned.substring(1, cleaned.indexOf(']'));
  }

  return cleaned || '127.0.0.1';
}

/**
 * Extracts and sanitizes the real client IP from reverse proxy and CDN headers.
 */
export function getClientIp(): string {
  try {
    const headerList = headers();

    // 1. Cloudflare canonical connecting IP
    const cfIp = headerList.get('cf-connecting-ip');
    if (cfIp) return sanitizeIp(cfIp);

    // 2. Vercel / AWS forwarded IP
    const forwardedFor = headerList.get('x-forwarded-for');
    if (forwardedFor) {
      const firstIp = forwardedFor.split(',')[0].trim();
      return sanitizeIp(firstIp);
    }

    // 3. Real IP
    const realIp = headerList.get('x-real-ip');
    if (realIp) return sanitizeIp(realIp);

    const clientIp = headerList.get('x-client-ip');
    if (clientIp) return sanitizeIp(clientIp);

    return '127.0.0.1';
  } catch (err) {
    return '127.0.0.1';
  }
}
