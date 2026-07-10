import { USER_ROLES, type UserRole } from "@/constants/roles"
import type { Tables } from "@/types/database"
import type { PortalRole } from "@/types/portal"

export const SCHOOL_OFFICE_CONVERSATION_TYPE = "school_office"

export type DashboardChatContext = {
  kind: "dashboard"
  user_id: string
  role: UserRole
  tenant_id: string
  school_id: string
  full_name: string
  display_name: string | null
}

export type PortalChatContext = {
  kind: "portal"
  user_id: string
  role: PortalRole
  tenant_id: string
  school_id: string
  full_name: string
  display_name: string | null
}

export type ChatActorContext = DashboardChatContext | PortalChatContext

export type ChatConversationAccessRecord = Pick<
  Tables<"chat_conversations">,
  "id" | "tenant_id" | "school_id" | "type" | "metadata" | "subject" | "status"
> & {
  participant_user_ids: string[]
}

const dashboardSchoolOfficeRoles = [USER_ROLES.SCHOOL_ADMIN] as const

function normalizeMetadataValue(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const normalizedValue = value.trim()
  return normalizedValue.length > 0 ? normalizedValue : null
}

export function getConversationPortalOwnerId(
  conversation: Pick<Tables<"chat_conversations">, "metadata">
): string | null {
  const metadata = conversation.metadata

  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null
  }

  return normalizeMetadataValue(
    (metadata as Record<string, unknown>).portal_user_id
  )
}

export function canAccessDashboardSchoolOfficeChat(role: UserRole): boolean {
  return dashboardSchoolOfficeRoles.includes(
    role as (typeof dashboardSchoolOfficeRoles)[number]
  )
}

export function getDashboardChatRestrictionCopy(role: UserRole) {
  if (role === USER_ROLES.SYSTEM_ADMIN) {
    return {
      title: "الوصول مقيد في هذه المرحلة",
      description:
        "محادثات أولياء الأمور والطلاب ما تزال محصورة بمدير المدرسة ضمن المدرسة النشطة فقط، من دون أي تجاوز شامل على مستوى المستأجر.",
    }
  }

  return {
    title: "هذه المحادثات غير متاحة لدورك الحالي",
    description:
      "في Phase 25B يقتصر مسار محادثات أولياء الأمور والطلاب على مدير المدرسة فقط، بينما تبقى الأدوار الأخرى على حالة آمنة تمهيدية.",
  }
}

export function canViewConversation(
  context: ChatActorContext,
  conversation: ChatConversationAccessRecord
): boolean {
  if (
    conversation.tenant_id !== context.tenant_id ||
    conversation.school_id !== context.school_id ||
    conversation.type !== SCHOOL_OFFICE_CONVERSATION_TYPE
  ) {
    return false
  }

  if (context.kind === "dashboard") {
    return canAccessDashboardSchoolOfficeChat(context.role)
  }

  return (
    conversation.participant_user_ids.includes(context.user_id) &&
    getConversationPortalOwnerId(conversation) === context.user_id
  )
}

export function canSendMessage(
  context: ChatActorContext,
  conversation: ChatConversationAccessRecord
): boolean {
  return canViewConversation(context, conversation) && conversation.status === "open"
}
