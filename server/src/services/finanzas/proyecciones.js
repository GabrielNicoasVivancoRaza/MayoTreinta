// Funciones puras y testeables para proyecciones de ventas.

const MS_POR_DIA = 24 * 60 * 60 * 1000;

// Agrupa ingresos por semana (domingo como inicio de semana), ordenado cronologicamente.
export function construirSerieSemanal(ventas) {
  const porSemana = new Map();

  for (const venta of ventas) {
    const fecha = new Date(venta.fechaHora);
    const inicioSemana = new Date(fecha);
    inicioSemana.setHours(0, 0, 0, 0);
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const key = inicioSemana.toISOString().slice(0, 10);

    const actual = porSemana.get(key) || { semana: key, ingresos: 0 };
    actual.ingresos += venta.total;
    porSemana.set(key, actual);
  }

  return [...porSemana.values()].sort((a, b) => a.semana.localeCompare(b.semana));
}

export function promedioHistorico(serieSemanal) {
  if (!serieSemanal.length) return 0;
  return serieSemanal.reduce((sum, p) => sum + p.ingresos, 0) / serieSemanal.length;
}

export function promedioMovil(serieSemanal, ventana = 4) {
  return promedioHistorico(serieSemanal.slice(-ventana));
}

// Regresion lineal simple (minimos cuadrados) sobre el indice de semana.
export function calcularTendenciaLineal(serieSemanal) {
  const n = serieSemanal.length;
  if (n < 2) return { pendiente: 0, intercepto: serieSemanal[0]?.ingresos || 0 };

  const xs = serieSemanal.map((_, i) => i);
  const ys = serieSemanal.map((p) => p.ingresos);
  const mediaX = xs.reduce((s, x) => s + x, 0) / n;
  const mediaY = ys.reduce((s, y) => s + y, 0) / n;

  let numerador = 0;
  let denominador = 0;
  for (let i = 0; i < n; i += 1) {
    numerador += (xs[i] - mediaX) * (ys[i] - mediaY);
    denominador += (xs[i] - mediaX) ** 2;
  }

  const pendiente = denominador !== 0 ? numerador / denominador : 0;
  const intercepto = mediaY - pendiente * mediaX;
  return { pendiente, intercepto };
}

export function proyectarConTendenciaLineal(serieSemanal) {
  const { pendiente, intercepto } = calcularTendenciaLineal(serieSemanal);
  const valor = intercepto + pendiente * serieSemanal.length;
  return Math.max(0, valor);
}

// Heuristica de seleccion de metodo segun cantidad de semanas con datos.
export function seleccionarMetodo(serieSemanal) {
  if (serieSemanal.length < 2) return 'promedio_historico';
  if (serieSemanal.length < 6) return 'promedio_movil';
  return 'tendencia_lineal';
}

export function calcularTasaSemanal(serieSemanal, metodo) {
  if (metodo === 'tendencia_lineal') return proyectarConTendenciaLineal(serieSemanal);
  if (metodo === 'promedio_movil') return promedioMovil(serieSemanal);
  return promedioHistorico(serieSemanal);
}

export function calcularDesviacionSemanal(serieSemanal) {
  const n = serieSemanal.length;
  if (n < 2) return 0;
  const media = promedioHistorico(serieSemanal);
  const varianza = serieSemanal.reduce((sum, p) => sum + (p.ingresos - media) ** 2, 0) / n;
  return Math.sqrt(varianza);
}

export function evaluarConfiabilidadProyeccion(ventas, serieSemanal) {
  const primeraFechaMs = ventas.length ? Math.min(...ventas.map((v) => new Date(v.fechaHora).getTime())) : null;
  const diasHistorial = primeraFechaMs ? (Date.now() - primeraFechaMs) / MS_POR_DIA : 0;

  if (diasHistorial < 30 || ventas.length < 10) {
    return {
      nivel: 'baja',
      advertencia:
        'Hay menos de 30 dias de historial o menos de 10 ventas registradas. Esta proyeccion es poco confiable.',
    };
  }
  if (serieSemanal.length < 6) {
    return {
      nivel: 'media',
      advertencia: 'Hay historial pero menos de 6 semanas con ventas registradas; la proyeccion es orientativa.',
    };
  }
  return { nivel: 'alta', advertencia: null };
}

export function aplicarEscenario(valor, escenario, ajustePesimista = -20, ajusteOptimista = 20) {
  if (escenario === 'pesimista') return valor * (1 + ajustePesimista / 100);
  if (escenario === 'optimista') return valor * (1 + ajusteOptimista / 100);
  return valor;
}

// Multiplicador ponderado por dias: los dias del horizonte que caen dentro de un evento activo
// usan su multiplicador; el resto de dias usa 1. Se promedia por el total de dias del horizonte.
export function calcularMultiplicadorEstacional(eventos, desde, hasta) {
  const diasHorizonte = Math.floor((hasta - desde) / MS_POR_DIA) + 1;
  if (diasHorizonte <= 0) return 1;

  let diasConEvento = 0;
  let sumaPonderada = 0;

  for (const evento of eventos) {
    if (!evento.activo) continue;
    const inicio = evento.fechaInicio > desde ? evento.fechaInicio : desde;
    const fin = evento.fechaFin < hasta ? evento.fechaFin : hasta;
    if (inicio > fin) continue;

    const dias = Math.floor((fin - inicio) / MS_POR_DIA) + 1;
    diasConEvento += dias;
    sumaPonderada += dias * evento.multiplicador;
  }

  const diasSinEvento = Math.max(0, diasHorizonte - diasConEvento);
  sumaPonderada += diasSinEvento * 1;

  return sumaPonderada / diasHorizonte;
}
