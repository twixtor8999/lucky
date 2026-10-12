// Lucky 777 Service Worker v1.0.0
const CACHE_NAME = 'lucky777-shell-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/offline.html',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

// Install: Cache Shell & Static Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
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

  // Exclude API requests, wallet, auth, and mutations from ServiceWorker caching
  if (
    url.pathname.startsWith('/api/') ||
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
