// Simple in-memory rate limiter for MVP
// In production, this can be backed by Redis (e.g., Upstash)

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
 * 
 * Supports:
 * 1. x-client-ip (injected by internal Next.js middleware)
 * 2. cf-connecting-ip (Cloudflare edge)
 * 3. true-client-ip (Cloudflare Enterprise / Akamai)
 * 4. x-real-ip (Nginx reverse proxy)
 * 5. x-forwarded-for (Standard multi-hop proxy list - leftmost client IP)
 */
export function getClientIp(): string {
  try {
    const { headers } = require('next/headers');
    const headerList = headers();

    // 1. Check x-client-ip set by middleware
    const clientIp = headerList.get('x-client-ip');
    if (clientIp) return sanitizeIp(clientIp);

    // 2. Cloudflare canonical connecting IP
    const cfIp = headerList.get('cf-connecting-ip');
    if (cfIp) return sanitizeIp(cfIp);

    // 3. Akamai / Cloudflare Enterprise
    const trueClientIp = headerList.get('true-client-ip');
    if (trueClientIp) return sanitizeIp(trueClientIp);

    // 4. Nginx X-Real-IP
    const realIp = headerList.get('x-real-ip');
    if (realIp) return sanitizeIp(realIp);

    // 5. Standard X-Forwarded-For (take leftmost client IP)
    const forwardedFor = headerList.get('x-forwarded-for');
    if (forwardedFor) {
      const firstIp = forwardedFor.split(',')[0].trim();
      return sanitizeIp(firstIp);
    }

    return '127.0.0.1';
  } catch (err) {
    return '127.0.0.1';
  }
}
