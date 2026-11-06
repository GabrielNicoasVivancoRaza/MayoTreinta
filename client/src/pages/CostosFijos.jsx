import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import Modal from '../components/Modal.jsx';
import InfoBox from '../components/InfoBox.jsx';
import { centsToDisplay, displayToCents } from '../lib/money.js';
import { COSTO_FIJO_FRECUENCIAS } from '../lib/constants.js';

const emptyForm = {
  nombre: '',
  monto: '0',
  frecuencia: COSTO_FIJO_FRECUENCIAS[0].value,
  fechaInicio: new Date().toISOString().slice(0, 10),
  fechaFin: '',
};

export default function CostosFijos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await api.get('/costos-fijos');
    setItems(data);
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

  function openEdit(item) {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      monto: centsToDisplay(item.monto),
      frecuencia: item.frecuencia,
      fechaInicio: item.fechaInicio ? item.fechaInicio.slice(0, 10) : '',
      fechaFin: item.fechaFin ? item.fechaFin.slice(0, 10) : '',
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      nombre: form.nombre,
      monto: displayToCents(form.monto),
      frecuencia: form.frecuencia,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin || null,
    };
    try {
      if (editing) {
        await api.put(`/costos-fijos/${editing._id}`, payload);
      } else {
        await api.post('/costos-fijos', payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar');
    }
  }

  async function toggleActivo(item) {
    await api.patch(`/costos-fijos/${item._id}/activo`, { activo: !item.activo });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Costos Fijos</h1>
        <button
          onClick={openCreate}
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700"
        >
          + Nuevo costo fijo
        </button>
      </div>

      <InfoBox>
        Aquí van los gastos que se repiten solos, pase lo que pase, vendas o no vendas: arriendo del local, internet,
        suscripciones, sueldo fijo, etc. El sistema los reparte automáticamente por día para calcular tu punto de
        equilibrio y tus reportes de utilidad.
      </InfoBox>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Monto</th>
                <th className="px-4 py-2">Frecuencia</th>
                <th className="px-4 py-2">Desde</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-t border-gray-100 hover:bg-indigo-50/60 transition-colors">
                  <td className="px-4 py-2">{item.nombre}</td>
                  <td className="px-4 py-2">${centsToDisplay(item.monto)}</td>
                  <td className="px-4 py-2 capitalize">{item.frecuencia}</td>
                  <td className="px-4 py-2">{item.fechaInicio ? item.fechaInicio.slice(0, 10) : ''}</td>
                  <td className="px-4 py-2">
                    <span className={item.activo ? 'text-green-600' : 'text-gray-400'}>
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-indigo-600 hover:underline">
                      Editar
                    </button>
                    <button onClick={() => toggleActivo(item)} className="text-gray-500 hover:underline">
                      {item.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400 italic">
                    No hay costos fijos todavia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Editar costo fijo' : 'Nuevo costo fijo'}
        onClose={() => setModalOpen(false)}
      >
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
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Frecuencia</label>
              <select
                value={form.frecuencia}
                onChange={(e) => setForm({ ...form, frecuencia: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {COSTO_FIJO_FRECUENCIAS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha inicio</label>
              <input
                type="date"
                required
                value={form.fechaInicio}
                onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha fin (opcional)</label>
              <input
                type="date"
                value={form.fechaFin}
                onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
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
