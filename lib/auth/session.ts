import { ROLE_LABELS_AR, type UserRole } from "@/constants/roles"
import type { AuthenticatedUser, SessionUser, UserProfile } from "@/types/auth"

export function buildSessionUser(profile: UserProfile): SessionUser {
  return {
    id: profile.user_id,
    email: profile.email,
    full_name: profile.full_name,
    role: profile.role,
    tenant_id: profile.tenant_id,
    school_id: profile.school_id,
  }
}

export function buildAuthenticatedUser(profile: UserProfile): AuthenticatedUser {
  return {
    ...buildSessionUser(profile),
    profile,
  }
}

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS_AR[role]
}
