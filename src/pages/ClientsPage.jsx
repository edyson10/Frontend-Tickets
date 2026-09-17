import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clientsApi } from '../api/clients.api.js'
import { useAuth } from '../auth/useAuth.js'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ErrorState, EmptyState } from '../components/ui/EmptyState.jsx'

const initialForm = { name: '', email: '', company: '', phone: '' }

export default function ClientsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const canCreate = user.role === 'admin'
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState('')

  const clientsQuery = useQuery({ queryKey: ['clients', 'all'], queryFn: () => clientsApi.list() })

  const mutation = useMutation({
    mutationFn: (payload) => clientsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setForm(initialForm)
      setShowForm(false)
    },
    onError: (err) => setFormError(err.message),
  })

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    if (form.name.trim().length < 2) {
      setFormError('El nombre debe tener al menos 2 caracteres.')
      return
    }
    mutation.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim() || undefined,
      phone: form.phone.trim() || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500">
            Clientes que pueden asociarse a los tickets de soporte.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancelar' : '+ Nuevo cliente'}
          </Button>
        )}
      </div>

      {showForm && (
        <Card title="Crear cliente">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nombre de contacto</label>
                <input
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="Nombre del contacto"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Correo</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="contacto@empresa.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Empresa</label>
                <input
                  value={form.company}
                  onChange={(e) => update('company', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="Nombre de la empresa"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Telefono</label>
                <input
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="+57 300 000 0000"
                />
              </div>
            </div>

            {formError && <ErrorState message={formError} />}

            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creando...' : 'Crear cliente'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card bodyClassName="p-0">
        {clientsQuery.isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner label="Cargando clientes..." />
          </div>
        ) : clientsQuery.isError ? (
          <div className="p-5">
            <ErrorState message={clientsQuery.error.message} />
          </div>
        ) : clientsQuery.data.length === 0 ? (
          <EmptyState title="No hay clientes" />
        ) : (
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Telefono</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientsQuery.data.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-3 text-slate-600">{c.email}</td>
                  <td className="px-4 py-3 text-slate-600">{c.company ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{c.phone ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
