/* EEAM Rabat service worker
 *
 * Cache name is versioned via the ?v= query param appended at registration
 * (NEXT_PUBLIC_APP_VERSION), so each deployment gets a fresh cache and old
 * ones are deleted on activate.
 *
 * Strategy
 * - Only same-origin GET requests are handled; everything else (form posts,
 *   server actions, Supabase, Cloudflare…) goes straight to the network.
 * - /_next/static/* and /icons, /images: cache-first (content-hashed / static).
 * - Public pages: network-first, cached copy used only when offline.
 * - Private areas (/dashboard, /auth, /profile, /api): never cached, so
 *   member data never stays on the device after logout. Offline → offline page.
 */
const APP_VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const CACHE_NAME = `eeam-rabat-${APP_VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [
  OFFLINE_URL,
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];
const PRIVATE_PREFIXES = ["/dashboard", "/auth", "/profile", "/api"];
const STATIC_PREFIXES = ["/_next/static/", "/icons/", "/images/"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)));
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })()
  );
});

const isPrivate = (path) => PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Static, immutable assets: cache-first
  if (STATIC_PREFIXES.some((p) => url.pathname.startsWith(p))) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(request, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  if (request.mode !== "navigate") return;

  // Private pages: network only, offline page as fallback
  if (isPrivate(url.pathname)) {
    event.respondWith(
      (async () => {
        try {
          return (await event.preloadResponse) || (await fetch(request));
        } catch {
          return caches.match(OFFLINE_URL);
        }
      })()
    );
    return;
  }

  // Public pages: network-first, keep a copy for offline use
  event.respondWith(
    (async () => {
      try {
        const res = (await event.preloadResponse) || (await fetch(request));
        if (res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy));
        }
        return res;
      } catch {
        return (await caches.match(request)) || (await caches.match(OFFLINE_URL));
      }
    })()
  );
});

// Push notifications
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "EEAM Rabat", {
      body: data.body || "Vous avez une nouvelle notification.",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-96.png",
      lang: "fr",
      data: { url: data.url || "/" },
    })
  );
});

// Open (or focus) the app on the notification's page when tapped
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "/", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if (client.url === target && "focus" in client) return client.focus();
      }
      const existing = windows.find((c) => "navigate" in c);
      if (existing) {
        await existing.navigate(target);
        return existing.focus();
      }
      return self.clients.openWindow(target);
    })()
  );
});
