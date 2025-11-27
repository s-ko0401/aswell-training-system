import { atomWithStorage } from 'jotai/utils'
import type { AuthResponse, AuthUser } from '@/types/auth'

type AuthState = {
  token: string | null
  user: AuthUser | null
}

const defaultState: AuthState = {
  token: null,
  user: null,
}

export const authAtom = atomWithStorage<AuthState>('auth_state', defaultState)

export const setAuthFromResponse = (response: AuthResponse | null): AuthState => {
  if (!response) {
    localStorage.removeItem('auth_token')
    return defaultState
  }
  localStorage.setItem('auth_token', response.token)
  return {
    token: response.token,
    user: response.user,
  }
}
