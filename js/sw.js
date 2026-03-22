const cacheName = 'memory-game-v1';

// قائمة بجميع الملفات التي يحتاجها تطبيقك ليعمل أوفلاين
// تأكد أن أسماء المجلدات والملفات تطابق ما لديك في المشروع تماماً
const assets = [
  './',
  '../index.html',
  '../css/style.css',
  '../css/all.css',
  '../css/all.min.css',
  '../css/sweetalert2.min.css',
  './script.js',
  './sweetalert2.all.min.js',
  '../manifest.json',
  '../image/icon2.png',
  '../sound/success.mp3',
  '../sound/click.mp3',
  '../sound/fail.mp3',
];

// 1. مرحلة التثبيت (Install): تخزين الملفات في الـ Cache
self.addEventListener('install', e => {
  console.log('Service Worker: Installing...');
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Service Worker: Caching Assets...');
      return cache.addAll(assets);
    }).then(() => self.skipWaiting())
  );
});

// 2. مرحلة التفعيل (Activate): حذف الكاش القديم إذا وجد
self.addEventListener('activate', e => {
  console.log('Service Worker: Activated');
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== cacheName) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. مرحلة الجلب (Fetch): الاستجابة من الكاش عند انقطاع الإنترنت
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cacheResponse => {
      // إذا كان الملف موجوداً في الكاش، نرجعه، وإلا نطلبه من الشبكة
      return cacheResponse || fetch(e.request).catch(() => {
        // في حال فشل الكاش والشبكة (مثل طلب صفحة غير موجودة أوفلاين)
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});