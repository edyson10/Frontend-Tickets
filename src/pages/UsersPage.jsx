import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/users.api.js'
import { useAuth } from '../auth/useAuth.js'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ErrorState, EmptyState } from '../components/ui/EmptyState.jsx'
import { RoleBadge } from '../components/ui/StatusPriorityBadges.jsx'

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'agent', label: 'Agente de soporte' },
  { value: 'supervisor', label: 'Supervisor o Lider operativo' },
]

const initialForm = { name: '', email: '', password: '', role: 'agent' }

export default function UsersPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const canCreate = user.role === 'admin'
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState('')

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list() })

  const mutation = useMutation({
    mutationFn: (payload) => usersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
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
    if (form.password.length < 8) {
      setFormError('La contrasena debe tener al menos 8 caracteres.')
      return
    }
    mutation.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-sm text-slate-500">
            Administradores, supervisores y agentes de soporte con acceso a la plataforma.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancelar' : '+ Nuevo usuario'}
          </Button>
        )}
      </div>

      {showForm && (
        <Card title="Crear usuario">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
                <input
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Correo</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="nombre@empresa.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Contrasena</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="Minimo 8 caracteres"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => update('role', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formError && <ErrorState message={formError} />}

            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creando...' : 'Crear usuario'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card bodyClassName="p-0">
        {usersQuery.isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner label="Cargando usuarios..." />
          </div>
        ) : usersQuery.isError ? (
          <div className="p-5">
            <ErrorState message={usersQuery.error.message} />
          </div>
        ) : usersQuery.data.length === 0 ? (
          <EmptyState title="No hay usuarios" />
        ) : (
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersQuery.data.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
