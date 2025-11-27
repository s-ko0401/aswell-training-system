import { useAtomValue, useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { authAtom, setAuthFromResponse } from '@/hook/authAtoms'
import { logout as apiLogout } from '@/api/auth'

export const TopBar = () => {
  const auth = useAtomValue(authAtom)
  const setAuth = useSetAtom(authAtom)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await apiLogout()
    } catch (err) {
      console.warn('logout failed, clearing client session anyway', err)
    } finally {
      setAuth(setAuthFromResponse(null))
      navigate('/login', { replace: true })
    }
  }

  return (
    <header className="flex items-center justify-end gap-3 bg-white/90 px-6 py-3 shadow-sm ring-1 ring-slate-200">
      <div className="text-sm text-slate-700">
        {auth.user?.companyName} / {auth.user?.loginId}
      </div>
      <button
        className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        onClick={handleLogout}
      >
        ログアウト
      </button>
    </header>
  )
}
