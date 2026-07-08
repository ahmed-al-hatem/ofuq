import type { Enums, Tables } from "@/types/database"

export type SchoolSettings = Tables<"school_settings">
export type IntegrationSetting = Tables<"integration_settings">
export type MessageTemplate = Tables<"message_templates">

export type IntegrationProvider = Enums<"integration_provider">
export type IntegrationStatus = Enums<"integration_status">
export type MessageTemplateChannel = Enums<"message_template_channel">
export type MessageTemplateStatus = Enums<"message_template_status">

export const INTEGRATION_PROVIDER_LABELS_AR: Record<
  IntegrationProvider,
  string
> = {
  whatsapp: "واتساب للأعمال",
  webhooks: "الويب هوكس",
  moe: "وزارة التربية",
  google_calendar: "تقويم Google",
  microsoft_calendar: "تقويم Microsoft",
  power_bi: "Power BI",
  looker: "Looker",
  zapier: "Zapier",
  make: "Make",
}

export const INTEGRATION_STATUS_LABELS_AR: Record<IntegrationStatus, string> = {
  placeholder: "إعدادات فقط",
  disabled: "غير مفعّل",
  configured: "مهيأ محليًا",
  error: "بحاجة إلى مراجعة",
}

export const MESSAGE_TEMPLATE_CHANNEL_LABELS_AR: Record<
  MessageTemplateChannel,
  string
> = {
  in_app: "داخل التطبيق",
  email: "البريد الإلكتروني",
  sms: "SMS",
  whatsapp: "واتساب",
}

export const MESSAGE_TEMPLATE_STATUS_LABELS_AR: Record<
  MessageTemplateStatus,
  string
> = {
  draft: "مسودة",
  active: "نشط",
  archived: "مؤرشف",
}

export const INTEGRATION_STATUS_TONES = {
  placeholder: "warning",
  disabled: "neutral",
  configured: "info",
  error: "danger",
} as const

export const MESSAGE_TEMPLATE_STATUS_TONES = {
  draft: "neutral",
  active: "success",
  archived: "neutral",
} as const
