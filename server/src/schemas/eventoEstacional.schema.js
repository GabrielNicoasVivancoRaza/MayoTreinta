import { z } from 'zod';

export const eventoEstacionalCreateSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
  fechaInicio: z.coerce.date(),
  fechaFin: z.coerce.date(),
  multiplicador: z.number().positive('El multiplicador debe ser mayor a 0'),
});

export const eventoEstacionalUpdateSchema = eventoEstacionalCreateSchema.partial();
