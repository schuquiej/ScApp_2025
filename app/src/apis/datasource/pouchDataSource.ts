    import { v4 as uuid } from 'uuid';
import { localDB } from '../../../src/db/db';
import { Ingreso, IngresoSchema } from '../../../src/models/Ingreso';

const TYPE = 'ingreso';

export const IngresoRepository = {
  async create(data: Omit<Ingreso, '_id'|'type'|'createdAt'|'updatedAt'>) {
    const payload: Ingreso = IngresoSchema.parse({
      ...data,
      type: TYPE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const _id = `ingreso:${uuid()}`;
    await localDB.put({ _id, ...payload });
    return this.findById(_id);
  },

  async findById(id: string) {
    const doc = await localDB.get(id);
    return doc as Ingreso & { _id: string; _rev: string };
  },

  async list() {

    await localDB.createIndex({ index: { fields: ['type', 'fecha'] } });
    const res = await localDB.find({
      selector: { type: TYPE },
      sort: ['type'],
      limit: 500,
    });
    return res.docs as (Ingreso & { _id: string; _rev: string })[];
  },

  async update(id: string, patch: Partial<Ingreso>) {
    const current = await localDB.get(id);
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    const parsed = IngresoSchema.parse(next); 
    await localDB.put(parsed);
    return this.findById(id);
  },

  async remove(id: string) {
    const doc = await localDB.get(id);
    await localDB.remove(doc);
    return true;
  },
};
