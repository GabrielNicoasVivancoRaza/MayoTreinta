// Funcion pura y testeable para el costo de un item de venta.

// Costo total de la linea = costoUnitarioSnapshot * cantidad + costoExtraManual (este ultimo no se multiplica,
// es un cargo unico de la linea, ej. el DTF de una restauracion).
export function calcularCostoTotalItem({ costoUnitarioSnapshot = 0, cantidad = 1, costoExtraManual = 0 }) {
  return Math.round(costoUnitarioSnapshot * cantidad) + costoExtraManual;
}
