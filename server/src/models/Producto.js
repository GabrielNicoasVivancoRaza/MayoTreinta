import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    // Texto libre y administrable: no se fija un enum de categorias de producto. Opcional: "General" por defecto.
    categoria: { type: String, trim: true, default: 'General' },
    descripcion: { type: String, trim: true, default: '' },
    precioSugerido: { type: Number, required: true, min: 0 },
    // Costo estimado por unidad, en centavos. Campo directo y simple: no se calcula a partir de
    // una receta de insumos (decision del negocio: el inventario de insumos se maneja aparte,
    // sin obligar a vincular cada producto con una formula de materia prima para poder venderlo).
    costoUnitario: { type: Number, required: true, min: 0, default: 0 },
    activo: { type: Boolean, default: true },
    requiereTalla: { type: Boolean, default: false },
    unidad: { type: String, required: true, trim: true, default: 'unidad' },
  },
  { timestamps: true }
);

export default mongoose.model('Producto', productoSchema);
