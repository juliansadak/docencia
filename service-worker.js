const CACHE_NAME = 'cecyte-portal-cache-v2';

// URLs base para evitar problemas con rutas relativas en producción
const getAssetUrl = (path) => {
  const origin = self.location.origin;
  return new URL(path, origin).href;
};

// Listado de archivos locales que se guardarán en la memoria del dispositivo
const ASSETS_TO_CACHE = [
  getAssetUrl('/'),
  getAssetUrl('/index.html'),
  getAssetUrl('/radi.html'),
  getAssetUrl('/indicadores.html'),
  getAssetUrl('/comparativa.html'),
  getAssetUrl('/manifest.json'),
  getAssetUrl('/service-worker.js'),
  getAssetUrl('/pwa.js'),
  getAssetUrl('/julianprofile.png'),
  getAssetUrl('/juliansadak.png'),
  getAssetUrl('/logo.png'),
  getAssetUrl('/arturodiaz.png'),
  getAssetUrl('/cecyte/lms.html'),
  getAssetUrl('/cecyte/eval/plantilla_rubrica.html'),
  getAssetUrl('/cecyte/eval/plantilla_observacion.html'),
  getAssetUrl('/cecyte/eval/plantilla_estimativa.html'),
  getAssetUrl('/cecyte/eval/plantilla_cotejo.html')
];

// Evento de Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Almacenando herramientas educativas en caché...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Evento de Activación para limpiar cachés viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('SW: Eliminando caché obsoleto:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de Red con Caída a Caché (Network First, falling back to cache)
// Esto asegura que si modificas un archivo en tu servidor se actualice, pero si no hay internet cargue la versión guardada
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardarla/actualizarla en caché
        if (response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red (offline), buscar en el caché local
        return caches.match(event.request);
      })
  );
});