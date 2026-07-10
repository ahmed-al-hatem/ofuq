"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { appRoutes } from "@/constants/routes"
import { failure, success, validationFailure, type ActionResult } from "@/lib/actions/action-result"
import { buildAssistantContextDocument, renderAssistantContextDocument } from "@/lib/assistant/context"
import { generateAssistantReply } from "@/lib/assistant/gemini-client"
import { getCurrentAssistantActorContext, getAssistantAccessPolicy } from "@/lib/assistant/policies"
import {
  ensureAssistantConversation,
  getRecentAssistantHistory,
  insertAssistantMessage,
  touchAssistantConversation,
} from "@/lib/assistant/queries"
import { getAssistantSystemPrompt } from "@/lib/assistant/prompts"

const askAssistantSchema = z.object({
  conversation_id: z.preprocess(
    (value) => {
      const normalizedValue = String(value ?? "").trim()
      return normalizedValue === "" ? null : normalizedValue
    },
    z.string().uuid("المحادثة المحددة غير صالحة").nullable()
  ),
  message: z
    .string()
    .trim()
    .min(1, "نص السؤال مطلوب")
    .max(1500, "نص السؤال يجب ألا يتجاوز 1500 حرف"),
})

export type AssistantActionState =
  | ActionResult<{ conversationId: string; assistantMessageId: string }>
  | null

async function revalidateAssistantRoutes() {
  revalidatePath(appRoutes.dashboardAssistant)
  revalidatePath(appRoutes.portalAssistant)
}

function truncateConversationTitle(message: string) {
  const normalizedMessage = message.trim()
  const maxLength = 48

  if (normalizedMessage.length <= maxLength) {
    return normalizedMessage
  }

  return `${normalizedMessage.slice(0, maxLength - 1)}…`
}

function isModelHistoryMessage(
  message: Awaited<ReturnType<typeof getRecentAssistantHistory>>[number]
): message is Awaited<ReturnType<typeof getRecentAssistantHistory>>[number] & {
  role: "user" | "assistant"
} {
  return message.role === "user" || message.role === "assistant"
}

export async function askOfuqAssistant(
  _previousState: AssistantActionState,
  formData: FormData
): Promise<AssistantActionState> {
  const actorResult = await getCurrentAssistantActorContext()

  if (!actorResult.ok) {
    return actorResult
  }

  const policy = getAssistantAccessPolicy(actorResult.data)

  if (!policy.allowed) {
    return failure(
      policy.denialDescription ?? "لا تملك صلاحية استخدام مساعد أُفُق في هذا المسار."
    )
  }

  const parsedValues = askAssistantSchema.safeParse({
    conversation_id: formData.get("conversation_id"),
    message: formData.get("message"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const conversationResult = await ensureAssistantConversation({
      context: actorResult.data,
      requestedConversationId: parsedValues.data.conversation_id,
      initialMessage: parsedValues.data.message,
    })

    if (!conversationResult.ok) {
      return conversationResult
    }

    const userMessageResult = await insertAssistantMessage({
      context: actorResult.data,
      conversationId: conversationResult.data.id,
      role: "user",
      content: parsedValues.data.message,
    })

    if (!userMessageResult.ok) {
      return userMessageResult
    }

    await touchAssistantConversation({
      context: actorResult.data,
      conversationId: conversationResult.data.id,
      title: conversationResult.data.title === "محادثة جديدة"
        ? truncateConversationTitle(parsedValues.data.message)
        : undefined,
    })

    const recentHistory = await getRecentAssistantHistory(
      conversationResult.data.id
    )
    const contextDocument = await buildAssistantContextDocument({
      context: actorResult.data,
      recentMessages: recentHistory,
    })
    const systemInstruction = [
      getAssistantSystemPrompt(),
      "",
      "## السياق المصرح",
      renderAssistantContextDocument(contextDocument),
    ].join("\n")

    const geminiResult = await generateAssistantReply({
      systemInstruction,
      history: recentHistory
        .filter(isModelHistoryMessage)
        .map((message) => ({
          role: message.role,
          content: message.content,
        })),
    })

    if (!geminiResult.ok) {
      if (geminiResult.kind === "configuration_missing") {
        return failure(geminiResult.message)
      }

      return failure(
        "تعذر الحصول على رد من مساعد أُفُق الآن. يرجى المحاولة لاحقًا."
      )
    }

    const assistantMessageResult = await insertAssistantMessage({
      context: actorResult.data,
      conversationId: conversationResult.data.id,
      role: "assistant",
      content: geminiResult.text,
      model: geminiResult.model,
      tokenEstimate: geminiResult.usage.totalTokenCount,
      metadata: {
        prompt_token_count: geminiResult.usage.promptTokenCount,
        candidate_token_count: geminiResult.usage.candidateTokenCount,
      },
    })

    if (!assistantMessageResult.ok) {
      return assistantMessageResult
    }

    await touchAssistantConversation({
      context: actorResult.data,
      conversationId: conversationResult.data.id,
    })
    await revalidateAssistantRoutes()

    return success(
      {
        conversationId: conversationResult.data.id,
        assistantMessageId: assistantMessageResult.data.id,
      },
      "تم حفظ الرد بنجاح"
    )
  } catch {
    return failure(
      "تعذر الحصول على رد من مساعد أُفُق الآن. يرجى المحاولة لاحقًا."
    )
  }
}
