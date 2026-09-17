import { Link } from 'react-router-dom'
import { StatusBadge, PriorityBadge } from '../ui/StatusPriorityBadges.jsx'
import { formatRelativeTime } from '../../utils/formatters.js'

export function TicketTable({ tickets }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Ticket</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Prioridad</th>
            <th className="px-4 py-3">Asignado a</th>
            <th className="px-4 py-3">Actualizado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="font-semibold text-slate-800 hover:text-brand-600"
                >
                  {ticket.code}
                </Link>
                <p className="max-w-xs truncate text-xs text-slate-500">{ticket.title}</p>
              </td>
              <td className="px-4 py-3 text-slate-600">{ticket.clientName}</td>
              <td className="px-4 py-3">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="px-4 py-3 text-slate-600">{ticket.assignedToName ?? 'Sin asignar'}</td>
              <td className="px-4 py-3 text-slate-500">{formatRelativeTime(ticket.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
