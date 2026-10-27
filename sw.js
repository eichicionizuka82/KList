const V='serie-viste-v1';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET') return;
  if(u.origin===location.origin){
    // app: prima rete, se offline la copia salvata
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./'))));
  }else if(u.hostname==='image.tmdb.org'){
    // locandine e foto TMDB: copia salvata, aggiornata in background
    e.respondWith(caches.open(V).then(c=>c.match(e.request).then(h=>{
      const n=fetch(e.request).then(r=>{c.put(e.request,r.clone());return r}).catch(()=>h);
      return h||n;
    })));
  }
});
