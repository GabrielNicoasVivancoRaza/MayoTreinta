import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import Modal from '../components/Modal.jsx';
import InfoBox from '../components/InfoBox.jsx';

const emptyForm = { nombre: '', descripcion: '', enlaceInstagram: '', etiquetas: '' };

export default function Disenos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await api.get('/disenos');
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
      descripcion: item.descripcion || '',
      enlaceInstagram: item.enlaceInstagram || '',
      etiquetas: (item.etiquetas || []).join(', '),
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      enlaceInstagram: form.enlaceInstagram || null,
      etiquetas: form.etiquetas
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (editing) {
        await api.put(`/disenos/${editing._id}`, payload);
      } else {
        await api.post('/disenos', payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar');
    }
  }

  async function toggleActivo(item) {
    await api.patch(`/disenos/${item._id}/activo`, { activo: !item.activo });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Disenos</h1>
        <button
          onClick={openCreate}
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700"
        >
          + Nuevo diseno
        </button>
      </div>

      <InfoBox>
        Opcional: si quieres saber qué diseños se venden más (para el Dashboard), regístralos aquí y márcalos al
        hacer una venta. Si no te interesa ese dato, puedes ignorar esta pantalla sin problema.
      </InfoBox>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Etiquetas</th>
                <th className="px-4 py-2">Instagram</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-t border-gray-100 hover:bg-indigo-50/60 transition-colors">
                  <td className="px-4 py-2">{item.nombre}</td>
                  <td className="px-4 py-2">{(item.etiquetas || []).join(', ')}</td>
                  <td className="px-4 py-2">
                    {item.enlaceInstagram ? (
                      <a
                        href={item.enlaceInstagram}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        Ver
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
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
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400 italic">
                    No hay disenos todavia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} title={editing ? 'Editar diseno' : 'Nuevo diseno'} onClose={() => setModalOpen(false)}>
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
            <label className="block text-sm font-medium text-gray-700">Descripcion (opcional)</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Enlace Instagram (opcional)</label>
            <input
              value={form.enlaceInstagram}
              onChange={(e) => setForm({ ...form, enlaceInstagram: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Etiquetas (separadas por coma)</label>
            <input
              value={form.etiquetas}
              onChange={(e) => setForm({ ...form, etiquetas: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="floral, minimalista, personalizado"
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
