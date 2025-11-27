import { useAtomValue } from 'jotai'
import { Navigate } from 'react-router-dom'
import type { RoleCode } from '@/types/auth'
import { authAtom } from '@/hook/authAtoms'

type Props = {
  allowedRoles?: RoleCode[]
  children: React.ReactElement
}

export const ProtectedRoute = ({ allowedRoles, children }: Props) => {
  const auth = useAtomValue(authAtom)

  // If we have a token but user info is not yet loaded (during hydration), keep waiting.
  if (auth.token && !auth.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        セッションを復元しています...
      </div>
    )
  }

  if (!auth.user || !auth.token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = auth.user.roles.some((role) => allowedRoles.includes(role))
    if (!hasRole) {
      return <Navigate to="/login" replace />
    }
  }

  return children
}
