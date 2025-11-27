import { api } from './client'
import type { Role } from '@/types/role'

export interface CreateRolePayload {
  code: string
  nameJa: string
  description?: string
  sortOrder?: number
}

export interface UpdateRolePayload {
  code?: string
  nameJa?: string
  description?: string
  sortOrder?: number
}

export const listRoles = async () => {
  const { data } = await api.get<Role[]>('/roles')
  return data
}

export const createRole = async (payload: CreateRolePayload) => {
  const { data } = await api.post<Role>('/roles', payload)
  return data
}

export const updateRole = async (roleId: number, payload: UpdateRolePayload) => {
  const { data } = await api.put<Role>(`/roles/${roleId}`, payload)
  return data
}

export const deleteRole = async (roleId: number) => {
  await api.delete(`/roles/${roleId}`)
}
