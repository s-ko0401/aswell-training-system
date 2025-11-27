import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', to: '/system-admin' },
  { label: '企業管理', to: '/system-admin/companies' },
  { label: 'ユーザー管理', to: '/system-admin/users' },
  { label: '権限管理', to: '/system-admin/roles' },
]

export const Sidebar = () => {
  return (
    <aside className="flex h-full w-60 flex-col border-r bg-white/80 px-4 py-6 shadow-sm">
      <div className="mb-6 text-lg font-semibold text-slate-800">管理メニュー</div>
      <nav className="space-y-1 text-sm">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-md px-3 py-2 transition-colors',
                isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
