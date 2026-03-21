const cacheName = 'memory-pro-v1';
const assets = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/all.min.css',
  './css/sweetalert2.min.css',
  './js/script.js',
  './js/sweetalert2.all.min.js',
  './sound/success.mp3',
  './sound/click.mp3',
  './sound/fail.mp3',
  './image/icon2.png'
];

// تثبيت الـ Service Worker وحفظ الملفات
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Caching assets...');
      return cache.addAll(assets);
    })
  );
});

// استراتيجية "Cache First": البحث في الكاش أولاً ثم الشبكة
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});