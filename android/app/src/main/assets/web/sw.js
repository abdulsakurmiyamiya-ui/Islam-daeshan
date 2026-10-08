/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "ac9cec42c7dda994ad2db1980334b35c"
  }, {
    "url": "pwa-512x512.png",
    "revision": "e9b99e4895ef7e8574eeaf8168b6fbf5"
  }, {
    "url": "pwa-192x192.png",
    "revision": "be5a8f1870be098a1f8301b8403fe14b"
  }, {
    "url": "index.html",
    "revision": "854e700f0815a7f769a44c2fcb6f8b89"
  }, {
    "url": "icon.svg",
    "revision": "ab0948f1a4a4b19cb24af6d0d22c0eb4"
  }, {
    "url": "favicon.ico",
    "revision": "ffa9cf50ff9224ab0bb9bccf40f9cadf"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "a724d289148ea73b7fac8e89e7cca521"
  }, {
    "url": "assets/index-ByOwxg9n.js",
    "revision": null
  }, {
    "url": "assets/index-BGihTetu.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "a724d289148ea73b7fac8e89e7cca521"
  }, {
    "url": "favicon.ico",
    "revision": "ffa9cf50ff9224ab0bb9bccf40f9cadf"
  }, {
    "url": "icon.svg",
    "revision": "ab0948f1a4a4b19cb24af6d0d22c0eb4"
  }, {
    "url": "pwa-192x192.png",
    "revision": "be5a8f1870be098a1f8301b8403fe14b"
  }, {
    "url": "pwa-512x512.png",
    "revision": "e9b99e4895ef7e8574eeaf8168b6fbf5"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "ac9cec42c7dda994ad2db1980334b35c"
  }, {
    "url": "manifest.webmanifest",
    "revision": "82cc9c6a5b8d153655d7b6ed50f3a9c8"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
