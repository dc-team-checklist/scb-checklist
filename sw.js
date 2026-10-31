var C='scb-offline-v1';
var FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(FILES);}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==C;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
function fromCache(req){return caches.match(req,{ignoreSearch:true}).then(function(m){return m||caches.match('./index.html');});}
self.addEventListener('fetch',function(e){
  var r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(new Promise(function(res){
    var done=false,t=setTimeout(function(){if(done)return;fromCache(r).then(function(m){if(m&&!done){done=true;res(m);}});},3500);
    fetch(r).then(function(n){
      if(done)return;done=true;clearTimeout(t);
      var cp=n.clone();if(n.ok)caches.open(C).then(function(c){c.put(r,cp);});
      res(n);
    }).catch(function(){
      clearTimeout(t);if(done)return;
      fromCache(r).then(function(m){done=true;res(m||new Response('Offline',{status:503}));});
    });
  }));
});
