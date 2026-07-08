import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import type { IntegrationProvider } from "@/types/settings"

export const settingsAdminRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
] as const

export const SETTINGS_PLACEHOLDER_WARNING =
  "هذه الصفحة مخصصة لإعدادات أولية فقط. لا يتم تنفيذ أي اتصال خارجي في هذه المرحلة."

export const SETTINGS_SECRET_WARNING =
  "لا يتم حفظ مفاتيح API حقيقية في هذه المرحلة."

export const SETTINGS_LOCALE_OPTIONS = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "الإنجليزية" },
] as const

export const SETTINGS_DIRECTION_OPTIONS = [
  { value: "rtl", label: "من اليمين إلى اليسار" },
  { value: "ltr", label: "من اليسار إلى اليمين" },
] as const

export const ACADEMIC_WEEK_START_OPTIONS = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الاثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" },
] as const

export const SETTINGS_MODULE_DEFINITIONS = [
  {
    key: "students",
    label: "الطلاب",
    description: "إعداد مرئي فقط في هذه المرحلة ولا يعطل أي مسار قائم.",
  },
  {
    key: "academic",
    label: "الأكاديمي",
    description: "يبقى المسار الأكاديمي فعّالًا بغض النظر عن هذا المفتاح حاليًا.",
  },
  {
    key: "attendance",
    label: "الحضور",
    description: "يستخدم كإعداد تأسيسي فقط دون تعطيل حضور فعلي.",
  },
  {
    key: "grades",
    label: "الدرجات",
    description: "يوضح تفضيل المدرسة دون تغيير السلوك التشغيلي الحالي.",
  },
  {
    key: "timetable",
    label: "الجدول",
    description: "قيمة محفوظة فقط، ولا توقف صفحات الجدول الحالية.",
  },
  {
    key: "finance",
    label: "المالية",
    description: "يبقى التنفيذ الحالي كما هو؛ هذا المفتاح تحضيري فقط.",
  },
  {
    key: "communication",
    label: "التواصل",
    description: "يوثق تفعيل الوحدة داخل الإعدادات دون مزودات خارجية.",
  },
  {
    key: "reports",
    label: "التقارير",
    description: "يفيد لاحقًا في تخصيص الوصول أو الواجهة فقط.",
  },
  {
    key: "library",
    label: "المكتبة",
    description: "تفضيل مخزن للمدرسة دون تعطيل الوحدة الحالية.",
  },
  {
    key: "student_care",
    label: "الرعاية الطلابية",
    description: "قيمة تحضيرية للواجهة والإدارة فقط.",
  },
  {
    key: "feedback",
    label: "الشكاوى والاستبيانات",
    description: "لا تغير السلوك الحالي وإنما تحفظ التفضيل.",
  },
  {
    key: "portal",
    label: "بوابة ولي الأمر والطالب",
    description: "لا تلغي البوابة الحالية في هذه المرحلة.",
  },
] as const

export type SettingsModuleFlagKey =
  (typeof SETTINGS_MODULE_DEFINITIONS)[number]["key"]

export const DEFAULT_MODULE_FLAGS: Record<SettingsModuleFlagKey, boolean> =
  Object.fromEntries(
    SETTINGS_MODULE_DEFINITIONS.map((item) => [item.key, true])
  ) as Record<SettingsModuleFlagKey, boolean>

export const INTEGRATION_PROVIDER_DEFINITIONS = [
  {
    provider: "whatsapp",
    displayName: "WhatsApp Business",
    label: "واتساب للأعمال",
    href: appRoutes.integrationsWhatsapp,
    summary: "قوالب ورسائل إعداد فقط دون إرسال فعلي.",
  },
  {
    provider: "webhooks",
    displayName: "Webhooks",
    label: "الويب هوكس",
    href: appRoutes.integrationsWebhooks,
    summary: "مراجعة نقاط الربط المستقبلية دون تنفيذ أو إعادة محاولات.",
  },
  {
    provider: "moe",
    displayName: "وزارة التربية",
    label: "وزارة التربية",
    href: appRoutes.integrationsMoe,
    summary: "واجهة تهيئة فقط دون أي استدعاءات خارجية.",
  },
  {
    provider: "google_calendar",
    displayName: "Google Calendar",
    label: "تقويم Google",
    href: appRoutes.integrationsCalendar,
    summary: "عرض بيانات تهيئة فقط دون OAuth أو مزامنة.",
  },
  {
    provider: "microsoft_calendar",
    displayName: "Microsoft Calendar",
    label: "تقويم Microsoft",
    href: appRoutes.integrationsCalendar,
    summary: "عرض بيانات تهيئة فقط دون OAuth أو مزامنة.",
  },
  {
    provider: "power_bi",
    displayName: "Power BI",
    label: "Power BI",
    href: appRoutes.integrationsBi,
    summary: "إعداد تقريري أولي فقط دون تضمين أو اتصال مباشر.",
  },
  {
    provider: "looker",
    displayName: "Looker",
    label: "Looker",
    href: appRoutes.integrationsBi,
    summary: "إعداد تقريري أولي فقط دون تضمين أو اتصال مباشر.",
  },
  {
    provider: "zapier",
    displayName: "Zapier",
    label: "Zapier",
    href: appRoutes.integrationsAutomation,
    summary: "قالب أتمتة فقط دون تشغيل سيناريوهات خارجية.",
  },
  {
    provider: "make",
    displayName: "Make",
    label: "Make",
    href: appRoutes.integrationsAutomation,
    summary: "قالب أتمتة فقط دون تشغيل سيناريوهات خارجية.",
  },
] as const satisfies readonly {
  provider: IntegrationProvider
  displayName: string
  label: string
  href: string
  summary: string
}[]

export const INTEGRATION_PROVIDERS = INTEGRATION_PROVIDER_DEFINITIONS.map(
  (item) => item.provider
) as readonly IntegrationProvider[]

export const INTEGRATION_PROVIDER_BY_KEY = Object.fromEntries(
  INTEGRATION_PROVIDER_DEFINITIONS.map((item) => [item.provider, item])
) as Record<
  IntegrationProvider,
  (typeof INTEGRATION_PROVIDER_DEFINITIONS)[number]
>
