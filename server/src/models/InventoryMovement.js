import mongoose from 'mongoose';
import { MOVIMIENTO_TIPOS, MOVIMIENTO_DIRECCIONES } from '../constants/enums.js';

const inventoryMovementSchema = new mongoose.Schema(
  {
    tipo: { type: String, enum: MOVIMIENTO_TIPOS, required: true },
    // Exactamente uno de los dos debe estar presente
    insumo: { type: mongoose.Schema.Types.ObjectId, ref: 'Insumo', default: null },
    variante: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
    cantidad: { type: Number, required: true, min: 0.0001 },
    direccion: { type: String, enum: MOVIMIENTO_DIRECCIONES, required: true },
    fecha: { type: Date, required: true, default: Date.now },
    referenciaVenta: { type: mongoose.Schema.Types.ObjectId, ref: 'Venta', default: null },
    referenciaCompra: { type: mongoose.Schema.Types.ObjectId, ref: 'CompraInsumo', default: null },
    motivo: { type: String, trim: true, default: '' },
    observacion: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('InventoryMovement', inventoryMovementSchema);
