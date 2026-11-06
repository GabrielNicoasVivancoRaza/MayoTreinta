// Funciones puras y testeables para el punto de equilibrio con mix de productos.

// A partir de ventas historicas (no canceladas), calcula el mix de participacion por producto
// y el margen de contribucion ponderado, usando precios y costos REALES de esas ventas
// (no el precioSugerido/costo actual del producto).
export function calcularMixYMargen(ventas) {
  const porProducto = new Map();

  for (const venta of ventas) {
    for (const item of venta.items) {
      const key = String(item.producto);
      const actual = porProducto.get(key) || { producto: item.producto, unidades: 0, ingresos: 0, costos: 0 };
      actual.unidades += item.cantidad;
      actual.ingresos += item.precioUnitarioVenta * item.cantidad;
      actual.costos += item.costoUnitarioSnapshot * item.cantidad + item.costoExtraManual;
      porProducto.set(key, actual);
    }
  }

  const totalUnidades = [...porProducto.values()].reduce((sum, p) => sum + p.unidades, 0);

  const mix = [...porProducto.values()].map((p) => {
    const precioPromedio = p.unidades > 0 ? p.ingresos / p.unidades : 0;
    const costoVariablePromedio = p.unidades > 0 ? p.costos / p.unidades : 0;
    return {
      producto: p.producto,
      unidades: p.unidades,
      participacion: totalUnidades > 0 ? p.unidades / totalUnidades : 0,
      precioPromedio,
      costoVariablePromedio,
      margenContribucion: precioPromedio - costoVariablePromedio,
    };
  });

  return resumirMix(mix);
}

function resumirMix(mix) {
  const margenPonderado = mix.reduce((sum, p) => sum + p.participacion * p.margenContribucion, 0);
  const precioPonderado = mix.reduce((sum, p) => sum + p.participacion * p.precioPromedio, 0);
  const ratioMargen = precioPonderado > 0 ? margenPonderado / precioPonderado : 0;
  return { mix, margenPonderado, precioPonderado, ratioMargen };
}

// Simulador: aplica ajustes porcentuales de precio/costo y/o un mix de participacion distinto,
// sobre el mix base ya calculado. No toca la base de datos, es un calculo en memoria.
export function aplicarAjustesSimulador(
  mixBase,
  { ajustePrecioPorcentaje = 0, ajusteCostoPorcentaje = 0, mixOverride } = {}
) {
  let mixAjustado = mixBase.map((p) => ({
    ...p,
    precioPromedio: p.precioPromedio * (1 + ajustePrecioPorcentaje / 100),
    costoVariablePromedio: p.costoVariablePromedio * (1 + ajusteCostoPorcentaje / 100),
  }));

  if (mixOverride && mixOverride.length) {
    const totalParticipacion = mixOverride.reduce((sum, m) => sum + m.participacion, 0) || 1;
    mixAjustado = mixAjustado.map((p) => {
      const override = mixOverride.find((m) => String(m.producto) === String(p.producto));
      return { ...p, participacion: override ? override.participacion / totalParticipacion : 0 };
    });
  }

  mixAjustado = mixAjustado.map((p) => ({
    ...p,
    margenContribucion: p.precioPromedio - p.costoVariablePromedio,
  }));

  return resumirMix(mixAjustado);
}

// PE monetario = costos fijos del periodo / ratio de margen de contribucion (margen como % del precio)
// PE en unidades = costos fijos del periodo / margen de contribucion ponderado por unidad
export function calcularPuntoEquilibrio({ costosFijosPeriodo, margenPonderado, ratioMargen }) {
  const unidades = margenPonderado > 0 ? costosFijosPeriodo / margenPonderado : null;
  const monetario = ratioMargen > 0 ? costosFijosPeriodo / ratioMargen : null;
  return { unidades, monetario };
}

export function evaluarConfiabilidad(ventasVentana, diasVentana) {
  if (diasVentana < 30 || ventasVentana.length < 10) {
    return {
      nivel: 'baja',
      advertencia:
        'Hay poco historial de ventas (menos de 30 dias o menos de 10 ventas en la ventana). El punto de equilibrio puede no ser representativo todavia.',
    };
  }
  return { nivel: 'alta', advertencia: null };
}
