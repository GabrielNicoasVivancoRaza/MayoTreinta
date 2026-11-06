// Parsea desde/hasta de query params; si no vienen, usa "mes a la fecha".
export function parseRango(query) {
  const hasta = query.hasta ? new Date(query.hasta) : new Date();
  const desde = query.desde ? new Date(query.desde) : new Date(hasta.getFullYear(), hasta.getMonth(), 1);

  desde.setHours(0, 0, 0, 0);
  hasta.setHours(23, 59, 59, 999);
  return { desde, hasta };
}
