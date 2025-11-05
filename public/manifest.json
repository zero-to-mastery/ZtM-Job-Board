const CACHE_NAME = 'ztm-job-board-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // add all your built JS/CSS assets here, e.g.,
  '/static/js/main.js',
  '/static/css/main.css'
];

// Install event: cache everything
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Fetch event: serve from cache, fallback to index.html for navigation
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(response =>
        response || fetch(event.request)
      )
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});

// Optional: Activate event to clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
});
