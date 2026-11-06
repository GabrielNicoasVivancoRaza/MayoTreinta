const DIAS_POR_FRECUENCIA = { mensual: 30, semanal: 7, anual: 365 };
const MS_POR_DIA = 24 * 60 * 60 * 1000;

// Prorratea cada CostoFijo activo sobre su superposicion con [desde, hasta].
// 'unico' cuenta completo solo si su fechaInicio cae dentro del rango.
export function calcularCostosFijosPeriodo(costosFijos, desde, hasta) {
  let total = 0;
  const detalle = [];

  for (const cf of costosFijos) {
    if (!cf.activo) continue;

    if (cf.frecuencia === 'unico') {
      if (cf.fechaInicio >= desde && cf.fechaInicio <= hasta) {
        total += cf.monto;
        detalle.push({ costoFijo: cf._id, nombre: cf.nombre, monto: cf.monto });
      }
      continue;
    }

    const inicioActivo = cf.fechaInicio > desde ? cf.fechaInicio : desde;
    const finVentana = cf.fechaFin && cf.fechaFin < hasta ? cf.fechaFin : hasta;
    if (inicioActivo > finVentana) continue;

    const dias = Math.floor((finVentana - inicioActivo) / MS_POR_DIA) + 1;
    const tasaDiaria = cf.monto / DIAS_POR_FRECUENCIA[cf.frecuencia];
    const montoPeriodo = Math.round(tasaDiaria * dias);

    total += montoPeriodo;
    detalle.push({ costoFijo: cf._id, nombre: cf.nombre, monto: montoPeriodo });
  }

  return { total: Math.round(total), detalle };
}
