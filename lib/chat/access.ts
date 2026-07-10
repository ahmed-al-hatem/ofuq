import "server-only"

import { USER_ROLES } from "@/constants/roles"
import { failure, success, type ActionResult } from "@/lib/actions/action-result"
import { requireActiveMembership } from "@/lib/actions/require-auth"
import { requireSchoolContext } from "@/lib/actions/require-tenant"
import {
  canViewConversation,
  getConversationPortalOwnerId,
  canAccessDashboardSchoolOfficeChat,
  canSendMessage,
  getDashboardChatRestrictionCopy,
  SCHOOL_OFFICE_CONVERSATION_TYPE,
  type ChatActorContext,
  type ChatConversationAccessRecord,
  type DashboardChatContext,
  type PortalChatContext,
} from "@/lib/chat/policies"
import { requirePortalContext } from "@/lib/portal/context"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TablesInsert } from "@/types/database"

type ParticipantSelectRow = {
  user_id: string
}

export async function getDashboardChatContext(): Promise<
  ActionResult<DashboardChatContext>
> {
  const membershipResult = await requireActiveMembership()

  if (!membershipResult.ok) {
    return membershipResult
  }

  const schoolResult = requireSchoolContext(membershipResult.data)

  if (!schoolResult.ok) {
    return schoolResult
  }

  return success({
    kind: "dashboard",
    user_id: membershipResult.data.id,
    role: membershipResult.data.membership.role,
    tenant_id: schoolResult.data.tenant_id,
    school_id: schoolResult.data.school_id,
    full_name: membershipResult.data.full_name,
    display_name: membershipResult.data.display_name,
  })
}

export async function getPortalChatContext(): Promise<ActionResult<PortalChatContext>> {
  const portalResult = await requirePortalContext()

  if (!portalResult.ok) {
    return portalResult
  }

  return success({
    kind: "portal",
    user_id: portalResult.data.user.id,
    role: portalResult.data.role,
    tenant_id: portalResult.data.tenant_id,
    school_id: portalResult.data.school_id,
    full_name: portalResult.data.user.full_name,
    display_name: portalResult.data.user.display_name,
  })
}

export async function getCurrentChatActorContext(): Promise<
  ActionResult<ChatActorContext>
> {
  const membershipResult = await requireActiveMembership()

  if (!membershipResult.ok) {
    return membershipResult
  }

  const schoolResult = requireSchoolContext(membershipResult.data)

  if (!schoolResult.ok) {
    return schoolResult
  }

  if (
    membershipResult.data.membership.role === USER_ROLES.PARENT ||
    membershipResult.data.membership.role === USER_ROLES.STUDENT
  ) {
    return success({
      kind: "portal",
      user_id: membershipResult.data.id,
      role: membershipResult.data.membership.role,
      tenant_id: schoolResult.data.tenant_id,
      school_id: schoolResult.data.school_id,
      full_name: membershipResult.data.full_name,
      display_name: membershipResult.data.display_name,
    })
  }

  return success({
    kind: "dashboard",
    user_id: membershipResult.data.id,
    role: membershipResult.data.membership.role,
    tenant_id: schoolResult.data.tenant_id,
    school_id: schoolResult.data.school_id,
    full_name: membershipResult.data.full_name,
    display_name: membershipResult.data.display_name,
  })
}

export async function assertConversationAccess(
  context: ChatActorContext,
  conversationId: string
): Promise<ActionResult<ChatConversationAccessRecord>> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("chat_conversations")
    .select("id, tenant_id, school_id, type, metadata, subject, status, chat_participants(user_id)")
    .eq("id", conversationId)
    .maybeSingle()

  if (error || !data) {
    return failure("تعذر العثور على المحادثة المطلوبة")
  }

  const conversation: ChatConversationAccessRecord = {
    id: data.id,
    tenant_id: data.tenant_id,
    school_id: data.school_id,
    type: data.type,
    metadata: data.metadata,
    subject: data.subject,
    status: data.status,
    participant_user_ids: (data.chat_participants ?? []).map(
      (participant) => (participant as ParticipantSelectRow).user_id
    ),
  }

  if (!canViewConversation(context, conversation)) {
    return failure("لا تملك صلاحية الوصول إلى هذه المحادثة")
  }

  return success(conversation)
}

export async function ensureConversationParticipant(
  context: ChatActorContext,
  conversationId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const participantRecord: TablesInsert<"chat_participants"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    conversation_id: conversationId,
    user_id: context.user_id,
    role: context.role,
  }

  await supabase.from("chat_participants").upsert(participantRecord, {
    onConflict: "conversation_id,user_id",
  })
}

export {
  canAccessDashboardSchoolOfficeChat,
  canSendMessage,
  canViewConversation,
  getConversationPortalOwnerId,
  getDashboardChatRestrictionCopy,
  SCHOOL_OFFICE_CONVERSATION_TYPE,
}

export type {
  ChatActorContext,
  ChatConversationAccessRecord,
  DashboardChatContext,
  PortalChatContext,
}
