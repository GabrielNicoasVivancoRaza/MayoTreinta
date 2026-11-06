import { z } from 'zod';

export const disenoCreateSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
  descripcion: z.string().trim().optional(),
  enlaceInstagram: z.string().trim().min(1).optional().nullable(),
  etiquetas: z.array(z.string().trim().min(1)).optional(),
});

export const disenoUpdateSchema = disenoCreateSchema.partial();
