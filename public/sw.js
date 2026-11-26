// Service worker mínimo: sirve para que el navegador ofrezca instalar la web como app.
// No guarda nada en caché, así que siempre se ve la versión más reciente de la web.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(self.clients.claim());
});

// Las peticiones siguen su camino normal por internet
self.addEventListener("fetch", () => {});
