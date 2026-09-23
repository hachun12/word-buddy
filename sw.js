/* Service Worker — 讓 App 可離線使用、載入更快
   策略：連線優先 (network-first)。
   有網路時一律取最新版並更新快取；沒網路時才用快取，
   這樣改版後線上使用者會立即看到新版，不會卡在舊快取。 */
const CACHE = 'wordbuddy-v3';
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
    fetch(e.request).then(res => {
      // 取到最新版就順手更新快取
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() =>
      // 沒網路時退回快取；找不到就回首頁
      caches.match(e.request).then(hit => hit || caches.match('./index.html'))
    )
  );
});
