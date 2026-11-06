import { z } from 'zod';

export const activoSchema = z.object({
  activo: z.boolean(),
});
