import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import Modal from '../components/Modal.jsx';
import { centsToDisplay, displayToCents } from '../lib/money.js';

const emptyForm = {
  nombre: '',
  categoria: '',
  descripcion: '',
  precioSugerido: '0',
  costoUnitario: '0',
  requiereTalla: false,
  unidad: 'unidad',
};

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const [variantesProducto, setVariantesProducto] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [varianteForm, setVarianteForm] = useState({ nombreVariante: '', stock: '0' });
  const [varianteError, setVarianteError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await api.get('/productos');
    setProductos(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  }

  function openEdit(producto) {
    setEditing(producto);
    setForm({
      nombre: producto.nombre,
      categoria: producto.categoria || '',
      descripcion: producto.descripcion || '',
      precioSugerido: centsToDisplay(producto.precioSugerido),
      costoUnitario: centsToDisplay(producto.costoUnitario),
      requiereTalla: producto.requiereTalla,
      unidad: producto.unidad,
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      nombre: form.nombre,
      categoria: form.categoria || 'General',
      descripcion: form.descripcion,
      precioSugerido: displayToCents(form.precioSugerido),
      costoUnitario: displayToCents(form.costoUnitario),
      requiereTalla: form.requiereTalla,
      unidad: form.unidad || 'unidad',
    };
    try {
      if (editing) {
        await api.put(`/productos/${editing._id}`, payload);
      } else {
        await api.post('/productos', payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar');
    }
  }

  async function toggleActivo(producto) {
    await api.patch(`/productos/${producto._id}/activo`, { activo: !producto.activo });
    load();
  }

  async function openVariantes(producto) {
    setVariantesProducto(producto);
    setVarianteError('');
    setVarianteForm({ nombreVariante: '', stock: '0' });
    const { data } = await api.get(`/productos/${producto._id}/variantes`);
    setVariantes(data);
  }

  async function addVariante(e) {
    e.preventDefault();
    setVarianteError('');
    try {
      await api.post(`/productos/${variantesProducto._id}/variantes`, {
        nombreVariante: varianteForm.nombreVariante,
        stock: Number(varianteForm.stock),
      });
      setVarianteForm({ nombreVariante: '', stock: '0' });
      const { data } = await api.get(`/productos/${variantesProducto._id}/variantes`);
      setVariantes(data);
    } catch (err) {
      setVarianteError(err.response?.data?.message || 'No se pudo guardar la variante');
    }
  }

  async function toggleVarianteActivo(variante) {
    await api.patch(`/productos/${variantesProducto._id}/variantes/${variante._id}/activo`, {
      activo: !variante.activo,
    });
    const { data } = await api.get(`/productos/${variantesProducto._id}/variantes`);
    setVariantes(data);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Productos</h1>
        <button
          onClick={openCreate}
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700"
        >
          + Nuevo producto
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Categoria</th>
                <th className="px-4 py-2">Precio</th>
                <th className="px-4 py-2">Costo</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto._id} className="border-t border-gray-100 hover:bg-indigo-50/60 transition-colors">
                  <td className="px-4 py-2">{producto.nombre}</td>
                  <td className="px-4 py-2">{producto.categoria}</td>
                  <td className="px-4 py-2">${centsToDisplay(producto.precioSugerido)}</td>
                  <td className="px-4 py-2">${centsToDisplay(producto.costoUnitario)}</td>
                  <td className="px-4 py-2">
                    <span className={producto.activo ? 'text-green-600' : 'text-gray-400'}>
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    {producto.requiereTalla && (
                      <button onClick={() => openVariantes(producto)} className="text-indigo-600 hover:underline">
                        Variantes
                      </button>
                    )}
                    <button onClick={() => openEdit(producto)} className="text-indigo-600 hover:underline">
                      Editar
                    </button>
                    <button onClick={() => toggleActivo(producto)} className="text-gray-500 hover:underline">
                      {producto.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400 italic">
                    No hay productos todavia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              required
              autoFocus
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio de venta ($)</label>
              <input
                required
                type="number"
                step="0.01"
                value={form.precioSugerido}
                onChange={(e) => setForm({ ...form, precioSugerido: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Costo aprox. ($, opcional)</label>
              <input
                type="number"
                step="0.01"
                value={form.costoUnitario}
                onChange={(e) => setForm({ ...form, costoUnitario: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.requiereTalla}
              onChange={(e) => setForm({ ...form, requiereTalla: e.target.checked })}
            />
            Tiene tallas o variantes (ej. camiseta S/M/L)
          </label>

          <details className="text-sm">
            <summary className="cursor-pointer text-indigo-600">Mas detalles (opcional)</summary>
            <div className="mt-2 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoria</label>
                <input
                  placeholder="General"
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unidad</label>
                <input
                  value={form.unidad}
                  onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripcion</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
            </div>
          </details>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700"
          >
            Guardar
          </button>
        </form>
      </Modal>

      <Modal
        open={!!variantesProducto}
        title={`Variantes de ${variantesProducto?.nombre || ''}`}
        onClose={() => setVariantesProducto(null)}
      >
        <div className="space-y-4">
          <table className="w-full text-sm">
            <thead className="text-gray-500 text-left">
              <tr>
                <th className="py-1">Variante</th>
                <th className="py-1">Stock</th>
                <th className="py-1">Estado</th>
                <th className="py-1"></th>
              </tr>
            </thead>
            <tbody>
              {variantes.map((v) => (
                <tr key={v._id} className="border-t border-gray-100 hover:bg-indigo-50/60 transition-colors">
                  <td className="py-1">{v.nombreVariante}</td>
                  <td className="py-1">{v.stock}</td>
                  <td className="py-1">{v.activo ? 'Activa' : 'Inactiva'}</td>
                  <td className="py-1 text-right">
                    <button
                      onClick={() => toggleVarianteActivo(v)}
                      className="text-gray-500 hover:underline text-xs"
                    >
                      {v.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
              {variantes.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400">
                    Sin variantes todavia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <form onSubmit={addVariante} className="flex gap-2 items-end border-t pt-3">
            {varianteError && <p className="text-sm text-red-600">{varianteError}</p>}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700">Nombre (talla/color)</label>
              <input
                required
                value={varianteForm.nombreVariante}
                onChange={(e) => setVarianteForm({ ...varianteForm, nombreVariante: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-gray-700">Stock</label>
              <input
                type="number"
                value={varianteForm.stock}
                onChange={(e) => setVarianteForm({ ...varianteForm, stock: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700"
            >
              Agregar
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}
