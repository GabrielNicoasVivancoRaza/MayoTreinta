import { z } from 'zod';

export const simuladorSchema = z.object({
  ajustePrecioPorcentaje: z.number().optional(),
  ajusteCostoPorcentaje: z.number().optional(),
  costosFijosOverride: z.number().int().min(0).optional().nullable(),
  mixOverride: z
    .array(
      z.object({
        producto: z.string().min(1),
        participacion: z.number().min(0),
      })
    )
    .optional(),
});
