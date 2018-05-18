const staticCache = 'mws-restaurant-v9.1'; // version 8.1
const cacheFiles = [
          './',
          './css/styles.css',
          './data/restaurants.json',
          './js/main.js',
          './img/1.jpg',
          './img/2.jpg',
          './img/3.jpg',
          './img/4.jpg',
          './img/5.jpg',
          './img/6.jpg',
          './img/7.jpg',
          './img/8.jpg',
          './img/9.jpg',
          './img/10.jpg',
          './js/dbhelper.js',
          './js/restaurant_info.js',
          './restaurant.html',
          './index.html',
          './img/'
        ];  // cache all relevant files for offline first experience.

// open the cache and cache the resources
self.addEventListener('install', evt => {
  console.log('[ServiceWorker] Installed.');
  evt.waitUntil(
    caches.open(staticCache)
      .then( cache => {
        console.log('[ServiceWorker] Cache open: ', staticCache);
        return cache.addAll(cacheFiles);
      })
      .catch( err => {
        console.log('[ServiceWorker] Error opening cache: ', err);
      })
  )
})

//remove old caches starting with mws-restaurant
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys()
      .then( cacheNames => {
         return Promise.all(
            cacheNames.filter( cacheName => {
              return cacheName.startsWith('mws-restaurant') && cacheName != staticCache;
            }).map( cacheName => {
              return cache.delete(cacheName);
            })
          );
    }).catch( err => {
      console.log('[ServiceWorker] Error during Activation: ', err);
    })
  )
})

// intercept and serve requests from cache first if not in cache serve from the server.
// self.addEventListener('fetch', evt => {
//   console.log('[ServiceWorker] Service Worker Listening...')
//   evt.respondWith(
//     caches.match(evt.request)
//       .then( response => {
//         if (response) {
//           console.log('[ServiceWorker] Cached Resource');
//           return response;
//         } else {
//           console.log('[ServiceWorker] Server Fetch');
//           return fetch(evt.request);
//         }
//       }).catch( err => {
//         console.log('[ServiceWorker] Error during Fetch: ', err);
//       })
//    );
//   //  evt.waitUntil(
//   //    fetch(evt.request)
//   //      .then( response => {
//   //        console.log(response);
//   //        location.reload();
//   //    })
//   // )
// })


self.addEventListener('fetch', evt => {
  console.log('[ServiceWorker] Service Worker Listening...');

  evt.respondWith(
    caches.match(evt.request)
      .then(response = > {
        if (response) { return response;}
      })
  );
  evt.waitUntil(
    update(evt.request).then(refresh)
  );
});


function update(request) {
  return caches.open(staticCache)
    .then( cache => {
      return fetch(request)
        .then( response => {
          return cache.put(request, response.clone()).then( () => {
            return response;
          });
        });
    });
}

function refresh(response) {
  return self.clients.matchAll()
    .then( clients => {
      clients.forEach( client => {
        var msg = {
          type: 'refresh',
          url: response.url,
          eTag: response.headers.get('ETag')
        };
        client.postMessage(JSON.stringify(msg));
      });
    });
}
