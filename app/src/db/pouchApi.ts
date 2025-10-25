import PouchDB from 'pouchdb-browser';


type Selectors = Record<string, any>;

function matchesSelector(doc: any, sel: Selectors = {}) {
  for (const k of Object.keys(sel)) {
    const cond = sel[k];
    if (cond && typeof cond === 'object' && '$in' in cond) {
      if (!Array.isArray(cond.$in) || !cond.$in.includes(doc[k])) return false;
    } else {
      if (doc[k] !== cond) return false; 
    }
  }
  return true;
}

export async function listarCitas(dbName: string, selectors: Selectors = {}) {
  const db = new PouchDB(dbName);
  const res = await db.allDocs({ include_docs: true });
  console.log(res);
  console.log(selectors);
  const docs = res.rows.map(r => r.doc).filter(d => d && !String(d._id||'').startsWith('_design/'));
  return Object.keys(selectors).length ? docs.filter(d => matchesSelector(d, selectors)) : docs;
}

