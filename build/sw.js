/**
 * Service Worker der installierten App – liegt als sw.js neben index.html (build/pwa.ts) und wird nur auf einer
 * echten Web-Adresse angemeldet (src/state/app-install.svelte.ts).
 *
 * Die ganze App ist eine einzige Seite. Mit Netz kommt immer die neueste Fassung, die gleich für später gemerkt
 * wird; ohne Netz – oder wenn das Netz länger als ein paar Sekunden braucht – startet die gemerkte. So spielt
 * niemand tagelang mit einer alten Fassung, und gegen den Computer geht es auch im Funkloch.
 */

const CACHE = 'illuminati13';
/** Die Seite selbst: der Ordner, in dem sw.js liegt (z. B. https://cyanlist.github.io/node-illuminati13/) */
const PAGE = self.registration.scope;
/** So lange darf das Netz brauchen, bevor die gemerkte Fassung startet (ms) */
const PATIENCE = 4000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(new Request(PAGE, { cache: 'no-cache' })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // nur das Öffnen der Seite – alles andere steckt ohnehin in ihr
  if (event.request.mode !== 'navigate') return;
  const fresh = refresh();
  // auch wenn die gemerkte Fassung schneller war: die neue noch zu Ende laden und merken
  event.waitUntil(fresh);
  event.respondWith(answer(fresh));
});

/** Holt die neueste Fassung und merkt sie sich; null, wenn das nicht klappt. */
async function refresh() {
  try {
    const response = await fetch(PAGE, { cache: 'no-cache' });
    if (!response.ok) return null;
    const cache = await caches.open(CACHE);
    await cache.put(PAGE, response.clone());
    return response;
  } catch {
    return null;
  }
}

/** Die neue Fassung, wenn sie rechtzeitig kommt – sonst die gemerkte. */
async function answer(fresh) {
  const saved = await caches.match(PAGE);
  if (!saved) return (await fresh) ?? Response.error();
  const tooLate = new Promise((resolve) => setTimeout(() => resolve(null), PATIENCE));
  return (await Promise.race([fresh, tooLate])) ?? saved;
}
