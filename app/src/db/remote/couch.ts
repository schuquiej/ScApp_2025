
import { PouchDB } from "../pouch";

const baseUrl = "https://couchdb-production-7848.up.railway.app";
const username = "admin";
const password = "TuPassFuerte123";

// ---------- helpers ----------
function authHeader() {
  return "Basic " + btoa(`${username}:${password}`);
}

export async function checkAndCreateRemoteDB(dbname: string): Promise<boolean> {
  const remoteDbUrl = `${baseUrl.replace(/\/+$/, "")}/${encodeURIComponent(dbname)}`;
  try {
    const head = await fetch(remoteDbUrl, { method: "HEAD", headers: { Authorization: authHeader() } });
    if (head.status === 200) {
      console.log(`La base remota "${dbname}" ya existe.`);
      return true;
    }
    if (head.status !== 404) {
      console.warn(` HEAD ${remoteDbUrl} => ${head.status}`);
      return false;
    }
    console.log(`ℹBase remota "${dbname}" no encontrada. Creando...`);
    const put = await fetch(remoteDbUrl, { method: "PUT", headers: { Authorization: authHeader() } });
    if (put.ok || put.status === 201 || put.status === 202 || put.status === 412) {
      console.log(`Base remota "${dbname}" creada/asegurada.`);
      return true;
    }
    console.error(` Error al crear la base remota "${dbname}": ${put.status}`);
    return false;
  } catch (err) {
    console.error(" Error al comprobar/crear DB remota:", err);
    return false;
  }
}

async function ensureRemoteIndex(dbname: string, fields: string[]) {
  const url = `${baseUrl.replace(/\/+$/, "")}/${encodeURIComponent(dbname)}/_index`;
  if (!fields.length) return;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader() },
      body: JSON.stringify({
        index: { fields },
        name: `idx_${fields.join("_")}`,
        type: "json",
      }),
    });
    if (!res.ok) console.warn(`[ensureRemoteIndex] POST ${url} -> ${res.status}`);
  } catch (e) {
    console.warn("[ensureRemoteIndex] error:", e);
  }
}

// ---------- sync principal (pull filtrado + push sin filtro) ----------
/**
 * Arranca sync vivo para una base:
 *  - PULL: filtra con _selector (solo baja lo que pedís)
 *  - PUSH: sin filtro (sube todo, incluidos _deleted)
 *
 * @returns { cancel } para detener ambos flujos
 */
export async function syncSolicitudesFromRemote(
  dbName: string,
  selectores: Record<string, any> = {}
) {
  const dbname = dbName.trim();
  console.log("[sync] db:", dbname, "selector:", selectores);

  // asegurar remoto
  const ok = await checkAndCreateRemoteDB(dbname);
  if (!ok) return { cancel: () => {}, local: null, remote: null };

  const localpouch = new PouchDB(dbname);
  const remoteDbUrl = `${baseUrl.replace(/\/+$/, "")}/${encodeURIComponent(dbname)}`;
  const couchdb = new PouchDB(remoteDbUrl, {
    skip_setup: true,
    auth: { username, password },
  });

  // selector efectivo: si viene vacío, usa "match all" estable
  const selector =
    selectores && Object.keys(selectores).length ? selectores : { _id: { $gt: null } };

  // crear índice remoto para los campos del selector (si no es el "match all")
  const indexFields = Object.keys(selectores || {});
  if (indexFields.length > 0) {
    await ensureRemoteIndex(dbname, indexFields);
  }

  const pull = localpouch.replicate.from(couchdb, {
    live: true,
    retry: true,
    filter: "_selector",
    selector,
  })
  .on("change", (info: any) => console.log(`[pull ${dbname}] change`, info))
  .on("paused", (err: any) => (err ? console.warn(`[pull ${dbname}] paused`, err) : null))
  .on("active", () => console.log(`[pull ${dbname}] active`))
  .on("error", (err: any) => console.error(`[pull ${dbname}] error`, err));

  const push = localpouch.replicate.to(couchdb, {
    live: true,
    retry: true,
  })
  .on("change", (info: any) => console.log(`[push ${dbname}] change`, info))
  .on("paused", (err: any) => (err ? console.warn(`[push ${dbname}] paused`, err) : null))
  .on("active", () => console.log(`[push ${dbname}] active`))
  .on("error", (err: any) => console.error(`[push ${dbname}] error`, err));

  return {
    cancel: () => { try { pull.cancel(); } catch {} try { push.cancel(); } catch {} },
    local: localpouch,
    remote: couchdb,
  };
}
