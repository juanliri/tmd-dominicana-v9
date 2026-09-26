// Service Worker Robusto PWA (Fase 20.1) — TMD Dominicana
// Estrategia 'Stale-While-Revalidate' para Catálogo de Maquinarias, Repuestos, Fichas Técnicas y Manuales en Campo

const CACHE_VERSION = 'tmd-pwa-v20.1-swr';
const APP_SHELL_CACHE = `tmd-app-shell-${CACHE_VERSION}`;
const TECH_DATASHEETS_CACHE = `tmd-datasheets-${CACHE_VERSION}`;
const PARTS_MANUALS_CACHE = `tmd-manuals-${CACHE_VERSION}`;
const CATALOG_SPECS_CACHE = `tmd-catalog-specs-${CACHE_VERSION}`;
const CURRENCY_CACHE = `tmd-currency-${CACHE_VERSION}`;
const RUNTIME_CACHE = `tmd-runtime-${CACHE_VERSION}`;

// Core App Shell & Static Registry Assets to pre-cache on installation
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  'https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,700;1,800&family=JetBrains+Mono:wght@400;500;600;700;800&family=Oswald:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://tmd-dominicana-2026-todobuild-apps.vercel.app/assets/tmd_multibrand_registry.js',
  'https://tmd-dominicana-2026-todobuild-apps.vercel.app/assets/tmd_jcb_catalog_data.js',
  'https://tmd-dominicana-2026-todobuild-apps.vercel.app/assets/tmd_liugong_catalog_data.js',
  'https://tmd-dominicana-2026-todobuild-apps.vercel.app/assets/tmd_kubota_catalog_data.js',
  'https://tmd-dominicana-2026-todobuild-apps.vercel.app/assets/tmd_ls_tractor_catalog_data.js',
  'https://tmd-dominicana-2026-todobuild-apps.vercel.app/assets/tmd_yanmar_catalog_data.js',
  'https://tmd-dominicana-2026-todobuild-apps.vercel.app/assets/tmd_ammann_catalog_data.js',
  'https://tmd-dominicana-2026-todobuild-apps.vercel.app/assets/tmd_imer_catalog_data.js',
  'https://tmd-dominicana-2026-todobuild-apps.vercel.app/assets/tmd_afex_catalog_data.js',
  'https://tmd-dominicana-2026-todobuild-apps.vercel.app/assets/tmd_yomel_orsi_celli_data.js'
];

// Service Worker Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => {
      console.log('[TMD ServiceWorker v20.1] Precaching App Shell & Core Registry for Intermittent Connectivity...');
      return cache.addAll(APP_SHELL_ASSETS).catch((err) => {
        console.warn('[TMD ServiceWorker] Non-critical precache asset failed:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Service Worker Activation & Cache Cleanup
self.addEventListener('activate', (event) => {
  const currentCaches = [
    APP_SHELL_CACHE, 
    TECH_DATASHEETS_CACHE, 
    PARTS_MANUALS_CACHE, 
    CATALOG_SPECS_CACHE,
    CURRENCY_CACHE,
    RUNTIME_CACHE
  ];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName) && cacheName.startsWith('tmd-')) {
            console.log('[TMD ServiceWorker] Purging deprecated cache partition:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Stale-While-Revalidate Generic Strategy
async function staleWhileRevalidate(request, targetCacheName, fallbackContentType = 'application/json') {
  const cache = await caches.open(targetCacheName);
  const cachedResponse = await cache.match(request);

  // Background fetch to revalidate and refresh the cache
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((err) => {
      console.log('[TMD ServiceWorker SWR] Network background revalidation offline/failed for:', request.url, err);
      return null;
    });

  // If we already have a cached version, return it immediately without blocking on network
  if (cachedResponse) {
    return cachedResponse;
  }

  // If not in cache, await network
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }

  // If network failed and nothing in cache, provide resilient offline fallback
  if (fallbackContentType === 'application/json') {
    return new Response(
      JSON.stringify({
        status: 'offline_cached',
        message: 'Información técnica servida desde el almacén local TMD PWA para condiciones de conectividad intermitente.',
        offlineNotice: 'Para emergencias de campo en mina o carretera, llame al +1 (809) 560-1234.'
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response('/* Recurso técnico TMD en modo offline */', {
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Fetch Interceptor with Smart Caching Strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests or Firebase Firestore/Auth WebSocket streaming
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:' || url.hostname.includes('firestore.googleapis.com')) {
    return;
  }

  // 1. Live Exchange Rate API Sync (Stale-While-Revalidate with Cached Offline Fallback)
  if (url.hostname.includes('open.er-api.com') || url.pathname.includes('/api/exchange-rate')) {
    event.respondWith(
      caches.open(CURRENCY_CACHE).then((cache) => {
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Synthesize offline fallback rate if never cached
              return new Response(
                JSON.stringify({
                  result: 'success',
                  base_code: 'USD',
                  rates: { DOP: 60.50 },
                  time_last_update_utc: new Date().toUTCString(),
                  fallback: true
                }),
                {
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
          });
      })
    );
    return;
  }

  // 2. Machine & Parts Catalog Data (Stale-While-Revalidate Strategy)
  if (
    url.pathname.includes('/data/catalog') ||
    url.pathname.includes('/assets/tmd_') ||
    url.pathname.includes('/api/catalog') ||
    url.pathname.includes('/api/parts') ||
    url.pathname.includes('/api/machinery')
  ) {
    event.respondWith(
      staleWhileRevalidate(request, CATALOG_SPECS_CACHE, 'application/json')
    );
    return;
  }

  // 3. Technical Documents, Product Specs, Fichas Técnicas & Parts Schematics (Stale-While-Revalidate Strategy)
  if (
    url.pathname.includes('/tech-docs/') ||
    url.pathname.includes('/manuals/') ||
    url.pathname.includes('/specs/') ||
    url.pathname.includes('/schematics/') ||
    url.searchParams.has('offline_vault') ||
    url.pathname.endsWith('.pdf')
  ) {
    event.respondWith(
      staleWhileRevalidate(request, TECH_DATASHEETS_CACHE, 'text/plain')
    );
    return;
  }

  // 4. Navigation / HTML Requests -> Network First with App Shell Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // 5. Google Fonts & CDN Scripts -> Cache First with Stale-While-Revalidate
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('tmd-dominicana-2026-todobuild-apps.vercel.app')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch fresh in background
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          return new Response('/* Offline fallback for asset */', {
            headers: { 'Content-Type': 'text/javascript' }
          });
        });
      })
    );
    return;
  }

  // 6. Default Static Assets & Images -> Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If offline and not in cache, return safe fallback if image
        if (request.destination === 'image') {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#18181b" width="200" height="200"/><text fill="#f59e0b" font-family="sans-serif" font-size="12" font-weight="bold" x="50%" y="50%" text-anchor="middle">TMD OFFLINE</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Client Communication Message Handler
self.addEventListener('message', (event) => {
  if (!event.data) return;

  const { type, payload } = event.data;

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (type === 'PRECACHE_CRITICAL_VAULT') {
    const urlsToCache = payload?.urls || [];
    caches.open(TECH_DATASHEETS_CACHE).then(async (cache) => {
      let cachedCount = 0;
      for (const url of urlsToCache) {
        try {
          const response = await fetch(url, { cache: 'reload' });
          if (response.ok) {
            await cache.put(url, response);
            cachedCount++;
          }
        } catch (e) {
          console.warn('[TMD ServiceWorker] Failed to cache item:', url, e);
        }
      }

      // Notify clients of completion
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'VAULT_PRECACHE_COMPLETED',
            cachedCount,
            totalRequested: urlsToCache.length,
            timestamp: new Date().toISOString()
          });
        });
      });
    });
  }

  if (type === 'GET_CACHE_STATS') {
    Promise.all([
      caches.open(APP_SHELL_CACHE).then((c) => c.keys()),
      caches.open(TECH_DATASHEETS_CACHE).then((c) => c.keys()),
      caches.open(PARTS_MANUALS_CACHE).then((c) => c.keys()),
      caches.open(CATALOG_SPECS_CACHE).then((c) => c.keys()),
      caches.open(CURRENCY_CACHE).then((c) => c.keys()),
      caches.open(RUNTIME_CACHE).then((c) => c.keys())
    ]).then(([appKeys, techKeys, partKeys, catalogKeys, currKeys, runKeys]) => {
      const totalKeys = appKeys.length + techKeys.length + partKeys.length + catalogKeys.length + currKeys.length + runKeys.length;
      event.source.postMessage({
        type: 'CACHE_STATS_RESPONSE',
        stats: {
          appShellCount: appKeys.length,
          techDatasheetsCount: techKeys.length,
          partsManualsCount: partKeys.length,
          catalogSpecsCount: catalogKeys.length,
          currencyCacheCount: currKeys.length,
          runtimeItemsCount: runKeys.length,
          totalCachedResources: totalKeys,
          version: CACHE_VERSION
        }
      });
    });
  }

  if (type === 'CLEAR_OFFLINE_VAULT') {
    Promise.all([
      caches.delete(TECH_DATASHEETS_CACHE),
      caches.delete(PARTS_MANUALS_CACHE),
      caches.delete(CATALOG_SPECS_CACHE),
      caches.delete(CURRENCY_CACHE),
      caches.delete(RUNTIME_CACHE)
    ]).then(() => {
      event.source.postMessage({
        type: 'VAULT_CLEARED_SUCCESS',
        timestamp: new Date().toISOString()
      });
    });
  }
});

// Push Notifications Support
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const payload = event.data.json();
      const title = payload.notification?.title || payload.data?.title || 'TMD Dominicana';
      const options = {
        body: payload.notification?.body || payload.data?.body || 'Actualización técnica de maquinaria y repuestos.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: payload.data?.type || 'tmd-pwa-alert',
        data: payload.data || {}
      };
      event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
      console.warn('Push parse warning:', e);
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.actionUrl || '/#/offline-vault';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
