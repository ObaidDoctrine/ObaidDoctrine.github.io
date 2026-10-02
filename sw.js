const CACHE_NAME = "obaid-doctrine-pwa-v2";
const APP_SHELL = ["/", "/manifest.json"];

function isPrivatePath(pathname) {
  return pathname === "/account/" || pathname.startsWith("/account/") ||
         pathname === "/member/" || pathname.startsWith("/member/") ||
         pathname === "/ur/account/" || pathname.startsWith("/ur/account/") ||
         pathname === "/ur/member/" || pathname.startsWith("/ur/member/");
}

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || isPrivatePath(url.pathname)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match("/")))
  );
});
