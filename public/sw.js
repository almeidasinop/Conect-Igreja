const CACHE_NAME = "conectigreja-cache-v1";
const URLS_TO_CACHE = ["/app", "/app/index.html", "/offline.html"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then(response => response || caches.match("/offline.html"))
    )
  );
});
