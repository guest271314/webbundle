self.addEventListener("install", (event) => {
  console.log(event.type);
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", async (event) => {
  console.log(event.type);
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", async (event) => {
  console.log(event.request.url);
  if (event.request.destination === "script") {
    event.respondWith((async () => {
      const r = await fetch(event.request.url, { cache: "no-store" });
      const text = await r.text();
      return new Response(new Blob([text], { type: "text/javascript" }));
    })());
  }
});
