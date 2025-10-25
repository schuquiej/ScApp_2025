
export type EstadoCita = 'PROGRAMADA' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA' | 'NO_ASISTIO' |  'FACTURADO';

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
