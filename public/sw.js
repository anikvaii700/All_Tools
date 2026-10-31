// The MoSaFa Tools - Advanced PWA & Offline Service Worker
// Version: 3.3.0 (Master Command: Update ON)
// Supports full offline usage for mobile APK/PWA + instant cache purging on update release

const CACHE_NAME = 'mosafa-tools-v3.3.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg',
  '/apple-touch-icon.png',
];

// Install: Cache core app shell and immediately activate if requested
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching partial error:', err);
      });
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate: Clean up all older version caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Message listener for manual and automated update skipWaiting
self.addEventListener('message', (event) => {
  if (event.data) {
    if (event.data.type === 'SKIP_WAITING' || event.data.type === 'PURGE_AND_UPDATE') {
      self.skipWaiting();
    }
  }
});

// Fetch: Smart network-first for API & version checks; cache-first with network fallback for offline tools
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Bypass ServiceWorker for chrome-extension or non-HTTP(S)
  if (!url.protocol.startsWith('http')) return;

  // 2. Strict Network-Only / Network-First for API and Version checks
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname === '/version.json' ||
    url.searchParams.has('nocache')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return offline JSON if API requested while completely offline
        return new Response(
          JSON.stringify({
            offline: true,
            message: 'আপনি বর্তমানে অফলাইনে আছেন। ইন্টারনেট সংযোগ পেলে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 503,
          }
        );
      })
    );
    return;
  }

  // 3. For navigation requests (HTML pages): Network-first with offline cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = await caches.match('/index.html');
          return fallback || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // 4. For static assets (JS, CSS, images, fonts): Cache-first with background network update (Stale-While-Revalidate)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
