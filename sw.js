// PDF Studio offline support: the app is cached on install and served from the cache,
// so it starts instantly and works without internet. Updates download quietly in the background.
const CACHE = 'pdfstudio-v2';
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-16.png", "./icon-24.png", "./icon-32.png", "./icon-48.png", "./icon-64.png", "./icon-96.png", "./icon-128.png", "./icon-192.png", "./icon-256.png", "./icon-512.png", "./icon-maskable.png", "./file-16.png", "./file-24.png", "./file-32.png", "./file-48.png", "./file-64.png", "./file-128.png", "./file-256.png"];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  const key = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(key, { ignoreSearch: true });
    const net = fetch(req.mode === 'navigate' ? './index.html' : req).then(r => { if (r.ok) c.put(key, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || new Response('Offline', { status: 503 });
  }));
});
