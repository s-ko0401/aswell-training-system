import { api } from './client'
import type { UserSummary } from '@/types/user'
import type { RoleCode } from '@/types/auth'

export const listUsers = async (keyword?: string) => {
  const { data } = await api.get<UserSummary[]>('/users', { params: { keyword } })
  return data
}

export interface CreateUserPayload {
  loginId: string
  password: string
  name: string
  email?: string
  roleCode: RoleCode
  teacherId?: string
  flag?: number
}

export const createUser = async (payload: CreateUserPayload) => {
  const { data } = await api.post<UserSummary>('/users', payload)
  return data
}

export interface UpdateUserPayload {
  name: string
  email?: string
  roleCode: RoleCode
  teacherId?: string
  flag?: number
}

export const updateUser = async (userId: string, payload: UpdateUserPayload) => {
  const { data } = await api.put<UserSummary>(`/users/${userId}`, payload)
  return data
}

export const deleteUser = async (userId: string) => {
  await api.delete(`/users/${userId}`)
}
