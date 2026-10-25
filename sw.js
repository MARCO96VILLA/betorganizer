// Service worker della versione locale (PWA): tiene in cache tutta l'app, così funziona anche senza connessione.
// Il file reale (sw.js) lo scrive la build, che sostituisce le due costanti qui sotto con la versione e l'elenco dei file.
//
// Aggiornamenti: una versione nuova si scarica in silenzio e resta IN ATTESA; la pagina avvisa l'utente, che la attiva
// quando vuole (messaggio "salta-attesa"). Così un aggiornamento non parte mai nel mezzo di un lavoro.

const VERSIONE = "e6b3a519996fa155-2d7d4fc8";
const CACHE = `bet-tracker-${VERSIONE}`;
const FILE = ["./","assets/BackupLocale-D0dvjVZW.js","assets/SezioneInstalla-CVDP8LOv.js","assets/bootstrapWorker-DBkmQh1I.js","assets/index-B9MzPPgK.js","assets/index-BT_zdHtZ.css","assets/leggiScreenshot-CRmk7S6i.js","assets/locale-Bjjf8frR.js","assets/motore.worker-BI6hevSD.js","assets/simulazioneWorker-BDHmWNHB.js","fonts/LICENZA-bandiere.md","fonts/TwemojiCountryFlags.woff2","icone/apple-touch-icon.png","icone/favicon.png","icone/icona-192.png","icone/icona-512-maskable.png","icone/icona-512.png","index.html","manifest.webmanifest","py/codice.zip","py/precompilato.zip","vendor/manifest-locale.json","vendor/pyodide/annotated_doc-0.0.4-py3-none-any.whl","vendor/pyodide/annotated_types-0.7.0-py3-none-any.whl","vendor/pyodide/anyio-4.13.0-py3-none-any.whl","vendor/pyodide/argon2_cffi-23.1.0-py3-none-any.whl","vendor/pyodide/argon2_cffi_bindings-25.1.0-cp314-abi3-pyemscripten_2026_0_wasm32.whl","vendor/pyodide/cffi-2.0.0-cp314-cp314-pyemscripten_2026_0_wasm32.whl","vendor/pyodide/dnspython-2.8.0-py3-none-any.whl","vendor/pyodide/fastapi-0.136.1-py3-none-any.whl","vendor/pyodide/httpx-0.28.1-py3-none-any.whl","vendor/pyodide/idna-3.11-py3-none-any.whl","vendor/pyodide/jinja2-3.1.6-py3-none-any.whl","vendor/pyodide/markupsafe-3.0.3-cp314-cp314-pyemscripten_2026_0_wasm32.whl","vendor/pyodide/micropip-0.11.1-py3-none-any.whl","vendor/pyodide/pillow-12.2.0-cp314-cp314-pyemscripten_2026_0_wasm32.whl","vendor/pyodide/pycparser-3.0-py3-none-any.whl","vendor/pyodide/pydantic-2.12.5-py3-none-any.whl","vendor/pyodide/pydantic_core-2.41.5-cp314-cp314-pyemscripten_2026_0_wasm32.whl","vendor/pyodide/pyodide-lock.json","vendor/pyodide/pyodide.asm.mjs","vendor/pyodide/pyodide.asm.wasm","vendor/pyodide/pyodide.mjs","vendor/pyodide/python_stdlib.zip","vendor/pyodide/sniffio-1.3.1-py3-none-any.whl","vendor/pyodide/sqlalchemy-2.0.48-cp314-cp314-pyemscripten_2026_0_wasm32.whl","vendor/pyodide/starlette-1.0.0-py3-none-any.whl","vendor/pyodide/typing_extensions-4.15.0-py3-none-any.whl","vendor/pyodide/typing_inspection-0.4.2-py3-none-any.whl","vendor/pyodide/tzdata-2025.3-py2.py3-none-any.whl","vendor/tesseract/LICENSE-tessdata_fast.txt","vendor/tesseract/LICENSE-tesseract.js-core.txt","vendor/tesseract/LICENSE-tesseract.js.txt","vendor/tesseract/ita.traineddata","vendor/tesseract/tesseract-core-simd-lstm.wasm.js","vendor/tesseract/tesseract.esm.min.js","vendor/tesseract/worker.min.js","vendor/wheels/alembic-1.20.0-py3-none-any.whl","vendor/wheels/email_validator-2.3.0-py3-none-any.whl","vendor/wheels/et_xmlfile-2.0.0-py3-none-any.whl","vendor/wheels/mako-1.4.3-py3-none-any.whl","vendor/wheels/openpyxl-3.1.5-py2.py3-none-any.whl","vendor/wheels/pydantic_settings-2.16.0-py3-none-any.whl","vendor/wheels/pyjwt-2.15.1-py3-none-any.whl","vendor/wheels/python_dotenv-1.2.4-py3-none-any.whl","vendor/wheels/python_multipart-0.0.32-py3-none-any.whl","vendor/wheels/sqlmodel-0.0.44-py3-none-any.whl"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(FILE.map((percorso) => new Request(percorso, { cache: "reload" })));
    })()
  );
});

self.addEventListener("message", (evento) => {
  if (evento.data === "salta-attesa") self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    (async () => {
      for (const nome of await caches.keys()) {
        if (nome.startsWith("bet-tracker-") && nome !== CACHE) await caches.delete(nome);
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (evento) => {
  const richiesta = evento.request;
  if (richiesta.method !== "GET" || new URL(richiesta.url).origin !== self.location.origin) return;
  evento.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      // ogni apertura dell'app (anche con un indirizzo diverso) riceve la pagina principale
      if (richiesta.mode === "navigate") return (await cache.match("index.html")) ?? fetch(richiesta);
      // ignoreVary: i moduli JavaScript arrivano con un'intestazione Origin che il server può dichiarare in `Vary`,
      // e senza questa opzione la copia in cache non verrebbe riconosciuta
      return (await cache.match(richiesta, { ignoreSearch: true, ignoreVary: true })) ?? fetch(richiesta);
    })()
  );
});
