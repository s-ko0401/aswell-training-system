import { useAtomValue } from 'jotai'
import { SystemAdminLayout } from '@/components/layout/SystemAdminLayout'
import { authAtom } from '@/hook/authAtoms'

export const SystemAdminPage = () => {
  const auth = useAtomValue(authAtom)

  return (
    <SystemAdminLayout title="システム管理者ダッシュボード">
      <div className="space-y-4 text-sm text-slate-700">
        <p className="text-base font-semibold text-slate-900">ようこそ、{auth.user?.name ?? 'ユーザー'} さん</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <h3 className="text-xs uppercase tracking-wide text-slate-500">企業</h3>
            <p className="mt-2 text-lg font-semibold text-slate-900">{auth.user?.companyName}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <h3 className="text-xs uppercase tracking-wide text-slate-500">権限</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {auth.user?.roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <h3 className="text-xs uppercase tracking-wide text-slate-500">ユーザー名</h3>
            <p className="mt-2 font-semibold text-slate-900">{auth.user?.loginId}</p>
            <p className="text-xs text-slate-500">{auth.user?.email}</p>
          </div>
        </div>
        <p className="text-slate-500">企業管理・ユーザー管理・権限管理の機能はこのレイアウトの中に追加していきます。</p>
      </div>
    </SystemAdminLayout>
  )
}
