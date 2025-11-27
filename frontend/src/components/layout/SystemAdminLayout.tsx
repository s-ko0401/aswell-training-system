import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

type Props = {
  title?: string
  children: React.ReactNode
}

export const SystemAdminLayout = ({ title, children }: Props) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto px-8 py-10">
            {title && <h1 className="mb-6 text-2xl font-semibold text-slate-900">{title}</h1>}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
