import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { fetchMe } from '@/api/auth'
import { authAtom, setAuthFromResponse } from '@/hook/authAtoms'
import type { AuthUser } from '@/types/auth'

type StoredAuthState = {
  token?: string | null
  user?: AuthUser | null
}

type Props = {
  children: React.ReactNode
}

/**
 * Bootstraps auth state on page reload:
 * - if a token exists but user info is missing, fetch /auth/me to restore the session
 * - if token is invalid, clear it
 */
export const AuthProvider = ({ children }: Props) => {
  const [auth, setAuth] = useAtom(authAtom)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const hydrate = async () => {
      let persisted: StoredAuthState | null = null
      const persistedString = localStorage.getItem('auth_state')
      if (persistedString) {
        try {
          persisted = JSON.parse(persistedString) as StoredAuthState
        } catch (err) {
          console.warn('Failed to parse stored auth_state', err)
        }
      }

      const storedToken = localStorage.getItem('auth_token')
      const token = auth.token || persisted?.token || storedToken
      const user = auth.user || persisted?.user || null

      // Ensure axios interceptor can pick up the token even if auth_token was wiped.
      if (token && !storedToken) {
        localStorage.setItem('auth_token', token)
      }

      // Restore the atom from persisted storage without forcing a network call when we already have the user.
      if ((!auth.token && token) || (!auth.user && user)) {
        setAuth({ token: token ?? null, user })
      }

      if (token && !user) {
        try {
          const me = await fetchMe()
          setAuth({ token, user: me })
        } catch (err: unknown) {
          const status = (err as { response?: { status?: number } }).response?.status
          if (status === 401 || status === 403) {
            // token invalid -> clear everything
            setAuth(setAuthFromResponse(null))
          }
        }
      }
      setHydrated(true)
    }
    hydrate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token, auth.user, setAuth])

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        セッションを確認しています...
      </div>
    )
  }

  return <>{children}</>
}
