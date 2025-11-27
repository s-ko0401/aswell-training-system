import { useAtomValue } from 'jotai'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { authAtom } from '@/hook/authAtoms'

export const AdminPage = () => {
  const auth = useAtomValue(authAtom)
  return (
    <AdminLayout title="管理者ページ">
      <div className="space-y-2 text-slate-700">
        <div>ここは管理者ページのプレースホルダーです。</div>
        <div>ログインID: {auth.user?.loginId}</div>
        <div>権限: {auth.user?.roles.join(', ')}</div>
      </div>
    </AdminLayout>
  )
}
