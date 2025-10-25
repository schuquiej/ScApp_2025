import { PouchDB } from "../db/pouch"; 

const DEFAULT_DATE_KEYS = [
  "fechaHora",
  "fecha",
  "clienteNac",
  "nacimiento",
  "createdAt",
  "updatedAt",
];


function normalizeDates(doc: any, keys: string[] = DEFAULT_DATE_KEYS) {
  const out = { ...doc };
  let firstIso: string | null = null;
  for (const k of keys) {
    if (out[k] != null) {
      const iso = new Date(out[k]).toISOString();
      out[k] = iso;
      if (!firstIso) firstIso = iso;
    }
  }
  return { normalized: out, firstIso: firstIso ?? new Date().toISOString() };
}

const uuid = () =>
  typeof crypto !== "undefined" && (crypto as any).randomUUID
    ? (crypto as any).randomUUID()
    : Math.random().toString(36).slice(2);

export async function createDocGeneric(
  doc: any,
  dbTarget: string | PouchDB.Database,
  opts?: {
    idPrefix?: string;
    dateKeys?: string[];
    idBuilder?: (d: any) => string;
    forceType?: string;
  }
) {
  const db =
    typeof dbTarget === "string" ? new PouchDB(dbTarget) : (dbTarget as PouchDB.Database);

  const withType = opts?.forceType && !doc?.type ? { ...doc, type: opts.forceType } : { ...doc };

  const { normalized, firstIso } = normalizeDates(withType, opts?.dateKeys);

  let _id = normalized._id;
  if (!_id) {
    _id = opts?.idBuilder
      ? opts.idBuilder(normalized)
      : `${(normalized.type as string) ?? opts?.idPrefix ?? "doc"}:${firstIso}:${uuid()}`;
  }

  const finalDoc = { ...normalized, _id };
  const res = await db.put(finalDoc);
  return { ...finalDoc, _rev: res.rev };
}



export async function removeDocGeneric(
  id: string,
  dbTarget: string | PouchDB.Database
): Promise<boolean> {
  const db = typeof dbTarget === 'string' ? new PouchDB(dbTarget) : dbTarget;
  try {
    const doc = await db.get(id);
    await db.remove(doc); // usa _id y _rev del get
    return true;
  } catch (err: any) {
    console.error('[removeDocGeneric] error:', err);
    if (err?.status === 404) return true; // ya estaba borrado
    if (err?.status === 409) {
      const latest = await db.get(id);
      await db.remove(latest);
      return true;
    }
    throw err;
  }
}

export async function removeByIdRev(
  id: string,
  rev: string,
  dbTarget: string | PouchDB.Database
): Promise<boolean> {
  const db = typeof dbTarget === 'string' ? new PouchDB(dbTarget) : dbTarget;
  try {
    await db.remove(id, rev);
    return true;
  } catch (err: any) {
    console.error('[removeByIdRev] error:', err);
    throw err;
  }
}

export async function softDeleteDocGeneric(
  id: string,
  dbTarget: string | PouchDB.Database,
  flagField = 'deleted'
): Promise<boolean> {
  const db = typeof dbTarget === 'string' ? new PouchDB(dbTarget) : dbTarget;
  const cur = await db.get(id);
  const next = { ...cur, [flagField]: true, updatedAt: new Date().toISOString() };
  await db.put(next);
  return true;
}


export async function removeManyDocsGeneric(
  ids: string[],
  dbTarget: string | PouchDB.Database
): Promise<{ ok: string[]; failed: string[] }> {
  const db = typeof dbTarget === 'string' ? new PouchDB(dbTarget) : dbTarget;
  const ok: string[] = [];
  const failed: string[] = [];

  await Promise.all(
    ids.map(async (id) => {
      try {
        const d = await db.get(id);
        await db.remove(d);
        ok.push(id);
      } catch (e: any) {
        if (e?.status === 404) { ok.push(id); return; }
        if (e?.status === 409) {
          try {
            const latest = await db.get(id);
            await db.remove(latest);
            ok.push(id);
            return;
          } catch {}
        }
        failed.push(id);
      }
    })
  );

  return { ok, failed };
}


export async function updateFieldById<
  TDoc extends { _id: string; _rev?: string } = any,
  K extends string = string
>(
  id: string,
  field: K,
  value: any,
  dbTarget: string | PouchDB.Database,
  opts?: { dateKeys?: string[]; maxRetries?: number; skipDateNormalize?: boolean }
): Promise<TDoc> {
  const db = typeof dbTarget === "string" ? new PouchDB(dbTarget) : dbTarget;
  const maxRetries = opts?.maxRetries ?? 3;

  let attempt = 0;
  while (true) {
    attempt++;
    try {
      const cur = (await db.get(id)) as TDoc;
      const next: any = { ...cur, [field]: value, updatedAt: new Date().toISOString() };
      const finalDoc = opts?.skipDateNormalize
        ? next
        : normalizeDates(next, opts?.dateKeys).normalized;

      const res = await db.put(finalDoc);
      return { ...finalDoc, _rev: res.rev } as TDoc;
    } catch (err: any) {
      if (err?.status === 409 && attempt <= maxRetries) continue; // conflicto -> reintenta
      if (err?.status === 404) throw new Error(`[updateFieldById] no existe el doc ${id}`);
      throw err;
    }
  }
}
