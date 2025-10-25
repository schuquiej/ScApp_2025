// src/hooks/useDocs.ts
import { useEffect, useState } from 'react';
import { localDB } from '../../db/pouch';

export function useDocs(selector: any, deps: any[] = []) {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        await localDB.createIndex({ index: { fields: ['type', 'updatedAt'] } });

        const sel = {
          ...selector,
          updatedAt: { $gte: null },
        };

        const res = await localDB.find({
          selector: sel,
          sort: [{ type: 'asc' }, { updatedAt: 'desc' }],
          limit: 100,
        });

        if (!cancelled) setRows(res.docs);
      } catch (err) {
        console.error('Error en useDocs:', err);
      }
    }

    fetchData();

    const ch = localDB
      .changes({ live: true, since: 'now', include_docs: true })
      .on('change', fetchData);

    return () => {
      cancelled = true;
      ch.cancel();
    };
  }, deps);

  return rows;
}
