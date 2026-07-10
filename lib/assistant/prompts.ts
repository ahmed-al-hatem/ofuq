import { USER_ROLES, type UserRole } from "@/constants/roles"
import type { AssistantPromptSuggestion } from "@/types/chat"

const assistantName = "مساعد أُفُق"

export function getAssistantSystemPrompt(): string {
  return [
    `أنت ${assistantName}، مساعد مدرسي داخل نظام Ofuq.`,
    "أجب بالعربية المبسطة وبأسلوب مهني مختصر.",
    "استخدم فقط السياق المرسل لك.",
    "لا تخترع أرقامًا أو أسماء أو نتائج.",
    "إذا لم تكن المعلومة موجودة في السياق، قل إن البيانات غير متاحة حاليًا.",
    "لا تنفذ أوامر.",
    "لا تنشئ أو تعدل أو تحذف أي بيانات.",
    "لا تقدم SQL ولا تطلب تشغيل SQL.",
    "لا تكشف tenant_id أو school_id أو user_id أو أي معرفات داخلية.",
    "لا تتجاوز صلاحيات الدور الحالي.",
    "إذا طلب المستخدم أمرًا تنفيذيًا، وضّح أنك مساعد قراءة فقط في هذه المرحلة.",
  ].join("\n")
}

export function getAssistantPromptSuggestions(
  role: UserRole
): AssistantPromptSuggestion[] {
  switch (role) {
    case USER_ROLES.SYSTEM_ADMIN:
    case USER_ROLES.SCHOOL_ADMIN:
      return [
        {
          id: "assistant-admin-prompt-1",
          title: "ملخص الطلاب",
          prompt: "كم عدد الطلاب النشطين حاليًا؟",
          description: "يعطيك ملخصًا قصيرًا يعتمد على المدرسة الحالية فقط.",
        },
        {
          id: "assistant-admin-prompt-2",
          title: "ملخص الحضور",
          prompt: "ما ملخص الحضور هذا الأسبوع؟",
          description: "يلخص الحضور والغياب والأنشطة الأخيرة المسجلة.",
        },
        {
          id: "assistant-admin-prompt-3",
          title: "المستحقات",
          prompt: "ما وضع الفواتير غير المدفوعة؟",
          description: "يساعدك على قراءة وضع المستحقات من دون أي تعديل للبيانات.",
        },
      ]
    case USER_ROLES.TEACHER:
      return [
        {
          id: "assistant-teacher-prompt-1",
          title: "حضور الصفوف",
          prompt: "ما ملخص حضور صفوفي مؤخرًا؟",
          description: "ملخص ضمن جلسات الحضور المسجلة لصفوفك فقط.",
        },
        {
          id: "assistant-teacher-prompt-2",
          title: "جدول اليوم",
          prompt: "ما حصصي المجدولة اليوم؟",
          description: "يركز على جدولك الحالي دون أي بيانات مالية أو إدارية.",
        },
        {
          id: "assistant-teacher-prompt-3",
          title: "الاختبارات",
          prompt: "ما آخر الاختبارات أو الإدخالات المرتبطة بموادي؟",
          description: "يعرض أحدث المؤشرات ضمن نطاق المواد والتكليفات المسندة لك.",
        },
      ]
    case USER_ROLES.ACCOUNTANT:
      return [
        {
          id: "assistant-accountant-prompt-1",
          title: "الفواتير",
          prompt: "ما عدد الفواتير المفتوحة حاليًا؟",
          description: "قراءة موجزة لوضع الفواتير ضمن المدرسة الحالية.",
        },
        {
          id: "assistant-accountant-prompt-2",
          title: "المدفوعات",
          prompt: "ما أحدث الدفعات المسجلة؟",
          description: "يساعدك على مراجعة الحركة المالية الأخيرة بسرعة.",
        },
        {
          id: "assistant-accountant-prompt-3",
          title: "الرصيد",
          prompt: "ما إجمالي الرصيد المستحق الآن؟",
          description: "يركز على الإجماليات المالية فقط.",
        },
      ]
    case USER_ROLES.LIBRARIAN:
      return [
        {
          id: "assistant-librarian-prompt-1",
          title: "الإعارات",
          prompt: "ما ملخص الإعارات النشطة؟",
          description: "يعرض عدد الإعارات والحالات المتأخرة ضمن المدرسة الحالية.",
        },
        {
          id: "assistant-librarian-prompt-2",
          title: "الفهرس",
          prompt: "كم عدد عناوين الفهرس والنسخ المتاحة؟",
          description: "يختصر حالة الفهرس والنسخ من دون أي بيانات خارج المكتبة.",
        },
        {
          id: "assistant-librarian-prompt-3",
          title: "الحركة الأخيرة",
          prompt: "ما آخر الإعارات المسجلة؟",
          description: "يقدم نظرة سريعة على أحدث حركة مكتبية.",
        },
      ]
    case USER_ROLES.PARENT:
      return [
        {
          id: "assistant-parent-prompt-1",
          title: "آخر الدرجات",
          prompt: "ما آخر درجات أبنائي؟",
          description: "يلخص النتائج الحديثة للأبناء المرتبطين بحسابك فقط.",
        },
        {
          id: "assistant-parent-prompt-2",
          title: "الفواتير",
          prompt: "هل توجد فواتير غير مدفوعة؟",
          description: "يقرأ وضع الرسوم والمدفوعات للأبناء المرتبطين بك فقط.",
        },
        {
          id: "assistant-parent-prompt-3",
          title: "الحضور",
          prompt: "ما أحدث ملاحظات الحضور هذا الأسبوع؟",
          description: "يستعرض الحضور والغياب ضمن النطاق المسموح لك.",
        },
      ]
    case USER_ROLES.STUDENT:
      return [
        {
          id: "assistant-student-prompt-1",
          title: "درجاتي",
          prompt: "ما آخر درجاتي؟",
          description: "ملخص سريع لآخر النتائج والمدخلات المتاحة لك.",
        },
        {
          id: "assistant-student-prompt-2",
          title: "جدولي",
          prompt: "ما جدولي اليوم؟",
          description: "يعرض حصصك الحالية فقط ضمن بياناتك الشخصية.",
        },
        {
          id: "assistant-student-prompt-3",
          title: "حضوري",
          prompt: "ما ملخص حضوري مؤخرًا؟",
          description: "يقدم نظرة موجزة على حضورك من دون أي بيانات لطلاب آخرين.",
        },
      ]
  }
}
