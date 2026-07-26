const CACHE_NAME = "hodoku-v15";

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./audio/guidance/manifests/03min.json",
  "./audio/guidance/manifests/07min.json",
  "./audio/guidance/manifests/12min.json",
  "./audio/guidance/manifests/messages.json",
  "./audio/guidance/manifests/day-messages.json",
  "./audio/guidance/manifests/day-12min.json",
  "./audio/guidance/manifests/day-07min.json",
  "./audio/guidance/manifests/day-03min.json",
  "./audio/bgm/gigidelaromusic-peaceful-light-ray-short-450966.mp3",
  "./audio/bgm/eryliaa-gentle-rain-for-relaxation-and-sleep-337279.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
