/* Argonvia Campo — funciona sem rede: guarda a app no telemóvel na primeira abertura.
   Ao publicar uma versão nova, mude VERSAO para os telemóveis a irem buscar. */
var VERSAO = "campo-2";
var FICHEIROS = ["./", "index.html", "manifest.webmanifest", "icone-192.png", "icone-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSAO).then(function (c) { return c.addAll(FICHEIROS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSAO; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* abre logo a cópia guardada (em obra a rede é fraca) e, se houver rede, atualiza-a para a próxima vez */
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(VERSAO).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (guardado) {
      var rede = fetch(e.request).then(function (r) { if (r && r.ok) c.put(e.request, r.clone()); return r; })
        .catch(function () { return guardado || c.match("index.html"); });
      return guardado || rede;
    });
  }));
});
