import { presetHoy, presetSemana, presetMes } from '../lib/dateRanges.js';

export default function DateRangeFilter({ desde, hasta, onChange }) {
  return (
    <div className="flex flex-wrap items-end gap-2 mb-4">
      <button
        type="button"
        onClick={() => onChange(presetHoy())}
        className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
      >
        Hoy
      </button>
      <button
        type="button"
        onClick={() => onChange(presetSemana())}
        className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
      >
        Ultimos 7 dias
      </button>
      <button
        type="button"
        onClick={() => onChange(presetMes())}
        className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
      >
        Mes actual
      </button>
      <div className="flex items-end gap-2 ml-2">
        <div>
          <label className="block text-xs text-gray-500">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => onChange({ desde: e.target.value, hasta })}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => onChange({ desde, hasta: e.target.value })}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
