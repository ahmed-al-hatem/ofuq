import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { CommunicationModuleContext } from "@/lib/communication/context"
import { createNotificationLog } from "@/lib/communication/notifications"
import type { TablesInsert } from "@/types/database"
import type { Message, MessageRecipient } from "@/types/communication"
import type { UserRole } from "@/constants/roles"

export type CommunicationUserOption = {
  id: string
  full_name: string
  display_name: string | null
  role: UserRole
}

export type SendMessageInput = {
  recipient_user_ids: string[]
  subject: string
  body: string
  related_student_id: string | null
}

export type InboxMessageListItem = MessageRecipient & {
  messages: (Message & {
    sender: { full_name: string; display_name: string | null } | null
  }) | null
}

export type SentMessageListItem = Message & {
  recipients: {
    recipient_user_id: string
    read_at: string | null
    archived_at: string | null
    recipient: { full_name: string; display_name: string | null } | null
  }[]
}

export type MessageDetails = Message & {
  sender: { full_name: string; display_name: string | null } | null
  recipients: {
    id: string
    recipient_user_id: string
    read_at: string | null
    archived_at: string | null
    recipient: { full_name: string; display_name: string | null } | null
  }[]
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)))
}

async function assertRelatedStudent(
  context: CommunicationModuleContext,
  studentId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("RELATED_STUDENT_NOT_FOUND")
  }
}

async function loadActiveMemberIds(
  context: CommunicationModuleContext,
  userIds: string[]
): Promise<Set<string>> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("user_memberships")
    .select("user_id")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")
    .in("user_id", userIds)

  if (error || !data) {
    return new Set()
  }

  return new Set(data.map((membership) => membership.user_id))
}

export async function listMessageRecipientOptions(
  context: CommunicationModuleContext
): Promise<CommunicationUserOption[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("user_memberships")
    .select("user_id, role, user_profiles(full_name, display_name)")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")
    .neq("user_id", context.user_id)
    .order("role", { ascending: true })

  if (error || !data) {
    return []
  }

  return data
    .map((membership) => {
      const profile = Array.isArray(membership.user_profiles)
        ? membership.user_profiles[0]
        : membership.user_profiles

      if (!profile) {
        return null
      }

      return {
        id: membership.user_id,
        role: membership.role,
        full_name: profile.full_name,
        display_name: profile.display_name,
      }
    })
    .filter(Boolean) as CommunicationUserOption[]
}

export async function sendMessage(
  context: CommunicationModuleContext,
  input: SendMessageInput
): Promise<Message> {
  const supabase = await createSupabaseServerClient()
  const recipientIds = uniqueValues(input.recipient_user_ids)

  if (recipientIds.length === 0) {
    throw new Error("MESSAGE_REQUIRES_RECIPIENT")
  }

  const activeMemberIds = await loadActiveMemberIds(context, recipientIds)

  if (activeMemberIds.size !== recipientIds.length) {
    throw new Error("RECIPIENT_NOT_FOUND")
  }

  if (input.related_student_id) {
    await assertRelatedStudent(context, input.related_student_id)
  }

  const messageRecord: TablesInsert<"messages"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    sender_user_id: context.user_id,
    subject: input.subject.trim(),
    body: input.body.trim(),
    related_student_id: input.related_student_id,
  }

  const { data: message, error: messageError } = await supabase
    .from("messages")
    .insert(messageRecord)
    .select("*")
    .single()

  if (messageError) {
    throw new Error(messageError.message)
  }

  const recipientRecords: TablesInsert<"message_recipients">[] =
    recipientIds.map((recipientUserId) => ({
      tenant_id: context.tenant_id,
      school_id: context.school_id,
      message_id: message.id,
      recipient_user_id: recipientUserId,
    }))

  const { error: recipientsError } = await supabase
    .from("message_recipients")
    .insert(recipientRecords)

  if (recipientsError) {
    throw new Error(recipientsError.message)
  }

  await Promise.all(
    recipientIds.map((recipientUserId) =>
      createNotificationLog(context, {
        recipient_user_id: recipientUserId,
        notification_type: "communication.message.sent",
        title: input.subject,
        body: "وصلتك رسالة داخلية جديدة.",
        related_entity_type: "message",
        related_entity_id: message.id,
      })
    )
  )

  return message
}

export async function listInboxMessages(
  context: CommunicationModuleContext,
  limit = 50
): Promise<InboxMessageListItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("message_recipients")
    .select(
      "*, messages(*, sender:user_profiles!messages_sender_user_id_fkey(full_name, display_name))"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("recipient_user_id", context.user_id)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data as unknown as InboxMessageListItem[]
}

export async function listSentMessages(
  context: CommunicationModuleContext,
  limit = 50
): Promise<SentMessageListItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("messages")
    .select(
      "*, recipients:message_recipients(recipient_user_id, read_at, archived_at, recipient:user_profiles!message_recipients_recipient_user_id_fkey(full_name, display_name))"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("sender_user_id", context.user_id)
    .order("sent_at", { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data as unknown as SentMessageListItem[]
}

export async function getMessageDetails(
  context: CommunicationModuleContext,
  messageId: string
): Promise<MessageDetails> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("messages")
    .select(
      "*, sender:user_profiles!messages_sender_user_id_fkey(full_name, display_name), recipients:message_recipients(id, recipient_user_id, read_at, archived_at, recipient:user_profiles!message_recipients_recipient_user_id_fkey(full_name, display_name))"
    )
    .eq("id", messageId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("MESSAGE_NOT_FOUND")
  }

  const details = data as unknown as MessageDetails
  const canRead =
    details.sender_user_id === context.user_id ||
    details.recipients.some(
      (recipient) => recipient.recipient_user_id === context.user_id
    )

  if (!canRead) {
    throw new Error("MESSAGE_NOT_FOUND")
  }

  return details
}

export async function markMessageAsRead(
  context: CommunicationModuleContext,
  messageId: string
): Promise<MessageRecipient> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("message_recipients")
    .update({ read_at: new Date().toISOString() })
    .eq("message_id", messageId)
    .eq("recipient_user_id", context.user_id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error("MESSAGE_RECIPIENT_NOT_FOUND")
  }

  return data
}

export async function archiveMessageForRecipient(
  context: CommunicationModuleContext,
  messageId: string
): Promise<MessageRecipient> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("message_recipients")
    .update({ archived_at: new Date().toISOString() })
    .eq("message_id", messageId)
    .eq("recipient_user_id", context.user_id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error("MESSAGE_RECIPIENT_NOT_FOUND")
  }

  return data
}
