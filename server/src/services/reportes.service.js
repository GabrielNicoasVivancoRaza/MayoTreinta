import Venta from '../models/Venta.js';
import Gasto from '../models/Gasto.js';
import CostoFijo from '../models/CostoFijo.js';
import Insumo from '../models/Insumo.js';
import { calcularCostosFijosPeriodo } from './finanzas/costosFijos.js';

export async function obtenerVentasEnRango(desde, hasta) {
  return Venta.find({
    fechaHora: { $gte: desde, $lte: hasta },
    estadoPedido: { $ne: 'cancelado' },
  }).lean();
}

export function calcularTotalesVentas(ventas) {
  const ingresos = ventas.reduce((sum, v) => sum + v.total, 0);
  const costosVariables = ventas.reduce((sum, v) => sum + v.costoTotal, 0);
  return { ingresos, costosVariables, utilidadBruta: ingresos - costosVariables };
}

export async function calcularEstadoResultados(desde, hasta) {
  const ventas = await obtenerVentasEnRango(desde, hasta);
  const { ingresos, costosVariables, utilidadBruta } = calcularTotalesVentas(ventas);

  const gastosDocs = await Gasto.find({ fecha: { $gte: desde, $lte: hasta } }).lean();
  const gastos = gastosDocs.reduce((sum, g) => sum + g.monto, 0);

  const costosFijosDocs = await CostoFijo.find({ activo: true }).lean();
  const { total: costosFijos, detalle: detalleCostosFijos } = calcularCostosFijosPeriodo(
    costosFijosDocs,
    desde,
    hasta
  );

  const utilidadNeta = utilidadBruta - costosFijos - gastos;
  const margenNeto = ingresos > 0 ? utilidadNeta / ingresos : 0;

  return {
    desde,
    hasta,
    ventasCount: ventas.length,
    ingresos,
    costosVariables,
    utilidadBruta,
    gastos,
    costosFijos,
    detalleCostosFijos,
    utilidadNeta,
    margenNeto,
  };
}

export function calcularTopProductos(ventas, limite = 5) {
  const mapa = new Map();
  for (const venta of ventas) {
    for (const item of venta.items) {
      const key = String(item.producto);
      const actual = mapa.get(key) || { producto: item.producto, cantidad: 0, ingresos: 0 };
      actual.cantidad += item.cantidad;
      actual.ingresos += item.precioUnitarioVenta * item.cantidad;
      mapa.set(key, actual);
    }
  }
  return [...mapa.values()].sort((a, b) => b.cantidad - a.cantidad).slice(0, limite);
}

export function calcularTopDisenos(ventas, limite = 5) {
  const mapa = new Map();
  for (const venta of ventas) {
    for (const item of venta.items) {
      for (const disenoId of item.disenos || []) {
        const key = String(disenoId);
        mapa.set(key, (mapa.get(key) || 0) + item.cantidad);
      }
    }
  }
  return [...mapa.entries()]
    .map(([diseno, apariciones]) => ({ diseno, apariciones }))
    .sort((a, b) => b.apariciones - a.apariciones)
    .slice(0, limite);
}

export function calcularPagosPorMetodo(ventas) {
  const resultado = {};
  for (const venta of ventas) {
    for (const pago of venta.pagos || []) {
      resultado[pago.metodoPago] = (resultado[pago.metodoPago] || 0) + pago.monto;
    }
  }
  return resultado;
}

export function calcularSerieIngresosPorDia(ventas, desde, hasta) {
  const porDia = new Map();
  for (const venta of ventas) {
    const dia = new Date(venta.fechaHora).toISOString().slice(0, 10);
    porDia.set(dia, (porDia.get(dia) || 0) + venta.total);
  }

  const serie = [];
  const cursor = new Date(desde);
  cursor.setHours(0, 0, 0, 0);
  const fin = new Date(hasta);
  while (cursor <= fin) {
    const key = cursor.toISOString().slice(0, 10);
    serie.push({ fecha: key, ingresos: porDia.get(key) || 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return serie;
}

export async function obtenerStockBajo() {
  const insumos = await Insumo.find({ activo: true }).lean();
  return insumos.filter((i) => i.stockActual <= i.stockMinimo);
}

export async function obtenerPedidosPendientes(limite = 10) {
  return Venta.find({ estadoPedido: { $in: ['pendiente', 'en_produccion'] } })
    .sort({ fechaHora: 1 })
    .limit(limite)
    .lean();
}
