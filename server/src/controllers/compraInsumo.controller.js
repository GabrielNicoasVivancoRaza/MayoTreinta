import CompraInsumo from '../models/CompraInsumo.js';
import Insumo from '../models/Insumo.js';
import InventoryMovement from '../models/InventoryMovement.js';
import { httpError } from '../utils/httpError.js';

export async function list(req, res) {
  const filter = {};
  if (req.query.insumo) filter.insumo = req.query.insumo;
  const compras = await CompraInsumo.find(filter).sort({ fecha: -1 });
  res.json(compras);
}

export async function getById(req, res) {
  const compra = await CompraInsumo.findById(req.params.id);
  if (!compra) return res.status(404).json({ message: 'No encontrada' });
  res.json(compra);
}

export async function create(req, res) {
  const insumo = await Insumo.findById(req.body.insumo);
  if (!insumo) throw httpError(400, 'El insumo no existe');

  const { cantidad, costoTotal } = req.body;

  // Costo promedio ponderado: (stock anterior * costo anterior + costo de esta compra) / stock nuevo
  const stockAnterior = insumo.stockActual;
  const valorAnterior = stockAnterior * insumo.costoPromedioUnitario;
  const stockNuevo = stockAnterior + cantidad;
  const costoPromedioResultante =
    stockNuevo > 0 ? Math.round((valorAnterior + costoTotal) / stockNuevo) : 0;

  insumo.stockActual = stockNuevo;
  insumo.costoPromedioUnitario = costoPromedioResultante;
  await insumo.save();

  const compra = await CompraInsumo.create({
    ...req.body,
    costoPromedioResultante,
  });

  await InventoryMovement.create({
    tipo: 'entrada_compra',
    insumo: insumo._id,
    cantidad,
    direccion: 'entrada',
    referenciaCompra: compra._id,
    motivo: `Compra de insumo${req.body.proveedor ? ` a ${req.body.proveedor}` : ''}`,
  });

  res.status(201).json(compra);
}
