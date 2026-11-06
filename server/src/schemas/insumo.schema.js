import { z } from 'zod';
import { INSUMO_CATEGORIAS } from '../constants/enums.js';

export const insumoCreateSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
  categoria: z.enum(INSUMO_CATEGORIAS, { message: 'Categoria invalida' }),
  talla: z.string().trim().min(1).optional().nullable(),
  color: z.string().trim().min(1).optional().nullable(),
  tipo: z.string().trim().min(1).optional().nullable(),
  unidad: z.string().trim().min(1, 'La unidad es requerida'),
  stockActual: z.number().min(0).optional(),
  stockMinimo: z.number().min(0).optional(),
  costoPromedioUnitario: z.number().int().min(0).optional(),
});

export const insumoUpdateSchema = insumoCreateSchema.partial();
