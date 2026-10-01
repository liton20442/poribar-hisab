const CACHE_NAME = "poribar-hisab-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./service-worker.js"
];


/* =========================
   INSTALL
========================= */

self.addEventListener("install", event => {

  event.waitUntil(

    caches
      .open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(APP_FILES);

      })
      .then(() => {

        return self.skipWaiting();

      })

  );

});


/* =========================
   ACTIVATE
========================= */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches
      .keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(
              key => key !== CACHE_NAME
            )
            .map(
              key => caches.delete(key)
            )

        );

      })
      .then(() => {

        return self.clients.claim();

      })

  );

});


/* =========================
   FETCH
========================= */

self.addEventListener("fetch", event => {

  if(event.request.method !== "GET"){

    return;

  }


  event.respondWith(

    caches
      .match(event.request)
      .then(cachedResponse => {

        if(cachedResponse){

          return cachedResponse;

        }


        return fetch(event.request)

          .then(response => {

            if(
              !response ||
              response.status !== 200 ||
              response.type === "opaque"
            ){

              return response;

            }


            const responseCopy =
              response.clone();


            caches
              .open(CACHE_NAME)
              .then(cache => {

                cache.put(
                  event.request,
                  responseCopy
                );

              });


            return response;

          })

          .catch(() => {

            return caches.match(
              "./index.html"
            );

          });

      })

  );

});
