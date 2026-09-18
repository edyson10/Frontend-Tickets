import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import { RoleBadge } from '../ui/StatusPriorityBadges.jsx'
import { Button } from '../ui/Button.jsx'

export function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex h-16 items-center justify-end border-b border-slate-200 bg-white px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
          <RoleBadge role={user?.role} />
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Cerrar sesion
        </Button>
      </div>
    </header>
  )
}
