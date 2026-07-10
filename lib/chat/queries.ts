import "server-only"

import { appRoutes } from "@/constants/routes"
import { USER_ROLES, USER_ROLE_LABELS_AR, type UserRole } from "@/constants/roles"
import {
  canAccessDashboardSchoolOfficeChat,
  ensureConversationParticipant,
  getConversationPortalOwnerId,
  getDashboardChatRestrictionCopy,
  SCHOOL_OFFICE_CONVERSATION_TYPE,
  type ChatActorContext,
  type DashboardChatContext,
  type PortalChatContext,
} from "@/lib/chat/access"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  ChatComposerState,
  ChatConversationPreview,
  ChatMessageRecord,
} from "@/types/chat"
import type { Tables, TablesInsert } from "@/types/database"

type ConversationParticipantRow = {
  conversation_id: string
  user_id: string
  role: UserRole
  user_profiles:
    | {
        full_name: string
        display_name: string | null
      }
    | {
        full_name: string
        display_name: string | null
      }[]
    | null
}

type ConversationMessageSummaryRow = Pick<
  Tables<"chat_messages">,
  "id" | "conversation_id" | "sender_user_id" | "body" | "created_at"
>

type MessageReadRow = Pick<Tables<"chat_message_reads">, "message_id">

type MessageWithSenderRow = Pick<
  Tables<"chat_messages">,
  "id" | "body" | "created_at" | "message_type" | "sender_user_id"
> & {
  sender:
    | {
        full_name: string
        display_name: string | null
      }
    | {
        full_name: string
        display_name: string | null
      }[]
    | null
}

type ConversationProfile = {
  user_id: string
  role: UserRole
  name: string
}

type InternalChatReadyPageData = {
  status: "ready"
  sidebarTitle: string
  sidebarDescription: string
  conversations: ChatConversationPreview[]
  activeConversationId: string | null
  threadTitle: string
  threadDescription: string
  phaseLabel: string
  note: string
  emptyStateTitle: string
  emptyStateDescription: string
  messages: ChatMessageRecord[]
  composer: ChatComposerState
}

export type DashboardChatPageData =
  | InternalChatReadyPageData
  | {
      status: "restricted"
      title: string
      description: string
    }

export type PortalChatPageData = InternalChatReadyPageData

function getProfileName(
  profile:
    | {
        full_name: string
        display_name: string | null
      }
    | {
        full_name: string
        display_name: string | null
      }[]
    | null
): string {
  const normalizedProfile = Array.isArray(profile) ? profile[0] : profile

  if (!normalizedProfile) {
    return "مستخدم المدرسة"
  }

  return normalizedProfile.display_name?.trim() || normalizedProfile.full_name
}

function getConversationStatusLabel(status: string): string {
  switch (status) {
    case "closed":
      return "مغلقة"
    case "archived":
      return "مؤرشفة"
    default:
      return "مفتوحة"
  }
}

function buildConversationExcerpt(message: string | null): string {
  if (!message) {
    return "لا توجد رسائل بعد. ابدأ المحادثة الأولى ضمن هذا المسار."
  }

  const normalizedMessage = message.replace(/\s+/g, " ").trim()

  if (normalizedMessage.length <= 100) {
    return normalizedMessage
  }

  return `${normalizedMessage.slice(0, 97)}...`
}

function buildComposerState(kind: "dashboard" | "portal"): ChatComposerState {
  if (kind === "portal") {
    return {
      placeholder: "اكتب رسالتك إلى إدارة المدرسة",
      helperText:
        "تُعرض الردود هنا مباشرة عند توفر اتصال Realtime، مع بقاء التحقق من النطاق على الخادم.",
      disabledLabel: "الإرسال غير متاح",
      submitLabel: "إرسال",
      disabled: false,
    }
  }

  return {
    placeholder: "اكتب ردك إلى ولي الأمر أو الطالب",
    helperText:
      "تُحفظ الرسائل في المدرسة الحالية فقط، وتصل للطرف الآخر لحظيًا عند نجاح Realtime.",
    disabledLabel: "الإرسال غير متاح",
    submitLabel: "إرسال",
    disabled: false,
  }
}

function buildReadyPageData(input: {
  kind: "dashboard" | "portal"
  conversations: ChatConversationPreview[]
  activeConversationId: string | null
  threadTitle: string
  threadDescription: string
  note: string
  messages: ChatMessageRecord[]
}): InternalChatReadyPageData {
  return {
    status: "ready",
    sidebarTitle:
      input.kind === "dashboard" ? "قائمة المحادثات" : "سجل المراسلات",
    sidebarDescription:
      input.kind === "dashboard"
        ? "محادثات إدارة المدرسة مع أولياء الأمور والطلاب ضمن المدرسة الحالية."
        : "قناة مباشرة وآمنة لمراسلة إدارة المدرسة ضمن حسابك الحالي.",
    conversations: input.conversations,
    activeConversationId: input.activeConversationId,
    threadTitle: input.threadTitle,
    threadDescription: input.threadDescription,
    phaseLabel: "Realtime MVP",
    note: input.note,
    emptyStateTitle:
      input.kind === "dashboard"
        ? "لا توجد رسائل في هذه المحادثة بعد"
        : "لم تبدأ المراسلة بعد",
    emptyStateDescription:
      input.kind === "dashboard"
        ? "بمجرد وصول أول رسالة من ولي الأمر أو الطالب ستظهر هنا مع حالة القراءة."
        : "أرسل أول رسالة وستظهر الردود هنا من إدارة المدرسة داخل نفس المدرسة فقط.",
    messages: input.messages,
    composer: buildComposerState(input.kind),
  }
}

function buildDashboardThreadDescription(profile: ConversationProfile | null): string {
  if (!profile) {
    return "محادثة داخلية مباشرة ضمن المدرسة الحالية."
  }

  return `محادثة مباشرة مع ${USER_ROLE_LABELS_AR[profile.role]} ضمن المدرسة الحالية.`
}

function buildPortalOwnerProfile(
  conversation: Tables<"chat_conversations">,
  participants: ConversationParticipantRow[]
): ConversationProfile | null {
  const portalOwnerId = getConversationPortalOwnerId(conversation)

  const participant =
    participants.find((row) => row.user_id === portalOwnerId) ??
    participants.find(
      (row) => row.role === USER_ROLES.PARENT || row.role === USER_ROLES.STUDENT
    )

  if (!participant) {
    return null
  }

  return {
    user_id: participant.user_id,
    role: participant.role,
    name: getProfileName(participant.user_profiles),
  }
}

function buildConversationPreview(input: {
  conversation: Tables<"chat_conversations">
  latestMessage: ConversationMessageSummaryRow | null
  unreadCount: number
  participants: ConversationParticipantRow[]
  context: ChatActorContext
}): ChatConversationPreview {
  const portalOwner = buildPortalOwnerProfile(
    input.conversation,
    input.participants
  )

  if (input.context.kind === "dashboard") {
    const ownerRoleLabel = portalOwner
      ? USER_ROLE_LABELS_AR[portalOwner.role]
      : "مستخدم البوابة"

    return {
      id: input.conversation.id,
      href: `${appRoutes.dashboardChat}?conversation=${input.conversation.id}`,
      title: portalOwner?.name ?? "محادثة مدرسية",
      excerpt: buildConversationExcerpt(input.latestMessage?.body ?? null),
      participantLabel: ownerRoleLabel,
      lastMessageAt:
        input.conversation.last_message_at ?? input.latestMessage?.created_at ?? null,
      unreadCount: input.unreadCount,
      statusLabel: getConversationStatusLabel(input.conversation.status),
    }
  }

  return {
    id: input.conversation.id,
    href: `${appRoutes.portalChat}?conversation=${input.conversation.id}`,
    title: "مراسلة إدارة المدرسة",
    excerpt: buildConversationExcerpt(input.latestMessage?.body ?? null),
    participantLabel: "إدارة المدرسة",
    lastMessageAt:
      input.conversation.last_message_at ?? input.latestMessage?.created_at ?? null,
    unreadCount: input.unreadCount,
    statusLabel: getConversationStatusLabel(input.conversation.status),
  }
}

function buildMessageVariant(
  context: ChatActorContext,
  message: Pick<Tables<"chat_messages">, "sender_user_id" | "message_type">
): ChatMessageRecord["variant"] {
  if (message.message_type === "system") {
    return "system"
  }

  if (message.sender_user_id === context.user_id) {
    return "current-user"
  }

  return "participant"
}

function buildAuthorRoleLabel(input: {
  context: ChatActorContext
  senderRole: UserRole | undefined
  senderUserId: string
}): string | undefined {
  if (!input.senderRole) {
    return undefined
  }

  if (
    input.context.kind === "portal" &&
    input.senderUserId !== input.context.user_id &&
    input.senderRole === USER_ROLES.SCHOOL_ADMIN
  ) {
    return "إدارة المدرسة"
  }

  return USER_ROLE_LABELS_AR[input.senderRole]
}

async function listConversationParticipants(
  conversationIds: string[]
): Promise<ConversationParticipantRow[]> {
  if (conversationIds.length === 0) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("chat_participants")
    .select("conversation_id, user_id, role, user_profiles(full_name, display_name)")
    .in("conversation_id", conversationIds)

  if (error || !data) {
    return []
  }

  return data as ConversationParticipantRow[]
}

async function listConversationMessagesSummary(
  conversationIds: string[]
): Promise<ConversationMessageSummaryRow[]> {
  if (conversationIds.length === 0) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, conversation_id, sender_user_id, body, created_at")
    .in("conversation_id", conversationIds)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })

  if (error || !data) {
    return []
  }

  return data
}

async function listMessageReadsForUser(
  messageIds: string[],
  userId: string
): Promise<MessageReadRow[]> {
  if (messageIds.length === 0) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("chat_message_reads")
    .select("message_id")
    .eq("user_id", userId)
    .in("message_id", messageIds)

  if (error || !data) {
    return []
  }

  return data
}

async function listDashboardConversations(
  context: DashboardChatContext
): Promise<Tables<"chat_conversations">[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("type", SCHOOL_OFFICE_CONVERSATION_TYPE)
    .order("last_message_at", { ascending: false })
    .order("updated_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data
}

async function listPortalConversationIds(
  context: PortalChatContext
): Promise<string[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("chat_participants")
    .select("conversation_id")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("user_id", context.user_id)

  if (error || !data) {
    return []
  }

  return Array.from(new Set(data.map((participant) => participant.conversation_id)))
}

async function findPortalConversation(
  context: PortalChatContext
): Promise<Tables<"chat_conversations"> | null> {
  const conversationIds = await listPortalConversationIds(context)

  if (conversationIds.length === 0) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("type", SCHOOL_OFFICE_CONVERSATION_TYPE)
    .in("id", conversationIds)
    .order("updated_at", { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return null
  }

  return data[0]
}

async function listActiveSchoolAdminIds(
  context: PortalChatContext
): Promise<string[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("user_memberships")
    .select("user_id")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")
    .eq("role", USER_ROLES.SCHOOL_ADMIN)

  if (error || !data) {
    return []
  }

  return Array.from(new Set(data.map((membership) => membership.user_id)))
}

export async function ensureSchoolOfficeConversationForPortalUser(
  context: PortalChatContext
): Promise<Tables<"chat_conversations">> {
  const existingConversation = await findPortalConversation(context)

  if (existingConversation) {
    await ensureConversationParticipant(context, existingConversation.id)
    return existingConversation
  }

  const supabase = await createSupabaseServerClient()
  const conversationRecord: TablesInsert<"chat_conversations"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    type: SCHOOL_OFFICE_CONVERSATION_TYPE,
    subject: "مراسلة إدارة المدرسة",
    status: "open",
    created_by_user_id: context.user_id,
    metadata: {
      portal_user_id: context.user_id,
      portal_role: context.role,
    },
  }

  const { data: insertedConversation, error: insertError } = await supabase
    .from("chat_conversations")
    .insert(conversationRecord)
    .select("*")
    .single()

  if (insertError || !insertedConversation) {
    const fallbackConversation = await findPortalConversation(context)

    if (fallbackConversation) {
      await ensureConversationParticipant(context, fallbackConversation.id)
      return fallbackConversation
    }

    throw new Error(insertError?.message ?? "CHAT_CONVERSATION_CREATE_FAILED")
  }

  const schoolAdminIds = await listActiveSchoolAdminIds(context)
  const participantRecords: TablesInsert<"chat_participants">[] = [
    {
      tenant_id: context.tenant_id,
      school_id: context.school_id,
      conversation_id: insertedConversation.id,
      user_id: context.user_id,
      role: context.role,
    },
    ...schoolAdminIds
      .filter((userId) => userId !== context.user_id)
      .map((userId) => ({
        tenant_id: context.tenant_id,
        school_id: context.school_id,
        conversation_id: insertedConversation.id,
        user_id: userId,
        role: USER_ROLES.SCHOOL_ADMIN,
      })),
  ]

  await supabase.from("chat_participants").upsert(participantRecords, {
    onConflict: "conversation_id,user_id",
  })

  return insertedConversation
}

async function listPortalConversations(
  context: PortalChatContext
): Promise<Tables<"chat_conversations">[]> {
  const ensuredConversation = await ensureSchoolOfficeConversationForPortalUser(context)
  const conversationIds = await listPortalConversationIds(context)
  const ids = Array.from(new Set([...conversationIds, ensuredConversation.id]))

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("type", SCHOOL_OFFICE_CONVERSATION_TYPE)
    .in("id", ids)
    .order("updated_at", { ascending: false })

  if (error || !data) {
    return [ensuredConversation]
  }

  return data
}

function resolveActiveConversationId(
  requestedConversationId: string | null | undefined,
  conversations: Tables<"chat_conversations">[]
): string | null {
  if (conversations.length === 0) {
    return null
  }

  const requestedConversation = conversations.find(
    (conversation) => conversation.id === requestedConversationId
  )

  return requestedConversation?.id ?? conversations[0].id
}

function buildPreviewCollections(
  context: ChatActorContext,
  conversations: Tables<"chat_conversations">[]
): Promise<ChatConversationPreview[]> {
  return (async () => {
    const conversationIds = conversations.map((conversation) => conversation.id)
    const [participants, messages] = await Promise.all([
      listConversationParticipants(conversationIds),
      listConversationMessagesSummary(conversationIds),
    ])

    const readRows = await listMessageReadsForUser(
      messages.map((message) => message.id),
      context.user_id
    )
    const readMessageIds = new Set(readRows.map((row) => row.message_id))

    return conversations.map((conversation) => {
      const conversationParticipants = participants.filter(
        (participant) => participant.conversation_id === conversation.id
      )
      const conversationMessages = messages.filter(
        (message) => message.conversation_id === conversation.id
      )
      const latestMessage =
        conversationMessages[conversationMessages.length - 1] ?? null
      const unreadCount = conversationMessages.filter(
        (message) =>
          message.sender_user_id !== context.user_id &&
          !readMessageIds.has(message.id)
      ).length

      return buildConversationPreview({
        conversation,
        latestMessage,
        unreadCount,
        participants: conversationParticipants,
        context,
      })
    })
  })()
}

export async function getConversationMessages(
  context: ChatActorContext,
  conversationId: string
): Promise<ChatMessageRecord[]> {
  const supabase = await createSupabaseServerClient()
  const [participantRows, messageRowsResult] = await Promise.all([
    listConversationParticipants([conversationId]),
    supabase
      .from("chat_messages")
      .select(
        "id, body, created_at, message_type, sender_user_id, sender:user_profiles!chat_messages_sender_user_id_fkey(full_name, display_name)"
      )
      .eq("conversation_id", conversationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
  ])

  const { data: messageRows, error: messageError } = messageRowsResult

  if (messageError || !messageRows) {
    return []
  }

  const senderRoles = new Map(
    participantRows.map((participant) => [participant.user_id, participant.role])
  )

  return (messageRows as MessageWithSenderRow[]).map((message) => ({
    id: message.id,
    authorName:
      message.sender_user_id === context.user_id && context.kind === "portal"
        ? context.display_name?.trim() || context.full_name
        : getProfileName(message.sender),
    authorRoleLabel: buildAuthorRoleLabel({
      context,
      senderRole: senderRoles.get(message.sender_user_id),
      senderUserId: message.sender_user_id,
    }),
    body: message.body,
    createdAt: message.created_at,
    variant: buildMessageVariant(context, message),
  }))
}

export async function getConversationUnreadCounts(
  context: ChatActorContext,
  conversationIds: string[]
): Promise<Record<string, number>> {
  const messages = await listConversationMessagesSummary(conversationIds)
  const readRows = await listMessageReadsForUser(
    messages.map((message) => message.id),
    context.user_id
  )
  const readMessageIds = new Set(readRows.map((row) => row.message_id))

  return messages.reduce<Record<string, number>>((counts, message) => {
    if (
      message.sender_user_id !== context.user_id &&
      !readMessageIds.has(message.id)
    ) {
      counts[message.conversation_id] =
        (counts[message.conversation_id] ?? 0) + 1
    }

    return counts
  }, {})
}

export async function getDashboardChatPageData(input: {
  context: DashboardChatContext
  activeConversationId?: string | null
}): Promise<DashboardChatPageData> {
  if (!canAccessDashboardSchoolOfficeChat(input.context.role)) {
    return {
      status: "restricted",
      ...getDashboardChatRestrictionCopy(input.context.role),
    }
  }

  const conversations = await listDashboardConversations(input.context)
  const previews = await buildPreviewCollections(input.context, conversations)
  const activeConversationId = resolveActiveConversationId(
    input.activeConversationId,
    conversations
  )
  const activeConversation =
    conversations.find((conversation) => conversation.id === activeConversationId) ??
    null
  const activeConversationParticipants = activeConversation
    ? await listConversationParticipants([activeConversation.id])
    : []
  const portalOwner = activeConversation
    ? buildPortalOwnerProfile(activeConversation, activeConversationParticipants)
    : null
  const messages = activeConversation
    ? await getConversationMessages(input.context, activeConversation.id)
    : []

  return buildReadyPageData({
    kind: "dashboard",
    conversations: previews,
    activeConversationId,
    threadTitle: portalOwner?.name ?? "المحادثات الداخلية",
    threadDescription: buildDashboardThreadDescription(portalOwner),
    note: "تُطبّق صلاحيات الوصول والقراءة والإرسال على الخادم وفق المدرسة الحالية فقط، بينما تعمل Realtime كتحسين تجربة لا كطبقة تفويض.",
    messages,
  })
}

export async function getPortalChatPageData(input: {
  context: PortalChatContext
  activeConversationId?: string | null
}): Promise<PortalChatPageData> {
  const conversations = await listPortalConversations(input.context)
  const previews = await buildPreviewCollections(input.context, conversations)
  const activeConversationId = resolveActiveConversationId(
    input.activeConversationId,
    conversations
  )
  const messages = activeConversationId
    ? await getConversationMessages(input.context, activeConversationId)
    : []

  return buildReadyPageData({
    kind: "portal",
    conversations: previews,
    activeConversationId,
    threadTitle: "مراسلة إدارة المدرسة",
    threadDescription:
      "تصل الردود هنا من مديري المدرسة في نفس المدرسة الحالية، من دون الحاجة لاختيار موظف محدد.",
    note: "تُراجع الرسائل وتُرسل من قبل إدارة المدرسة فقط، مع بقاء النطاق والصلاحيات مفروضين على الخادم بحسب العضوية والمدرسة الحالية.",
    messages,
  })
}
