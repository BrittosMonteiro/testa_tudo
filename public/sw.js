const CACHE_NAME = "pwa-cache-v3";
const STATIC_ASSETS = [
  "/", // Página inicial
  "/offline.html", // Página offline customizada
  "/manifest.json", // Manifest
  "/favicon.ico", // Ícone
];

// Instala e faz o pre-cache das rotas e assets estáticos
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Ativa e remove caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) return caches.delete(key);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Escuta mensagens do front-end (para cache dinâmico de rotas)
self.addEventListener("message", (event) => {
  if (!event.data) return;

  // Cache manual de rotas enviadas via postMessage
  if (event.data.type === "CACHE_ROUTES") {
    const routes = event.data.payload || [];
    caches.open(CACHE_NAME).then((cache) => {
      routes.forEach((route) => {
        cache.add(route).catch(() => {
          console.warn("[SW] Falha ao salvar rota dinâmica:", route);
        });
      });
    });
  }

  // Forçar atualização imediata do service worker (caso queira)
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Estratégia de busca (Network falling back to Cache)
// self.addEventListener("fetch", (event) => {
//   const { request } = event;

//   // Ignorar requisições não GET
//   if (request.method !== "GET") return;

//   event.respondWith(
//     fetch(request)
//       .then((response) => {
//         // Salva no cache respostas bem-sucedidas
//         const responseClone = response.clone();
//         caches
//           .open(CACHE_NAME)
//           .then((cache) => cache.put(request, responseClone));
//         return response;
//       })
//       .catch(async () => {
//         // Busca no cache em caso de falha na rede
//         const cachedResponse = await caches.match(request);
//         if (cachedResponse) return cachedResponse;

//         // Retorna a página offline se nada for encontrado
//         if (request.mode === "navigate") {
//           return caches.match("/offline.html");
//         }
//       })
//   );
// });

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open("my-app-cache-v2");
        const cached = await cache.match(event.request);
        return cached || cache.match("/offline.html");
      })
    );
  }
});
