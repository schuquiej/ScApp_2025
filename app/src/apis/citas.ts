import { request } from './http';

/** Tipos */
export type EstadoCita = 'PROGRAMADA' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA' | 'NO_ASISTIO';

export interface CitaResponse {
  id: number;
  clienteId: number;
  clienteNombre: string;
  profesionalId: number;
  profesionalNombre: string;
  servicioId: number;
  servicioNombre: string;
  fechaHora: string;   
  estado: EstadoCita;
  notas?: string;
}

export interface CitaDTO {
  clienteId: number;
  profesionalId: number;
  servicioId: number;
  fechaHora: string;   
  estado?: EstadoCita;
  notas?: string;
}

/** Endpoints Citas */
export const listarCitas   = () => request<CitaResponse[]>('/citas');
export const obtenerCita   = (id: number) => request<CitaResponse>(`/citas/${id}`);
export const crearCita     = (dto: CitaDTO) => request<CitaResponse>('/citas', { method: 'POST', json: dto });
export const actualizarCita= (id: number, dto: Partial<CitaDTO>) =>
  request<CitaResponse>(`/citas/${id}`, { method: 'PUT', json: dto });
export const borrarCita    = (id: number) => request<void>(`/citas/${id}`, { method: 'DELETE' });
