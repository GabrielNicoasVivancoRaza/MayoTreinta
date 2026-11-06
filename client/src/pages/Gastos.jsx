import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import Modal from '../components/Modal.jsx';
import InfoBox from '../components/InfoBox.jsx';
import { centsToDisplay, displayToCents } from '../lib/money.js';

const emptyForm = {
  fecha: new Date().toISOString().slice(0, 10),
  categoria: '',
  monto: '0',
  descripcion: '',
  observaciones: '',
  esFijo: false,
};

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const [{ data: gastosData }, { data: categoriasData }] = await Promise.all([
      api.get('/gastos'),
      api.get('/categorias-gasto'),
    ]);
    setGastos(gastosData);
    setCategorias(categoriasData);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, categoria: categorias[0]?._id || '' });
    setError('');
    setModalOpen(true);
  }

  function openEdit(gasto) {
    setEditing(gasto);
    setForm({
      fecha: gasto.fecha ? gasto.fecha.slice(0, 10) : '',
      categoria: gasto.categoria,
      monto: centsToDisplay(gasto.monto),
      descripcion: gasto.descripcion,
      observaciones: gasto.observaciones || '',
      esFijo: gasto.esFijo,
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      fecha: form.fecha,
      categoria: form.categoria,
      monto: displayToCents(form.monto),
      descripcion: form.descripcion,
      observaciones: form.observaciones,
      esFijo: form.esFijo,
    };
    try {
      if (editing) {
        await api.put(`/gastos/${editing._id}`, payload);
      } else {
        await api.post('/gastos', payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar');
    }
  }

  async function handleDelete(gasto) {
    if (!window.confirm(`Eliminar el gasto "${gasto.descripcion}"?`)) return;
    await api.delete(`/gastos/${gasto._id}`);
    load();
  }

  function categoriaNombre(id) {
    return categorias.find((c) => c._id === id)?.nombre || '-';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Gastos</h1>
        <button
          onClick={openCreate}
          disabled={categorias.length === 0}
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          + Nuevo gasto
        </button>
      </div>

      <InfoBox>
        Aquí van los gastos puntuales de la operación del negocio (no de producir el pedido): un taxi, una compra de
        publicidad, arreglar la máquina, etc. Si un gasto se repite todos los meses igual, mejor ponlo en "Costos
        Fijos" en vez de registrarlo aquí cada vez.
      </InfoBox>

      {categorias.length === 0 && !loading && (
        <p className="text-sm text-amber-600 mb-4">
          Primero crea al menos una categoria de gasto en el modulo "Categorias de Gasto".
        </p>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Categoria</th>
                <th className="px-4 py-2">Descripcion</th>
                <th className="px-4 py-2">Monto</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((gasto) => (
                <tr key={gasto._id} className="border-t border-gray-100 hover:bg-indigo-50/60 transition-colors">
                  <td className="px-4 py-2">{gasto.fecha?.slice(0, 10)}</td>
                  <td className="px-4 py-2">{categoriaNombre(gasto.categoria)}</td>
                  <td className="px-4 py-2">{gasto.descripcion}</td>
                  <td className="px-4 py-2">${centsToDisplay(gasto.monto)}</td>
                  <td className="px-4 py-2">{gasto.esFijo ? 'Fijo' : 'Variable'}</td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button onClick={() => openEdit(gasto)} className="text-indigo-600 hover:underline">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(gasto)} className="text-red-500 hover:underline">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {gastos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400 italic">
                    No hay gastos todavia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} title={editing ? 'Editar gasto' : 'Nuevo gasto'} onClose={() => setModalOpen(false)}>
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
              <label className="block text-sm font-medium text-gray-700">Categoria</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {categorias.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripcion</label>
            <input
              required
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Monto ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 pb-2">
              <input
                type="checkbox"
                checked={form.esFijo}
                onChange={(e) => setForm({ ...form, esFijo: e.target.checked })}
              />
              Tiende a repetirse (informativo)
            </label>
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
