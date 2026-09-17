import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ticketsApi } from '../api/tickets.api.js'
import { usersApi } from '../api/users.api.js'
import { useAuth } from '../auth/useAuth.js'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ErrorState } from '../components/ui/EmptyState.jsx'
import { StatusBadge, PriorityBadge } from '../components/ui/StatusPriorityBadges.jsx'
import { CommentList } from '../components/tickets/CommentList.jsx'
import { CommentForm } from '../components/tickets/CommentForm.jsx'
import { formatDateTime } from '../utils/formatters.js'
import { NON_TERMINAL_STATUS_OPTIONS, PRIORITY_OPTIONS } from '../utils/constants.js'

export default function TicketDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [actionError, setActionError] = useState('')

  const ticketQuery = useQuery({
    queryKey: ['tickets', id, user.id],
    queryFn: () => ticketsApi.get(id, user),
  })
  const commentsQuery = useQuery({
    queryKey: ['tickets', id, 'comments'],
    queryFn: () => ticketsApi.listComments(id, user),
    enabled: Boolean(ticketQuery.data),
  })
  const historyQuery = useQuery({
    queryKey: ['tickets', id, 'history'],
    queryFn: () => ticketsApi.history(id, user),
    enabled: Boolean(ticketQuery.data),
  })

  const canAssign = user.role === 'admin' || user.role === 'supervisor'
  const { data: agents = [] } = useQuery({
    queryKey: ['users', 'agent'],
    queryFn: () => usersApi.list({ role: 'agent' }),
    enabled: canAssign,
  })

  function invalidateTicket() {
    queryClient.invalidateQueries({ queryKey: ['tickets', id] })
    queryClient.invalidateQueries({ queryKey: ['tickets'], exact: false })
  }

  const updateMutation = useMutation({
    mutationFn: (payload) => ticketsApi.update(id, payload, user),
    onSuccess: () => {
      setEditMode(false)
      invalidateTicket()
    },
    onError: (err) => setActionError(err.message),
  })

  const statusMutation = useMutation({
    mutationFn: (status) => ticketsApi.changeStatus(id, status, user),
    onSuccess: invalidateTicket,
    onError: (err) => setActionError(err.message),
  })

  const closeMutation = useMutation({
    mutationFn: () => ticketsApi.close(id, user),
    onSuccess: invalidateTicket,
    onError: (err) => setActionError(err.message),
  })

  const reopenMutation = useMutation({
    mutationFn: () => ticketsApi.reopen(id, user),
    onSuccess: invalidateTicket,
    onError: (err) => setActionError(err.message),
  })

  const assignMutation = useMutation({
    mutationFn: (assignedTo) => ticketsApi.assign(id, assignedTo, user),
    onSuccess: invalidateTicket,
    onError: (err) => setActionError(err.message),
  })

  const commentMutation = useMutation({
    mutationFn: (payload) => ticketsApi.addComment(id, payload, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', id, 'comments'] })
      invalidateTicket()
    },
    onError: (err) => setActionError(err.message),
  })

  if (ticketQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner label="Cargando ticket..." />
      </div>
    )
  }

  if (ticketQuery.isError) {
    return <ErrorState message={ticketQuery.error.message} />
  }

  const ticket = ticketQuery.data
  const canEdit = user.role === 'admin' || (user.role === 'agent' && ticket.assignedTo === user.id)
  const canChangeStatus = canEdit && ticket.status !== 'closed'
  const canClose = user.role === 'admin' && ticket.status !== 'closed'
  const canReopen = user.role === 'admin' && ticket.status === 'closed'
  const canMarkInternal = user.role === 'admin' || user.role === 'supervisor'

  function startEdit() {
    setEditForm({ title: ticket.title, description: ticket.description ?? '', priority: ticket.priority })
    setActionError('')
    setEditMode(true)
  }

  function submitEdit(event) {
    event.preventDefault()
    updateMutation.mutate(editForm)
  }

  return (
    <div className="space-y-6">
      <Link to="/tickets" className="text-sm text-slate-500 hover:text-brand-600">
        &larr; Volver a tickets
      </Link>

      <Card
        title={
          <span className="flex items-center gap-2 text-base">
            {ticket.code}
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </span>
        }
        actions={
          canEdit &&
          !editMode && (
            <Button variant="secondary" onClick={startEdit}>
              Editar
            </Button>
          )
        }
      >
        {actionError && (
          <div className="mb-4">
            <ErrorState message={actionError} />
          </div>
        )}

        {editMode ? (
          <form onSubmit={submitEdit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Titulo</label>
              <input
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Descripcion</label>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="max-w-xs">
              <label className="mb-1 block text-sm font-medium text-slate-700">Prioridad</label>
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditMode(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-slate-900">{ticket.title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
              {ticket.description || 'Sin descripcion.'}
            </p>

            <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Cliente" value={ticket.clientName} />
              <Info label="Creado por" value={ticket.createdByName} />
              <Info label="Asignado a" value={ticket.assignedToName ?? 'Sin asignar'} />
              <Info label="Creado" value={formatDateTime(ticket.createdAt)} />
              <Info label="Ultima actualizacion" value={formatDateTime(ticket.updatedAt)} />
              <Info label="Resuelto" value={formatDateTime(ticket.resolvedAt)} />
              <Info label="Cerrado" value={formatDateTime(ticket.closedAt)} />
            </dl>
          </>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Acciones" className="lg:col-span-1">
          <div className="space-y-4">
            {canChangeStatus && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Cambiar estado</label>
                <select
                  value={ticket.status}
                  disabled={statusMutation.isPending}
                  onChange={(e) => statusMutation.mutate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  {NON_TERMINAL_STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {canAssign && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Asignar / reasignar
                </label>
                <select
                  value={ticket.assignedTo ?? ''}
                  disabled={assignMutation.isPending}
                  onChange={(e) => e.target.value && assignMutation.mutate(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Sin asignar</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(canClose || canReopen) && (
              <div className="flex gap-2 pt-2">
                {canClose && (
                  <Button
                    variant="danger"
                    disabled={closeMutation.isPending}
                    onClick={() => closeMutation.mutate()}
                  >
                    Cerrar ticket
                  </Button>
                )}
                {canReopen && (
                  <Button
                    variant="secondary"
                    disabled={reopenMutation.isPending}
                    onClick={() => reopenMutation.mutate()}
                  >
                    Reabrir ticket
                  </Button>
                )}
              </div>
            )}

            {!canChangeStatus && !canAssign && !canClose && !canReopen && (
              <p className="text-sm text-slate-500">No tienes acciones disponibles sobre este ticket.</p>
            )}
          </div>
        </Card>

        <Card title="Historial" className="lg:col-span-2">
          {historyQuery.isLoading ? (
            <Spinner label="Cargando historial..." />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase text-slate-500">Cambios de estado</h4>
                <ul className="space-y-2 text-sm">
                  {historyQuery.data?.statusHistory.length ? (
                    historyQuery.data.statusHistory.map((h) => (
                      <li key={h.id} className="text-slate-600">
                        <span className="font-medium">{h.oldStatus ?? '—'}</span> &rarr;{' '}
                        <span className="font-medium">{h.newStatus}</span>
                        <span className="ml-2 text-xs text-slate-400">{formatDateTime(h.changedAt)}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">Sin cambios registrados.</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase text-slate-500">Reasignaciones</h4>
                <ul className="space-y-2 text-sm">
                  {historyQuery.data?.assignmentHistory.length ? (
                    historyQuery.data.assignmentHistory.map((h) => (
                      <li key={h.id} className="text-slate-600">
                        <span className="font-medium">{agentName(agents, h.oldAssignee)}</span> &rarr;{' '}
                        <span className="font-medium">{agentName(agents, h.newAssignee)}</span>
                        <span className="ml-2 text-xs text-slate-400">{formatDateTime(h.changedAt)}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">Sin reasignaciones registradas.</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card title="Comentarios">
        {commentsQuery.isLoading ? (
          <Spinner label="Cargando comentarios..." />
        ) : (
          <div className="space-y-5">
            <CommentList comments={commentsQuery.data} />
            <div className="border-t border-slate-100 pt-4">
              <CommentForm
                submitting={commentMutation.isPending}
                canMarkInternal={canMarkInternal}
                onSubmit={(payload) => commentMutation.mutate(payload)}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

function agentName(agents, id) {
  if (!id) return 'Sin asignar'
  return agents.find((a) => a.id === id)?.name ?? `Usuario #${id}`
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-slate-700">{value ?? '-'}</dd>
    </div>
  )
}
