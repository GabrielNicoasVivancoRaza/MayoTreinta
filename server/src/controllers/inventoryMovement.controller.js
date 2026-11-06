import InventoryMovement from '../models/InventoryMovement.js';
import Insumo from '../models/Insumo.js';
import ProductVariant from '../models/ProductVariant.js';
import { httpError } from '../utils/httpError.js';

export async function list(req, res) {
  const filter = {};
  if (req.query.insumo) filter.insumo = req.query.insumo;
  if (req.query.variante) filter.variante = req.query.variante;
  if (req.query.tipo) filter.tipo = req.query.tipo;
  const movimientos = await InventoryMovement.find(filter).sort({ fecha: -1 });
  res.json(movimientos);
}

// Solo para tipo 'ajuste' o 'dano'; los demas tipos los genera el sistema (Venta/CompraInsumo).
export async function createManual(req, res) {
  const { tipo, insumo, variante, cantidad, direccion, fecha, motivo, observacion } = req.body;
  const signo = direccion === 'entrada' ? 1 : -1;

  if (insumo) {
    const doc = await Insumo.findById(insumo);
    if (!doc) throw httpError(400, 'El insumo no existe');
    doc.stockActual += signo * cantidad;
    await doc.save();
  } else {
    const doc = await ProductVariant.findById(variante);
    if (!doc) throw httpError(400, 'La variante no existe');
    doc.stock += signo * cantidad;
    await doc.save();
  }

  const movimiento = await InventoryMovement.create({
    tipo,
    insumo: insumo || null,
    variante: variante || null,
    cantidad,
    direccion,
    fecha,
    motivo,
    observacion,
  });

  res.status(201).json(movimiento);
}
