import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'ダッシュボード', to: '/admin' },
  { label: '研修テンプレ', to: '/admin/templates' },
  { label: '教育担当者', to: '/admin/trainers' },
  { label: '研修者', to: '/admin/trainees' },
  { label: '日報管理', to: '/admin/daily-reports' },
  { label: '質疑管理', to: '/admin/questions' },
  { label: 'アカウント管理', to: '/admin/accounts' },
]

export const AdminSidebar = () => {
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
