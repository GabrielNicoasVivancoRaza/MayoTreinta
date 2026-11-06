import EventoEstacional from '../models/EventoEstacional.js';

// Fechas aproximadas para Ecuador; se cargan solo como punto de partida editable.
// Decision documentada: no se auto-regeneran cada año, el admin las ajusta/duplica cuando corresponda.
function eventosDefaultEcuador(anio) {
  return [
    { nombre: 'San Valentin', fechaInicio: new Date(anio, 1, 1), fechaFin: new Date(anio, 1, 14), multiplicador: 1.5 },
    { nombre: 'Dia de la Madre', fechaInicio: new Date(anio, 4, 1), fechaFin: new Date(anio, 4, 14), multiplicador: 1.8 },
    { nombre: 'Dia del Padre', fechaInicio: new Date(anio, 5, 1), fechaFin: new Date(anio, 5, 15), multiplicador: 1.4 },
    { nombre: 'Black Friday', fechaInicio: new Date(anio, 10, 20), fechaFin: new Date(anio, 10, 30), multiplicador: 1.6 },
    { nombre: 'Navidad', fechaInicio: new Date(anio, 11, 1), fechaFin: new Date(anio, 11, 24), multiplicador: 1.8 },
  ];
}

export async function seedEventosEstacionales() {
  const existing = await EventoEstacional.countDocuments();
  if (existing > 0) return;

  const anio = new Date().getFullYear();
  await EventoEstacional.insertMany(eventosDefaultEcuador(anio).map((e) => ({ ...e, activo: true })));
  console.log('Eventos estacionales por defecto creados (Ecuador)');
}
