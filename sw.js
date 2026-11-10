const CACHE_NAME = 'simply-todo-e05-1';
const OFFLINE_URL = './offline.html';
const SHELL = [
  './offline.html',
  './style.css',
  './script.js',
  './manifest.json',        // sesuaikan dengan nama file kamu
  './icons/192px.png',
  './icons/512px.png'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching App Shell');
      return cache.addAll(SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network First: coba jaringan, kalau gagal pakai cache, lalu offline.html
async function networkFirstPage(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(request);
    // response hasil redirect tidak boleh disajikan ulang untuk navigasi
    if (res.ok && !res.redirected) cache.put(request, res.clone());
    return res;
  } catch {
    return (await cache.match(request)) || (await cache.match(OFFLINE_URL));
  }
}

// Stale-While-Revalidate: kasih cache dulu, refresh di belakang layar
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetching = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => cached || Response.error());
  return cached || fetching;
}

// Cache First: cache dulu, kalau tidak ada baru ke jaringan lalu simpan
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    return Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;            // POST (save/delete) biarkan lewat

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirstPage(req));
  } else if (/\.(css|js)$/.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(req));
  } else if (url.pathname.includes('/uploads/')) {
    event.respondWith(cacheFirst(req));
  }
});
