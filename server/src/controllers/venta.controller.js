import Venta from '../models/Venta.js';
import { httpError } from '../utils/httpError.js';
import {
  generarCodigoVenta,
  construirItemsConCosto,
  calcularTotalesVenta,
  calcularEstadoPago,
  descontarStockVenta,
  revertirStockVenta,
} from '../services/venta.service.js';

export async function list(req, res) {
  const filter = {};
  if (req.query.estadoPedido) filter.estadoPedido = req.query.estadoPedido;
  if (req.query.canal) filter.canal = req.query.canal;
  if (req.query.desde || req.query.hasta) {
    filter.fechaHora = {};
    if (req.query.desde) filter.fechaHora.$gte = new Date(req.query.desde);
    if (req.query.hasta) filter.fechaHora.$lte = new Date(req.query.hasta);
  }
  const ventas = await Venta.find(filter).sort({ fechaHora: -1 });
  res.json(ventas);
}

export async function getById(req, res) {
  const venta = await Venta.findById(req.params.id);
  if (!venta) return res.status(404).json({ message: 'No encontrada' });
  res.json(venta);
}

export async function create(req, res) {
  const { items: itemsInput, movilidad, canal, cliente, observaciones, fechaHora } = req.body;

  const { items } = await construirItemsConCosto(itemsInput);
  const { subtotal, total, costoTotal, utilidadEstimada } = calcularTotalesVenta(items, movilidad);
  const codigo = await generarCodigoVenta();

  const venta = await Venta.create({
    codigo,
    fechaHora,
    cliente,
    canal,
    items,
    movilidad,
    observaciones,
    subtotal,
    total,
    costoTotal,
    utilidadEstimada,
    estadoPago: 'pendiente',
    estadoPedido: 'pendiente',
  });

  const advertencias = await descontarStockVenta(venta);

  res.status(201).json({ venta, advertencias });
}

export async function update(req, res) {
  const venta = await Venta.findById(req.params.id);
  if (!venta) return res.status(404).json({ message: 'No encontrada' });
  if (venta.estadoPedido === 'cancelado') {
    throw httpError(400, 'No se puede editar una venta cancelada');
  }

  Object.assign(venta, req.body);
  await venta.save();
  res.json(venta);
}

export async function addPago(req, res) {
  const venta = await Venta.findById(req.params.id);
  if (!venta) return res.status(404).json({ message: 'No encontrada' });
  if (venta.estadoPedido === 'cancelado') {
    throw httpError(400, 'No se puede registrar un pago en una venta cancelada');
  }

  venta.pagos.push(req.body);
  venta.estadoPago = calcularEstadoPago(venta.pagos, venta.total);
  await venta.save();
  res.json(venta);
}

export async function cancelar(req, res) {
  const venta = await Venta.findById(req.params.id);
  if (!venta) return res.status(404).json({ message: 'No encontrada' });
  if (venta.estadoPedido === 'cancelado') {
    throw httpError(400, 'La venta ya estaba cancelada');
  }

  await revertirStockVenta(venta);
  venta.estadoPedido = 'cancelado';
  venta.canceladaEn = new Date();
  await venta.save();
  res.json(venta);
}
