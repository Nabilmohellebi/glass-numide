// Service worker minimal. Rôle unique : rendre l'app installable (critère navigateur) et
// mettre en cache la coquille statique pour un démarrage instantané. Aucune donnée
// utilisateur ne transite ici — le stockage reste dans localStorage, jamais dans le cache SW.

const CACHE = "cadran-shell-v1";
const SHELL = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request)
          .then((res) => {
            const copy = res.clone();
            if (res.ok && new URL(event.request.url).origin === self.location.origin) {
              caches.open(CACHE).then((c) => c.put(event.request, copy));
            }
            return res;
          })
          .catch(() => cached),
    ),
  );
});
