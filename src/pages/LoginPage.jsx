import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { Button } from '../components/ui/Button.jsx'
import { ErrorState } from '../components/ui/EmptyState.jsx'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname ?? '/'
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Ingresa tu correo y contrasena.')
      return
    }

    setLoading(true)
    try {
      await login({ email: email.trim(), password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message ?? 'No fue posible iniciar sesion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-3xl">🛟</p>
          <h1 className="mt-2 text-xl font-bold text-slate-900">Support Desk</h1>
          <p className="text-sm text-slate-500">Plataforma interna de gestion de tickets de soporte</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Correo electronico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="admin@demo.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="********"
            />
          </div>

          {error && <ErrorState message={error} />}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Ingresando...' : 'Iniciar sesion'}
          </Button>
        </form>
      </div>
    </div>
  )
}
