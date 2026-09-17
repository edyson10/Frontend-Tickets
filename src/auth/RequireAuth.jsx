import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.js'
import { Spinner } from '../components/ui/Spinner.jsx'

export function RequireAuth() {
  const { isAuthenticated, initializing } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner label="Cargando sesion..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export function RequireRole({ roles, children }) {
  const { user } = useAuth()
  if (!roles.includes(user?.role)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center text-slate-500">
        <p className="text-lg font-semibold text-slate-700">Acceso restringido</p>
        <p>No tienes permisos para ver esta seccion con tu rol actual.</p>
      </div>
    )
  }
  return children
}
