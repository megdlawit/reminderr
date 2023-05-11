"use strict";

const cacheName = "reminder-cache";
const cacheFiles = [
  "/reminder-pwa/",
  "/reminder-pwa/manifest.webmanifest",
  "/reminder-pwa/js/app.js",
  "/reminder-pwa/js/reminder.js",
  "/reminder-pwa/css/styles.css",
  "/reminder-pwa/img/favicon.ico",
  "/reminder-pwa/img/logo-192.png",
  "/reminder-pwa/img/logo-512.png"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log("c-add-all");
      return cache.addAll(cacheFiles);
    })
  );
});

self.addEventListener("fetch", function(event) {
  const fileName = event.request.url.slice(event.request.url.lastIndexOf("/"));

  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      if(response) {
        console.log(`c-match ${fileName}`);
        return response;
      }

      let fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then(function(response) {
          if(response && (response.status === 200)) {

            console.log(`fetch-ok ${fileName}`);
            //??? cache only files in cacheFiles
            let cacheResponse = response.clone();

            caches.open(cacheName)
              .then(function(cache) {
                console.log(`c-put ${fileName}`);
                cache.put(event.request, cacheResponse);
              });
          }

          return response;
        });
    })
  );
});

self.addEventListener("message", function(event) {
  console.log("message: " + event.data);
  caches.delete(cacheName);
});
