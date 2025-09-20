import { z } from 'zod';

export const IngresoSchema = z.object({
  _id: z.string().optional(),       
  type: z.literal('ingreso'),
  fecha: z.string(),                
  categoria: z.string(),
  descripcion: z.string().optional(),
  monto: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Ingreso = z.infer<typeof IngresoSchema>;
