import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import api from '../lib/api.js';
import StatTile from '../components/StatTile.jsx';
import { centsToDisplay, displayToCents } from '../lib/money.js';
import { SEQUENTIAL_ACCENT, CHROME } from '../lib/chartTheme.js';

const HORIZONTES = [
  { value: 'semana', label: 'Proxima semana' },
  { value: 'mes', label: 'Proximo mes' },
  { value: '3meses', label: 'Proximos 3 meses' },
  { value: '6meses', label: 'Proximos 6 meses' },
  { value: '12meses', label: 'Proximos 12 meses' },
  { value: 'fecha', label: 'Fecha especifica' },
  { value: 'personalizado', label: 'Rango personalizado' },
];

const METODOS = [
  { value: 'auto', label: 'Automatico (segun datos disponibles)' },
  { value: 'promedio_historico', label: 'Promedio historico' },
  { value: 'promedio_movil', label: 'Promedio movil (4 semanas)' },
  { value: 'tendencia_lineal', label: 'Tendencia lineal' },
];

const ESCENARIOS = [
  { value: 'pesimista', label: 'Pesimista (-20%)' },
  { value: 'base', label: 'Base' },
  { value: 'optimista', label: 'Optimista (+20%)' },
];

function toDateInput(value) {
  return new Date(value).toISOString().slice(0, 10);
}

export default function Proyecciones() {
  const [horizonte, setHorizonte] = useState('mes');
  const [fecha, setFecha] = useState(toDateInput(new Date()));
  const [desde, setDesde] = useState(toDateInput(new Date()));
  const [hasta, setHasta] = useState(toDateInput(new Date()));
  const [metodo, setMetodo] = useState('auto');
  const [escenario, setEscenario] = useState('base');
  const [metaManual, setMetaManual] = useState('');

  const [data, setData] = useState(null);
  const [pe, setPe] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = { horizonte, escenario };
    if (metodo !== 'auto') params.metodo = metodo;
    if (horizonte === 'fecha') params.fecha = fecha;
    if (horizonte === 'personalizado') {
      params.desde = desde;
      params.hasta = hasta;
    }

    const { data: proyeccion } = await api.get('/proyecciones', { params });
    setData(proyeccion);

    const { data: peData } = await api.get('/punto-equilibrio', {
      params: { desde: toDateInput(proyeccion.horizonte.desde), hasta: toDateInput(proyeccion.horizonte.hasta) },
    });
    setPe(peData);

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horizonte, fecha, desde, hasta, metodo, escenario]);

  const metaCentavos = metaManual ? displayToCents(metaManual) : null;
  const chartData = (data?.porProducto || []).map((p) => ({ nombre: p.nombre, unidades: p.unidadesProyectadas }));

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-4">Proyecciones</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 grid md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700">Horizonte</label>
          <select
            value={horizonte}
            onChange={(e) => setHorizonte(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {HORIZONTES.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </div>

        {horizonte === 'fecha' && (
          <div>
            <label className="block text-xs font-medium text-gray-700">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        )}

        {horizonte === 'personalizado' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700">Desde</label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Hasta</label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700">Metodo</label>
          <select
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {METODOS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Escenario</label>
          <select
            value={escenario}
            onChange={(e) => setEscenario(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {ESCENARIOS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Meta manual ($, opcional)</label>
          <input
            type="number"
            step="0.01"
            value={metaManual}
            onChange={(e) => setMetaManual(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {loading || !data ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="space-y-4">
          {data.confiabilidad.nivel !== 'alta' && (
            <p className="text-sm bg-amber-50 text-amber-700 border border-amber-200 rounded-lg p-3">
              {data.confiabilidad.advertencia}
            </p>
          )}

          <p className="text-xs text-gray-500">
            Metodo usado: <span className="font-medium">{data.metodo.replace('_', ' ')}</span> — Horizonte:{' '}
            {toDateInput(data.horizonte.desde)} a {toDateInput(data.horizonte.hasta)} ({data.horizonte.dias} dias) —
            Multiplicador estacional aplicado: x{data.multiplicadorEstacional.toFixed(2)}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile
              label="Ingresos proyectados"
              value={`$${centsToDisplay(data.ingresosProyectados)}`}
            />
            <StatTile
              label="Rango estimado"
              value={`$${centsToDisplay(data.rangoEstimado.minimo)} - $${centsToDisplay(data.rangoEstimado.maximo)}`}
            />
            <StatTile label="Costos variables proy." value={`$${centsToDisplay(data.costosVariablesProyectados)}`} />
            <StatTile label="Margen proyectado" value={`$${centsToDisplay(data.margenProyectado)}`} />
            <StatTile label="Costos fijos proy." value={`$${centsToDisplay(data.costosFijosProyectados)}`} />
            <StatTile
              label="Utilidad neta proyectada"
              value={`$${centsToDisplay(data.utilidadNetaProyectada)}`}
              tone={data.utilidadNetaProyectada >= 0 ? 'good' : 'bad'}
            />
            {pe && (
              <StatTile
                label="Punto de equilibrio (mismo periodo)"
                value={pe.puntoEquilibrio.monetario !== null ? `$${centsToDisplay(pe.puntoEquilibrio.monetario)}` : '-'}
                tone={
                  pe.puntoEquilibrio.monetario !== null && data.ingresosProyectados >= pe.puntoEquilibrio.monetario
                    ? 'good'
                    : 'bad'
                }
              />
            )}
            {metaCentavos !== null && (
              <StatTile
                label="vs. Meta manual"
                value={`${data.ingresosProyectados >= metaCentavos ? '+' : ''}$${centsToDisplay(
                  data.ingresosProyectados - metaCentavos
                )}`}
                tone={data.ingresosProyectados >= metaCentavos ? 'good' : 'bad'}
              />
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Unidades proyectadas por producto</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} stroke={CHROME.gridline} />
                <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: CHROME.textMuted }} />
                <YAxis tick={{ fontSize: 11, fill: CHROME.textMuted }} width={40} />
                <Tooltip formatter={(value) => [value, 'Unidades']} />
                <Bar dataKey="unidades" fill={SEQUENTIAL_ACCENT} radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
            {chartData.length === 0 && <p className="text-xs text-gray-400 text-center">Sin datos aun.</p>}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2">Producto</th>
                  <th className="px-4 py-2">Participacion</th>
                  <th className="px-4 py-2">Unidades proy.</th>
                  <th className="px-4 py-2">Ingresos asignados</th>
                  <th className="px-4 py-2">Costo variable proy.</th>
                </tr>
              </thead>
              <tbody>
                {data.porProducto.map((p) => (
                  <tr key={p.producto} className="border-t border-gray-100 hover:bg-indigo-50/60 transition-colors">
                    <td className="px-4 py-2">{p.nombre}</td>
                    <td className="px-4 py-2">{(p.participacion * 100).toFixed(1)}%</td>
                    <td className="px-4 py-2">{p.unidadesProyectadas}</td>
                    <td className="px-4 py-2">${centsToDisplay(p.ingresosAsignados)}</td>
                    <td className="px-4 py-2">${centsToDisplay(p.costoVariableProyectado)}</td>
                  </tr>
                ))}
                {data.porProducto.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-400 italic">
                      No hay suficiente historial para repartir la proyeccion por producto.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
