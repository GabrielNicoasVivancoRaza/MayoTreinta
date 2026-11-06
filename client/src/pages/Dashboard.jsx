import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import api from '../lib/api.js';
import DateRangeFilter from '../components/DateRangeFilter.jsx';
import StatTile from '../components/StatTile.jsx';
import { centsToDisplay } from '../lib/money.js';
import { presetMes } from '../lib/dateRanges.js';
import { CATEGORICAL, SEQUENTIAL_ACCENT, STATUS, CHROME } from '../lib/chartTheme.js';

export default function Dashboard() {
  const [{ desde, hasta }, setRango] = useState(presetMes());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data: dashboardData } = await api.get('/dashboard', { params: { desde, hasta } });
    setData(dashboardData);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta]);

  const serieIngresos = (data?.serieIngresos || []).map((d) => ({
    fecha: d.fecha.slice(5),
    ingresos: Number(centsToDisplay(d.ingresos)),
  }));

  const topProductos = (data?.topProductos || []).map((p) => ({
    nombre: p.nombre,
    cantidad: p.cantidad,
  }));

  const pagosPorMetodo = ['Efectivo', 'Transferencia'].map((metodo) => ({
    metodo,
    monto: Number(centsToDisplay(data?.pagosPorMetodo?.[metodo] || 0)),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
      </div>
      <DateRangeFilter desde={desde} hasta={hasta} onChange={(r) => setRango(r)} />

      {loading || !data ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile label="Ingresos" value={`$${centsToDisplay(data.kpis.ingresos)}`} />
            <StatTile label="Costos variables" value={`$${centsToDisplay(data.kpis.costosVariables)}`} />
            <StatTile label="Costos fijos (prorrateo)" value={`$${centsToDisplay(data.kpis.costosFijos)}`} />
            <StatTile label="Gastos" value={`$${centsToDisplay(data.kpis.gastos)}`} />
            <StatTile
              label="Utilidad neta"
              value={
                data.kpis.utilidadNeta < 0
                  ? `-$${centsToDisplay(Math.abs(data.kpis.utilidadNeta))}`
                  : `$${centsToDisplay(data.kpis.utilidadNeta)}`
              }
              tone={data.kpis.utilidadNeta >= 0 ? 'good' : 'bad'}
            />
            <StatTile label="Margen neto" value={`${(data.kpis.margenNeto * 100).toFixed(1)}%`} />
            <StatTile label="Ventas registradas" value={data.kpis.ventasCount} />
            <StatTile label="Pedidos pendientes" value={data.pedidosPendientes.length} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Ingresos por dia</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={serieIngresos}>
                  <CartesianGrid vertical={false} stroke={CHROME.gridline} />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: CHROME.textMuted }} />
                  <YAxis tick={{ fontSize: 11, fill: CHROME.textMuted }} width={50} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Ingresos']} />
                  <Line
                    type="monotone"
                    dataKey="ingresos"
                    stroke={SEQUENTIAL_ACCENT}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Productos mas vendidos</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topProductos}>
                  <CartesianGrid vertical={false} stroke={CHROME.gridline} />
                  <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: CHROME.textMuted }} />
                  <YAxis tick={{ fontSize: 11, fill: CHROME.textMuted }} width={40} />
                  <Tooltip formatter={(value) => [value, 'Unidades']} />
                  <Bar dataKey="cantidad" fill={SEQUENTIAL_ACCENT} radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
              {topProductos.length === 0 && <p className="text-xs text-gray-400 text-center">Sin datos aun.</p>}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Efectivo vs Transferencia</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pagosPorMetodo}>
                  <CartesianGrid vertical={false} stroke={CHROME.gridline} />
                  <XAxis dataKey="metodo" tick={{ fontSize: 11, fill: CHROME.textMuted }} />
                  <YAxis tick={{ fontSize: 11, fill: CHROME.textMuted }} width={50} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Cobrado']} />
                  <Bar dataKey="monto" radius={[4, 4, 0, 0]} barSize={24}>
                    {pagosPorMetodo.map((entry, index) => (
                      <Cell key={entry.metodo} fill={CATEGORICAL[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Diseños con mas participacion</h2>
              {data.topDisenos.length === 0 ? (
                <p className="text-xs text-gray-400">Sin datos aun.</p>
              ) : (
                <ul className="space-y-1">
                  {data.topDisenos.map((d, i) => (
                    <li key={d.diseno} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {i + 1}. {d.nombre}
                      </span>
                      <span className="text-gray-500">{d.apariciones} unidades</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Alertas de stock bajo</h2>
              {data.stockBajo.length === 0 ? (
                <p className="text-xs text-gray-400">Todo el inventario esta por encima del minimo.</p>
              ) : (
                <ul className="space-y-1">
                  {data.stockBajo.map((i) => (
                    <li key={i._id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{i.nombre}</span>
                      <span style={{ color: i.stockActual <= 0 ? STATUS.critical : STATUS.warning }}>
                        {i.stockActual} / {i.stockMinimo} {i.unidad}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Pedidos pendientes</h2>
              {data.pedidosPendientes.length === 0 ? (
                <p className="text-xs text-gray-400">No hay pedidos pendientes.</p>
              ) : (
                <ul className="space-y-1">
                  {data.pedidosPendientes.map((v) => (
                    <li key={v._id} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {v.codigo} — {v.cliente?.nombre || 'Sin nombre'}
                      </span>
                      <span className="text-gray-500 capitalize">{v.estadoPedido.replace('_', ' ')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
