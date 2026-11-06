import CostoFijo from '../models/CostoFijo.js';
import Producto from '../models/Producto.js';
import { parseRango } from '../utils/rango.js';
import { calcularCostosFijosPeriodo } from '../services/finanzas/costosFijos.js';
import { obtenerVentasEnRango, calcularTotalesVentas } from '../services/reportes.service.js';
import {
  calcularMixYMargen,
  calcularPuntoEquilibrio,
  evaluarConfiabilidad,
  aplicarAjustesSimulador,
} from '../services/finanzas/puntoEquilibrio.js';

const VENTANA_DEFAULT_DIAS = 90;

async function construirContexto(query) {
  const { desde, hasta } = parseRango(query);

  const ventanaDias = Number(query.ventanaDias) || VENTANA_DEFAULT_DIAS;
  const ventanaHasta = new Date();
  ventanaHasta.setHours(23, 59, 59, 999);
  const ventanaDesde = new Date(ventanaHasta);
  ventanaDesde.setDate(ventanaDesde.getDate() - ventanaDias + 1);
  ventanaDesde.setHours(0, 0, 0, 0);

  const [ventasVentana, ventasPeriodo, costosFijosDocs] = await Promise.all([
    obtenerVentasEnRango(ventanaDesde, ventanaHasta),
    obtenerVentasEnRango(desde, hasta),
    CostoFijo.find({ activo: true }).lean(),
  ]);

  const { total: costosFijosPeriodo } = calcularCostosFijosPeriodo(costosFijosDocs, desde, hasta);
  const confiabilidad = evaluarConfiabilidad(ventasVentana, ventanaDias);

  return {
    desde,
    hasta,
    ventanaDesde,
    ventanaHasta,
    ventanaDias,
    ventasVentana,
    ventasPeriodo,
    costosFijosPeriodo,
    confiabilidad,
  };
}

async function construirRespuesta(ctx, mixData) {
  const pe = calcularPuntoEquilibrio({
    costosFijosPeriodo: ctx.costosFijosPeriodo,
    margenPonderado: mixData.margenPonderado,
    ratioMargen: mixData.ratioMargen,
  });

  const { ingresos: ventasActualesMonetario } = calcularTotalesVentas(ctx.ventasPeriodo);
  const unidadesActuales = ctx.ventasPeriodo.reduce(
    (sum, v) => sum + v.items.reduce((s, it) => s + it.cantidad, 0),
    0
  );

  const porcentaje = pe.monetario ? Math.min(999, (ventasActualesMonetario / pe.monetario) * 100) : null;
  const faltanteMonetario = pe.monetario ? Math.max(0, pe.monetario - ventasActualesMonetario) : null;

  const productos = await Producto.find({ _id: { $in: mixData.mix.map((m) => m.producto) } }).lean();
  const mixConNombre = mixData.mix.map((m) => ({
    ...m,
    nombre: productos.find((p) => String(p._id) === String(m.producto))?.nombre || 'Producto eliminado',
  }));

  const sugerenciasFaltante = faltanteMonetario
    ? mixConNombre
        .filter((m) => m.precioPromedio > 0)
        .sort((a, b) => b.participacion - a.participacion)
        .slice(0, 3)
        .map((m) => ({ nombre: m.nombre, unidadesAprox: Math.ceil(faltanteMonetario / m.precioPromedio) }))
    : [];

  return {
    periodo: { desde: ctx.desde, hasta: ctx.hasta },
    ventanaHistorica: { desde: ctx.ventanaDesde, hasta: ctx.ventanaHasta, dias: ctx.ventanaDias },
    confiabilidad: ctx.confiabilidad,
    mix: mixConNombre,
    margenContribucionPonderado: mixData.margenPonderado,
    precioPromedioPonderado: mixData.precioPonderado,
    ratioMargenContribucion: mixData.ratioMargen,
    costosFijosPeriodo: ctx.costosFijosPeriodo,
    puntoEquilibrio: pe,
    ventasActuales: { monetario: ventasActualesMonetario, unidades: unidadesActuales },
    progreso: { porcentaje, faltanteMonetario, sugerenciasFaltante },
  };
}

export async function obtener(req, res) {
  const ctx = await construirContexto(req.query);
  const mixData = calcularMixYMargen(ctx.ventasVentana);
  res.json(await construirRespuesta(ctx, mixData));
}

export async function simular(req, res) {
  const ctx = await construirContexto(req.query);
  const mixBase = calcularMixYMargen(ctx.ventasVentana);

  const mixData = aplicarAjustesSimulador(mixBase.mix, {
    ajustePrecioPorcentaje: req.body.ajustePrecioPorcentaje,
    ajusteCostoPorcentaje: req.body.ajusteCostoPorcentaje,
    mixOverride: req.body.mixOverride,
  });

  if (req.body.costosFijosOverride !== undefined && req.body.costosFijosOverride !== null) {
    ctx.costosFijosPeriodo = req.body.costosFijosOverride;
  }

  res.json(await construirRespuesta(ctx, mixData));
}
