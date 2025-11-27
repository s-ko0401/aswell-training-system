import type { RoleCode } from './auth'

export interface UserSummary {
  userId: string
  companyId: string
  companyName: string
  loginId: string
  name: string
  email?: string
  flag: number
  createdAt: string
  updatedAt: string
  roles: RoleCode[]
}
