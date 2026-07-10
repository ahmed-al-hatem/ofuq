import type { UserRole } from "@/constants/roles"

export const CHAT_CONVERSATION_STATUSES = [
  "open",
  "closed",
  "archived",
] as const

export const CHAT_CONVERSATION_TYPES = ["internal", "school_office"] as const

export const AI_CONVERSATION_STATUSES = ["active", "archived"] as const
export const ASSISTANT_RUNTIME_STATUSES = [
  "configured",
  "setup_required",
] as const

export const CHAT_MESSAGE_VARIANTS = [
  "current-user",
  "participant",
  "assistant",
  "system",
] as const

export type ChatConversationStatus =
  (typeof CHAT_CONVERSATION_STATUSES)[number]
export type ChatConversationType = (typeof CHAT_CONVERSATION_TYPES)[number]
export type AiConversationStatus = (typeof AI_CONVERSATION_STATUSES)[number]
export type AssistantRuntimeStatus =
  (typeof ASSISTANT_RUNTIME_STATUSES)[number]
export type ChatMessageVariant = (typeof CHAT_MESSAGE_VARIANTS)[number]

export type ChatConversationPreview = {
  id: string
  href?: string
  title: string
  excerpt: string
  participantLabel: string
  lastMessageAt: string | null
  unreadCount: number
  statusLabel: string
}

export type ChatMessageRecord = {
  id: string
  authorName: string
  authorRoleLabel?: string
  body: string
  createdAt: string
  variant: ChatMessageVariant
  meta?: string
}

export type ChatComposerState = {
  placeholder: string
  helperText: string
  disabledLabel: string
  submitLabel: string
  disabled: boolean
}

export type ChatScreenScaffold = {
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

export type AssistantPromptSuggestion = {
  id: string
  title: string
  prompt: string
  description: string
}

export type AssistantScreenScaffold = {
  sidebarTitle: string
  sidebarDescription: string
  conversations: ChatConversationPreview[]
  activeConversationId: string | null
  threadTitle: string
  threadDescription: string
  phaseLabel: string
  note: string
  prompts: AssistantPromptSuggestion[]
  emptyStateTitle: string
  emptyStateDescription: string
  messages: ChatMessageRecord[]
  composer: ChatComposerState
}

export const STAFF_ASSISTANT_ROLE_SCOPE: Record<UserRole, string> = {
  system_admin: "ملخص مؤسسي عبر المدارس المصرح بها",
  school_admin: "ملخص المدرسة الحالية فقط",
  teacher: "الفصول والمواد المسندة لك فقط",
  parent: "الأبناء المرتبطون بك فقط",
  student: "بياناتك الشخصية فقط",
  accountant: "المؤشرات المالية المصرح بها فقط",
  librarian: "سجلات المكتبة المصرح بها فقط",
}
