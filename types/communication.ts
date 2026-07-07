import type { Enums, Tables } from "@/types/database"

export type CommunicationMessageStatus =
  Enums<"communication_message_status">
export type AnnouncementTargetType = Enums<"announcement_target_type">
export type AnnouncementStatus = Enums<"announcement_status">
export type NotificationChannel = Enums<"notification_channel">
export type NotificationStatus = Enums<"notification_status">
export type SchoolEventTargetType = Enums<"school_event_target_type">
export type SchoolEventStatus = Enums<"school_event_status">

export type Message = Tables<"messages">
export type MessageRecipient = Tables<"message_recipients">
export type Announcement = Tables<"announcements">
export type NotificationLog = Tables<"notification_logs">
export type SchoolEvent = Tables<"school_events">

export const COMMUNICATION_MESSAGE_STATUS_LABELS_AR: Record<
  CommunicationMessageStatus,
  string
> = {
  sent: "مرسلة",
  archived: "مؤرشفة",
}

export const ANNOUNCEMENT_TARGET_TYPE_LABELS_AR: Record<
  AnnouncementTargetType,
  string
> = {
  school: "كل المدرسة",
  role: "حسب الدور",
  grade_level: "صف دراسي",
  class: "شعبة",
}

export const ANNOUNCEMENT_STATUS_LABELS_AR: Record<
  AnnouncementStatus,
  string
> = {
  draft: "مسودة",
  published: "منشور",
  archived: "مؤرشف",
}

export const NOTIFICATION_CHANNEL_LABELS_AR: Record<
  NotificationChannel,
  string
> = {
  in_app: "داخل التطبيق",
}

export const NOTIFICATION_STATUS_LABELS_AR: Record<
  NotificationStatus,
  string
> = {
  created: "جديدة",
  read: "مقروءة",
  archived: "مؤرشفة",
  failed: "فشلت",
}

export const SCHOOL_EVENT_TARGET_TYPE_LABELS_AR: Record<
  SchoolEventTargetType,
  string
> = {
  school: "كل المدرسة",
  grade_level: "صف دراسي",
  class: "شعبة",
}

export const SCHOOL_EVENT_STATUS_LABELS_AR: Record<
  SchoolEventStatus,
  string
> = {
  scheduled: "مجدول",
  cancelled: "ملغي",
  completed: "مكتمل",
  archived: "مؤرشف",
}

export const ANNOUNCEMENT_STATUS_TONES = {
  draft: "neutral",
  published: "success",
  archived: "neutral",
} as const

export const NOTIFICATION_STATUS_TONES = {
  created: "info",
  read: "success",
  archived: "neutral",
  failed: "danger",
} as const

export const SCHOOL_EVENT_STATUS_TONES = {
  scheduled: "info",
  cancelled: "warning",
  completed: "success",
  archived: "neutral",
} as const
