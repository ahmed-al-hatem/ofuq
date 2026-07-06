import type { UserRole } from "@/constants/roles"
import type { SchoolId, TenantId } from "@/types/tenant"

export type UserProfile = {
  id: string
  user_id: string
  full_name: string
  email: string
  role: UserRole
  tenant_id: TenantId | null
  school_id: SchoolId | null
  avatar_url?: string | null
}

export type SessionUser = {
  id: string
  email: string | null
  full_name: string
  role: UserRole
  tenant_id: TenantId | null
  school_id: SchoolId | null
}

export type AuthenticatedUser = SessionUser & {
  profile: UserProfile
}
