// Mantri777 Service Worker v1.0.2
const CACHE_NAME = 'mantri777-shell-v3';
const STATIC_ASSETS = [
  '/',
  '/?app=true',
  '/manifest.webmanifest',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png'
];

// Install: Cache Shell & Static Assets safely
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn('[SW] Could not cache asset:', asset, err);
          })
        )
      );
    })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Never cache private/financial/API endpoints! Network-first with offline shell fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Exclude API requests, APK downloads, wallet, auth, and mutations from ServiceWorker caching
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.endsWith('.apk') ||
    event.request.method !== 'GET' ||
    url.pathname.includes('/wallet') ||
    url.pathname.includes('/bets')
  ) {
    return; // Pass directly to network
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache valid static GET responses (like CSS, JS, SVGs)
        if (response.status === 200 && (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/'))) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return new Response('Network error occurred', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});
