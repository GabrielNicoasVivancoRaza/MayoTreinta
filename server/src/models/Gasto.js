import mongoose from 'mongoose';

const gastoSchema = new mongoose.Schema(
  {
    fecha: { type: Date, required: true, default: Date.now },
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseCategory', required: true },
    monto: { type: Number, required: true, min: 0 }, // centavos
    descripcion: { type: String, required: true, trim: true },
    observaciones: { type: String, trim: true, default: '' },
    // Informativo: no reemplaza a CostoFijo, solo etiqueta gastos puntuales que tienden a repetirse
    esFijo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Gasto', gastoSchema);
