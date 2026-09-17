export const STATUS = {
  open: { label: 'Abierto', className: 'bg-blue-100 text-blue-700 ring-blue-200' },
  in_progress: { label: 'En progreso', className: 'bg-amber-100 text-amber-700 ring-amber-200' },
  pending_customer: { label: 'Esperando cliente', className: 'bg-purple-100 text-purple-700 ring-purple-200' },
  resolved: { label: 'Resuelto', className: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  closed: { label: 'Cerrado', className: 'bg-slate-200 text-slate-600 ring-slate-300' },
}

export const PRIORITY = {
  low: { label: 'Baja', className: 'bg-slate-100 text-slate-600 ring-slate-200' },
  medium: { label: 'Media', className: 'bg-sky-100 text-sky-700 ring-sky-200' },
  high: { label: 'Alta', className: 'bg-orange-100 text-orange-700 ring-orange-200' },
  critical: { label: 'Critica', className: 'bg-red-100 text-red-700 ring-red-200' },
}

export const ROLE = {
  admin: { label: 'Administrador', className: 'bg-indigo-100 text-indigo-700' },
  supervisor: { label: 'Supervisor', className: 'bg-teal-100 text-teal-700' },
  agent: { label: 'Agente de soporte', className: 'bg-cyan-100 text-cyan-700' },
}

export const STATUS_OPTIONS = Object.entries(STATUS).map(([value, meta]) => ({ value, ...meta }))
export const PRIORITY_OPTIONS = Object.entries(PRIORITY).map(([value, meta]) => ({ value, ...meta }))

export const NON_TERMINAL_STATUS_OPTIONS = STATUS_OPTIONS.filter((s) => s.value !== 'closed')
