import "server-only"

import type { User } from "@supabase/supabase-js"

import { getRoleLabel as getSharedRoleLabel, type UserRole } from "@/constants/roles"
import { createSupabaseServerClient } from "@/lib/supabase/server"
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
  return getSharedRoleLabel(role)
}

export async function getCurrentAuthUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return null
  }

  return data.user
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data as UserProfile
}

export async function getUserMemberships(
  userId: string
): Promise<UserMembership[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("user_memberships")
    .select("*")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true })

  if (error || !data) {
    return []
  }

  return data as UserMembership[]
}

export async function getPrimaryMembership(
  userId: string
): Promise<UserMembership | null> {
  const memberships = await getUserMemberships(userId)

  return (
    memberships.find(
      (membership) => membership.status === "active" && membership.is_primary
    ) ??
    memberships.find((membership) => membership.status === "active") ??
    null
  )
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const authUser = await getCurrentAuthUser()

  if (!authUser) {
    return null
  }

  const profile = await getUserProfile(authUser.id)

  if (!profile) {
    return null
  }

  const membership = await getPrimaryMembership(authUser.id)

  return buildAuthenticatedUser(profile, membership, authUser.email ?? null)
}
