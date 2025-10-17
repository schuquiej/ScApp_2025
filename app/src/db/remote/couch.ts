import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

const REMOTE_URL = 'https://admin:TuPassFuerte123@sergio.up.railway.app/scappdb';

export const localDB = new PouchDB('scapp-local');
export const remoteDB = new PouchDB(REMOTE_URL, { skip_setup: false });

export async function ensureIndexes() {
  await localDB.createIndex({ index: { fields: ['type'] } });
  await localDB.createIndex({ index: { fields: ['id_solicitud'] } }); 
}
