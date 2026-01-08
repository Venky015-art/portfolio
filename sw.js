const CACHE = 'portfolio-todo-v1';
const ASSETS = [
  'index.html',
  'styles.css',
  'script.js',
  'todo.html',
  'todo.css',
  'todo.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-192.svg',
  'icons/icon-512.svg'
];

self.addEventListener('install', (evt)=>{
  evt.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (evt)=>{
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (evt)=>{
  // Try cache first, then network. If neither is available, fallback to todo.html when appropriate.
  evt.respondWith(caches.match(evt.request).then(res => {
    if(res) return res;
    return fetch(evt.request).then(r => {
      // Clone and store in cache for future
      const rClone = r.clone();
      caches.open(CACHE).then(cache => {
        // Only cache GET requests
        if(evt.request.method === 'GET') cache.put(evt.request, rClone).catch(()=>{});
      });
      return r;
    }).catch(() => {
      // If request is navigation or HTML, return cached todo.html if available
      if(evt.request.mode === 'navigate' || (evt.request.headers.get && evt.request.headers.get('accept') && evt.request.headers.get('accept').includes('text/html'))){
        return caches.match('todo.html');
      }
      return caches.match('index.html');
    });
  }));
});
