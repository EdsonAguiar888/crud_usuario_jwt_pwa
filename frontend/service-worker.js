// const cacheName = 'crud-jwt-v2'
// const arquivos = [
//   '/',
//   '/index.html',
//   '/usuarios.html',
//   '/style.css',
//   '/auth.js',
//   '/usuarios.js',
//   '/manifest.json'
// ]

// self.addEventListener('install', event => {
//   event.waitUntil(
//     caches.open(cacheName).then(cache => cache.addAll(arquivos))
//   )
// })

// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request).then(resposta => resposta || fetch(event.request))
//   )
// })


const cacheName = 'crud-jwt-v3';
const arquivos = [
  '/',
  '/index.html',
  '/usuarios.html',
  '/style.css',
  '/auth.js',
  '/usuarios.js',
  '/manifest.json'
];

// Evento de Instalação: Armazena os arquivos estáticos no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('[Service Worker] Instalando e armazenando arquivos no cache...');
      return cache.addAll(arquivos);
    })
  );
  self.skipWaiting();
});

// Evento de Ativação: Remove caches antigos se houver atualização de versão
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== cacheName) {
            console.log('[Service Worker] Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Evento de Fetch: Intercepta requisições, servindo do cache ou buscando na rede
self.addEventListener('fetch', event => {
  // Ignora requisições para a API (/api) para garantir que dados de médicos/pacientes venham sempre frescos do servidor
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(resposta => {
      return resposta || fetch(event.request).catch(() => {
        // Fallback opcional caso esteja offline e tente acessar uma página HTML
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
      });
    })
  );
});