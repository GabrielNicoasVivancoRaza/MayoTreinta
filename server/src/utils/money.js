export function centavosToDolares(centavos) {
  return (Number(centavos || 0) / 100).toFixed(2);
}

export function dolaresToCentavos(dolares) {
  return Math.round(Number(dolares || 0) * 100);
}
