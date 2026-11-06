import mongoose from 'mongoose';
import {
  VENTA_CANALES,
  METODOS_PAGO,
  VENTA_ESTADOS_PEDIDO,
  VENTA_ESTADOS_PAGO,
  MOVILIDAD_ASUMIDO_POR,
} from '../constants/enums.js';

const itemVentaSchema = new mongoose.Schema(
  {
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    variante: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
    disenos: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Diseno' }], default: [] },
    cantidad: { type: Number, required: true, min: 1 },
    precioUnitarioVenta: { type: Number, required: true, min: 0 }, // centavos, precio real negociado
    // Snapshot del Producto.costoUnitario al momento de la venta (no se recalcula despues)
    costoUnitarioSnapshot: { type: Number, required: true, min: 0, default: 0 },
    costoExtraManual: { type: Number, required: true, min: 0, default: 0 }, // DTF/restauracion, etc.
  },
  { _id: false }
);

const pagoSchema = new mongoose.Schema(
  {
    fecha: { type: Date, required: true, default: Date.now },
    monto: { type: Number, required: true, min: 1 }, // centavos
    metodoPago: { type: String, enum: METODOS_PAGO, required: true },
  },
  { _id: false }
);

const ventaSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, unique: true, trim: true },
    fechaHora: { type: Date, required: true, default: Date.now },
    cliente: {
      nombre: { type: String, trim: true, default: '' },
      telefono: { type: String, trim: true, default: '' },
    },
    canal: { type: String, enum: VENTA_CANALES, required: true },
    items: { type: [itemVentaSchema], required: true, validate: (v) => v.length > 0 },

    movilidad: {
      monto: { type: Number, default: 0, min: 0 }, // centavos
      asumidoPor: { type: String, enum: MOVILIDAD_ASUMIDO_POR, default: 'ninguno' },
    },

    pagos: { type: [pagoSchema], default: [] },
    estadoPago: { type: String, enum: VENTA_ESTADOS_PAGO, default: 'pendiente' },
    estadoPedido: { type: String, enum: VENTA_ESTADOS_PEDIDO, default: 'pendiente' },

    // Totales calculados al crear la venta (centavos); nunca se recalculan con datos actuales
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    costoTotal: { type: Number, required: true, min: 0 },
    utilidadEstimada: { type: Number, required: true },

    observaciones: { type: String, trim: true, default: '' },
    canceladaEn: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Venta', ventaSchema);
