import { calcularProyeccion } from '../services/proyeccion.service.js';

export async function obtener(req, res) {
  const resultado = await calcularProyeccion(req.query);
  res.json(resultado);
}
