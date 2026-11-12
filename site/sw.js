// Service Worker: macht die App installierbar und offline nutzbar.
const CACHE = 'spiritual-light-v13';
const SHELL = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'content.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'fonts/cormorant-garamond-latin-500-normal.woff2',
  'fonts/cormorant-garamond-latin-600-normal.woff2',
  'fonts/cormorant-garamond-latin-500-italic.woff2',
  'fonts/nunito-latin-wght-normal.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Erst das Netz fragen (frische Inhalte), bei fehlender Verbindung den letzten Stand zeigen.
async function networkFirst(request, fresh) {
  const cache = await caches.open(CACHE);
  try {
    // Eigene Dateien immer beim Server nachfragen (statt bis zu 10 Min. aus dem Browser-Cache)
    const res = await fetch(request, fresh ? { cache: 'no-cache' } : undefined);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isWeather = url.hostname.endsWith('open-meteo.com');
  if (sameOrigin || isWeather) event.respondWith(networkFirst(request, sameOrigin));
});
