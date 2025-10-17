import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { Preferences } from '@capacitor/preferences';

PouchDB.plugin(PouchDBFind);

const BASE_URL = "https://couchdb-production-7848.up.railway.app/"; 
const DB_NAME  = 'db_sergio';
const REMOTE_DB = `${BASE_URL}/${DB_NAME}`;

async function getCreds() {

    
await Preferences.set({ key: 'couch_user', value: 'fdfdasfds' });
await Preferences.set({ key: 'couch_pass', value: 'fdafa' });

const { value: username } = await Preferences.get({ key: 'couch_user' });
const { value: password } = await Preferences.get({ key: 'couch_pass' });


return { username, password };
}


export async function syncDB() {
  const local = new PouchDB(DB_NAME); 
  const { username, password } = await getCreds();

  const remote = new PouchDB(REMOTE_DB, {
    skip_setup: true,
    fetch: (url, opts = {}) => {
      const headers = new Headers(opts.headers || {});
      const token = btoa(`${username}:${password}`);
      headers.set('Authorization', `Basic ${token}`);
      return PouchDB.fetch(url, { ...opts, headers });
    },
  });

  const syncHandler = local
    .sync(remote, {
      live: true,
      retry: true,
    })
    .on('change', (info) => {
      console.log('🔄 Cambios sincronizados:', info);
    })
    .on('paused', (err) => {
      if (err) console.warn('⏸️ Sincronización pausada:', err);
      else console.log('⏸️ En pausa (sin cambios nuevos)');
    })
    .on('active', () => {
      console.log('▶️ Sincronización activa');
    })
    .on('denied', (err) => {
      console.error('🚫 Documento rechazado:', err);
    })
    .on('complete', (info) => {
      console.log('✅ Sincronización completa:', info);
    })
    .on('error', (err) => {
      console.error('❌ Error de sincronización:', err);
    });

  return syncHandler;
}

