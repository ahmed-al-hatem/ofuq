import type { UserRole } from "@/constants/roles"
import type { SchoolId, TenantId } from "@/types/tenant"

export type UserProfile = {
  id: string
  full_name: string
  display_name: string | null
  avatar_url: string | null
  phone: string | null
  preferred_locale: string
  preferred_direction: "rtl" | "ltr"
}

export type MembershipStatus = "active" | "invited" | "suspended" | "archived"

export type UserMembership = {
  id: string
  user_id: string
  tenant_id: TenantId
  school_id: SchoolId | null
  role: UserRole
  status: MembershipStatus
  is_primary: boolean
}

export type SessionUser = {
  id: string
  email: string | null
  full_name: string
  display_name: string | null
  role: UserRole | null
  tenant_id: TenantId | null
  school_id: SchoolId | null
  membership: UserMembership | null
}

export type AuthenticatedUser = SessionUser & {
  profile: UserProfile
}
