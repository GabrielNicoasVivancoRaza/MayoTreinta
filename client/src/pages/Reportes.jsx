import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import DateRangeFilter from '../components/DateRangeFilter.jsx';
import { centsToDisplay } from '../lib/money.js';
import { presetMes } from '../lib/dateRanges.js';

async function descargarCsv(url, params, nombreArchivo) {
  const response = await api.get(url, { params, responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export default function Reportes() {
  const [{ desde, hasta }, setRango] = useState(presetMes());
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await api.get('/reportes/estado-resultados', { params: { desde, hasta } });
    setResultado(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta]);

  const filas = resultado
    ? [
        { concepto: 'Ingresos', monto: resultado.ingresos },
        { concepto: 'Costos variables', monto: -resultado.costosVariables },
        { concepto: 'Utilidad bruta', monto: resultado.utilidadBruta, destacado: true },
        { concepto: 'Costos fijos (prorrateados)', monto: -resultado.costosFijos },
        { concepto: 'Gastos', monto: -resultado.gastos },
        { concepto: 'Utilidad neta', monto: resultado.utilidadNeta, destacado: true },
      ]
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold text-gray-800">Reportes</h1>
      </div>
      <DateRangeFilter desde={desde} hasta={hasta} onChange={(r) => setRango(r)} />

      <div className="flex gap-2 mb-4">
        <button
          onClick={() =>
            descargarCsv(
              '/reportes/estado-resultados/csv',
              { desde, hasta },
              `estado-resultados_${desde}_${hasta}.csv`
            )
          }
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Descargar estado de resultados (CSV)
        </button>
        <button
          onClick={() => descargarCsv('/reportes/ventas/csv', { desde, hasta }, `ventas_${desde}_${hasta}.csv`)}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Descargar ventas del periodo (CSV)
        </button>
      </div>

      {loading || !resultado ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2">Concepto</th>
                <th className="px-4 py-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <tr
                  key={fila.concepto}
                  className={`border-t border-gray-100 hover:bg-indigo-50/60 transition-colors ${fila.destacado ? 'font-semibold bg-gray-50' : ''}`}
                >
                  <td className="px-4 py-2">{fila.concepto}</td>
                  <td
                    className={`px-4 py-2 text-right ${
                      fila.monto < 0 ? 'text-red-600' : fila.destacado ? 'text-green-700' : 'text-gray-700'
                    }`}
                  >
                    {fila.monto < 0 ? '-' : ''}${centsToDisplay(Math.abs(fila.monto))}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-gray-200">
                <td className="px-4 py-2 text-gray-500">Margen neto</td>
                <td className="px-4 py-2 text-right text-gray-500">{(resultado.margenNeto * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-500">Ventas en el periodo</td>
                <td className="px-4 py-2 text-right text-gray-500">{resultado.ventasCount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
