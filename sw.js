// Service worker de Legua: caché básica para abrir sin conexión + avisos push.
const CACHE='legua-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./manifest.json','./icon.png']).catch(()=>{})));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin))return;
 e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request)));});
self.addEventListener('push',e=>{let d={title:'Legua',body:'Toca entrenar'};try{d=e.data.json();}catch(x){if(e.data)d.body=e.data.text();}
 e.waitUntil(self.registration.showNotification(d.title||'Legua',{body:d.body||'',icon:'./icon.png',badge:'./icon.png'}));});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(cs=>cs.length?cs[0].focus():clients.openWindow('./')));});
