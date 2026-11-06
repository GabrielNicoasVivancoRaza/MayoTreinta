import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    nombre: { type: String, required: true, trim: true },
    // Enum de un solo valor hoy; se amplia cuando existan mas roles (p.ej. 'vendedor')
    rol: { type: String, enum: ['admin'], default: 'admin' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
