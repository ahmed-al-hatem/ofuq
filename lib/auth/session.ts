import { USER_ROLE_LABELS_AR, type UserRole } from "@/constants/roles"
import type {
  AuthenticatedUser,
  SessionUser,
  UserMembership,
  UserProfile,
} from "@/types/auth"

export function buildSessionUser(
  profile: UserProfile,
  membership: UserMembership | null,
  email: string | null
): SessionUser {
  return {
    id: profile.id,
    email,
    full_name: profile.full_name,
    display_name: profile.display_name,
    role: membership?.role ?? null,
    tenant_id: membership?.tenant_id ?? null,
    school_id: membership?.school_id ?? null,
    membership,
  }
}

export function buildAuthenticatedUser(
  profile: UserProfile,
  membership: UserMembership | null,
  email: string | null
): AuthenticatedUser {
  return {
    ...buildSessionUser(profile, membership, email),
    profile,
  }
}

export function getRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS_AR[role]
}
