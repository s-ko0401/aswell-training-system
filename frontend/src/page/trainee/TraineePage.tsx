import { useAtomValue } from 'jotai'
import { authAtom } from '@/hook/authAtoms'

export const TraineePage = () => {
  const auth = useAtomValue(authAtom)
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-xl font-semibold text-slate-900">研修者ページ</h1>
        <p className="mt-2 text-sm text-slate-600">自分の企業と権限・ユーザー名を表示します。</p>
        <div className="mt-6 space-y-3 text-sm text-slate-700">
          <div>
            <div className="text-xs uppercase text-slate-500">企業</div>
            <div className="text-lg font-semibold text-slate-900">{auth.user?.companyName}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500">ユーザー名</div>
            <div className="font-semibold text-slate-900">{auth.user?.loginId}</div>
            <div className="text-xs text-slate-500">{auth.user?.name}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500">権限</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {auth.user?.roles.map((role) => (
                <span key={role} className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
