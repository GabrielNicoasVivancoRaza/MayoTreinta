import mongoose from 'mongoose';
import { COSTO_FIJO_FRECUENCIAS } from '../constants/enums.js';

const costoFijoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    monto: { type: Number, required: true, min: 0 },
    frecuencia: { type: String, enum: COSTO_FIJO_FRECUENCIAS, required: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, default: null },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('CostoFijo', costoFijoSchema);
