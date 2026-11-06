import Producto from '../models/Producto.js';
import Diseno from '../models/Diseno.js';
import {
  obtenerVentasEnRango,
  calcularEstadoResultados,
  calcularTopProductos,
  calcularTopDisenos,
  calcularPagosPorMetodo,
  calcularSerieIngresosPorDia,
  obtenerStockBajo,
  obtenerPedidosPendientes,
} from '../services/reportes.service.js';
import { parseRango } from '../utils/rango.js';

export async function obtenerDashboard(req, res) {
  const { desde, hasta } = parseRango(req.query);

  const ventas = await obtenerVentasEnRango(desde, hasta);
  const kpis = await calcularEstadoResultados(desde, hasta);

  const topProductosRaw = calcularTopProductos(ventas);
  const productos = await Producto.find({ _id: { $in: topProductosRaw.map((p) => p.producto) } }).lean();
  const topProductos = topProductosRaw.map((p) => ({
    ...p,
    nombre: productos.find((prod) => String(prod._id) === String(p.producto))?.nombre || 'Producto eliminado',
  }));

  const topDisenosRaw = calcularTopDisenos(ventas);
  const disenos = await Diseno.find({ _id: { $in: topDisenosRaw.map((d) => d.diseno) } }).lean();
  const topDisenos = topDisenosRaw.map((d) => ({
    ...d,
    nombre: disenos.find((dis) => String(dis._id) === String(d.diseno))?.nombre || 'Diseno eliminado',
  }));

  const pagosPorMetodo = calcularPagosPorMetodo(ventas);
  const serieIngresos = calcularSerieIngresosPorDia(ventas, desde, hasta);
  const stockBajo = await obtenerStockBajo();
  const pedidosPendientes = await obtenerPedidosPendientes();

  res.json({
    rango: { desde, hasta },
    kpis,
    topProductos,
    topDisenos,
    pagosPorMetodo,
    serieIngresos,
    stockBajo,
    pedidosPendientes,
  });
}
