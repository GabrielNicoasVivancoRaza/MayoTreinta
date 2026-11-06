import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import Modal from '../components/Modal.jsx';
import InfoBox from '../components/InfoBox.jsx';
import { centsToDisplay, displayToCents } from '../lib/money.js';
import { INSUMO_CATEGORIAS } from '../lib/constants.js';

const emptyForm = {
  nombre: '',
  categoria: INSUMO_CATEGORIAS[0].value,
  talla: '',
  color: '',
  tipo: '',
  unidad: '',
  stockActual: '0',
  stockMinimo: '0',
  costoPromedioUnitario: '0',
};

export default function Insumos() {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await api.get('/insumos');
    setInsumos(data);
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

  function openEdit(insumo) {
    setEditing(insumo);
    setForm({
      nombre: insumo.nombre,
      categoria: insumo.categoria,
      talla: insumo.talla || '',
      color: insumo.color || '',
      tipo: insumo.tipo || '',
      unidad: insumo.unidad,
      stockActual: String(insumo.stockActual),
      stockMinimo: String(insumo.stockMinimo),
      costoPromedioUnitario: centsToDisplay(insumo.costoPromedioUnitario),
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      nombre: form.nombre,
      categoria: form.categoria,
      talla: form.talla || null,
      color: form.color || null,
      tipo: form.tipo || null,
      unidad: form.unidad,
      stockActual: Number(form.stockActual),
      stockMinimo: Number(form.stockMinimo),
      costoPromedioUnitario: displayToCents(form.costoPromedioUnitario),
    };
    try {
      if (editing) {
        await api.put(`/insumos/${editing._id}`, payload);
      } else {
        await api.post('/insumos', payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar');
    }
  }

  async function toggleActivo(insumo) {
    await api.patch(`/insumos/${insumo._id}/activo`, { activo: !insumo.activo });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Insumos</h1>
        <button
          onClick={openCreate}
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700"
        >
          + Nuevo insumo
        </button>
      </div>

      <InfoBox>
        Este es tu inventario de materia prima: tela, tinta, papel transfer, empaques, etc. Sirve para saber cuánto
        tienes y cuánto te cuesta cada cosa. Es independiente de tus Productos — <strong>no necesitas tocar esto
        para poder vender</strong>, solo úsalo si quieres llevar el control de lo que compras y gastas en insumos.
      </InfoBox>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Categoria</th>
                <th className="px-4 py-2">Stock</th>
                <th className="px-4 py-2">Costo prom.</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {insumos.map((insumo) => (
                <tr key={insumo._id} className="border-t border-gray-100 hover:bg-indigo-50/60 transition-colors">
                  <td className="px-4 py-2">{insumo.nombre}</td>
                  <td className="px-4 py-2">{insumo.categoria}</td>
                  <td className="px-4 py-2">
                    {insumo.stockActual} {insumo.unidad}
                    {insumo.stockActual <= insumo.stockMinimo && (
                      <span className="ml-2 text-xs text-red-600 font-medium">bajo stock</span>
                    )}
                  </td>
                  <td className="px-4 py-2">${centsToDisplay(insumo.costoPromedioUnitario)}</td>
                  <td className="px-4 py-2">
                    <span className={insumo.activo ? 'text-green-600' : 'text-gray-400'}>
                      {insumo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button onClick={() => openEdit(insumo)} className="text-indigo-600 hover:underline">
                      Editar
                    </button>
                    <button onClick={() => toggleActivo(insumo)} className="text-gray-500 hover:underline">
                      {insumo.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
              {insumos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400 italic">
                    No hay insumos todavia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} title={editing ? 'Editar insumo' : 'Nuevo insumo'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoria</label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {INSUMO_CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Talla (opcional)</label>
              <input
                value={form.talla}
                onChange={(e) => setForm({ ...form, talla: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Color (opcional)</label>
              <input
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo (para tazas, opcional)</label>
            <input
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unidad</label>
            <input
              required
              placeholder="unidad, metro, litro, hoja..."
              value={form.unidad}
              onChange={(e) => setForm({ ...form, unidad: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock actual</label>
              <input
                type="number"
                step="any"
                value={form.stockActual}
                onChange={(e) => setForm({ ...form, stockActual: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock minimo</label>
              <input
                type="number"
                step="any"
                value={form.stockMinimo}
                onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Costo prom. ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.costoPromedioUnitario}
                onChange={(e) => setForm({ ...form, costoPromedioUnitario: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700"
          >
            Guardar
          </button>
        </form>
      </Modal>
    </div>
  );
}
