import Producto from '../models/Producto.js';
import ProductVariant from '../models/ProductVariant.js';
import { createCrudController } from '../utils/crudFactory.js';

const base = createCrudController(Producto);

export const { list, getById, create, update, setActivo } = base;

export async function listVariantes(req, res) {
  const variantes = await ProductVariant.find({ producto: req.params.productoId }).sort({
    createdAt: 1,
  });
  res.json(variantes);
}

export async function createVariante(req, res) {
  const producto = await Producto.findById(req.params.productoId);
  if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

  const variante = await ProductVariant.create({ ...req.body, producto: producto._id });
  res.status(201).json(variante);
}

export async function updateVariante(req, res) {
  const variante = await ProductVariant.findOneAndUpdate(
    { _id: req.params.varianteId, producto: req.params.productoId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!variante) return res.status(404).json({ message: 'Variante no encontrada' });
  res.json(variante);
}

export async function setActivoVariante(req, res) {
  const variante = await ProductVariant.findOneAndUpdate(
    { _id: req.params.varianteId, producto: req.params.productoId },
    { activo: req.body.activo },
    { new: true }
  );
  if (!variante) return res.status(404).json({ message: 'Variante no encontrada' });
  res.json(variante);
}
