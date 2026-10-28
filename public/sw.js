// The MoSaFa Tools - Self-destructing & Cache-Purging Service Worker
// Automatically purges old caches and unregisters to prevent iframe blank-screen loading issues

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Always pass-through directly to network
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
