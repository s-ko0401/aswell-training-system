import { api } from './client'
import type { Company } from '@/types/company'

export interface CreateCompanyPayload {
  companyName: string
  billingEmail?: string
  adminLoginId: string
  adminPassword: string
  adminName: string
  adminEmail?: string
}

export interface UpdateCompanyPayload {
  companyName?: string
  billingEmail?: string
  flag?: number
}

const normalizeOptionalEmail = (value?: string | null) => {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : undefined
}

export const listCompanies = async (keyword?: string) => {
  const { data } = await api.get<Company[]>('/companies', { params: { keyword } })
  return data
}

export const createCompany = async (payload: CreateCompanyPayload) => {
  const { data } = await api.post<Company>('/companies', {
    ...payload,
    billingEmail: normalizeOptionalEmail(payload.billingEmail),
    adminEmail: normalizeOptionalEmail(payload.adminEmail),
  })
  return data
}

export const updateCompany = async (id: string, payload: UpdateCompanyPayload) => {
  const { data } = await api.put<Company>(`/companies/${id}`, {
    ...payload,
    billingEmail: normalizeOptionalEmail(payload.billingEmail),
  })
  return data
}

export const deleteCompany = async (id: string) => {
  await api.delete(`/companies/${id}`)
}
