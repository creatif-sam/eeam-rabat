// Cache name is versioned via the ?v= query param appended to the registration
// URL (see app/layout.tsx), which is driven by NEXT_PUBLIC_APP_VERSION. Every
// new deployment gets a new cache name, and activate() below wipes every cache
// that doesn't match it.
const APP_VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE_NAME = `eeam-rabat-${APP_VERSION}`;
const urlsToCache = [
  '/manifest.json',
  '/images/eeam-logo.png',
  '/politique-de-confidentialite',
  '/politique-cookies'
];

// Install event - cache static resources only (no navigations, no API)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - wipe every cache that isn't the current version
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event:
// - /api/ requests: NetworkOnly — never serve or store a cached response,
//   these can carry authenticated/session-specific data.
// - Navigation requests (HTML pages): NetworkFirst — always try the network
//   first so logged-in/out state is never served stale; only fall back to
//   the cache (or the offline shell) when the network is unreachable.
// - Everything else (static assets): cache-first, falling back to network.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Listen for push events and show notifications
self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  const title = data.title || 'EEAM Notification';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/images/eeam-logo.png',
    badge: '/images/eeam-logo.png',
    data: data.url || '/'
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
