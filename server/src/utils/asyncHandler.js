// Express 4 no reenvia rechazos de promesas al middleware de errores automaticamente
export function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}
