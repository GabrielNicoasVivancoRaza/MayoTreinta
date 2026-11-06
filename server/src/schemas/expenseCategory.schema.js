import { z } from 'zod';

export const expenseCategoryCreateSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
});

export const expenseCategoryUpdateSchema = expenseCategoryCreateSchema.partial();
