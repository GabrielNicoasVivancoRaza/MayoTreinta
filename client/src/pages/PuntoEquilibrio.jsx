import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import DateRangeFilter from '../components/DateRangeFilter.jsx';
import StatTile from '../components/StatTile.jsx';
import InfoBox from '../components/InfoBox.jsx';
import { centsToDisplay, displayToCents } from '../lib/money.js';
import { presetMes } from '../lib/dateRanges.js';
import { SEQUENTIAL_ACCENT, STATUS } from '../lib/chartTheme.js';

function colorProgreso(pct) {
  if (pct === null) return STATUS.critical;
  if (pct >= 100) return STATUS.good;
  if (pct >= 60) return SEQUENTIAL_ACCENT;
  if (pct >= 30) return STATUS.warning;
  return STATUS.critical;
}

function Meter({ porcentaje }) {
  const pct = porcentaje === null ? 0 : Math.min(100, porcentaje);
  return (
    <div className="w-full">
      <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: colorProgreso(porcentaje) }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {porcentaje === null ? 'Sin datos suficientes' : `${porcentaje.toFixed(1)}% del punto de equilibrio`}
      </p>
    </div>
  );
}

function ResultadoPE({ data, titulo }) {
  if (!data) return null;
  return (
    <div className="space-y-4">
      {titulo && <h2 className="text-sm font-semibold text-gray-700">{titulo}</h2>}

      {data.confiabilidad.nivel === 'baja' && (
        <p className="text-sm bg-amber-50 text-amber-700 border border-amber-200 rounded-lg p-3">
          {data.confiabilidad.advertencia}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label="Punto de equilibrio ($)"
          value={data.puntoEquilibrio.monetario !== null ? `$${centsToDisplay(data.puntoEquilibrio.monetario)}` : '-'}
          hint="Cuanto necesitas vender en este periodo para no ganar ni perder."
        />
        <StatTile
          label="Punto de equilibrio (unidades)"
          value={data.puntoEquilibrio.unidades !== null ? Math.ceil(data.puntoEquilibrio.unidades) : '-'}
          hint="Lo mismo, pero en cantidad de productos vendidos."
        />
        <StatTile
          label="Ventas actuales ($)"
          value={`$${centsToDisplay(data.ventasActuales.monetario)}`}
          hint="Lo que ya llevas vendido en este periodo."
        />
        <StatTile
          label="Costos fijos del periodo"
          value={`$${centsToDisplay(data.costosFijosPeriodo)}`}
          hint="Arriendo, internet, etc. ya repartidos para estas fechas."
        />
        <StatTile
          label="Margen de contribucion (%)"
          value={`${(data.ratioMargenContribucion * 100).toFixed(1)}%`}
          hint="De cada $1 que vendes, cuanto te queda tras el costo del producto."
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Progreso hacia el punto de equilibrio</h3>
        <Meter porcentaje={data.progreso.porcentaje} />
        {data.progreso.faltanteMonetario > 0 && (
          <p className="text-sm text-gray-600 mt-3">
            Te faltan <span className="font-semibold">${centsToDisplay(data.progreso.faltanteMonetario)}</span>
            {data.progreso.sugerenciasFaltante.length > 0 && (
              <>
                {' '}
                (aprox.{' '}
                {data.progreso.sugerenciasFaltante
                  .map((s) => `${s.unidadesAprox} ${s.nombre}`)
                  .join(', o ')}
                )
              </>
            )}
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <p className="text-xs text-gray-400 px-4 pt-3">
          Esta tabla muestra, de lo que vendiste en la ventana historica, que tanto peso tiene cada producto y
          cuanto deja de ganancia por unidad.
        </p>
        <table className="w-full text-sm mt-2">
          <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2">Producto</th>
              <th className="px-4 py-2">Participacion</th>
              <th className="px-4 py-2">Precio prom.</th>
              <th className="px-4 py-2">Costo var. prom.</th>
              <th className="px-4 py-2">Margen contrib.</th>
            </tr>
          </thead>
          <tbody>
            {data.mix.map((m) => (
              <tr key={m.producto} className="border-t border-gray-100 hover:bg-indigo-50/60 transition-colors">
                <td className="px-4 py-2">{m.nombre}</td>
                <td className="px-4 py-2">{(m.participacion * 100).toFixed(1)}%</td>
                <td className="px-4 py-2">${centsToDisplay(m.precioPromedio)}</td>
                <td className="px-4 py-2">${centsToDisplay(m.costoVariablePromedio)}</td>
                <td className="px-4 py-2">${centsToDisplay(m.margenContribucion)}</td>
              </tr>
            ))}
            {data.mix.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400 italic">
                  No hay ventas en la ventana historica para calcular el mix.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PuntoEquilibrio() {
  const [{ desde, hasta }, setRango] = useState(presetMes());
  const [ventanaDias, setVentanaDias] = useState('90');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [simForm, setSimForm] = useState({
    ajustePrecioPorcentaje: '0',
    ajusteCostoPorcentaje: '0',
    costosFijosOverride: '',
    usarMixPersonalizado: false,
  });
  const [mixParticipaciones, setMixParticipaciones] = useState({});
  const [simulado, setSimulado] = useState(null);
  const [simulando, setSimulando] = useState(false);
  const [simError, setSimError] = useState('');

  async function load() {
    setLoading(true);
    setSimulado(null);
    const { data: peData } = await api.get('/punto-equilibrio', { params: { desde, hasta, ventanaDias } });
    setData(peData);
    setMixParticipaciones(
      Object.fromEntries(peData.mix.map((m) => [m.producto, (m.participacion * 100).toFixed(1)]))
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta, ventanaDias]);

  async function handleSimular(e) {
    e.preventDefault();
    setSimError('');
    setSimulando(true);
    try {
      const payload = {
        ajustePrecioPorcentaje: Number(simForm.ajustePrecioPorcentaje) || 0,
        ajusteCostoPorcentaje: Number(simForm.ajusteCostoPorcentaje) || 0,
        costosFijosOverride: simForm.costosFijosOverride ? displayToCents(simForm.costosFijosOverride) : null,
      };
      if (simForm.usarMixPersonalizado) {
        payload.mixOverride = Object.entries(mixParticipaciones).map(([producto, participacion]) => ({
          producto,
          participacion: Number(participacion) || 0,
        }));
      }
      const { data: resultado } = await api.post('/punto-equilibrio/simular', payload, {
        params: { desde, hasta, ventanaDias },
      });
      setSimulado(resultado);
    } catch (err) {
      setSimError(err.response?.data?.message || 'No se pudo simular');
    } finally {
      setSimulando(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-2">Punto de Equilibrio</h1>

      <InfoBox>
        El punto de equilibrio es cuánto necesitas vender para cubrir todos tus gastos (fijos + lo que te cuesta
        producir) sin ganar ni perder. Si vendes más que esa cifra, esa parte de ahí para arriba ya es ganancia.
      </InfoBox>

      <DateRangeFilter desde={desde} hasta={hasta} onChange={(r) => setRango(r)} />

      <div className="mb-4">
        <label className="text-sm text-gray-600 mr-2">Calcular el margen con ventas de los ultimos:</label>
        <select
          value={ventanaDias}
          onChange={(e) => setVentanaDias(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
        >
          <option value="30">30 dias</option>
          <option value="60">60 dias</option>
          <option value="90">90 dias</option>
          <option value="180">180 dias</option>
        </select>
        <p className="text-xs text-gray-400 mt-1">
          Entre mas historial de ventas uses, mas preciso es el calculo — pero si tu negocio cambio mucho
          recientemente (nuevos productos, nuevos precios), prueba con un rango mas corto.
        </p>
      </div>

      {loading || !data ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <>
          <ResultadoPE data={data} />

          <details className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-6">
            <summary className="cursor-pointer text-sm font-semibold text-gray-700">
              Simulador: "¿y si subo precios o bajan mis costos?" (opcional)
            </summary>
            <form onSubmit={handleSimular} className="space-y-3 mt-3">
              {simError && <p className="text-sm text-red-600">{simError}</p>}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Ajuste de precios (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={simForm.ajustePrecioPorcentaje}
                    onChange={(e) => setSimForm({ ...simForm, ajustePrecioPorcentaje: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Ajuste de costos (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={simForm.ajusteCostoPorcentaje}
                    onChange={(e) => setSimForm({ ...simForm, ajusteCostoPorcentaje: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Costos fijos del periodo ($, opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={centsToDisplay(data.costosFijosPeriodo)}
                    value={simForm.costosFijosOverride}
                    onChange={(e) => setSimForm({ ...simForm, costosFijosOverride: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={simForm.usarMixPersonalizado}
                    onChange={(e) => setSimForm({ ...simForm, usarMixPersonalizado: e.target.checked })}
                  />
                  Usar un mix de productos personalizado (participacion %)
                </label>
                {simForm.usarMixPersonalizado && (
                  <div className="mt-2 space-y-2">
                    {data.mix.map((m) => (
                      <div key={m.producto} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-40">{m.nombre}</span>
                        <input
                          type="number"
                          step="any"
                          value={mixParticipaciones[m.producto] ?? ''}
                          onChange={(e) =>
                            setMixParticipaciones({ ...mixParticipaciones, [m.producto]: e.target.value })
                          }
                          className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    ))}
                    <p className="text-xs text-gray-400">
                      Los porcentajes se normalizan automaticamente para sumar 100%.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={simulando}
                className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {simulando ? 'Simulando...' : 'Simular'}
              </button>
            </form>

            {simulado && (
              <div className="mt-6 border-t pt-4">
                <ResultadoPE data={simulado} titulo="Resultado simulado" />
              </div>
            )}
          </details>
        </>
      )}
    </div>
  );
}
