import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import Modal from '../components/Modal.jsx';
import { centsToDisplay, displayToCents } from '../lib/money.js';

const emptyForm = {
  fecha: new Date().toISOString().slice(0, 10),
  insumo: '',
  cantidad: '1',
  costoTotal: '0',
  proveedor: '',
  nota: '',
};

export default function ComprasInsumo() {
  const [compras, setCompras] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const [{ data: comprasData }, { data: insumosData }] = await Promise.all([
      api.get('/compras-insumo'),
      api.get('/insumos'),
    ]);
    setCompras(comprasData);
    setInsumos(insumosData);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm({ ...emptyForm, insumo: insumos[0]?._id || '' });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      fecha: form.fecha,
      insumo: form.insumo,
      cantidad: Number(form.cantidad),
      costoTotal: displayToCents(form.costoTotal),
      proveedor: form.proveedor || null,
      nota: form.nota || null,
    };
    try {
      await api.post('/compras-insumo', payload);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar');
    }
  }

  function insumoNombre(id) {
    return insumos.find((i) => i._id === id)?.nombre || '(insumo eliminado)';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Compras de Insumo</h1>
        <button
          onClick={openCreate}
          disabled={insumos.length === 0}
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          + Nueva compra
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Cada compra recalcula el costo promedio ponderado del insumo e incrementa su stock. No se pueden editar ni
        eliminar compras ya registradas.
      </p>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Insumo</th>
                <th className="px-4 py-2">Cantidad</th>
                <th className="px-4 py-2">Costo total</th>
                <th className="px-4 py-2">Costo prom. resultante</th>
                <th className="px-4 py-2">Proveedor</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((compra) => (
                <tr key={compra._id} className="border-t border-gray-100 hover:bg-indigo-50/60 transition-colors">
                  <td className="px-4 py-2">{compra.fecha?.slice(0, 10)}</td>
                  <td className="px-4 py-2">{insumoNombre(compra.insumo)}</td>
                  <td className="px-4 py-2">{compra.cantidad}</td>
                  <td className="px-4 py-2">${centsToDisplay(compra.costoTotal)}</td>
                  <td className="px-4 py-2">${centsToDisplay(compra.costoPromedioResultante)}</td>
                  <td className="px-4 py-2">{compra.proveedor || '-'}</td>
                </tr>
              ))}
              {compras.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400 italic">
                    No hay compras registradas todavia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} title="Nueva compra de insumo" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha</label>
              <input
                type="date"
                required
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Insumo</label>
              <select
                value={form.insumo}
                onChange={(e) => setForm({ ...form, insumo: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {insumos.map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.nombre} ({i.unidad})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cantidad</label>
              <input
                type="number"
                step="any"
                value={form.cantidad}
                onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Costo total ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.costoTotal}
                onChange={(e) => setForm({ ...form, costoTotal: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Proveedor (opcional)</label>
            <input
              value={form.proveedor}
              onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nota (opcional)</label>
            <input
              value={form.nota}
              onChange={(e) => setForm({ ...form, nota: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
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
