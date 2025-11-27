import type { RoleCode } from '@/types/auth'

export const getDefaultPathForRoles = (roles: RoleCode[]) => {
  if (roles.includes('SYSTEM_ADMIN')) return '/system-admin'
  if (roles.includes('ADMIN')) return '/admin'
  if (roles.includes('TRAINER')) return '/trainer'
  return '/trainee'
}
