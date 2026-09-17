import { Badge } from './Badge.jsx'
import { STATUS, PRIORITY, ROLE } from '../../utils/constants.js'

export function StatusBadge({ status }) {
  const meta = STATUS[status] ?? { label: status, className: 'bg-slate-100 text-slate-600 ring-slate-200' }
  return <Badge label={meta.label} className={meta.className} />
}

export function PriorityBadge({ priority }) {
  const meta = PRIORITY[priority] ?? { label: priority, className: 'bg-slate-100 text-slate-600 ring-slate-200' }
  return <Badge label={meta.label} className={meta.className} />
}

export function RoleBadge({ role }) {
  const meta = ROLE[role] ?? { label: role, className: 'bg-slate-100 text-slate-600' }
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.className}`}>{meta.label}</span>
}
