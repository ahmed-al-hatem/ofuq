import "server-only"

import { notFound, redirect } from "next/navigation"

import { appRoutes } from "@/constants/routes"
import { failure, success, type ActionResult } from "@/lib/actions/action-result"
import { requireActiveMembership } from "@/lib/actions/require-auth"
import { requireSchoolContext } from "@/lib/actions/require-tenant"
import { getCurrentAuthUser } from "@/lib/auth/session"
import { hasPortalStudentAccess, isPortalRole } from "@/lib/portal/access"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { PortalContext, PortalRole, PortalStudentLink } from "@/types/portal"
import { USER_ROLES } from "@/constants/roles"

export function assertPortalStudentAccess(
  scope: { linked_student_ids: readonly string[] },
  studentId: string
): void {
  if (!hasPortalStudentAccess(scope, studentId)) {
    notFound()
  }
}

async function listLinkedStudentIds(input: {
  userId: string
  role: PortalRole
  tenant_id: string
  school_id: string
}): Promise<string[]> {
  const supabase = await createSupabaseServerClient()

  if (input.role === USER_ROLES.PARENT) {
    const { data, error } = await supabase
      .from("student_guardians")
      .select("student_id")
      .eq("guardian_user_id", input.userId)
      .eq("tenant_id", input.tenant_id)
      .eq("school_id", input.school_id)

    if (error || !data) {
      return []
    }

    return [...new Set(data.map((row) => row.student_id))]
  }

  const { data, error } = await supabase
    .from("students")
    .select("id")
    .eq("student_user_id", input.userId)
    .eq("tenant_id", input.tenant_id)
    .eq("school_id", input.school_id)

  if (error || !data) {
    return []
  }

  return data.map((row) => row.id)
}

async function listLinkedStudents(input: {
  tenant_id: string
  school_id: string
  linked_student_ids: string[]
}): Promise<PortalStudentLink[]> {
  if (input.linked_student_ids.length === 0) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, student_number, status")
    .eq("tenant_id", input.tenant_id)
    .eq("school_id", input.school_id)
    .in("id", input.linked_student_ids)
    .order("full_name", { ascending: true })

  if (error || !data) {
    return []
  }

  return data
}

export async function requirePortalContext(): Promise<ActionResult<PortalContext>> {
  const authUser = await getCurrentAuthUser()

  if (!authUser) {
    redirect(appRoutes.login)
  }

  const membershipResult = await requireActiveMembership()

  if (!membershipResult.ok) {
    return membershipResult
  }

  if (!isPortalRole(membershipResult.data.membership.role)) {
    redirect(appRoutes.dashboard)
  }

  const schoolResult = requireSchoolContext(membershipResult.data)

  if (!schoolResult.ok) {
    return failure(schoolResult.error)
  }

  const linkedStudentIds = await listLinkedStudentIds({
    userId: membershipResult.data.id,
    role: membershipResult.data.membership.role,
    tenant_id: schoolResult.data.tenant_id,
    school_id: schoolResult.data.school_id,
  })

  const linkedStudents = await listLinkedStudents({
    tenant_id: schoolResult.data.tenant_id,
    school_id: schoolResult.data.school_id,
    linked_student_ids: linkedStudentIds,
  })

  return success({
    user: {
      id: membershipResult.data.id,
      email: membershipResult.data.email,
      full_name: membershipResult.data.full_name,
      display_name: membershipResult.data.display_name,
      role: membershipResult.data.membership.role,
    },
    profile: membershipResult.data.profile,
    membership: membershipResult.data.membership,
    role: membershipResult.data.membership.role,
    tenant_id: schoolResult.data.tenant_id,
    school_id: schoolResult.data.school_id,
    linked_student_ids: linkedStudentIds,
    linked_students: linkedStudents,
  })
}
