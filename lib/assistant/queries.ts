import "server-only"

import { appRoutes } from "@/constants/routes"
import { getRoleLabel } from "@/constants/roles"
import { failure, success, type ActionResult } from "@/lib/actions/action-result"
import {
  getAssistantAccessPolicy,
  type AssistantActorContext,
  type DashboardAssistantContext,
  type PortalAssistantContext,
} from "@/lib/assistant/policies"
import { getAssistantPromptSuggestions } from "@/lib/assistant/prompts"
import { getGeminiRuntimeStatus } from "@/lib/assistant/gemini-client"
import { formatChatTimestamp } from "@/lib/chat/presenters"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ChatComposerState, ChatConversationPreview, ChatMessageRecord } from "@/types/chat"
import type { Json, TablesInsert } from "@/types/database"

type AssistantConversationRow = {
  id: string
  title: string
  status: "active" | "archived"
  updated_at: string
}

type AssistantMessageRow = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  created_at: string
}

type AssistantPageReadyData = {
  status: "ready"
  runtimeStatus: ReturnType<typeof getGeminiRuntimeStatus>["status"]
  setupMessage: string | null
  sidebarTitle: string
  sidebarDescription: string
  sidebarEmptyDescription: string
  conversations: ChatConversationPreview[]
  activeConversationId: string | null
  threadTitle: string
  threadDescription: string
  phaseLabel: string
  note: string
  prompts: ReturnType<typeof getAssistantPromptSuggestions>
  emptyStateTitle: string
  emptyStateDescription: string
  messages: ChatMessageRecord[]
  composer: ChatComposerState
}

type AssistantPageRestrictedData = {
  status: "restricted"
  runtimeStatus: ReturnType<typeof getGeminiRuntimeStatus>["status"]
  setupMessage: string | null
  title: string
  description: string
}

export type AssistantPageData = AssistantPageReadyData | AssistantPageRestrictedData

function truncateText(value: string, maxLength = 120) {
  const normalizedValue = value.trim()

  if (normalizedValue.length <= maxLength) {
    return normalizedValue
  }

  return `${normalizedValue.slice(0, maxLength - 1)}…`
}

function buildAssistantComposerState(roleLabel: string): ChatComposerState {
  return {
    placeholder: `اكتب سؤالك إلى مساعد أُفُق ضمن نطاق ${roleLabel}...`,
    helperText:
      "المساعد في هذه المرحلة للقراءة فقط، ويعتمد على ملخصات خادمية مقيدة بالدور والمدرسة.",
    disabledLabel: "غير متاح",
    submitLabel: "إرسال السؤال",
    disabled: false,
  }
}

function getScopedSchoolId(context: AssistantActorContext): string {
  if (!context.school_id) {
    throw new Error("ASSISTANT_SCHOOL_CONTEXT_REQUIRED")
  }

  return context.school_id
}

async function listAssistantConversationRows(
  context: AssistantActorContext
): Promise<AssistantConversationRow[]> {
  if (context.kind === "dashboard" && !context.school_id) {
    return []
  }

  const schoolId = getScopedSchoolId(context)
  const supabase = await createSupabaseServerClient()
  const query = supabase
    .from("ai_conversations")
    .select("id, title, status, updated_at")
    .eq("tenant_id", context.tenant_id)
    .eq("user_id", context.user_id)
    .eq("role", context.role)
    .eq("school_id", schoolId)
    .order("updated_at", { ascending: false })
    .limit(12)

  const { data } = await query

  return (data ?? []) as AssistantConversationRow[]
}

async function listLatestAssistantMessagesByConversation(
  conversationIds: string[]
): Promise<Map<string, AssistantMessageRow>> {
  if (conversationIds.length === 0) {
    return new Map()
  }

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("ai_messages")
    .select("id, conversation_id, role, content, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false })

  const latestByConversation = new Map<string, AssistantMessageRow>()

  for (const row of data ?? []) {
    if (!latestByConversation.has(row.conversation_id)) {
      latestByConversation.set(row.conversation_id, {
        id: row.id,
        role: row.role as AssistantMessageRow["role"],
        content: row.content,
        created_at: row.created_at,
      })
    }
  }

  return latestByConversation
}

function getConversationHref(context: AssistantActorContext, conversationId: string) {
  const basePath =
    context.kind === "portal"
      ? appRoutes.portalAssistant
      : appRoutes.dashboardAssistant

  return `${basePath}?conversation=${conversationId}`
}

async function buildAssistantConversationPreviews(
  context: AssistantActorContext
): Promise<ChatConversationPreview[]> {
  const conversations = await listAssistantConversationRows(context)
  const latestMessages = await listLatestAssistantMessagesByConversation(
    conversations.map((conversation) => conversation.id)
  )

  return conversations.map((conversation) => {
    const latestMessage = latestMessages.get(conversation.id)

    return {
      id: conversation.id,
      href: getConversationHref(context, conversation.id),
      title: conversation.title,
      excerpt: latestMessage
        ? truncateText(latestMessage.content)
        : "لا توجد رسائل محفوظة بعد.",
      participantLabel:
        context.kind === "portal"
          ? "ضمن بياناتك المصرح بها"
          : `الدور الحالي: ${getRoleLabel(context.role)}`,
      lastMessageAt: latestMessage?.created_at ?? conversation.updated_at,
      unreadCount: 0,
      statusLabel: conversation.status === "active" ? "نشطة" : "مؤرشفة",
    }
  })
}

async function loadAssistantConversationMessages(
  context: AssistantActorContext,
  conversationId: string | null
): Promise<ChatMessageRecord[]> {
  if (!conversationId) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("ai_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  return ((data ?? []) as AssistantMessageRow[]).map((message) => ({
    id: message.id,
    authorName:
      message.role === "assistant"
        ? "مساعد أُفُق"
        : message.role === "system"
          ? "النظام"
          : context.display_name ?? context.full_name,
    authorRoleLabel:
      message.role === "assistant"
        ? "مساعد قراءة فقط"
        : message.role === "system"
          ? "رسالة نظام"
          : getRoleLabel(context.role),
    body: message.content,
    createdAt: formatChatTimestamp(message.created_at),
    variant:
      message.role === "assistant"
        ? "assistant"
        : message.role === "system"
          ? "system"
          : "current-user",
    meta: formatChatTimestamp(message.created_at),
  }))
}

async function resolveActiveAssistantConversationId(
  context: AssistantActorContext,
  requestedConversationId: string | null,
  conversations: ChatConversationPreview[]
) {
  if (!requestedConversationId) {
    return conversations[0]?.id ?? null
  }

  const requestedConversation = conversations.find(
    (conversation) => conversation.id === requestedConversationId
  )

  return requestedConversation?.id ?? conversations[0]?.id ?? null
}

function buildAssistantPageNote(
  roleLabel: string,
  scopeDescription: string,
  setupMessage: string | null
) {
  const baseNote = `الدور الحالي: ${roleLabel}. النطاق: ${scopeDescription}`

  if (!setupMessage) {
    return `${baseNote} المساعد يجيب بالعربية ويقرأ فقط من الملخصات الخادمية المقيدة.`
  }

  return `${baseNote} ${setupMessage}`
}

async function buildAssistantPageData(
  context: AssistantActorContext
): Promise<AssistantPageData> {
  const policy = getAssistantAccessPolicy(context)
  const runtime = getGeminiRuntimeStatus()

  if (!policy.allowed) {
    return {
      status: "restricted",
      runtimeStatus: runtime.status,
      setupMessage: runtime.setupMessage,
      title: policy.denialTitle ?? "الوصول مقيد",
      description: policy.denialDescription ?? "لا تملك صلاحية استخدام هذا المسار.",
    }
  }

  const conversations = await buildAssistantConversationPreviews(context)

  return {
    status: "ready",
    runtimeStatus: runtime.status,
    setupMessage: runtime.setupMessage,
    sidebarTitle: "جلسات المساعد",
    sidebarDescription:
      context.kind === "portal"
        ? "محفوظات الأسئلة السابقة ضمن بياناتك المصرح بها."
        : "محفوظات أسئلتك السابقة ضمن المدرسة الحالية فقط.",
    sidebarEmptyDescription:
      "ستظهر جلسات مساعد أُفُق هنا بعد إرسال أول سؤال وحفظه ضمن السجل.",
    conversations,
    activeConversationId: null,
    threadTitle: "محادثة مساعد أُفُق",
    threadDescription:
      "إجابات عربية مختصرة مبنية على ملخصات خادمية مقيدة بالدور والمدرسة الحالية.",
    phaseLabel: runtime.status === "configured" ? "Gemini MVP" : "تهيئة مطلوبة",
    note: buildAssistantPageNote(
      policy.roleLabel,
      policy.scopeDescription,
      runtime.setupMessage
    ),
    prompts: getAssistantPromptSuggestions(context.role),
    emptyStateTitle: "ابدأ أول سؤال",
    emptyStateDescription:
      "سيظهر تاريخ المحادثة هنا بعد إرسال أول سؤال وحفظ الرد في قاعدة البيانات.",
    messages: [],
    composer: buildAssistantComposerState(policy.roleLabel),
  }
}

export async function getDashboardAssistantPageData(input: {
  context: DashboardAssistantContext
  activeConversationId: string | null
}): Promise<AssistantPageData> {
  const pageData = await buildAssistantPageData(input.context)

  if (pageData.status !== "ready") {
    return pageData
  }

  const activeConversationId = await resolveActiveAssistantConversationId(
    input.context,
    input.activeConversationId,
    pageData.conversations
  )

  return {
    ...pageData,
    activeConversationId,
    messages: await loadAssistantConversationMessages(
      input.context,
      activeConversationId
    ),
  }
}

export async function getPortalAssistantPageData(input: {
  context: PortalAssistantContext
  activeConversationId: string | null
}): Promise<AssistantPageData> {
  const pageData = await buildAssistantPageData(input.context)

  if (pageData.status !== "ready") {
    return pageData
  }

  const activeConversationId = await resolveActiveAssistantConversationId(
    input.context,
    input.activeConversationId,
    pageData.conversations
  )

  return {
    ...pageData,
    activeConversationId,
    messages: await loadAssistantConversationMessages(
      input.context,
      activeConversationId
    ),
  }
}

function buildConversationTitle(message: string) {
  const normalizedMessage = message.trim()
  const maxLength = 48

  if (normalizedMessage.length <= maxLength) {
    return normalizedMessage
  }

  return `${normalizedMessage.slice(0, maxLength - 1)}…`
}

export async function getRecentAssistantHistory(
  conversationId: string
): Promise<AssistantMessageRow[]> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("ai_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(6)

  return ((data ?? []) as AssistantMessageRow[]).reverse()
}

export async function ensureAssistantConversation(input: {
  context: AssistantActorContext
  requestedConversationId: string | null
  initialMessage: string
}): Promise<ActionResult<{ id: string; title: string }>> {
  const schoolId = getScopedSchoolId(input.context)
  const supabase = await createSupabaseServerClient()

  if (input.requestedConversationId) {
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("id, title")
      .eq("id", input.requestedConversationId)
      .eq("tenant_id", input.context.tenant_id)
      .eq("school_id", schoolId)
      .eq("user_id", input.context.user_id)
      .eq("role", input.context.role)
      .maybeSingle()

    if (error || !data) {
      return failure("المحادثة المحددة غير صالحة ضمن نطاقك الحالي")
    }

    return success({
      id: data.id,
      title: data.title,
    })
  }

  const { data: existingConversation } = await supabase
    .from("ai_conversations")
    .select("id, title")
    .eq("tenant_id", input.context.tenant_id)
    .eq("school_id", schoolId)
    .eq("user_id", input.context.user_id)
    .eq("role", input.context.role)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingConversation) {
    return success({
      id: existingConversation.id,
      title: existingConversation.title,
    })
  }

  const conversationRecord: TablesInsert<"ai_conversations"> = {
    tenant_id: input.context.tenant_id,
    school_id: schoolId,
    user_id: input.context.user_id,
    role: input.context.role,
    title: buildConversationTitle(input.initialMessage),
    scope: "role_scoped",
    status: "active",
    metadata: {
      surface: input.context.kind,
      mode: "read_only",
    },
  }

  const { data, error } = await supabase
    .from("ai_conversations")
    .insert(conversationRecord)
    .select("id, title")
    .single()

  if (error || !data) {
    return failure("تعذر إنشاء جلسة مساعد أُفُق حاليًا")
  }

  return success({
    id: data.id,
    title: data.title,
  })
}

export async function insertAssistantMessage(input: {
  context: AssistantActorContext
  conversationId: string
  role: "user" | "assistant" | "system"
  content: string
  model?: string | null
  tokenEstimate?: number | null
  metadata?: Record<string, unknown>
}): Promise<ActionResult<{ id: string }>> {
  const schoolId = getScopedSchoolId(input.context)
  const supabase = await createSupabaseServerClient()
  const messageRecord: TablesInsert<"ai_messages"> = {
    tenant_id: input.context.tenant_id,
    school_id: schoolId,
    conversation_id: input.conversationId,
    role: input.role,
    content: input.content,
    model: input.model ?? null,
    token_estimate: input.tokenEstimate ?? null,
    metadata: (input.metadata ?? {}) as Json,
  }

  const { data, error } = await supabase
    .from("ai_messages")
    .insert(messageRecord)
    .select("id")
    .single()

  if (error || !data) {
    return failure("تعذر حفظ رسالة المساعد في السجل")
  }

  return success({ id: data.id })
}

export async function touchAssistantConversation(input: {
  context: AssistantActorContext
  conversationId: string
  title?: string
}): Promise<void> {
  const schoolId = getScopedSchoolId(input.context)
  const supabase = await createSupabaseServerClient()
  const updatePayload: {
    updated_at: string
    title?: string
  } = {
    updated_at: new Date().toISOString(),
  }

  if (input.title) {
    updatePayload.title = input.title
  }

  await supabase
    .from("ai_conversations")
    .update(updatePayload)
    .eq("id", input.conversationId)
    .eq("tenant_id", input.context.tenant_id)
    .eq("school_id", schoolId)
}
