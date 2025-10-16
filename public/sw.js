// public/sw.js
const CACHE_NAME = "pwa-cache-v1";
const OFFLINE_URLS = ["/", "/sobre"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);

        // se a rota está no cache, serve ela
        if (OFFLINE_URLS.some((path) => request.url.endsWith(path))) {
          return cache.match(request) || cache.match("/");
        }

        // caso contrário (ex: /contato), retorna uma resposta "offline"
        return new Response(
          `<html><body style="display:flex;align-items:center;justify-content:center;flex-direction:column;height:100vh;font-family:sans-serif;text-align:center">
            <h1>Você está offline</h1>
            <p>Esta página não está disponível sem conexão.</p>
            <button onclick="window.location.href='/'">Voltar para a página inicial</button>
          </body></html>`,
          { headers: { "Content-Type": "text/html" } }
        );
      })
    );
  }
});
