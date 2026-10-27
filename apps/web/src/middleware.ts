import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware for Reverse Proxy IP Routing.
 * 
 * Extracts and sanitizes real client IP from Cloudflare, Nginx, or Load Balancers,
 * and forwards the validated IP downstream via `x-client-ip` request header.
 */
export function middleware(request: NextRequest) {
  // 1. Extract candidate IP based on reverse proxy headers in priority order:
  // - cf-connecting-ip: Cloudflare edge (cannot be spoofed if behind Cloudflare)
  // - true-client-ip: Cloudflare Enterprise / Akamai
  // - x-real-ip: Standard Nginx reverse proxy
  // - x-forwarded-for: Standard proxy hop list (take leftmost client IP)
  // - request.ip: Underlying socket IP from Next.js runtime
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  const trueClientIp = request.headers.get('true-client-ip');
  const xRealIp = request.headers.get('x-real-ip');
  const xForwardedFor = request.headers.get('x-forwarded-for');

  let resolvedIp = 
    cfConnectingIp || 
    trueClientIp || 
    xRealIp || 
    (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null) || 
    request.ip || 
    '127.0.0.1';

  // 2. Sanitize IP address format
  resolvedIp = resolvedIp.trim();
  if (resolvedIp.includes(':') && !resolvedIp.includes('::')) {
    // IPv4 with port (e.g. 192.168.1.1:45678) -> strip port
    resolvedIp = resolvedIp.split(':')[0];
  } else if (resolvedIp.startsWith('[') && resolvedIp.includes(']')) {
    // Bracketed IPv6 (e.g. [2001:db8::1]:8080) -> strip brackets and port
    resolvedIp = resolvedIp.substring(1, resolvedIp.indexOf(']'));
  }

  // 3. Clone request headers and attach normalized client IP & Geo headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-client-ip', resolvedIp);

  // Forward country / geo headers if present from CDN
  const geoCountry = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country');
  if (geoCountry) {
    requestHeaders.set('x-client-country', geoCountry);
  }

  // 4. Pass downstream with updated headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, images, PWA manifests, service worker, and public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|favicon.jpg|sw.js|manifest.webmanifest|manifest.json|offline.html|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
