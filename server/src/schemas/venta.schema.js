import { z } from 'zod';
import { VENTA_CANALES, METODOS_PAGO, VENTA_ESTADOS_PEDIDO, MOVILIDAD_ASUMIDO_POR } from '../constants/enums.js';

const itemVentaSchema = z.object({
  producto: z.string().min(1, 'El producto es requerido'),
  variante: z.string().min(1).optional().nullable(),
  disenos: z.array(z.string().min(1)).optional(),
  cantidad: z.number().int().positive(),
  precioUnitarioVenta: z.number().int().min(0),
  costoExtraManual: z.number().int().min(0).optional(),
});

const movilidadSchema = z.object({
  monto: z.number().int().min(0).optional(),
  asumidoPor: z.enum(MOVILIDAD_ASUMIDO_POR).optional(),
});

export const ventaCreateSchema = z.object({
  fechaHora: z.coerce.date().optional(),
  cliente: z
    .object({
      nombre: z.string().trim().optional(),
      telefono: z.string().trim().optional(),
    })
    .optional(),
  canal: z.enum(VENTA_CANALES),
  items: z.array(itemVentaSchema).min(1, 'La venta debe tener al menos un item'),
  movilidad: movilidadSchema.optional(),
  observaciones: z.string().trim().optional(),
});

export const ventaUpdateSchema = z.object({
  cliente: z
    .object({
      nombre: z.string().trim().optional(),
      telefono: z.string().trim().optional(),
    })
    .optional(),
  canal: z.enum(VENTA_CANALES).optional(),
  estadoPedido: z.enum(VENTA_ESTADOS_PEDIDO.filter((e) => e !== 'cancelado')).optional(),
  observaciones: z.string().trim().optional(),
});

export const pagoCreateSchema = z.object({
  fecha: z.coerce.date().optional(),
  monto: z.number().int().positive('El monto debe ser mayor a 0'),
  metodoPago: z.enum(METODOS_PAGO),
});
