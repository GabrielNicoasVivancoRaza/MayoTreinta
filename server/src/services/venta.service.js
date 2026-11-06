import Producto from '../models/Producto.js';
import ProductVariant from '../models/ProductVariant.js';
import Venta from '../models/Venta.js';
import InventoryMovement from '../models/InventoryMovement.js';
import { httpError } from '../utils/httpError.js';
import { calcularCostoTotalItem } from './finanzas/costoItem.js';

export async function generarCodigoVenta() {
  const count = await Venta.countDocuments();
  return `V-${String(count + 1).padStart(5, '0')}`;
}

// El costo por unidad es el campo directo Producto.costoUnitario, copiado como snapshot al
// momento de la venta (si luego cambia el costo del producto, esta venta ya guardada no se altera).
export async function construirItemsConCosto(itemsInput) {
  const items = [];
  const productosPorItem = [];

  for (const itemInput of itemsInput) {
    const producto = await Producto.findById(itemInput.producto);
    if (!producto) {
      throw httpError(400, `El producto ${itemInput.producto} no existe`);
    }
    if (itemInput.variante) {
      const variante = await ProductVariant.findOne({
        _id: itemInput.variante,
        producto: producto._id,
      });
      if (!variante) {
        throw httpError(400, `La variante ${itemInput.variante} no pertenece a ese producto`);
      }
    }

    items.push({
      producto: producto._id,
      variante: itemInput.variante || null,
      disenos: itemInput.disenos || [],
      cantidad: itemInput.cantidad,
      precioUnitarioVenta: itemInput.precioUnitarioVenta,
      costoUnitarioSnapshot: producto.costoUnitario,
      costoExtraManual: itemInput.costoExtraManual || 0,
    });
    productosPorItem.push(producto);
  }

  return { items, productosPorItem };
}

export function calcularTotalesVenta(items, movilidad = {}) {
  const subtotal = items.reduce((sum, it) => sum + it.precioUnitarioVenta * it.cantidad, 0);
  const costoItems = items.reduce((sum, it) => sum + calcularCostoTotalItem(it), 0);
  const monto = movilidad.monto || 0;
  const asumidoPor = movilidad.asumidoPor || 'ninguno';
  const total = subtotal + (asumidoPor === 'cliente' ? monto : 0);
  const costoTotal = costoItems + (asumidoPor === 'negocio' ? monto : 0);
  const utilidadEstimada = total - costoTotal;
  return { subtotal, total, costoTotal, utilidadEstimada };
}

export function calcularEstadoPago(pagos, total) {
  const pagado = pagos.reduce((sum, p) => sum + p.monto, 0);
  if (pagado <= 0) return 'pendiente';
  if (pagado < total) return 'parcial';
  return 'pagado';
}

// Descuenta stock de variante (talla) cuando el item especifica una. El inventario de insumos
// (materia prima) NO se toca aqui: se administra aparte en Compras de Insumo / Movimientos de
// Inventario, sin depender de una receta por producto. No bloquea por falta de stock, solo
// acumula advertencias. Registra un InventoryMovement por cada descuento.
export async function descontarStockVenta(venta) {
  const advertencias = [];

  for (const item of venta.items) {
    if (!item.variante) continue;

    const variante = await ProductVariant.findById(item.variante);
    if (!variante) continue;

    const nuevoStock = variante.stock - item.cantidad;
    if (nuevoStock < 0) {
      advertencias.push(
        `Stock insuficiente de la variante "${variante.nombreVariante}" (quedaria en ${nuevoStock})`
      );
    }
    variante.stock = nuevoStock;
    await variante.save();

    await InventoryMovement.create({
      tipo: 'salida_venta',
      variante: variante._id,
      cantidad: item.cantidad,
      direccion: 'salida',
      referenciaVenta: venta._id,
      motivo: `Venta ${venta.codigo}`,
    });
  }

  return advertencias;
}

// Revierte exactamente los movimientos de salida_venta registrados para esta venta.
export async function revertirStockVenta(venta) {
  const movimientos = await InventoryMovement.find({
    referenciaVenta: venta._id,
    tipo: 'salida_venta',
  });

  for (const mov of movimientos) {
    if (mov.variante) {
      await ProductVariant.findByIdAndUpdate(mov.variante, { $inc: { stock: mov.cantidad } });
    }

    await InventoryMovement.create({
      tipo: 'devolucion',
      variante: mov.variante,
      cantidad: mov.cantidad,
      direccion: 'entrada',
      referenciaVenta: venta._id,
      motivo: `Cancelacion venta ${venta.codigo}`,
    });
  }
}
