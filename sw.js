const CACHE = 'north-logs-v1';
const ASSETS = [
  './',
  './index.html',
  './NORTH_Canning_Log.html',
  './NORTH_Bottling_Front_Log.html',
  './NORTH_Bottling_Back_Log.html',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network first for CDN/external, cache first for local
  const url = e.request.url;
  if (url.includes('cdn.jsdelivr') || url.includes('cdnjs.cloudflare') || url.includes('emailjs')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }).catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(fr => {
        const clone = fr.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return fr;
      }))
    );
  }
});
