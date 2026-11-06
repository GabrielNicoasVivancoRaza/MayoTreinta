import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import Modal from '../components/Modal.jsx';
import InfoBox from '../components/InfoBox.jsx';
import { MOVIMIENTO_MANUAL_TIPOS, MOVIMIENTO_DIRECCIONES } from '../lib/constants.js';

const emptyForm = {
  tipo: 'ajuste',
  objetivo: 'insumo',
  insumo: '',
  variante: '',
  cantidad: '1',
  direccion: 'entrada',
  motivo: '',
  observacion: '',
};

export default function MovimientosInventario() {
  const [movimientos, setMovimientos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const [{ data: movimientosData }, { data: insumosData }, { data: productosData }] = await Promise.all([
      api.get('/movimientos-inventario'),
      api.get('/insumos'),
      api.get('/productos'),
    ]);
    setMovimientos(movimientosData);
    setInsumos(insumosData);

    const productosConTalla = productosData.filter((p) => p.requiereTalla);
    const variantesPorProducto = await Promise.all(
      productosConTalla.map(async (producto) => {
        const { data } = await api.get(`/productos/${producto._id}/variantes`);
        return data.map((v) => ({ ...v, productoNombre: producto.nombre }));
      })
    );
    setVariantes(variantesPorProducto.flat());
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
      tipo: form.tipo,
      cantidad: Number(form.cantidad),
      direccion: form.direccion,
      motivo: form.motivo,
      observacion: form.observacion,
      insumo: form.objetivo === 'insumo' ? form.insumo : null,
      variante: form.objetivo === 'variante' ? form.variante : null,
    };
    try {
      await api.post('/movimientos-inventario', payload);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar');
    }
  }

  function insumoNombre(id) {
    return insumos.find((i) => i._id === id)?.nombre || '(insumo eliminado)';
  }

  function varianteNombre(id) {
    const v = variantes.find((item) => item._id === id);
    return v ? `${v.productoNombre} - ${v.nombreVariante}` : '(variante eliminada)';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Movimientos de Inventario</h1>
        <button
          onClick={openCreate}
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700"
        >
          + Registrar ajuste / dano
        </button>
      </div>

      <InfoBox>
        Este es el historial de todo lo que le pasa a tu inventario de insumos: cuando compras materia prima, cuando
        corriges un conteo a mano, o cuando algo se daña. Las entradas por compra y devoluciones se registran solas;
        aquí abajo solo usas el botón si necesitas corregir un stock manualmente.
      </InfoBox>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Cantidad</th>
                <th className="px-4 py-2">Direccion</th>
                <th className="px-4 py-2">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((mov) => (
                <tr key={mov._id} className="border-t border-gray-100 hover:bg-indigo-50/60 transition-colors">
                  <td className="px-4 py-2">{mov.fecha?.slice(0, 10)}</td>
                  <td className="px-4 py-2 capitalize">{mov.tipo.replace('_', ' ')}</td>
                  <td className="px-4 py-2">{mov.insumo ? insumoNombre(mov.insumo) : varianteNombre(mov.variante)}</td>
                  <td className="px-4 py-2">{mov.cantidad}</td>
                  <td className="px-4 py-2 capitalize">{mov.direccion}</td>
                  <td className="px-4 py-2">{mov.motivo || '-'}</td>
                </tr>
              ))}
              {movimientos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400 italic">
                    No hay movimientos todavia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} title="Registrar ajuste / dano" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {MOVIMIENTO_MANUAL_TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Direccion</label>
              <select
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {MOVIMIENTO_DIRECCIONES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Afecta a</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  checked={form.objetivo === 'insumo'}
                  onChange={() => setForm({ ...form, objetivo: 'insumo' })}
                />
                Insumo
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  checked={form.objetivo === 'variante'}
                  onChange={() => setForm({ ...form, objetivo: 'variante' })}
                />
                Variante de producto
              </label>
            </div>
          </div>

          {form.objetivo === 'insumo' ? (
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
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">Variante</label>
              <select
                value={form.variante}
                onChange={(e) => setForm({ ...form, variante: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Selecciona una variante</option>
                {variantes.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.productoNombre} - {v.nombreVariante}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            <label className="block text-sm font-medium text-gray-700">Motivo (opcional)</label>
            <input
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
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
