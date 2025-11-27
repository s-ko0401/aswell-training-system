import { api } from './client'
import type { AuthResponse } from '@/types/auth'

export interface LoginPayload {
  companyName: string
  loginId: string
  password: string
}

export interface RegisterPayload {
  companyName: string
  loginId: string
  password: string
  name: string
  email?: string
  roleCodes?: string[]
}

export const login = async (payload: LoginPayload) => {
  const { data } = await api.post<AuthResponse>('/auth/login', payload)
  return data
}

export const register = async (payload: RegisterPayload) => {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data
}

export const logout = async () => {
  await api.post('/auth/logout')
}

export const fetchMe = async () => {
  const { data } = await api.get<AuthResponse['user']>('/auth/me')
  return data
}
