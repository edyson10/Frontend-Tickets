import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ticketsApi } from '../api/tickets.api.js'
import { clientsApi } from '../api/clients.api.js'
import { usersApi } from '../api/users.api.js'
import { useAuth } from '../auth/useAuth.js'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { ErrorState } from '../components/ui/EmptyState.jsx'
import { PRIORITY_OPTIONS } from '../utils/constants.js'

const initialForm = { title: '', description: '', clientId: '', priority: 'medium', assignedTo: '' }

export default function TicketCreatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState('')

  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: () => clientsApi.list() })
  const { data: agents = [] } = useQuery({
    queryKey: ['users', 'agent'],
    queryFn: () => usersApi.list({ role: 'agent' }),
  })

  const mutation = useMutation({
    mutationFn: (payload) => ticketsApi.create(payload, user),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      navigate(`/tickets/${ticket.id}`)
    },
    onError: (err) => setFormError(err.message),
  })

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (form.title.trim().length < 3) {
      setFormError('El titulo debe tener al menos 3 caracteres.')
      return
    }
    if (!form.clientId) {
      setFormError('Debes seleccionar un cliente.')
      return
    }

    mutation.mutate({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      clientId: Number(form.clientId),
      priority: form.priority,
      assignedTo: form.assignedTo ? Number(form.assignedTo) : undefined,
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nuevo ticket</h1>
        <p className="text-sm text-slate-500">Registra una nueva solicitud de soporte de un cliente.</p>
      </div>

      <Card>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Titulo *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="Ej: No puedo iniciar sesion"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Descripcion</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="Detalle del problema reportado..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Cliente *</label>
              <select
                value={form.clientId}
                onChange={(e) => update('clientId', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">Selecciona un cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company ?? c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Prioridad</label>
              <select
                value={form.priority}
                onChange={(e) => update('priority', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Asignar a (opcional)
            </label>
            <select
              value={form.assignedTo}
              onChange={(e) => update('assignedTo', e.target.value)}
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

          {formError && <ErrorState message={formError} />}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creando...' : 'Crear ticket'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
