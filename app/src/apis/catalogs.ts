import { request } from './http';

export interface Cliente { id: number; nombre: string; }
export interface Profesional { id: number; nombre: string; }
export interface Servicio { id: number; nombre: string; }

export const listarClientes = () => request<Cliente[]>('/clientes');
export const listarProfesionales = () => request<Profesional[]>('/profesionales');
export const listarServicios = () => request<Servicio[]>('/servicios');
