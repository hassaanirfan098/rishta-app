// Rishta service worker — v3 (plum rebrand)
// Bump the version above to force clients to update.

self.addEventListener("install", () => {
  // Take over from any older service worker immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Purge every cache left behind by older service workers
      // (stale precached shells/icons were serving an old app + old logo)
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const { title, body, url } = event.data.json();
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-96.png",
      data: { url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
