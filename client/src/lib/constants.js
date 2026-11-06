// Refleja los enums fijos del backend (server/src/constants/enums.js) para los <select> del UI.
// Las categorias de PRODUCTO, en cambio, son texto libre administrable (no hay enum aqui).
export const INSUMO_CATEGORIAS = [
  { value: 'prenda_blanco', label: 'Prenda en blanco' },
  { value: 'taza', label: 'Taza' },
  { value: 'papel', label: 'Papel' },
  { value: 'tinta', label: 'Tinta' },
  { value: 'dtf', label: 'DTF' },
  { value: 'poster', label: 'Poster' },
  { value: 'empaque', label: 'Empaque' },
  { value: 'otro', label: 'Otro' },
];

export const COSTO_FIJO_FRECUENCIAS = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'anual', label: 'Anual' },
  { value: 'unico', label: 'Unico' },
];

export const VENTA_CANALES = ['WhatsApp', 'Instagram', 'Presencial', 'Otro'];

export const METODOS_PAGO = ['Efectivo', 'Transferencia'];

export const VENTA_ESTADOS_PEDIDO = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_produccion', label: 'En produccion' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
];

export const MOVILIDAD_ASUMIDO_POR = [
  { value: 'ninguno', label: 'Sin movilidad' },
  { value: 'cliente', label: 'La paga el cliente' },
  { value: 'negocio', label: 'La asume el negocio' },
];

export const MOVIMIENTO_MANUAL_TIPOS = [
  { value: 'ajuste', label: 'Ajuste manual' },
  { value: 'dano', label: 'Producto danado' },
];

export const MOVIMIENTO_DIRECCIONES = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'salida', label: 'Salida' },
];
