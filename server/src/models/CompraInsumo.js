import mongoose from 'mongoose';

const compraInsumoSchema = new mongoose.Schema(
  {
    fecha: { type: Date, required: true, default: Date.now },
    insumo: { type: mongoose.Schema.Types.ObjectId, ref: 'Insumo', required: true },
    cantidad: { type: Number, required: true, min: 0.0001 },
    costoTotal: { type: Number, required: true, min: 0 }, // centavos
    proveedor: { type: String, trim: true, default: null },
    nota: { type: String, trim: true, default: null },
    // Snapshot informativo: costo promedio del insumo justo despues de aplicar esta compra
    costoPromedioResultante: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('CompraInsumo', compraInsumoSchema);
