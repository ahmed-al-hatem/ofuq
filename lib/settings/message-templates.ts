import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TablesUpdate } from "@/types/database"
import type { MessageTemplate, MessageTemplateStatus } from "@/types/settings"
import type { SettingsContext } from "@/lib/settings/context"

export type UpdateMessageTemplateInput = {
  id: string
  title: string
  body: string
  status: MessageTemplateStatus
}

export async function listMessageTemplates(
  context: SettingsContext
): Promise<MessageTemplate[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("message_templates")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("template_key", { ascending: true })
    .order("channel", { ascending: true })

  if (error || !data) {
    return []
  }

  return data
}

export async function updateMessageTemplate(
  context: SettingsContext,
  input: UpdateMessageTemplateInput
): Promise<MessageTemplate> {
  const supabase = await createSupabaseServerClient()
  const values: TablesUpdate<"message_templates"> = {
    title: input.title.trim(),
    body: input.body.trim(),
    status: input.status,
    updated_by_user_id: context.user_id,
  }

  const { data, error } = await supabase
    .from("message_templates")
    .update(values)
    .eq("id", input.id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "MESSAGE_TEMPLATE_NOT_FOUND")
  }

  return data
}
