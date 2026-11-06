import { z } from 'zod';

export const variantCreateSchema = z.object({
  nombreVariante: z.string().trim().min(1, 'El nombre de la variante es requerido'),
  stock: z.number().min(0).optional(),
});

export const variantUpdateSchema = variantCreateSchema.partial();
