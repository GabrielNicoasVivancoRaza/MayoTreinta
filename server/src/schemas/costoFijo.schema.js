import { z } from 'zod';
import { COSTO_FIJO_FRECUENCIAS } from '../constants/enums.js';

export const costoFijoCreateSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
  monto: z.number().int().min(0),
  frecuencia: z.enum(COSTO_FIJO_FRECUENCIAS, { message: 'Frecuencia invalida' }),
  fechaInicio: z.coerce.date(),
  fechaFin: z.coerce.date().optional().nullable(),
});

export const costoFijoUpdateSchema = costoFijoCreateSchema.partial();
