/* TechPlast Измерител — service worker (мрежа-първо за приложението, кеш за иконите) */
const CACHE = "techplast-ar-v1";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
function isAppDoc(req){ return req.mode==="navigate" || req.destination==="document" || req.url.endsWith("/index.html") || req.url.endsWith("/"); }
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (isAppDoc(req)) {
    e.respondWith(fetch(req).then(res=>{ const c=res.clone(); caches.open(CACHE).then(c2=>c2.put("./index.html",c)); return res; })
      .catch(()=>caches.match("./index.html").then(r=>r||caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(req).then(cached=>{
    const fresh = fetch(req).then(res=>{ if(res&&res.status===200&&res.type==="basic"){const c=res.clone();caches.open(CACHE).then(c2=>c2.put(req,c));} return res; }).catch(()=>cached);
    return cached || fresh;
  }));
});
