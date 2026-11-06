import { z } from 'zod';

export const productoCreateSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
  categoria: z.string().trim().min(1).optional(),
  descripcion: z.string().trim().optional(),
  precioSugerido: z.number().int().min(0),
  costoUnitario: z.number().int().min(0).optional(),
  requiereTalla: z.boolean().optional(),
  unidad: z.string().trim().min(1).optional(),
});

export const productoUpdateSchema = productoCreateSchema.partial();
