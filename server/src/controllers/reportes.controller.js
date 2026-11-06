import { calcularEstadoResultados, obtenerVentasEnRango } from '../services/reportes.service.js';
import { parseRango } from '../utils/rango.js';
import { buildCsv } from '../utils/csv.js';
import { centavosToDolares } from '../utils/money.js';

function nombreArchivo(prefijo, req) {
  const desde = req.query.desde || 'inicio';
  const hasta = req.query.hasta || 'hoy';
  return `${prefijo}_${desde}_${hasta}.csv`;
}

export async function estadoResultados(req, res) {
  const { desde, hasta } = parseRango(req.query);
  const resultado = await calcularEstadoResultados(desde, hasta);
  res.json(resultado);
}

export async function estadoResultadosCsv(req, res) {
  const { desde, hasta } = parseRango(req.query);
  const r = await calcularEstadoResultados(desde, hasta);

  const headers = ['Concepto', 'Monto ($)'];
  const rows = [
    ['Ingresos', centavosToDolares(r.ingresos)],
    ['Costos variables', centavosToDolares(r.costosVariables)],
    ['Utilidad bruta', centavosToDolares(r.utilidadBruta)],
    ['Costos fijos (prorrateados)', centavosToDolares(r.costosFijos)],
    ['Gastos', centavosToDolares(r.gastos)],
    ['Utilidad neta', centavosToDolares(r.utilidadNeta)],
    ['Margen neto (%)', (r.margenNeto * 100).toFixed(1)],
  ];

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo('estado-resultados', req)}"`);
  res.send(buildCsv(headers, rows));
}

export async function ventasCsv(req, res) {
  const { desde, hasta } = parseRango(req.query);
  const ventas = await obtenerVentasEnRango(desde, hasta);

  const headers = [
    'Codigo',
    'Fecha',
    'Cliente',
    'Canal',
    'Subtotal',
    'Movilidad',
    'Total',
    'Costo',
    'Utilidad',
    'Estado pago',
    'Estado pedido',
  ];
  const rows = ventas.map((v) => [
    v.codigo,
    new Date(v.fechaHora).toISOString().slice(0, 10),
    v.cliente?.nombre || '',
    v.canal,
    centavosToDolares(v.subtotal),
    centavosToDolares(v.movilidad?.monto || 0),
    centavosToDolares(v.total),
    centavosToDolares(v.costoTotal),
    centavosToDolares(v.utilidadEstimada),
    v.estadoPago,
    v.estadoPedido,
  ]);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo('ventas', req)}"`);
  res.send(buildCsv(headers, rows));
}
