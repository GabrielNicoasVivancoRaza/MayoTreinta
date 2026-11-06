import { z } from 'zod';

export const gastoCreateSchema = z.object({
  fecha: z.coerce.date().optional(),
  categoria: z.string().min(1, 'La categoria es requerida'),
  monto: z.number().int().min(0),
  descripcion: z.string().trim().min(1, 'La descripcion es requerida'),
  observaciones: z.string().trim().optional(),
  esFijo: z.boolean().optional(),
});

export const gastoUpdateSchema = gastoCreateSchema.partial();
