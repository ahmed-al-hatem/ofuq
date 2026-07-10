import "server-only"

import { USER_ROLES, getRoleLabel, type UserRole } from "@/constants/roles"
import { failure, success, type ActionResult } from "@/lib/actions/action-result"
import { requireActiveMembership } from "@/lib/actions/require-auth"
import { requirePortalContext } from "@/lib/portal/context"
import type { PortalContext, PortalStudentLink } from "@/types/portal"

export type AssistantDataDomain =
  | "overview"
  | "attendance"
  | "grades"
  | "finance"
  | "library"
  | "communication"
  | "timetable"

export type DashboardAssistantContext = {
  kind: "dashboard"
  user_id: string
  role: UserRole
  tenant_id: string
  school_id: string | null
  full_name: string
  display_name: string | null
}

export type PortalAssistantContext = PortalContext & {
  kind: "portal"
  user_id: string
  full_name: string
  display_name: string | null
}

export type AssistantActorContext =
  | DashboardAssistantContext
  | PortalAssistantContext

export type AssistantAccessPolicy = {
  allowed: boolean
  roleLabel: string
  scopeDescription: string
  allowedDomains: readonly AssistantDataDomain[]
  denialTitle?: string
  denialDescription?: string
}

const dashboardAssistantRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
  USER_ROLES.ACCOUNTANT,
  USER_ROLES.LIBRARIAN,
] as const

function buildPolicy(
  role: UserRole,
  allowed: boolean,
  scopeDescription: string,
  allowedDomains: readonly AssistantDataDomain[],
  denialTitle?: string,
  denialDescription?: string
): AssistantAccessPolicy {
  return {
    allowed,
    roleLabel: getRoleLabel(role),
    scopeDescription,
    allowedDomains,
    denialTitle,
    denialDescription,
  }
}

export function getAllowedAssistantDomains(
  role: UserRole
): readonly AssistantDataDomain[] {
  switch (role) {
    case USER_ROLES.SYSTEM_ADMIN:
    case USER_ROLES.SCHOOL_ADMIN:
      return [
        "overview",
        "attendance",
        "finance",
        "library",
        "communication",
      ]
    case USER_ROLES.TEACHER:
      return ["attendance", "grades", "timetable", "communication"]
    case USER_ROLES.PARENT:
      return ["attendance", "grades", "finance", "communication", "timetable"]
    case USER_ROLES.STUDENT:
      return ["attendance", "grades", "library", "communication", "timetable"]
    case USER_ROLES.ACCOUNTANT:
      return ["finance"]
    case USER_ROLES.LIBRARIAN:
      return ["library"]
  }
}

export function getAssistantScopeDescription(role: UserRole): string {
  switch (role) {
    case USER_ROLES.SYSTEM_ADMIN:
      return "قراءة المدرسة النشطة فقط، من دون أي تجميع عابر للمدارس أو كشف معرفات داخلية."
    case USER_ROLES.SCHOOL_ADMIN:
      return "ملخص المدرسة الحالية فقط ضمن حدود الحضور والمالية والمكتبة والتواصل."
    case USER_ROLES.TEACHER:
      return "صفوفك وموادك وجدولك فقط، من دون أي وصول مالي أو بيانات خارج تكليفاتك."
    case USER_ROLES.PARENT:
      return "الأبناء المرتبطون بحسابك فقط، مع حضورهم ودرجاتهم وفواتيرهم وإعلاناتهم."
    case USER_ROLES.STUDENT:
      return "بياناتك الشخصية فقط، مع حضورك ودرجاتك وجدولك وإعلاناتك وإعاراتك."
    case USER_ROLES.ACCOUNTANT:
      return "الملخصات المالية ضمن المدرسة الحالية فقط، من دون تفاصيل صحية أو أكاديمية غير لازمة."
    case USER_ROLES.LIBRARIAN:
      return "بيانات المكتبة فقط، مثل الفهرس والنسخ والإعارات ضمن المدرسة الحالية."
  }
}

export function getDashboardAssistantRestrictionCopy(role: UserRole) {
  if (role === USER_ROLES.SYSTEM_ADMIN) {
    return {
      title: "المساعد مقيد حتى تتوفر مدرسة نشطة",
      description:
        "يحافظ مساعد أُفُق في هذه المرحلة على عزل المدارس. إذا لم تكن العضوية الحالية مرتبطة بمدرسة نشطة فلن يتم عرض أي ملخصات عابرة للمدارس.",
    }
  }

  return {
    title: "هذه الصفحة غير متاحة لدورك الحالي",
    description:
      "مساعد أُفُق على لوحة التحكم مخصص للأدوار المدرسية والعملياتية فقط، بينما تبقى أدوار البوابة ضمن `/portal/assistant`.",
  }
}

export function getAssistantAccessPolicy(
  context: AssistantActorContext
): AssistantAccessPolicy {
  const scopeDescription = getAssistantScopeDescription(context.role)
  const allowedDomains = getAllowedAssistantDomains(context.role)

  if (context.kind === "portal") {
    return buildPolicy(context.role, true, scopeDescription, allowedDomains)
  }

  if (
    !dashboardAssistantRoles.includes(
      context.role as (typeof dashboardAssistantRoles)[number]
    )
  ) {
    const restriction = getDashboardAssistantRestrictionCopy(context.role)

    return buildPolicy(
      context.role,
      false,
      scopeDescription,
      [],
      restriction.title,
      restriction.description
    )
  }

  if (!context.school_id) {
    const restriction = getDashboardAssistantRestrictionCopy(context.role)

    return buildPolicy(
      context.role,
      false,
      scopeDescription,
      [],
      restriction.title,
      restriction.description
    )
  }

  return buildPolicy(context.role, true, scopeDescription, allowedDomains)
}

export function getPortalStudentAudienceLines(
  role: PortalAssistantContext["role"],
  linkedStudents: readonly PortalStudentLink[],
  preferredStudentId?: string | null
): string[] {
  if (role === USER_ROLES.STUDENT) {
    const selfStudent =
      linkedStudents.find((student) => student.id === preferredStudentId) ??
      linkedStudents[0]

    return selfStudent ? [selfStudent.full_name] : []
  }

  return linkedStudents.map((student) => student.full_name)
}

export async function getDashboardAssistantContext(): Promise<
  ActionResult<DashboardAssistantContext>
> {
  const membershipResult = await requireActiveMembership()

  if (!membershipResult.ok) {
    return membershipResult
  }

  return success({
    kind: "dashboard",
    user_id: membershipResult.data.id,
    role: membershipResult.data.membership.role,
    tenant_id: membershipResult.data.membership.tenant_id,
    school_id: membershipResult.data.membership.school_id,
    full_name: membershipResult.data.full_name,
    display_name: membershipResult.data.display_name,
  })
}

export async function getPortalAssistantContext(): Promise<
  ActionResult<PortalAssistantContext>
> {
  const portalResult = await requirePortalContext()

  if (!portalResult.ok) {
    return portalResult
  }

  return success({
    kind: "portal",
    user_id: portalResult.data.user.id,
    role: portalResult.data.role,
    user: portalResult.data.user,
    profile: portalResult.data.profile,
    membership: portalResult.data.membership,
    tenant_id: portalResult.data.tenant_id,
    school_id: portalResult.data.school_id,
    linked_student_ids: portalResult.data.linked_student_ids,
    linked_students: portalResult.data.linked_students,
    full_name: portalResult.data.user.full_name,
    display_name: portalResult.data.user.display_name,
  })
}

export async function getCurrentAssistantActorContext(): Promise<
  ActionResult<AssistantActorContext>
> {
  const membershipResult = await requireActiveMembership()

  if (!membershipResult.ok) {
    return membershipResult
  }

  if (
    membershipResult.data.membership.role === USER_ROLES.PARENT ||
    membershipResult.data.membership.role === USER_ROLES.STUDENT
  ) {
    const portalResult = await requirePortalContext()

    if (!portalResult.ok) {
      return failure(portalResult.error)
    }

    return success({
      kind: "portal",
      user_id: portalResult.data.user.id,
      role: portalResult.data.role,
      user: portalResult.data.user,
      profile: portalResult.data.profile,
      membership: portalResult.data.membership,
      tenant_id: portalResult.data.tenant_id,
      school_id: portalResult.data.school_id,
      linked_student_ids: portalResult.data.linked_student_ids,
      linked_students: portalResult.data.linked_students,
      full_name: portalResult.data.user.full_name,
      display_name: portalResult.data.user.display_name,
    })
  }

  return success({
    kind: "dashboard",
    user_id: membershipResult.data.id,
    role: membershipResult.data.membership.role,
    tenant_id: membershipResult.data.membership.tenant_id,
    school_id: membershipResult.data.membership.school_id,
    full_name: membershipResult.data.full_name,
    display_name: membershipResult.data.display_name,
  })
}
