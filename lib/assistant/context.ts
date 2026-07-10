import "server-only"

import { getAdminDashboardSummary } from "@/lib/dashboard/admin-summary"
import { getAccountantDashboardSummary } from "@/lib/dashboard/accountant-summary"
import { getTeacherDashboardSummary } from "@/lib/dashboard/teacher-summary"
import { getLibrarianDashboardSummary } from "@/lib/dashboard/librarian-summary"
import {
  formatCurrencyLabel,
  formatDateLabel,
  formatDateTimeLabel,
  getTodayTimetableDay,
} from "@/lib/dashboard/shared"
import { getPortalFinanceSummary } from "@/lib/portal/finance"
import { listPortalGrades } from "@/lib/portal/grades"
import { listPortalLibraryLoans } from "@/lib/portal/library"
import { listPortalStudents } from "@/lib/portal/students"
import { listPortalTimetableSlots } from "@/lib/portal/timetable"
import { listPortalAttendanceRecords } from "@/lib/portal/attendance"
import { listPortalAnnouncements } from "@/lib/portal/announcements"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  getAssistantAccessPolicy,
  getPortalStudentAudienceLines,
  type AssistantActorContext,
} from "@/lib/assistant/policies"
import type { DashboardScope } from "@/types/dashboard"
import type { PortalAssistantContext } from "@/lib/assistant/policies"

export type AssistantHistoryMessage = {
  role: "user" | "assistant" | "system"
  content: string
}

export type AssistantContextSection = {
  title: string
  lines: string[]
}

export type AssistantContextDocument = {
  roleLabel: string
  schoolName: string | null
  scopeDescription: string
  sections: AssistantContextSection[]
}

function compactLines(lines: Array<string | null | undefined>) {
  return lines
    .map((line) => line?.trim() ?? "")
    .filter((line) => line.length > 0)
}

function takeRecentMessages(
  messages: AssistantHistoryMessage[],
  maxMessages = 6
): AssistantHistoryMessage[] {
  return messages.slice(-maxMessages)
}

function renderSection(section: AssistantContextSection) {
  return [`### ${section.title}`, ...section.lines.map((line) => `- ${line}`)].join(
    "\n"
  )
}

export function renderAssistantContextDocument(
  document: AssistantContextDocument
): string {
  const parts = [
    "## الدور الحالي",
    `- ${document.roleLabel}`,
    "## نطاق القراءة المسموح",
    `- ${document.scopeDescription}`,
    "## المدرسة الحالية",
    `- ${document.schoolName ?? "غير متاحة"}`,
  ]

  for (const section of document.sections) {
    if (section.lines.length > 0) {
      parts.push(renderSection(section))
    }
  }

  return parts.join("\n")
}

async function getSchoolDisplayName(schoolId: string | null) {
  if (!schoolId) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("schools")
    .select("name")
    .eq("id", schoolId)
    .maybeSingle()

  return data?.name ?? null
}

function toDashboardScope(context: AssistantActorContext): DashboardScope | null {
  if (context.kind !== "dashboard" || !context.school_id) {
    return null
  }

  return {
    user_id: context.user_id,
    role: context.role as DashboardScope["role"],
    tenant_id: context.tenant_id,
    school_id: context.school_id,
  }
}

async function buildAdminSections(context: AssistantActorContext) {
  const scope = toDashboardScope(context)

  if (!scope) {
    return []
  }

  const [summary, supabase] = await Promise.all([
    getAdminDashboardSummary(scope),
    createSupabaseServerClient(),
  ])
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const attendanceStart = sevenDaysAgo.toISOString().slice(0, 10)

  const [
    attendanceCountResult,
    attendanceStatusResult,
    recentInvoicesResult,
    activeLoansResult,
    overdueLoansResult,
    surveysCountResult,
  ] = await Promise.all([
    supabase
      .from("attendance_sessions")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .gte("session_date", attendanceStart),
    supabase
      .from("attendance_records")
      .select("status")
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .gte("recorded_at", `${attendanceStart}T00:00:00.000Z`),
    supabase
      .from("invoices")
      .select("invoice_number, balance_amount, due_date")
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .in("status", ["issued", "partially_paid"])
      .gt("balance_amount", 0)
      .order("issue_date", { ascending: false })
      .limit(3),
    supabase
      .from("book_loans")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .eq("status", "active"),
    supabase
      .from("book_loans")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .eq("status", "active")
      .lt("due_at", new Date().toISOString()),
    supabase
      .from("surveys")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .in("status", ["draft", "published"]),
  ])

  const attendanceRows = attendanceStatusResult.data ?? []
  const presentCount = attendanceRows.filter((row) => row.status === "present").length
  const absentCount = attendanceRows.filter((row) => row.status === "absent").length
  const lateCount = attendanceRows.filter((row) => row.status === "late").length

  return [
    {
      title: "نظرة عامة",
      lines: compactLines([
        `عدد الطلاب النشطين: ${summary.activeStudentsCount}.`,
        `طلبات القبول المعلقة: ${summary.pendingAdmissionsCount}.`,
        `الشكاوى المفتوحة: ${summary.openComplaintsCount}.`,
        `الفواتير غير المسددة: ${summary.unpaidInvoicesCount}.`,
      ]),
    },
    {
      title: "الحضور خلال آخر 7 أيام",
      lines: compactLines([
        `جلسات الحضور المسجلة: ${attendanceCountResult.count ?? 0}.`,
        `حاضر: ${presentCount}، غائب: ${absentCount}، متأخر: ${lateCount}.`,
      ]),
    },
    {
      title: "المالية",
      lines: compactLines([
        ...summary.recentPayments
          .slice(0, 3)
          .map((item) => `${item.title}: ${item.description}${item.meta ? ` (${item.meta})` : ""}`),
        ...(recentInvoicesResult.data ?? []).map(
          (invoice) =>
            `فاتورة ${invoice.invoice_number}: رصيد ${formatCurrencyLabel(
              Number(invoice.balance_amount)
            )}${invoice.due_date ? `، الاستحقاق ${formatDateLabel(invoice.due_date)}` : ""}.`
        ),
      ]),
    },
    {
      title: "المكتبة والتواصل",
      lines: compactLines([
        `الإعارات النشطة: ${activeLoansResult.count ?? 0}، والمتأخرة: ${overdueLoansResult.count ?? 0}.`,
        `الإعلانات الحديثة: ${summary.recentAnnouncements.length}.`,
        `الفعاليات القادمة: ${summary.upcomingEvents.length}.`,
        `الاستبيانات المتاحة أو المنشورة: ${surveysCountResult.count ?? 0}.`,
      ]),
    },
  ]
}

async function buildTeacherSections(context: AssistantActorContext) {
  const scope = toDashboardScope(context)

  if (!scope) {
    return []
  }

  const summary = await getTeacherDashboardSummary(scope)

  return [
    {
      title: "تكليفاتك الحالية",
      lines: compactLines([
        `عدد المواد أو التكليفات النشطة: ${summary.assignedSubjectsCount}.`,
        `حصص اليوم المجدولة: ${summary.todayTimetableSlotsCount}.`,
        ...summary.todayTimetableSlots
          .slice(0, 4)
          .map((item) => `${item.title}: ${item.description}${item.meta ? ` (${item.meta})` : ""}`),
      ]),
    },
    {
      title: "الحضور والدرجات ضمن نطاقك",
      lines: compactLines([
        ...summary.recentAttendanceSessions
          .slice(0, 4)
          .map((item) => `${item.title}: ${item.description}${item.meta ? ` (${item.meta})` : ""}`),
        ...summary.recentExams
          .slice(0, 4)
          .map((item) => `${item.title}: ${item.description}${item.meta ? ` (${item.meta})` : ""}`),
      ]),
    },
    {
      title: "إعلانات المدرسة",
      lines: compactLines(
        summary.recentAnnouncements
          .slice(0, 4)
          .map((item) => `${item.title}: ${item.description}`)
      ),
    },
  ]
}

async function buildAccountantSections(context: AssistantActorContext) {
  const scope = toDashboardScope(context)

  if (!scope) {
    return []
  }

  const [summary, supabase] = await Promise.all([
    getAccountantDashboardSummary(scope),
    createSupabaseServerClient(),
  ])
  const recentInvoicesResult = await supabase
    .from("invoices")
    .select("invoice_number, total_amount, balance_amount, status")
    .eq("tenant_id", scope.tenant_id)
    .eq("school_id", scope.school_id)
    .order("created_at", { ascending: false })
    .limit(4)

  return [
    {
      title: "الملخص المالي",
      lines: compactLines([
        `إجمالي الفواتير: ${summary.invoicesCount}.`,
        `فواتير مدفوعة: ${summary.paidInvoicesCount}، جزئية: ${summary.partialInvoicesCount}، غير مدفوعة أو مسودة: ${summary.unpaidInvoicesCount}.`,
        `إجمالي الدفعات المسجلة: ${summary.paymentsCount}.`,
        `الرصيد المستحق الحالي: ${formatCurrencyLabel(summary.outstandingBalance)}.`,
        `الخصومات النشطة: ${summary.activeDiscountsCount}.`,
      ]),
    },
    {
      title: "أحدث الفواتير",
      lines: compactLines(
        (recentInvoicesResult.data ?? []).map(
          (invoice) =>
            `${invoice.invoice_number}: الإجمالي ${formatCurrencyLabel(
              Number(invoice.total_amount)
            )}، الرصيد ${formatCurrencyLabel(Number(invoice.balance_amount))}، الحالة ${invoice.status}.`
        )
      ),
    },
    {
      title: "أحدث الدفعات",
      lines: compactLines(
        summary.recentPayments
          .slice(0, 4)
          .map((item) => `${item.title}: ${item.description}${item.meta ? ` (${item.meta})` : ""}`)
      ),
    },
  ]
}

async function buildLibrarianSections(context: AssistantActorContext) {
  const scope = toDashboardScope(context)

  if (!scope) {
    return []
  }

  const summary = await getLibrarianDashboardSummary(scope)

  return [
    {
      title: "حالة المكتبة",
      lines: compactLines([
        `عناوين الفهرس: ${summary.catalogCount}.`,
        `إجمالي النسخ: ${summary.copiesCount}، والمتاح منها: ${summary.availableCopiesCount}.`,
        `الإعارات النشطة: ${summary.activeLoansCount}، والمتأخرة: ${summary.overdueLoansCount}.`,
      ]),
    },
    {
      title: "الحركة الأخيرة",
      lines: compactLines(
        summary.recentLoans
          .slice(0, 4)
          .map((item) => `${item.title}: ${item.description}${item.meta ? ` (${item.meta})` : ""}`)
      ),
    },
  ]
}

type ParentAssistantContext = PortalAssistantContext & {
  role: "parent"
}

type StudentAssistantContext = PortalAssistantContext & {
  role: "student"
}

async function buildParentSections(context: ParentAssistantContext) {
  const [students, attendance, grades, finance, announcements] = await Promise.all([
    listPortalStudents(context),
    listPortalAttendanceRecords(context),
    listPortalGrades(context),
    getPortalFinanceSummary(context),
    listPortalAnnouncements(context),
  ])

  const audienceLines = getPortalStudentAudienceLines(
    context.role,
    context.linked_students
  )

  return [
    {
      title: "الأبناء ضمن هذا الحساب",
      lines: compactLines(
        audienceLines.length > 0
          ? audienceLines.map((name) => `الطالب المرتبط: ${name}.`)
          : ["لا توجد روابط طلابية مفعلة حاليًا."]
      ),
    },
    {
      title: "الحضور والدرجات",
      lines: compactLines([
        ...attendance
          .slice(0, 5)
          .map(
            (item) =>
              `${item.student_name}: ${item.status} في ${formatDateLabel(
                item.session_date ?? item.recorded_at
              )}.`
          ),
        ...grades.examResults
          .slice(0, 5)
          .map(
            (item) =>
              `${item.student_name}: ${item.exam_title} - ${item.score ?? "-"} / ${item.max_score}.`
          ),
      ]),
    },
    {
      title: "المالية والإعلانات",
      lines: compactLines([
        finance.canViewDetails
          ? `عدد الفواتير المرئية: ${finance.invoices.length}، وعدد الدفعات: ${finance.payments.length}.`
          : finance.note,
        ...finance.invoices
          .filter((invoice) => invoice.balance_amount > 0)
          .slice(0, 5)
          .map(
            (invoice) =>
              `${invoice.student_name}: فاتورة ${invoice.invoice_number} برصيد ${formatCurrencyLabel(invoice.balance_amount)}.`
          ),
        ...announcements.announcements
          .slice(0, 4)
          .map(
            (announcement) =>
              `${announcement.title}: نشر في ${formatDateTimeLabel(
                announcement.published_at
              )}.`
          ),
      ]),
    },
    {
      title: "السجل الأكاديمي الحديث",
      lines: compactLines(
        students.slice(0, 5).map((student) => {
          const enrollment = student.active_enrollment

          if (!enrollment) {
            return `${student.full_name}: لا يوجد تسجيل دراسي نشط حاليًا.`
          }

          return `${student.full_name}: ${enrollment.grade_level_name} - ${enrollment.class_name} ${enrollment.class_section}.`
        })
      ),
    },
  ]
}

async function buildStudentSections(
  context: StudentAssistantContext
) {
  const [students, attendance, grades, timetable, announcements, libraryLoans] =
    await Promise.all([
      listPortalStudents(context),
      listPortalAttendanceRecords(context),
      listPortalGrades(context),
      listPortalTimetableSlots(context),
      listPortalAnnouncements(context),
      listPortalLibraryLoans(context),
    ])

  const audienceLines = getPortalStudentAudienceLines(
    context.role,
    context.linked_students,
    context.linked_student_ids[0] ?? null
  )
  const todayDay = getTodayTimetableDay()

  return [
    {
      title: "البيانات الشخصية ضمن النطاق",
      lines: compactLines(
        audienceLines.length > 0
          ? audienceLines.map((name) => `الطالب الحالي: ${name}.`)
          : ["لا توجد بيانات طالب مرتبطة بهذا الحساب حاليًا."]
      ),
    },
    {
      title: "الحضور والدرجات",
      lines: compactLines([
        ...attendance
          .slice(0, 5)
          .map(
            (item) =>
              `حضور ${formatDateLabel(item.session_date ?? item.recorded_at)}: ${item.status}.`
          ),
        ...grades.gradeEntries
          .slice(0, 5)
          .map(
            (item) =>
              `${item.title} - ${item.subject_name}: ${item.score} / ${item.max_score}.`
          ),
      ]),
    },
    {
      title: "الجدول والإعلانات",
      lines: compactLines([
        ...timetable
          .filter((slot) => slot.day_of_week === todayDay)
          .slice(0, 5)
          .map(
            (slot) =>
              `${slot.subject_name}: ${slot.starts_at} - ${slot.ends_at}${slot.room_name ? `، ${slot.room_name}` : ""}.`
          ),
        ...announcements.announcements
          .slice(0, 4)
          .map(
            (announcement) =>
              `${announcement.title}: ${formatDateTimeLabel(
                announcement.published_at
              )}.`
          ),
      ]),
    },
    {
      title: "المكتبة",
      lines: compactLines([
        `عدد الإعارات ضمن نطاقك: ${libraryLoans.length}.`,
        ...libraryLoans
          .slice(0, 5)
          .map(
            (loan) =>
              `${loan.book_title}: الاستعارة ${formatDateLabel(
                loan.borrowed_at
              )}، الاستحقاق ${formatDateLabel(loan.due_at)}.`
          ),
        ...students
          .slice(0, 1)
          .map((student) =>
            student.active_enrollment
              ? `صفك الحالي: ${student.active_enrollment.grade_level_name} - ${student.active_enrollment.class_name} ${student.active_enrollment.class_section}.`
              : "لا يوجد صف دراسي نشط ظاهر في السياق الحالي."
          ),
      ]),
    },
  ]
}

export async function buildAssistantContextDocument(input: {
  context: AssistantActorContext
  recentMessages: AssistantHistoryMessage[]
}): Promise<AssistantContextDocument> {
  const policy = getAssistantAccessPolicy(input.context)
  const schoolName = await getSchoolDisplayName(
    input.context.kind === "dashboard" ? input.context.school_id : input.context.school_id
  )

  if (!policy.allowed) {
    return {
      roleLabel: policy.roleLabel,
      schoolName,
      scopeDescription: policy.scopeDescription,
      sections: [
        {
          title: "الوصول",
          lines: compactLines([
            policy.denialTitle,
            policy.denialDescription,
          ]),
        },
      ],
    }
  }

  let sections: AssistantContextSection[] = []

  if (input.context.kind === "portal") {
    sections =
      input.context.role === "parent"
        ? await buildParentSections(input.context as ParentAssistantContext)
        : await buildStudentSections(input.context as StudentAssistantContext)
  } else {
    if (
      input.context.role === "system_admin" ||
      input.context.role === "school_admin"
    ) {
      sections = await buildAdminSections(input.context)
    } else if (input.context.role === "teacher") {
      sections = await buildTeacherSections(input.context)
    } else if (input.context.role === "accountant") {
      sections = await buildAccountantSections(input.context)
    } else if (input.context.role === "librarian") {
      sections = await buildLibrarianSections(input.context)
    }
  }

  const recentMessagesSection = takeRecentMessages(input.recentMessages).map(
    (message) => {
      if (message.role === "assistant") {
        return `المساعد: ${message.content}`
      }

      if (message.role === "system") {
        return `النظام: ${message.content}`
      }

      return `المستخدم: ${message.content}`
    }
  )

  sections.push({
    title: "آخر الرسائل",
    lines:
      recentMessagesSection.length > 0
        ? recentMessagesSection
        : ["لا توجد رسائل سابقة ضمن هذه المحادثة."],
  })

  return {
    roleLabel: policy.roleLabel,
    schoolName,
    scopeDescription: policy.scopeDescription,
    sections,
  }
}
