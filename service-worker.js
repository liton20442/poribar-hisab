const CACHE_NAME = "poribar-hisab-final-v2";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./service-worker.js"
];


self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())

    );

});


self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys
                        .filter(
                            key =>
                                key !== CACHE_NAME
                        )
                        .map(
                            key =>
                                caches.delete(key)
                        )

                );

            })
            .then(() => self.clients.claim())

    );

});


self.addEventListener("fetch", event => {

    if(
        event.request.method !== "GET"
    ){

        return;

    }


    /*
      HTML হলে আগে নতুন version নেওয়া হবে।
    */

    if(
        event.request.mode === "navigate"
    ){

        event.respondWith(

            fetch(event.request)
                .then(response => {

                    const copy =
                        response.clone();


                    caches.open(CACHE_NAME)
                        .then(cache => {

                            cache.put(
                                "./index.html",
                                copy
                            );

                        });


                    return response;

                })
                .catch(() => {

                    return caches.match(
                        "./index.html"
                    );

                })

        );

        return;

    }


    /*
      অন্যান্য file
    */

    event.respondWith(

        caches.match(event.request)
            .then(cached => {

                if(cached){

                    return cached;

                }


                return fetch(event.request)
                    .then(response => {

                        if(
                            response &&
                            response.status === 200
                        ){

                            const copy =
                                response.clone();


                            caches.open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        event.request,
                                        copy
                                    );

                                });

                        }


                        return response;

                    });

            })

    );

});
