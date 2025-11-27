export type RoleCode = 'SYSTEM_ADMIN' | 'ADMIN' | 'TRAINER' | 'TRAINEE' | string

export interface AuthUser {
  userId: string
  companyId: string
  companyName: string
  loginId: string
  name: string
  email?: string
  roles: RoleCode[]
}

export interface AuthResponse {
  token: string
  expiresAt: string
  user: AuthUser
}
