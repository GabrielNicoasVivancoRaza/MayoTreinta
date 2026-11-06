import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema(
  {
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    // Nombre libre: puede ser una talla ("M") o un color/tipo ("Rojo", "Con asa azul")
    nombreVariante: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productVariantSchema.index({ producto: 1, nombreVariante: 1 }, { unique: true });

export default mongoose.model('ProductVariant', productVariantSchema);
