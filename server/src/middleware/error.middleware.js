export function notFound(req, res) {
  res.status(404).json({ message: 'Ruta no encontrada' });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({ message: 'Ya existe un registro con ese valor unico', campo });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Identificador invalido' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
}
