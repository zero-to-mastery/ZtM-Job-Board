const CACHE_NAME = 'ztm-job-board-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add paths to main.js, main.css, and key assets/images here
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // cache map JS chunk (same-origin)
  if (url.origin === location.origin && url.pathname.includes('Map') && url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open('jb-v1').then(c => c.put(req, copy));
        return res;
      }))
    );
    return;
  }

  // cache 3rd-party tiles (update in the background)
  if (/tile|tiles|maps/i.test(url.hostname)) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // ...your other routes
});
