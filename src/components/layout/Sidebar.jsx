import { NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true, roles: ['admin', 'supervisor', 'agent'] },
  { to: '/tickets', label: 'Tickets', icon: '🎫', roles: ['admin', 'supervisor', 'agent'] },
  { to: '/clients', label: 'Clientes', icon: '🏢', roles: ['admin', 'supervisor', 'agent'] },
  { to: '/users', label: 'Usuarios', icon: '👥', roles: ['admin', 'supervisor'] },
]

export function Sidebar() {
  const { user } = useAuth()
  const items = NAV_ITEMS.filter((item) => item.roles.includes(user?.role))

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
        <span className="text-xl">🛟</span>
        <span className="text-sm font-bold text-slate-900">Support Desk</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-100 p-4 text-xs text-slate-400">
        Prueba tecnica Tech Lead FS JS
      </div>
    </aside>
  )
}
