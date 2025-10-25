import PouchDBBase from 'pouchdb-browser';
import PouchFind from 'pouchdb-find';


PouchDBBase.plugin(PouchFind);


export const PouchDB = PouchDBBase;


export const localDB = new PouchDB('db_sergio');


export function openLocalDB(name: string) {
  return name === 'db_sergio' ? localDB : new PouchDB(name);
}
