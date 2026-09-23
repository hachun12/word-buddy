/* Service Worker — 讓 App 可離線使用、載入更快
   採 cache-first；改版時把 CACHE 版本號 +1 即可更新。 */
const CACHE = 'wordbuddy-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/data.js',
  './js/speech.js',
  './js/progress.js',
  './js/ui.js',
  './js/mode-flashcards.js',
  './js/mode-listen.js',
  './js/mode-quiz.js',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
