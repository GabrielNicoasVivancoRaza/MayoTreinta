import EventoEstacional from '../models/EventoEstacional.js';
import CostoFijo from '../models/CostoFijo.js';
import Producto from '../models/Producto.js';
import { obtenerVentasEnRango } from './reportes.service.js';
import { calcularMixYMargen } from './finanzas/puntoEquilibrio.js';
import { calcularCostosFijosPeriodo } from './finanzas/costosFijos.js';
import {
  construirSerieSemanal,
  seleccionarMetodo,
  calcularTasaSemanal,
  calcularDesviacionSemanal,
  evaluarConfiabilidadProyeccion,
  aplicarEscenario,
  calcularMultiplicadorEstacional,
} from './finanzas/proyecciones.js';

const MS_POR_DIA = 24 * 60 * 60 * 1000;
const METODOS_VALIDOS = ['promedio_historico', 'promedio_movil', 'tendencia_lineal'];

export function resolverHorizonte(query) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (query.horizonte === 'fecha') {
    const fecha = new Date(query.fecha);
    fecha.setHours(0, 0, 0, 0);
    const hasta = new Date(fecha);
    hasta.setHours(23, 59, 59, 999);
    return { desde: fecha, hasta };
  }

  if (query.horizonte === 'personalizado') {
    const desde = query.desde ? new Date(query.desde) : new Date(hoy.getTime() + MS_POR_DIA);
    const hasta = query.hasta ? new Date(query.hasta) : new Date(desde.getTime() + 6 * MS_POR_DIA);
    desde.setHours(0, 0, 0, 0);
    hasta.setHours(23, 59, 59, 999);
    return { desde, hasta };
  }

  const desde = new Date(hoy.getTime() + MS_POR_DIA);
  const diasPorHorizonte = { semana: 6, mes: 29, '3meses': 89, '6meses': 179, '12meses': 364 };
  const dias = diasPorHorizonte[query.horizonte] ?? 29;
  const hasta = new Date(desde);
  hasta.setDate(hasta.getDate() + dias);
  hasta.setHours(23, 59, 59, 999);
  return { desde, hasta };
}

export async function calcularProyeccion(query) {
  const { desde: desdeProyeccion, hasta: hastaProyeccion } = resolverHorizonte(query);
  const escenario = query.escenario || 'base';
  const hoy = new Date();

  const ventasHistoricas = await obtenerVentasEnRango(new Date(0), hoy);
  const serieSemanal = construirSerieSemanal(ventasHistoricas);

  const metodo =
    query.metodo && METODOS_VALIDOS.includes(query.metodo) ? query.metodo : seleccionarMetodo(serieSemanal);
  const tasaSemanal = calcularTasaSemanal(serieSemanal, metodo);
  const desviacionSemanal = calcularDesviacionSemanal(serieSemanal);
  const confiabilidad = evaluarConfiabilidadProyeccion(ventasHistoricas, serieSemanal);

  const diasHorizonte = Math.floor((hastaProyeccion - desdeProyeccion) / MS_POR_DIA) + 1;
  const semanasHorizonte = diasHorizonte / 7;

  let ingresosProyectados = tasaSemanal * semanasHorizonte;

  const eventos = await EventoEstacional.find({ activo: true }).lean();
  const multiplicadorEstacional = calcularMultiplicadorEstacional(eventos, desdeProyeccion, hastaProyeccion);
  ingresosProyectados *= multiplicadorEstacional;
  ingresosProyectados = aplicarEscenario(ingresosProyectados, escenario);

  const rangoIncertidumbre = desviacionSemanal * Math.sqrt(semanasHorizonte);
  const rangoEstimado = {
    minimo: Math.max(0, Math.round(ingresosProyectados - rangoIncertidumbre)),
    maximo: Math.round(ingresosProyectados + rangoIncertidumbre),
  };

  // Mix de productos (90 dias), igual criterio que el punto de equilibrio, para repartir la proyeccion.
  const ventana90Desde = new Date(hoy);
  ventana90Desde.setDate(ventana90Desde.getDate() - 89);
  ventana90Desde.setHours(0, 0, 0, 0);
  const ventasVentana = await obtenerVentasEnRango(ventana90Desde, hoy);
  const mixData = calcularMixYMargen(ventasVentana);

  const productosDocs = await Producto.find({ _id: { $in: mixData.mix.map((m) => m.producto) } }).lean();

  const porProducto = mixData.mix.map((m) => {
    const ingresosAsignados = ingresosProyectados * m.participacion;
    const unidadesProyectadas = m.precioPromedio > 0 ? ingresosAsignados / m.precioPromedio : 0;
    const costoVariableProyectado = unidadesProyectadas * m.costoVariablePromedio;
    const producto = productosDocs.find((p) => String(p._id) === String(m.producto));
    return {
      producto: m.producto,
      nombre: producto?.nombre || 'Producto eliminado',
      participacion: m.participacion,
      unidadesProyectadas,
      ingresosAsignados,
      costoVariableProyectado,
    };
  });

  const costosVariablesProyectados = porProducto.reduce((sum, p) => sum + p.costoVariableProyectado, 0);
  const margenProyectado = ingresosProyectados - costosVariablesProyectados;

  const costosFijosDocs = await CostoFijo.find({ activo: true }).lean();
  const { total: costosFijosProyectados } = calcularCostosFijosPeriodo(
    costosFijosDocs,
    desdeProyeccion,
    hastaProyeccion
  );
  const utilidadNetaProyectada = margenProyectado - costosFijosProyectados;

  return {
    horizonte: { desde: desdeProyeccion, hasta: hastaProyeccion, dias: diasHorizonte },
    metodo,
    escenario,
    multiplicadorEstacional,
    confiabilidad,
    ingresosProyectados: Math.round(ingresosProyectados),
    rangoEstimado,
    costosVariablesProyectados: Math.round(costosVariablesProyectados),
    margenProyectado: Math.round(margenProyectado),
    costosFijosProyectados,
    utilidadNetaProyectada: Math.round(utilidadNetaProyectada),
    porProducto: porProducto.map((p) => ({
      producto: p.producto,
      nombre: p.nombre,
      participacion: p.participacion,
      unidadesProyectadas: Math.round(p.unidadesProyectadas * 10) / 10,
      ingresosAsignados: Math.round(p.ingresosAsignados),
      costoVariableProyectado: Math.round(p.costoVariableProyectado),
    })),
  };
}
