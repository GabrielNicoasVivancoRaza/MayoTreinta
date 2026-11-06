import mongoose from 'mongoose';

const disenoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true, default: '' },
    enlaceInstagram: { type: String, trim: true, default: null },
    etiquetas: { type: [String], default: [] },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Diseno', disenoSchema);
