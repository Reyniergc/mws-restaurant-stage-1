const cacheName = 'mws-restaurant-v3';
const cacheFiles = [
          './',
          './css/styles.css',
          './data/restaurants.json',
          './js/main.js',
          './js/dbhelper.js',
          './js/restaurant_info.js',
          './restaurant.html',
          './index.html',
          './img/'
        ];

self.addEventListener('install', evt => {
  console.log('[ServiceWorker] Installed.');
  evt.waitUntil(
    caches.open(cacheName)
      .then( cache => {
        console.log('[ServiceWorker] Cache open: ', cacheName);
        return cache.addAll(cacheFiles);
      })
      .catch( err => {
        console.log('[ServiceWorker] Error opening cache: ', err);
      })
  )
})

self.addEventListener('activate', evt => {
  console.log('[ServiceWorker] Activated!');

  evt.waitUntil(
    caches.keys()
      .then( cacheNames => {
        return Promise.all(cacheNames.map( thisCache => {
          if ( thisCache != cacheName ) {
            console.log('[ServiceWorker] Removing cached files from: ', thisCache );
            return caches.delete(thisCache);
          }
        }))
      }).catch( err => {
        console.log('[ServiceWorker] Error during Activation: ', err);
      })
  )
})

self.addEventListener('fetch', evt => {
  console.log('[ServiceWorker] Service Worker Listening...')
  //console.log(evt.request);
  evt.respondWith(
    caches.match(evt.request)
      .then( response => {
        if (response) {
          console.log('[ServiceWorker] Cached Resource');
          return response;
        } else {
          console.log('[ServiceWorker] Server Fetch');
          return fetch(evt.request);
        }
      }).catch( err => {
        console.log('[ServiceWorker] Error during Fetch: ', err);
      })
  );
})
