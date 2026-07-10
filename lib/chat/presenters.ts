import { USER_ROLE_LABELS_AR, type UserRole } from "@/constants/roles"
import type { AuthenticatedUser } from "@/types/auth"
import type { PortalContext } from "@/types/portal"
import type {
  AssistantPromptSuggestion,
  AssistantScreenScaffold,
  ChatComposerState,
  ChatConversationPreview,
  ChatMessageRecord,
  ChatScreenScaffold,
} from "@/types/chat"

function isoDateAt(hour: number, minute: number) {
  return new Date(Date.UTC(2026, 6, 10, hour, minute)).toISOString()
}

function buildDisabledComposer(
  placeholder: string,
  helperText: string,
  disabledLabel: string
): ChatComposerState {
  return {
    placeholder,
    helperText,
    disabledLabel,
    submitLabel: "إرسال",
    disabled: true,
  }
}

function getUserDisplayName(
  user:
    | Pick<AuthenticatedUser, "display_name" | "full_name">
    | Pick<PortalContext["user"], "display_name" | "full_name">
) {
  return user.display_name?.trim() || user.full_name
}

function buildStaffConversations(role: UserRole): ChatConversationPreview[] {
  const roleLabel = USER_ROLE_LABELS_AR[role]

  return [
    {
      id: "staff-chat-1",
      title: "متابعة حضور الصف الخامس أ",
      excerpt:
        "تم تجهيز واجهة المحادثات وسيتفعل الإرسال الفوري وإشعارات القراءة في Phase 25B.",
      participantLabel: "ولي أمر - حسن السالم",
      lastMessageAt: isoDateAt(9, 25),
      unreadCount: 2,
      statusLabel: "مفتوحة",
    },
    {
      id: "staff-chat-2",
      title: "استفسار حول الفاتورة الفصلية",
      excerpt: "قالب المحادثة جاهز لربط المالية والمراسلة الآنية في المرحلة التالية.",
      participantLabel: "ولي أمر - ريم العبدالله",
      lastMessageAt: isoDateAt(8, 40),
      unreadCount: 0,
      statusLabel: "مفتوحة",
    },
    {
      id: "staff-chat-3",
      title: `تنسيق داخلي - ${roleLabel}`,
      excerpt: "يظهر هذا الصف كتصور أولي فقط إلى أن يبدأ مسار الرسائل الحية.",
      participantLabel: "فريق المدرسة",
      lastMessageAt: isoDateAt(7, 55),
      unreadCount: 0,
      statusLabel: "مؤرشفة",
    },
  ]
}

function buildPortalConversations(): ChatConversationPreview[] {
  return [
    {
      id: "portal-chat-1",
      title: "مراسلة إدارة المدرسة",
      excerpt:
        "هذه الواجهة جاهزة لبدء المحادثات المباشرة لاحقًا، بينما يبقى الإرسال معطلًا في Phase 25A.",
      participantLabel: "إدارة المدرسة",
      lastMessageAt: isoDateAt(9, 5),
      unreadCount: 0,
      statusLabel: "قيد الإعداد",
    },
  ]
}

function buildStaffChatMessages(user: AuthenticatedUser): ChatMessageRecord[] {
  const displayName = getUserDisplayName(user)
  const roleLabel = user.role ? USER_ROLE_LABELS_AR[user.role] : undefined

  return [
    {
      id: "staff-message-1",
      authorName: "ولي أمر - حسن السالم",
      authorRoleLabel: "ولي أمر",
      body:
        "أحتاج متابعة حالة الحضور لهذا الأسبوع. الواجهة الحالية تعرض المحادثة كتهيئة مرئية فقط قبل تفعيل الإرسال الفعلي.",
      createdAt: isoDateAt(9, 10),
      variant: "participant",
    },
    {
      id: "staff-message-2",
      authorName: displayName,
      authorRoleLabel: roleLabel,
      body:
        "تم إعداد شاشة المحادثات لتستوعب المراسلة الداخلية لاحقًا، مع إبقاء جميع عمليات الإرسال والقراءة مؤجلة إلى Phase 25B.",
      createdAt: isoDateAt(9, 16),
      variant: "current-user",
      meta: "مسودة توضيحية",
    },
    {
      id: "staff-message-3",
      authorName: "النظام",
      body:
        "سيتم ربط التحديث الفوري، تتبع القراءة، والتحقق الخادمي من المشاركين في Phase 25B فقط.",
      createdAt: isoDateAt(9, 25),
      variant: "system",
    },
  ]
}

function buildPortalChatMessages(user: PortalContext["user"]): ChatMessageRecord[] {
  const displayName = getUserDisplayName(user)
  const roleLabel = USER_ROLE_LABELS_AR[user.role]

  return [
    {
      id: "portal-message-1",
      authorName: "إدارة المدرسة",
      authorRoleLabel: "المدرسة",
      body:
        "تم تجهيز شاشة المراسلة لتكون نقطة تواصل مباشرة ضمن حسابك، لكن الإرسال الفعلي سيبدأ في Phase 25B.",
      createdAt: isoDateAt(8, 50),
      variant: "participant",
    },
    {
      id: "portal-message-2",
      authorName: displayName,
      authorRoleLabel: roleLabel,
      body:
        "أفهم أن الصفحة تجريبية حاليًا. المهم أنها محصورة ضمن حسابي وبياناتي المسموح بها فقط.",
      createdAt: isoDateAt(9, 2),
      variant: "current-user",
    },
    {
      id: "portal-message-3",
      authorName: "النظام",
      body:
        "لن يتم إرسال أي رسالة أو إشعار فعلي في هذه المرحلة. صفحة المراسلة الحالية مخصصة للواجهة والبنية فقط.",
      createdAt: isoDateAt(9, 5),
      variant: "system",
    },
  ]
}

function buildStaffAssistantPrompts(): AssistantPromptSuggestion[] {
  return [
    {
      id: "staff-assistant-prompt-1",
      title: "كم عدد الطلاب؟",
      prompt: "كم عدد الطلاب النشطين في المدرسة الحالية؟",
      description: "مثال على سؤال تشغيلي عام ضمن صلاحيات المدرسة الحالية.",
    },
    {
      id: "staff-assistant-prompt-2",
      title: "ما ملخص الحضور هذا الأسبوع؟",
      prompt: "اعرض ملخص الحضور والغياب لهذا الأسبوع.",
      description: "سؤال يستهدف قراءة مؤشرات الحضور بعد بناء طبقة السياق الخادمي.",
    },
    {
      id: "staff-assistant-prompt-3",
      title: "ما الفواتير غير المسددة؟",
      prompt: "ما الفواتير غير المسددة في المدرسة الحالية؟",
      description: "سيعتمد لاحقًا على ملخصات مالية مقيدة بحسب الدور.",
    },
  ]
}

function buildPortalAssistantPrompts(): AssistantPromptSuggestion[] {
  return [
    {
      id: "portal-assistant-prompt-1",
      title: "ما آخر درجاتي؟",
      prompt: "اعرض آخر درجاتي أو آخر درجات الأبناء المرتبطين بي.",
      description: "يبقى هذا السؤال مقيدًا ببياناتك أو بالأبناء المرتبطين فقط.",
    },
    {
      id: "portal-assistant-prompt-2",
      title: "ما حضور هذا الأسبوع؟",
      prompt: "ما ملخص الحضور لهذا الأسبوع؟",
      description: "سيتم الرد لاحقًا عبر ملخص خادمي آمن من دون وصول مباشر للقاعدة.",
    },
    {
      id: "portal-assistant-prompt-3",
      title: "هل توجد فواتير غير مدفوعة؟",
      prompt: "هل توجد فواتير غير مدفوعة ضمن حسابي؟",
      description: "للأسرة أو الطالب ضمن النطاق المسموح فقط.",
    },
  ]
}

function buildStaffAssistantMessages(user: AuthenticatedUser): ChatMessageRecord[] {
  const displayName = getUserDisplayName(user)
  const roleLabel = user.role ? USER_ROLE_LABELS_AR[user.role] : undefined

  return [
    {
      id: "staff-assistant-message-1",
      authorName: displayName,
      authorRoleLabel: roleLabel,
      body: "ما ملخص الحضور هذا الأسبوع؟",
      createdAt: isoDateAt(10, 4),
      variant: "current-user",
    },
    {
      id: "staff-assistant-message-2",
      authorName: "مساعد أُفُق",
      body:
        "سيتم ربط Gemini في Phase 25C فقط. قبل ذلك سنبني طبقة ملخصات خادمية مقيدة بحسب الدور والمدرسة الحالية.",
      createdAt: isoDateAt(10, 5),
      variant: "assistant",
      meta: "استجابة تمهيدية",
    },
    {
      id: "staff-assistant-message-3",
      authorName: "النظام",
      body:
        "لن يتلقى المساعد أي SQL خام أو وصول غير مقيد للبيانات. كل سياق سيبنى خادميًا وفق العضوية النشطة.",
      createdAt: isoDateAt(10, 6),
      variant: "system",
    },
  ]
}

function buildPortalAssistantMessages(user: PortalContext["user"]): ChatMessageRecord[] {
  const displayName = getUserDisplayName(user)
  const roleLabel = USER_ROLE_LABELS_AR[user.role]

  return [
    {
      id: "portal-assistant-message-1",
      authorName: displayName,
      authorRoleLabel: roleLabel,
      body: "هل توجد فواتير غير مدفوعة؟",
      createdAt: isoDateAt(10, 8),
      variant: "current-user",
    },
    {
      id: "portal-assistant-message-2",
      authorName: "مساعد أُفُق",
      body:
        "هذه الشاشة جاهزة لتجربة المساعد فقط. الربط الفعلي مع Gemini سيبدأ في Phase 25C بعد تجهيز ملخصات مقيدة ببياناتك المسموح بها.",
      createdAt: isoDateAt(10, 9),
      variant: "assistant",
    },
    {
      id: "portal-assistant-message-3",
      authorName: "النظام",
      body:
        "لن تظهر هنا أي بيانات خارج الأبناء المرتبطين أو بيانات الطالب نفسه، ولن يتم إرسال أي طلب AI فعلي في هذه المرحلة.",
      createdAt: isoDateAt(10, 10),
      variant: "system",
    },
  ]
}

export function formatChatTimestamp(value: string | null) {
  if (!value) {
    return "بدون نشاط"
  }

  return new Intl.DateTimeFormat("ar-SY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function buildDashboardChatScaffold(
  user: AuthenticatedUser
): ChatScreenScaffold {
  return {
    sidebarTitle: "قائمة المحادثات",
    sidebarDescription:
      "تهيئة أولية لمحادثات المدرسة الداخلية مع حفظ مكان القوائم والرسائل قبل تشغيل الزمن الحقيقي.",
    conversations: buildStaffConversations(user.role ?? "school_admin"),
    activeConversationId: "staff-chat-1",
    threadTitle: "متابعة حضور الصف الخامس أ",
    threadDescription:
      "مثال مرئي لتوزيع الرسائل بين موظف المدرسة والطرف الآخر داخل المدرسة الحالية.",
    phaseLabel: "Phase 25A",
    note: "التحديثات الفورية والإرسال الحقيقي سيبدآن في Phase 25B بعد استكمال طبقة المشاركين والقراءة.",
    emptyStateTitle: "لا توجد محادثات مفعلة بعد",
    emptyStateDescription:
      "تم تجهيز هذا المسار ليعرض المحادثات الداخلية فور بدء Phase 25B من دون تغيير البنية الأساسية للصفحة.",
    messages: buildStaffChatMessages(user),
    composer: buildDisabledComposer(
      "اكتب الرد الذي سيُفعّل لاحقًا داخل المدرسة الحالية",
      "تم تعطيل الإدخال والإرسال عمدًا في هذه المرحلة حتى تكتمل خدمة المراسلة الداخلية والزمن الحقيقي.",
      "سيتم التفعيل في Phase 25B"
    ),
  }
}

export function buildPortalChatScaffold(
  context: PortalContext
): ChatScreenScaffold {
  return {
    sidebarTitle: "سجل المراسلات",
    sidebarDescription:
      "مساحة مخصصة لمراسلة المدرسة من داخل البوابة مع إبقاء التدفق الفعلي مؤجلًا للمرحلة التالية.",
    conversations: buildPortalConversations(),
    activeConversationId: "portal-chat-1",
    threadTitle: "مراسلة إدارة المدرسة",
    threadDescription:
      "ستبقى هذه المحادثات محصورة ضمن حسابك والمدرسة الحالية بعد تفعيل Phase 25B.",
    phaseLabel: "Phase 25A",
    note: "لا توجد أي عملية إرسال أو إشعار فعلي الآن. الصفحة الحالية تمهيدية وآمنة فقط.",
    emptyStateTitle: "لم تبدأ المراسلات بعد",
    emptyStateDescription:
      "ستظهر المحادثات المباشرة مع المدرسة هنا بعد تفعيل البنية التشغيلية في Phase 25B.",
    messages: buildPortalChatMessages(context.user),
    composer: buildDisabledComposer(
      "اكتب رسالتك إلى المدرسة",
      "الإرسال غير متاح في Phase 25A. ستُفعَّل المراسلة المباشرة لاحقًا مع تحقق خادمي كامل من النطاق.",
      "سيتم التفعيل في Phase 25B"
    ),
  }
}

export function buildDashboardAssistantScaffold(
  user: AuthenticatedUser
): AssistantScreenScaffold {
  return {
    sidebarTitle: "سجل المساعد",
    sidebarDescription:
      "تهيئة محفوظة لتاريخ جلسات مساعد أُفُق قبل ربط Gemini وبناء ملخصات البيانات المقيدة بالصلاحيات.",
    conversations: [
      {
        id: "staff-assistant-1",
        title: "ملخصات تشغيلية للمدرسة",
        excerpt: "جلسة تمهيدية لإظهار شكل المحادثة مع مساعد أُفُق.",
        participantLabel: "مدرستك الحالية",
        lastMessageAt: isoDateAt(10, 6),
        unreadCount: 0,
        statusLabel: "نشطة",
      },
      {
        id: "staff-assistant-2",
        title: "أسئلة مالية مستقبلية",
        excerpt: "سيظهر هنا تاريخ المحادثات المؤرشفة لاحقًا.",
        participantLabel: "ملخصات الدور",
        lastMessageAt: isoDateAt(8, 15),
        unreadCount: 0,
        statusLabel: "مؤرشفة",
      },
    ],
    activeConversationId: "staff-assistant-1",
    threadTitle: "مساعد أُفُق",
    threadDescription:
      "واجهة مرئية أولية لمحادثات الذكاء الاصطناعي، مع إبقاء التنفيذ الفعلي على الخادم في Phase 25C.",
    phaseLabel: "Phase 25A",
    note: "سيتم ربط Gemini في Phase 25C فقط، ولن يتلقى المساعد أي وصول مباشر أو غير مقيد إلى قاعدة البيانات.",
    prompts: buildStaffAssistantPrompts(),
    emptyStateTitle: "لا يوجد سجل مساعد فعلي بعد",
    emptyStateDescription:
      "ستظهر محادثات المساعد وتاريخها هنا بعد تفعيل Phase 25C وربط طبقة السياق الخادمي.",
    messages: buildStaffAssistantMessages(user),
    composer: buildDisabledComposer(
      "اسأل عن ملخصات الحضور أو الرسوم أو أعداد الطلاب",
      "حقل السؤال الحالي واجهة فقط. الربط الفعلي مع Gemini سيضاف لاحقًا عبر خدمة خادمية آمنة.",
      "سيتم ربط Gemini في Phase 25C"
    ),
  }
}

export function buildPortalAssistantScaffold(
  context: PortalContext
): AssistantScreenScaffold {
  return {
    sidebarTitle: "جلسات المساعد",
    sidebarDescription:
      "سجل تمهيدي للمساعد الشخصي داخل البوابة مع إبقاء جميع الأسئلة الفعلية مؤجلة.",
    conversations: [
      {
        id: "portal-assistant-1",
        title: "متابعة شخصية",
        excerpt: "مثال تمهيدي لشكل المحادثة الشخصية داخل البوابة.",
        participantLabel: "بياناتك المسموح بها",
        lastMessageAt: isoDateAt(10, 10),
        unreadCount: 0,
        statusLabel: "نشطة",
      },
    ],
    activeConversationId: "portal-assistant-1",
    threadTitle: "مساعد أُفُق",
    threadDescription:
      "سيجيب لاحقًا عن الحضور والدرجات والمالية ضمن حدود بياناتك أو الأبناء المرتبطين بك فقط.",
    phaseLabel: "Phase 25A",
    note: "سيتم ربط Gemini في Phase 25C، مع قصر السياق على بياناتك المصرح بها ومن دون أي وصول SQL حر.",
    prompts: buildPortalAssistantPrompts(),
    emptyStateTitle: "لا توجد جلسات مساعدة فعلية بعد",
    emptyStateDescription:
      "ستظهر هنا جلساتك مع المساعد بعد تفعيل Phase 25C وبناء طبقة السياق الشخصية الآمنة.",
    messages: buildPortalAssistantMessages(context.user),
    composer: buildDisabledComposer(
      "اسأل عن الحضور أو الدرجات أو الفواتير ضمن حسابك",
      "لن يُرسل أي طلب ذكاء اصطناعي في هذه المرحلة. تمهيد الواجهة فقط هو المفعّل الآن.",
      "سيتم ربط Gemini في Phase 25C"
    ),
  }
}
