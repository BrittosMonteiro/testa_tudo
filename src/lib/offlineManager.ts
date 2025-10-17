"use client";

export async function precacheDynamicRoutes(routes: string[]) {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;

  registration.active?.postMessage({
    type: "CACHE_ROUTES",
    routes,
  });
}
