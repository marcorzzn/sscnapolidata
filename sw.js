const CACHE_NAME = 'data-napoli-v1';
const ASSETS_TO_CACHE = [
  '/sscnapolidata/',
  '/sscnapolidata/index.html',
  '/sscnapolidata/assets/style.css',
  '/sscnapolidata/assets/app.js',
  '/sscnapolidata/assets/favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
