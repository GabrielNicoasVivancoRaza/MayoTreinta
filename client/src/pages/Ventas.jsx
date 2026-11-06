import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import Modal from '../components/Modal.jsx';
import { centsToDisplay, displayToCents } from '../lib/money.js';
import { VENTA_CANALES, METODOS_PAGO, MOVILIDAD_ASUMIDO_POR } from '../lib/constants.js';

const emptyItem = {
  producto: '',
  variante: '',
  disenos: [],
  cantidad: '1',
  precioUnitarioVenta: '0',
  costoExtraManual: '0',
};

const emptyForm = {
  clienteNombre: '',
  clienteTelefono: '',
  canal: VENTA_CANALES[0],
  items: [{ ...emptyItem }],
  movilidadMonto: '0',
  movilidadAsumidoPor: 'ninguno',
  observaciones: '',
};

const emptyPagoForm = { monto: '0', metodoPago: METODOS_PAGO[0] };

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [disenos, setDisenos] = useState([]);
  const [variantesPorProducto, setVariantesPorProducto] = useState({});
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  const [pagoVenta, setPagoVenta] = useState(null);
  const [pagoForm, setPagoForm] = useState(emptyPagoForm);
  const [pagoError, setPagoError] = useState('');

  const [nuevoProductoIndex, setNuevoProductoIndex] = useState(null);
  const [nuevoProductoForm, setNuevoProductoForm] = useState({ nombre: '', precio: '' });
  const [nuevoProductoError, setNuevoProductoError] = useState('');

  async function load() {
    setLoading(true);
    const [{ data: ventasData }, { data: productosData }, { data: disenosData }] = await Promise.all([
      api.get('/ventas'),
      api.get('/productos'),
      api.get('/disenos'),
    ]);
    setVentas(ventasData);
    setProductos(productosData);
    setDisenos(disenosData);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function cargarVariantes(productoId) {
    if (!productoId || variantesPorProducto[productoId]) return;
    const { data } = await api.get(`/productos/${productoId}/variantes`);
    setVariantesPorProducto((prev) => ({ ...prev, [productoId]: data }));
  }

  function openCreate() {
    setForm(emptyForm);
    setError('');
    setMostrarOpciones(false);
    setModalOpen(true);
  }

  function updateItem(index, field, value) {
    setForm((f) => {
      const items = [...f.items];
      items[index] = { ...items[index], [field]: value };
      return { ...f, items };
    });
    if (field === 'producto') cargarVariantes(value);
  }

  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, { ...emptyItem }] }));
  }

  function removeItem(index) {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  }

  function toggleDiseno(index, disenoId) {
    setForm((f) => {
      const items = [...f.items];
      const actuales = items[index].disenos;
      items[index] = {
        ...items[index],
        disenos: actuales.includes(disenoId)
          ? actuales.filter((id) => id !== disenoId)
          : [...actuales, disenoId],
      };
      return { ...f, items };
    });
  }

  function productoRequiereTalla(productoId) {
    return productos.find((p) => p._id === productoId)?.requiereTalla;
  }

  function iniciarNuevoProducto(index) {
    setNuevoProductoIndex(index);
    setNuevoProductoForm({ nombre: '', precio: '' });
    setNuevoProductoError('');
  }

  async function crearProductoRapido(e) {
    e.preventDefault();
    setNuevoProductoError('');
    try {
      const { data: nuevoProducto } = await api.post('/productos', {
        nombre: nuevoProductoForm.nombre,
        precioSugerido: displayToCents(nuevoProductoForm.precio),
      });
      setProductos((prev) => [...prev, nuevoProducto]);
      updateItem(nuevoProductoIndex, 'producto', nuevoProducto._id);
      updateItem(nuevoProductoIndex, 'precioUnitarioVenta', nuevoProductoForm.precio);
      setNuevoProductoIndex(null);
    } catch (err) {
      setNuevoProductoError(err.response?.data?.message || 'No se pudo crear el producto');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      cliente: { nombre: form.clienteNombre, telefono: form.clienteTelefono },
      canal: form.canal,
      items: form.items.map((it) => ({
        producto: it.producto,
        variante: it.variante || null,
        disenos: it.disenos,
        cantidad: Number(it.cantidad),
        precioUnitarioVenta: displayToCents(it.precioUnitarioVenta),
        costoExtraManual: displayToCents(it.costoExtraManual),
      })),
      movilidad: {
        monto: displayToCents(form.movilidadMonto),
        asumidoPor: form.movilidadAsumidoPor,
      },
      observaciones: form.observaciones,
    };
    try {
      const { data } = await api.post('/ventas', payload);
      setModalOpen(false);
      load();
      if (data.advertencias?.length) {
        window.alert(`Venta ${data.venta.codigo} registrada con advertencias:\n\n${data.advertencias.join('\n')}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la venta');
    }
  }

  function openPago(venta) {
    setPagoVenta(venta);
    setPagoForm(emptyPagoForm);
    setPagoError('');
  }

  async function handlePagoSubmit(e) {
    e.preventDefault();
    setPagoError('');
    try {
      await api.post(`/ventas/${pagoVenta._id}/pagos`, {
        monto: displayToCents(pagoForm.monto),
        metodoPago: pagoForm.metodoPago,
      });
      setPagoVenta(null);
      load();
    } catch (err) {
      setPagoError(err.response?.data?.message || 'No se pudo registrar el pago');
    }
  }

  async function handleCancelar(venta) {
    if (!window.confirm(`Cancelar la venta ${venta.codigo}? Esto revierte el inventario descontado.`)) return;
    await api.post(`/ventas/${venta._id}/cancelar`);
    load();
  }

  function productoNombre(id) {
    return productos.find((p) => p._id === id)?.nombre || '(producto eliminado)';
  }

  const estadoPagoColor = { pendiente: 'text-red-600', parcial: 'text-amber-600', pagado: 'text-green-600' };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Ventas</h1>
        <button
          onClick={openCreate}
          disabled={productos.length === 0}
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          + Nueva venta
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2">Codigo</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2">Canal</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Pago</th>
                <th className="px-4 py-2">Pedido</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta._id} className="border-t border-gray-100 hover:bg-indigo-50/60 transition-colors">
                  <td className="px-4 py-2 font-medium">{venta.codigo}</td>
                  <td className="px-4 py-2">{venta.fechaHora?.slice(0, 10)}</td>
                  <td className="px-4 py-2">{venta.cliente?.nombre || '-'}</td>
                  <td className="px-4 py-2">{venta.canal}</td>
                  <td className="px-4 py-2">${centsToDisplay(venta.total)}</td>
                  <td className={`px-4 py-2 capitalize ${estadoPagoColor[venta.estadoPago]}`}>
                    {venta.estadoPago}
                  </td>
                  <td className="px-4 py-2 capitalize">{venta.estadoPedido.replace('_', ' ')}</td>
                  <td className="px-4 py-2 text-right space-x-2">
                    {venta.estadoPedido !== 'cancelado' && (
                      <>
                        <button onClick={() => openPago(venta)} className="text-indigo-600 hover:underline">
                          Pago
                        </button>
                        <button onClick={() => handleCancelar(venta)} className="text-red-500 hover:underline">
                          Cancelar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {ventas.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-400 italic">
                    No hay ventas todavia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} title="Nueva venta" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cliente (opcional)</label>
              <input
                value={form.clienteNombre}
                onChange={(e) => setForm({ ...form, clienteNombre: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefono (opcional)</label>
              <input
                value={form.clienteTelefono}
                onChange={(e) => setForm({ ...form, clienteTelefono: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Canal</label>
            <select
              value={form.canal}
              onChange={(e) => setForm({ ...form, canal: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {VENTA_CANALES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Items</label>
              <button type="button" onClick={addItem} className="text-sm text-indigo-600 hover:underline">
                + Agregar item
              </button>
            </div>
            <div className="space-y-3 mt-2">
              {form.items.map((item, index) => {
                const variantes = variantesPorProducto[item.producto] || [];
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={item.producto}
                        onChange={(e) => {
                          if (e.target.value === '__nuevo__') {
                            iniciarNuevoProducto(index);
                          } else {
                            updateItem(index, 'producto', e.target.value);
                          }
                        }}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Selecciona un producto</option>
                        {productos.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.nombre}
                          </option>
                        ))}
                        <option value="__nuevo__">+ Crear producto nuevo...</option>
                      </select>
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:underline text-sm"
                        >
                          Quitar
                        </button>
                      )}
                    </div>

                    {nuevoProductoIndex === index && (
                      <form
                        onSubmit={crearProductoRapido}
                        className="flex gap-2 items-end bg-indigo-50 border border-indigo-200 rounded-lg p-2"
                      >
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700">Nombre del producto</label>
                          <input
                            required
                            autoFocus
                            value={nuevoProductoForm.nombre}
                            onChange={(e) => setNuevoProductoForm({ ...nuevoProductoForm, nombre: e.target.value })}
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="w-28">
                          <label className="block text-xs font-medium text-gray-700">Precio ($)</label>
                          <input
                            required
                            type="number"
                            step="0.01"
                            value={nuevoProductoForm.precio}
                            onChange={(e) => setNuevoProductoForm({ ...nuevoProductoForm, precio: e.target.value })}
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                        <button
                          type="submit"
                          className="bg-indigo-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-indigo-700"
                        >
                          Crear
                        </button>
                        <button
                          type="button"
                          onClick={() => setNuevoProductoIndex(null)}
                          className="text-gray-500 text-sm hover:underline"
                        >
                          Cancelar
                        </button>
                        {nuevoProductoError && <p className="text-xs text-red-600 w-full">{nuevoProductoError}</p>}
                      </form>
                    )}

                    {productoRequiereTalla(item.producto) && (
                      <select
                        value={item.variante}
                        onChange={(e) => updateItem(index, 'variante', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Sin variante especifica</option>
                        {variantes.map((v) => (
                          <option key={v._id} value={v._id}>
                            {v.nombreVariante} (stock {v.stock})
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => updateItem(index, 'cantidad', e.target.value)}
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Precio unit. ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.precioUnitarioVenta}
                          onChange={(e) => updateItem(index, 'precioUnitarioVenta', e.target.value)}
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    {mostrarOpciones && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">
                            Costo extra ($, ej. DTF ya incluido en el precio de arriba)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.costoExtraManual}
                            onChange={(e) => updateItem(index, 'costoExtraManual', e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>

                        {disenos.length > 0 && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Disenos</label>
                            <div className="flex flex-wrap gap-2">
                              {disenos.map((d) => (
                                <label
                                  key={d._id}
                                  className="flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1"
                                >
                                  <input
                                    type="checkbox"
                                    checked={item.disenos.includes(d._id)}
                                    onChange={() => toggleDiseno(index, d._id)}
                                  />
                                  {d.nombre}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMostrarOpciones((v) => !v)}
            className="text-sm text-indigo-600 hover:underline"
          >
            {mostrarOpciones ? '- Ocultar opciones avanzadas' : '+ Opciones avanzadas (diseños, costo extra, movilidad)'}
          </button>

          {mostrarOpciones && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Movilidad ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.movilidadMonto}
                    onChange={(e) => setForm({ ...form, movilidadMonto: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">La asume</label>
                  <select
                    value={form.movilidadAsumidoPor}
                    onChange={(e) => setForm({ ...form, movilidadAsumidoPor: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {MOVILIDAD_ASUMIDO_POR.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Observaciones (opcional)</label>
                <textarea
                  value={form.observaciones}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700"
          >
            Registrar venta
          </button>
        </form>
      </Modal>

      <Modal open={!!pagoVenta} title={`Registrar pago - ${pagoVenta?.codigo || ''}`} onClose={() => setPagoVenta(null)}>
        <form onSubmit={handlePagoSubmit} className="space-y-3">
          {pagoError && <p className="text-sm text-red-600">{pagoError}</p>}
          {pagoVenta && (
            <p className="text-sm text-gray-600">
              Total: ${centsToDisplay(pagoVenta.total)} — Pagado hasta ahora: $
              {centsToDisplay(pagoVenta.pagos.reduce((sum, p) => sum + p.monto, 0))}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Monto ($)</label>
              <input
                type="number"
                step="0.01"
                value={pagoForm.monto}
                onChange={(e) => setPagoForm({ ...pagoForm, monto: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Metodo</label>
              <select
                value={pagoForm.metodoPago}
                onChange={(e) => setPagoForm({ ...pagoForm, metodoPago: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {METODOS_PAGO.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700"
          >
            Guardar pago
          </button>
        </form>
      </Modal>
    </div>
  );
}
