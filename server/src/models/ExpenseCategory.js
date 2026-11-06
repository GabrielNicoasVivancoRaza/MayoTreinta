import mongoose from 'mongoose';

const expenseCategorySchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('ExpenseCategory', expenseCategorySchema);
