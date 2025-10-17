const CACHE_NAME = "pwa-cache-v5";
const STATIC_ROUTES = ["/", "/sobre", "/offline"];
const DB_NAME = "offline-routes-db";
const DB_STORE = "routes";

// --- INSTALL ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(STATIC_ROUTES);
    })
  );
  self.skipWaiting();
});

// --- ACTIVATE ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      self.clients.claim();
      await restoreDynamicRoutesFromDB();
    })()
  );
});

// --- MESSAGE ---
self.addEventListener("message", async (event) => {
  const { type, routes } = event.data || {};
  if (type === "PRECACHE_ROUTES" && Array.isArray(routes)) {
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
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(event.request);
        return cached || cache.match("/offline");
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
