import { USER_ROLES, type UserRole } from "@/constants/roles"

export function isFixedRole(value: string): value is UserRole {
  return Object.values(USER_ROLES).includes(value as UserRole)
}

export function canManageSchool(role: UserRole): boolean {
  return role === USER_ROLES.SYSTEM_ADMIN || role === USER_ROLES.SCHOOL_ADMIN
}

export function isOperationsRole(role: UserRole): boolean {
  return role === USER_ROLES.ACCOUNTANT || role === USER_ROLES.LIBRARIAN
}
