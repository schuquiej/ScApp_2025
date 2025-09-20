import { IngresoRepository } from "./datasource/pouchDataSource";

export type Ingreso = {
  _id?: string; _rev?: string;
  type: 'ingreso';
  fecha: string; categoria: string; descripcion?: string; monto: number;
  createdAt?: string; updatedAt?: string;
};

export async function crearIngreso(i: Omit<Ingreso,'_id'|'_rev'|'type'|'createdAt'|'updatedAt'>) {
  return IngresoRepository.create(i);
}
export async function listarIngresos() { return IngresoRepository.list(); }
export async function borrarIngreso(id: string) { return IngresoRepository.remove(id); }
