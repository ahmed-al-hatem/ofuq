"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { appRoutes } from "@/constants/routes"
import {
  canSendMessage,
  assertConversationAccess,
  ensureConversationParticipant,
  getCurrentChatActorContext,
} from "@/lib/chat/access"
import { ensureSchoolOfficeConversationForPortalUser } from "@/lib/chat/queries"
import {
  failure,
  success,
  type ActionResult,
  validationFailure,
} from "@/lib/actions/action-result"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TablesInsert } from "@/types/database"

const sendInternalMessageSchema = z.object({
  conversation_id: z.preprocess(
    (value) => {
      const normalizedValue = String(value ?? "").trim()
      return normalizedValue === "" ? null : normalizedValue
    },
    z.string().uuid("المحادثة المحددة غير صالحة").nullable()
  ),
  body: z
    .string()
    .trim()
    .min(1, "نص الرسالة مطلوب")
    .max(2000, "نص الرسالة يجب ألا يتجاوز 2000 حرف"),
})

const conversationIdSchema = z.string().uuid("المحادثة المحددة غير صالحة")

export type InternalChatActionState =
  | ActionResult<{ conversationId: string }>
  | null

async function revalidateChatRoutes() {
  revalidatePath(appRoutes.dashboardChat)
  revalidatePath(appRoutes.portalChat)
}

async function markConversationAsReadForActor(
  conversationId: string
): Promise<ActionResult<void>> {
  const actorResult = await getCurrentChatActorContext()

  if (!actorResult.ok) {
    return actorResult
  }

  const accessResult = await assertConversationAccess(
    actorResult.data,
    conversationId
  )

  if (!accessResult.ok) {
    return accessResult
  }

  await ensureConversationParticipant(actorResult.data, conversationId)

  const supabase = await createSupabaseServerClient()
  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .is("deleted_at", null)
    .neq("sender_user_id", actorResult.data.user_id)

  if (messagesError || !messages) {
    return failure("تعذر تحديث حالة القراءة للمحادثة")
  }

  if (messages.length > 0) {
    const messageIds = messages.map((message) => message.id)
    const { data: existingReads } = await supabase
      .from("chat_message_reads")
      .select("message_id")
      .eq("user_id", actorResult.data.user_id)
      .in("message_id", messageIds)

    const readMessageIds = new Set(
      (existingReads ?? []).map((readRow) => readRow.message_id)
    )
    const unreadMessageIds = messageIds.filter(
      (messageId) => !readMessageIds.has(messageId)
    )

    if (unreadMessageIds.length > 0) {
      const readRecords: TablesInsert<"chat_message_reads">[] =
        unreadMessageIds.map((messageId) => ({
          tenant_id: actorResult.data.tenant_id,
          school_id: actorResult.data.school_id,
          message_id: messageId,
          user_id: actorResult.data.user_id,
        }))

      const { error: readInsertError } = await supabase
        .from("chat_message_reads")
        .upsert(readRecords, {
          onConflict: "message_id,user_id",
        })

      if (readInsertError) {
        return failure("تعذر حفظ حالة القراءة للمحادثة")
      }
    }
  }

  const { error: participantUpdateError } = await supabase
    .from("chat_participants")
    .update({
      last_read_at: new Date().toISOString(),
    })
    .eq("conversation_id", conversationId)
    .eq("user_id", actorResult.data.user_id)

  if (participantUpdateError) {
    return failure("تعذر تحديث آخر وقت قراءة للمحادثة")
  }

  await revalidateChatRoutes()

  return success(undefined)
}

export async function sendInternalChatMessage(
  _previousState: InternalChatActionState,
  formData: FormData
): Promise<InternalChatActionState> {
  const actorResult = await getCurrentChatActorContext()

  if (!actorResult.ok) {
    return actorResult
  }

  const parsedValues = sendInternalMessageSchema.safeParse({
    conversation_id: formData.get("conversation_id"),
    body: formData.get("body"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  let conversationId = parsedValues.data.conversation_id

  if (!conversationId && actorResult.data.kind === "portal") {
    const conversation = await ensureSchoolOfficeConversationForPortalUser(
      actorResult.data
    )
    conversationId = conversation.id
  }

  if (!conversationId) {
    return failure("يجب اختيار محادثة صالحة قبل إرسال الرسالة")
  }

  const accessResult = await assertConversationAccess(
    actorResult.data,
    conversationId
  )

  if (!accessResult.ok) {
    return accessResult
  }

  if (!canSendMessage(actorResult.data, accessResult.data)) {
    return failure("لا يمكن إرسال رسالة إلى هذه المحادثة في حالتها الحالية")
  }

  await ensureConversationParticipant(actorResult.data, conversationId)

  const supabase = await createSupabaseServerClient()
  const messageRecord: TablesInsert<"chat_messages"> = {
    tenant_id: actorResult.data.tenant_id,
    school_id: actorResult.data.school_id,
    conversation_id: conversationId,
    sender_user_id: actorResult.data.user_id,
    body: parsedValues.data.body,
    message_type: "text",
  }

  const { error: insertError } = await supabase
    .from("chat_messages")
    .insert(messageRecord)

  if (insertError) {
    return failure("تعذر إرسال الرسالة حاليًا")
  }

  const { error: conversationUpdateError } = await supabase
    .from("chat_conversations")
    .update({
      last_message_at: new Date().toISOString(),
      status: "open",
    })
    .eq("id", conversationId)
    .eq("tenant_id", actorResult.data.tenant_id)
    .eq("school_id", actorResult.data.school_id)

  if (conversationUpdateError) {
    return failure("تم حفظ الرسالة لكن تعذر تحديث المحادثة")
  }

  const markReadResult = await markConversationAsReadForActor(conversationId)

  if (!markReadResult.ok) {
    return markReadResult
  }

  await revalidateChatRoutes()

  return success(
    { conversationId },
    "تم إرسال الرسالة بنجاح"
  )
}

export async function markInternalConversationAsRead(
  conversationId: string
): Promise<ActionResult<void>> {
  const parsedConversationId = conversationIdSchema.safeParse(conversationId)

  if (!parsedConversationId.success) {
    return failure("المحادثة المحددة غير صالحة")
  }

  return markConversationAsReadForActor(parsedConversationId.data)
}
