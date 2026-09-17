import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { metricsApi } from '../api/metrics.api.js'
import { useAuth } from '../auth/useAuth.js'
import { StatCard, Card } from '../components/ui/Card.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ErrorState, EmptyState } from '../components/ui/EmptyState.jsx'
import { StatusBadge, PriorityBadge } from '../components/ui/StatusPriorityBadges.jsx'
import { formatRelativeTime } from '../utils/formatters.js'

export default function DashboardPage() {
  const { user } = useAuth()
  const canSeeOverdue = user.role === 'admin' || user.role === 'supervisor'

  const {
    data: summary,
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ['metrics', 'dashboard'], queryFn: () => metricsApi.dashboard() })

  const { data: overdue } = useQuery({
    queryKey: ['metrics', 'overdue'],
    queryFn: () => metricsApi.overdue(5),
    enabled: canSeeOverdue,
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner label="Cargando metricas..." />
      </div>
    )
  }

  if (isError) return <ErrorState message={error.message} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard operativo</h1>
        <p className="text-sm text-slate-500">
          Vision general del estado de los tickets de soporte.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de tickets" value={summary.totalTickets} />
        <StatCard label="Tickets abiertos" value={summary.totalOpen} accent="text-blue-600" />
        <StatCard
          label="Creados (ultimos 30 dias)"
          value={summary.last30Days.totalCreated}
          hint={`${summary.last30Days.closedPercentage}% cerrados en ese periodo`}
        />
        <StatCard
          label="Cerrados (ultimos 30 dias)"
          value={summary.last30Days.totalClosed}
          accent="text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Tickets por estado">
          <ul className="space-y-3">
            {summary.byStatus.map((row) => (
              <li key={row.status} className="flex items-center justify-between">
                <StatusBadge status={row.status} />
                <span className="text-sm font-semibold text-slate-700">{row.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Tickets por prioridad">
          <ul className="space-y-3">
            {summary.byPriority.map((row) => (
              <li key={row.priority} className="flex items-center justify-between">
                <PriorityBadge priority={row.priority} />
                <span className="text-sm font-semibold text-slate-700">{row.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Tickets abiertos por agente">
          {summary.openTicketsByAgent.length === 0 ? (
            <EmptyState title="Sin agentes" />
          ) : (
            <ul className="space-y-3">
              {summary.openTicketsByAgent.map((row) => (
                <li key={row.agentId} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{row.agentName}</span>
                  <span className="font-semibold text-slate-900">{row.openTickets}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Tiempo promedio de resolucion (horas)">
          <ul className="space-y-3">
            {summary.avgResolutionHoursByPriority.map((row) => (
              <li key={row.priority} className="flex items-center justify-between text-sm">
                <PriorityBadge priority={row.priority} />
                <span className="font-semibold text-slate-900">
                  {row.avgResolutionHours ?? '-'} h
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {canSeeOverdue && (
        <Card
          title="Tickets vencidos (+48h sin actualizacion)"
          subtitle="Visible para administrador y supervisor"
          actions={
            <Link to="/tickets" className="text-sm font-medium text-brand-600 hover:underline">
              Ver todos
            </Link>
          }
        >
          {!overdue || overdue.length === 0 ? (
            <EmptyState title="Sin tickets vencidos" description="Todo esta al dia." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {overdue.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <Link
                      to={`/tickets/${t.id}`}
                      className="text-sm font-semibold text-slate-800 hover:text-brand-600"
                    >
                      {t.code} · {t.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {t.clientName} · {t.assignedToName ?? 'Sin asignar'} · actualizado{' '}
                      {formatRelativeTime(t.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  )
}
