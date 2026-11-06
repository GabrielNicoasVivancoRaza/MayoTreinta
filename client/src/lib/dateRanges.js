export function toInputDate(date) {
  return date.toISOString().slice(0, 10);
}

export function presetHoy() {
  const hoy = new Date();
  return { desde: toInputDate(hoy), hasta: toInputDate(hoy) };
}

export function presetSemana() {
  const hasta = new Date();
  const desde = new Date();
  desde.setDate(desde.getDate() - 6);
  return { desde: toInputDate(desde), hasta: toInputDate(hasta) };
}

export function presetMes() {
  const hasta = new Date();
  const desde = new Date(hasta.getFullYear(), hasta.getMonth(), 1);
  return { desde: toInputDate(desde), hasta: toInputDate(hasta) };
}
