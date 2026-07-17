// Service worker Éclosion — masque le réveil du serveur Render (offre gratuite).
// Stratégie :
//  - Pages (navigation) : réseau d'abord avec délai court, sinon coquille en cache.
//    Ainsi, dès la 2e visite, l'écran d'attente s'affiche immédiatement pendant
//    que le serveur endormi se réveille en arrière-plan.
//  - Assets construits (/assets/*, noms hachés) : cache d'abord, réseau sinon.
//  - /api/* : jamais mis en cache.

const CACHE_NAME = "eclosion-shell-v1";
const NAV_TIMEOUT_MS = 4000;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

const networkFirstNavigation = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  try {
    const network = fetch(request);
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("nav-timeout")), NAV_TIMEOUT_MS)
    );
    const response = await Promise.race([network, timeout]);
    if (response && response.ok) {
      cache.put("/index.html", response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match("/index.html");
    if (cached) return cached;
    // Pas de cache : on laisse le navigateur attendre la vraie réponse réseau.
    return fetch(request);
  }
};

const cacheFirstAsset = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
};

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirstAsset(request));
  }
});
