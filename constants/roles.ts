export const USER_ROLES = {
  SYSTEM_ADMIN: "system_admin",
  SCHOOL_ADMIN: "school_admin",
  TEACHER: "teacher",
  PARENT: "parent",
  STUDENT: "student",
  ACCOUNTANT: "accountant",
  LIBRARIAN: "librarian",
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const ROLE_LABELS_AR = {
  [USER_ROLES.SYSTEM_ADMIN]: "مدير النظام",
  [USER_ROLES.SCHOOL_ADMIN]: "مدير المدرسة",
  [USER_ROLES.TEACHER]: "معلم",
  [USER_ROLES.PARENT]: "ولي أمر",
  [USER_ROLES.STUDENT]: "طالب",
  [USER_ROLES.ACCOUNTANT]: "محاسب",
  [USER_ROLES.LIBRARIAN]: "أمين مكتبة",
} as const satisfies Record<UserRole, string>

export const ROLE_GROUPS = {
  administration: [USER_ROLES.SYSTEM_ADMIN, USER_ROLES.SCHOOL_ADMIN],
  education: [USER_ROLES.TEACHER, USER_ROLES.STUDENT],
  family: [USER_ROLES.PARENT],
  operations: [USER_ROLES.ACCOUNTANT, USER_ROLES.LIBRARIAN],
} as const satisfies Record<string, readonly UserRole[]>

export function isUserRole(value: string): value is UserRole {
  return Object.values(USER_ROLES).includes(value as UserRole)
}

export function roleInGroup(
  role: UserRole,
  group: keyof typeof ROLE_GROUPS
): boolean {
  return (ROLE_GROUPS[group] as readonly UserRole[]).includes(role)
}
