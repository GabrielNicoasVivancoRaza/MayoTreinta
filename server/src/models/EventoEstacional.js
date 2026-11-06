import mongoose from 'mongoose';

const eventoEstacionalSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
    multiplicador: { type: Number, required: true, min: 0, default: 1 },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('EventoEstacional', eventoEstacionalSchema);
