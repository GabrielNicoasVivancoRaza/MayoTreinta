import { z } from 'zod';
import { MOVIMIENTO_DIRECCIONES } from '../constants/enums.js';

// Solo para los dos tipos que se registran manualmente: ajuste y dano.
// entrada_compra / salida_venta / devolucion los genera el sistema (Compra/Venta/Cancelacion).
export const movimientoManualCreateSchema = z
  .object({
    tipo: z.enum(['ajuste', 'dano']),
    insumo: z.string().min(1).optional().nullable(),
    variante: z.string().min(1).optional().nullable(),
    cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
    direccion: z.enum(MOVIMIENTO_DIRECCIONES),
    fecha: z.coerce.date().optional(),
    motivo: z.string().trim().optional(),
    observacion: z.string().trim().optional(),
  })
  .refine((data) => Boolean(data.insumo) !== Boolean(data.variante), {
    message: 'Debes indicar exactamente uno: insumo o variante',
    path: ['insumo'],
  });
