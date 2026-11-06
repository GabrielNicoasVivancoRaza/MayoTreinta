import { z } from 'zod';

export const compraInsumoCreateSchema = z.object({
  fecha: z.coerce.date().optional(),
  insumo: z.string().min(1, 'El insumo es requerido'),
  cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
  costoTotal: z.number().int().min(0),
  proveedor: z.string().trim().min(1).optional().nullable(),
  nota: z.string().trim().min(1).optional().nullable(),
});
