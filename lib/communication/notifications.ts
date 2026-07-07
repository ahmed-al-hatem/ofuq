import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { CommunicationModuleContext } from "@/lib/communication/context"
import type { TablesInsert } from "@/types/database"
import type { NotificationLog } from "@/types/communication"

export type CreateNotificationInput = {
  recipient_user_id: string | null
  actor_user_id?: string | null
  notification_type: string
  title: string
  body?: string | null
  related_entity_type?: string | null
  related_entity_id?: string | null
}

export type NotificationListItem = NotificationLog & {
  recipient: { full_name: string } | null
  actor: { full_name: string } | null
}

async function assertActiveMember(
  context: CommunicationModuleContext,
  userId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("user_memberships")
    .select("id")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle()

  if (error || !data) {
    throw new Error("RECIPIENT_NOT_FOUND")
  }
}

export async function createNotificationLog(
  context: CommunicationModuleContext,
  input: CreateNotificationInput
): Promise<NotificationLog> {
  const supabase = await createSupabaseServerClient()

  if (input.recipient_user_id) {
    await assertActiveMember(context, input.recipient_user_id)
  }

  const record: TablesInsert<"notification_logs"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    recipient_user_id: input.recipient_user_id,
    actor_user_id: input.actor_user_id ?? context.user_id,
    channel: "in_app",
    notification_type: input.notification_type.trim(),
    title: input.title.trim(),
    body: input.body?.trim() || null,
    related_entity_type: input.related_entity_type?.trim() || null,
    related_entity_id: input.related_entity_id ?? null,
  }

  const { data, error } = await supabase
    .from("notification_logs")
    .insert(record)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function listNotificationLogs(
  context: CommunicationModuleContext,
  schoolWide = false,
  limit = 50
): Promise<NotificationListItem[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("notification_logs")
    .select(
      "*, recipient:user_profiles!notification_logs_recipient_user_id_fkey(full_name), actor:user_profiles!notification_logs_actor_user_id_fkey(full_name)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (!schoolWide) {
    query = query.eq("recipient_user_id", context.user_id)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data as unknown as NotificationListItem[]
}

export async function markNotificationAsRead(
  context: CommunicationModuleContext,
  notificationId: string,
  schoolWide = false
): Promise<NotificationLog> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("notification_logs")
    .update({ status: "read", read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)

  if (!schoolWide) {
    query = query.eq("recipient_user_id", context.user_id)
  }

  const { data, error } = await query.select("*").single()

  if (error || !data) {
    throw new Error("NOTIFICATION_NOT_FOUND")
  }

  return data
}
