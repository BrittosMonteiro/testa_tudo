const CACHE_NAME = "pwa-cache-v4";
const STATIC_ROUTES = ["/", "/sobre"];
const DB_NAME = "offline-routes-db";
const DB_STORE = "routes";

// --- INSTALAÇÃO ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ROUTES))
  );
  self.skipWaiting();
});

// --- ATIVAÇÃO ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      self.clients.claim();
      await restoreDynamicRoutesFromDB();
    })()
  );
});

// --- MENSAGENS ---
self.addEventListener("message", async (event) => {
  const { type, routes } = event.data || {};

  if (type === "PRECACHE_ROUTES" && Array.isArray(routes)) {
    console.log("[SW] Recebendo rotas para pré-cache:", routes);

    const cache = await caches.open(CACHE_NAME);

    for (const path of routes) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          await cache.put(path, response);
          await saveRouteToDB(path);
          console.log("[SW] Cacheado:", path);
        }
      } catch (err) {
        console.error("[SW] Falha ao cachear rota:", path, err);
      }
    }
  }
});

// --- FETCH ---
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request.url);
        if (cached) return cached;

        // fallback
        return new Response(
          `<html><body style="display:flex;align-items:center;justify-content:center;flex-direction:column;height:100vh;font-family:sans-serif;text-align:center">
            <h1>Você está offline</h1>
            <p>Esta página não está disponível sem conexão.</p>
            <button onclick="window.location.href='/'">Voltar</button>
          </body></html>`,
          { headers: { "Content-Type": "text/html" } }
        );
      })
    );
  }
});

// --- IndexedDB Helpers ---
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, { keyPath: "path" });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function saveRouteToDB(path) {
  const db = await openDB();
  const tx = db.transaction(DB_STORE, "readwrite");
  tx.objectStore(DB_STORE).put({ path });
  return tx.complete;
}

async function getAllRoutesFromDB() {
  const db = await openDB();
  const tx = db.transaction(DB_STORE, "readonly");
  const store = tx.objectStore(DB_STORE);
  return new Promise((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
  });
}

async function restoreDynamicRoutesFromDB() {
  const cache = await caches.open(CACHE_NAME);
  const storedRoutes = await getAllRoutesFromDB();

  for (const { path } of storedRoutes) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        await cache.put(path, response);
        console.log("[SW] Restaurou cache da rota dinâmica:", path);
      }
    } catch {}
  }
}
