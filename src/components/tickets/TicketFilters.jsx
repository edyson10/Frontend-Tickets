import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../utils/constants.js'

export function TicketFilters({ filters, onChange }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value || undefined, page: 1 })
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[220px] flex-1">
        <label className="mb-1 block text-xs font-medium text-slate-500">Buscar</label>
        <input
          type="text"
          value={filters.search ?? ''}
          onChange={(e) => update('search', e.target.value)}
          placeholder="Titulo o codigo (ej: TCK-000010)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Estado</label>
        <select
          value={filters.status ?? ''}
          onChange={(e) => update('status', e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          <option value="">Todos</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Prioridad</label>
        <select
          value={filters.priority ?? ''}
          onChange={(e) => update('priority', e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          <option value="">Todas</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
