// src/apis/couchCatalogAPI.ts
import { PouchDB } from "../db/pouch"; // ✅ Usa la clase base ya configurada
import { Preferences } from "@capacitor/preferences";

const BASE_URL = "https://couchdb-production-7848.up.railway.app"; // sin / al final

// Tipos de docs del catálogo
type ListDbDoc = {
  _id: string;         // nombre lógico local, ej. "profesiones"
  data_source: string; // nombre de la DB remota en Couch
  status?: boolean;    // si descargar o no
};

/* ======================================================
   AUTH HELPERS
   ====================================================== */

async function getAuthHeader() {


const COUCH_USER = "admin";
const COUCH_PASS = "TuPassFuerte123";

const user =COUCH_USER ;
  const pass = COUCH_PASS;


  if (!user || !pass) throw new Error("Faltan credenciales Couch");

  const toB64 = (s: string) => btoa(unescape(encodeURIComponent(s)));
  return "Basic " + toB64(`${user}:${pass}`);
}

/* ======================================================
   COUCH REMOTE DB (con auth injectada)
   ====================================================== */

function remoteDB(dbName: string, authHeader: string) {
  return new PouchDB(`${BASE_URL}/${dbName}`, {
    skip_setup: true,
    fetch: (url, opts: any = {}) => {
      const headers = new Headers(opts.headers || {});
      headers.set("Authorization", authHeader);
      return PouchDB.fetch(url, { ...opts, headers });
    },
  });
}

/* ======================================================
   HELPERS VARIOS
   ====================================================== */


/* ======================================================
   SYNC PRINCIPAL DE CATÁLOGOS
   ====================================================== */

/**
 * Lee la base remota list_catalogs y, por cada doc con status:true:
 *  - crea/usa DB local con el nombre _id en MAYÚSCULAS (p.ej. "PROFESIONES")
 *  - sincroniza con la DB remota data_source (p.ej. "profesiones")
 *  - descarga SOLO docs con {status:true}
 */
export async function syncEnabledDataSources({ live = false }: { live?: boolean } = {}) {
  const auth = await getAuthHeader();

  const list = remoteDB("list_catalogs", auth);
  const res = await list.find({ selector: { status: true } });
  const items = res.docs as unknown as ListDbDoc[];

  if (!items.length) {
    console.warn("⚠️ No hay items activos en list_catalogs.");
    return;
  }

  for (const it of items) {
    if (!it._id || !it.data_source) {
      console.warn("Doc inválido en list_catalogs:", it);
      continue;
    }

    const localName =it._id; 
    const remoteName = it.data_source;          

    const local = new PouchDB(localName);
    const remote = remoteDB(remoteName, auth);

    try {
      await local.createIndex({ index: { fields: ["status"] } });
    } catch {}

    console.log(`🔄 Sync "${remoteName}" (remoto) → "${localName}" (local) solo status:true`);

    local
      .sync(remote, {
        live,
        retry: live,
        selector: { status: true }, 
      })
      .on("change", info => console.log(`✔️ ${localName}: cambios`, info))
      .on("paused", err => err ? console.warn(`⏸️ ${localName}: pausa`, err) : null)
      .on("active", () => console.log(`▶️ ${localName}: activo`))
      .on("error", err => console.error(`❌ ${localName}: error`, err));
  }
}
