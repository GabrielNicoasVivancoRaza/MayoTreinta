import mongoose from 'mongoose';
import { INSUMO_CATEGORIAS } from '../constants/enums.js';

const insumoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    categoria: { type: String, enum: INSUMO_CATEGORIAS, required: true },
    talla: { type: String, trim: true, default: null },
    color: { type: String, trim: true, default: null },
    tipo: { type: String, trim: true, default: null },
    unidad: { type: String, required: true, trim: true },
    stockActual: { type: Number, required: true, default: 0, min: 0 },
    stockMinimo: { type: Number, required: true, default: 0, min: 0 },
    // En centavos, igual que todos los montos del sistema
    costoPromedioUnitario: { type: Number, required: true, default: 0, min: 0 },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Insumo', insumoSchema);
