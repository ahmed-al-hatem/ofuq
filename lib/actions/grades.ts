"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import {
  failure,
  success,
  type ActionResult,
  validationFailure,
} from "@/lib/actions/action-result"
import { requireGradesContext } from "@/lib/grades/context"
import { createExam } from "@/lib/grades/exams"
import {
  publishExamResults,
  saveExamResult,
} from "@/lib/grades/exam-results"
import { createGradeEntry } from "@/lib/grades/grade-entries"
import {
  generateReportCard,
  updateReportCardStatus,
} from "@/lib/grades/report-cards"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const gradesMutationRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

const gradesPublishRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
] as const

const examResultStatusValues = [
  "draft",
  "entered",
  "published",
  "absent",
  "excused",
] as const

const gradeEntryCategoryValues = [
  "quiz",
  "assignment",
  "homework",
  "project",
  "participation",
  "behavior",
  "other",
] as const

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))

const requiredDateSchema = z
  .string()
  .trim()
  .min(1, "التاريخ مطلوب")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "التاريخ غير صالح")

const optionalDateSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "التاريخ غير صالح",
  })

const optionalUuidSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || z.string().uuid().safeParse(value).success, {
    message: "القيمة المحددة غير صالحة",
  })

const positiveDecimalSchema = z
  .union([z.string(), z.number()])
  .transform((value) => Number(String(value).trim()))
  .refine((value) => Number.isFinite(value), {
    message: "يجب إدخال رقم صالح",
  })
  .refine((value) => value > 0, {
    message: "يجب أن يكون الرقم أكبر من صفر",
  })

const nonNegativeDecimalSchema = z
  .union([z.string(), z.number()])
  .transform((value) => Number(String(value).trim()))
  .refine((value) => Number.isFinite(value), {
    message: "يجب إدخال رقم صالح",
  })
  .refine((value) => value >= 0, {
    message: "يجب أن يكون الرقم صفرًا أو أكبر",
  })

const optionalPositiveDecimalSchema = z
  .union([z.string(), z.number(), z.null()])
  .transform((value) => {
    if (value === null) {
      return null
    }

    const stringValue = String(value).trim()
    return stringValue === "" ? null : Number(stringValue)
  })
  .refine((value) => value === null || Number.isFinite(value), {
    message: "يجب إدخال رقم صالح",
  })
  .refine((value) => value === null || value > 0, {
    message: "يجب أن يكون الرقم أكبر من صفر",
  })

const optionalScoreSchema = z
  .union([z.string(), z.number(), z.null()])
  .transform((value) => {
    if (value === null) {
      return null
    }

    const stringValue = String(value).trim()
    return stringValue === "" ? null : Number(stringValue)
  })
  .refine((value) => value === null || Number.isFinite(value), {
    message: "يجب إدخال رقم صالح",
  })
  .refine((value) => value === null || value >= 0, {
    message: "يجب أن يكون الرقم صفرًا أو أكبر",
  })

const createExamSchema = z
  .object({
    academic_year_id: z.string().uuid("السنة الدراسية مطلوبة"),
    term_id: optionalUuidSchema,
    class_id: z.string().uuid("الشعبة مطلوبة"),
    subject_id: z.string().uuid("المادة مطلوبة"),
    title: z.string().trim().min(1, "عنوان الاختبار مطلوب"),
    exam_date: optionalDateSchema,
    max_score: positiveDecimalSchema,
    weight: optionalPositiveDecimalSchema,
    notes: optionalTextSchema,
  })
  .refine((value) => value.weight === null || value.weight <= 100, {
    message: "الوزن يجب ألا يتجاوز 100",
    path: ["weight"],
  })

const saveExamResultSchema = z
  .object({
    exam_id: z.string().uuid("الاختبار مطلوب"),
    student_id: z.string().uuid("الطالب مطلوب"),
    score: optionalScoreSchema,
    status: z.enum(examResultStatusValues),
    notes: optionalTextSchema,
  })
  .refine(
    (value) =>
      value.status === "absent" || value.status === "excused"
        ? value.score === null
        : value.score !== null,
    {
      message: "الدرجة مطلوبة إلا في حالة الغياب أو العذر",
      path: ["score"],
    }
  )

const publishExamResultsSchema = z.object({
  exam_id: z.string().uuid("الاختبار مطلوب"),
})

const createGradeEntrySchema = z
  .object({
    academic_year_id: z.string().uuid("السنة الدراسية مطلوبة"),
    term_id: optionalUuidSchema,
    class_id: z.string().uuid("الشعبة مطلوبة"),
    subject_id: z.string().uuid("المادة مطلوبة"),
    student_id: z.string().uuid("الطالب مطلوب"),
    category: z.enum(gradeEntryCategoryValues),
    title: z.string().trim().min(1, "عنوان الدرجة مطلوب"),
    score: nonNegativeDecimalSchema,
    max_score: positiveDecimalSchema,
    weight: optionalPositiveDecimalSchema,
    recorded_on: requiredDateSchema,
    notes: optionalTextSchema,
  })
  .refine((value) => value.score <= value.max_score, {
    message: "الدرجة لا يمكن أن تتجاوز الدرجة العظمى",
    path: ["score"],
  })
  .refine((value) => value.weight === null || value.weight <= 100, {
    message: "الوزن يجب ألا يتجاوز 100",
    path: ["weight"],
  })

const generateReportCardSchema = z.object({
  academic_year_id: z.string().uuid("السنة الدراسية مطلوبة"),
  term_id: optionalUuidSchema,
  class_id: z.string().uuid("الشعبة مطلوبة"),
  student_id: z.string().uuid("الطالب مطلوب"),
  teacher_remarks: optionalTextSchema,
  admin_notes: optionalTextSchema,
})

const reportCardIdSchema = z.object({
  report_card_id: z.string().uuid("التقرير مطلوب"),
})

export type GradesActionState =
  | ActionResult<{ redirectTo?: string; savedCount?: number }>
  | null

async function writeGradesAuditLog(input: {
  actor_user_id: string
  tenant_id: string
  school_id: string
  action: string
  entity_type: string
  entity_id: string
  metadata?: Record<string, string | number | boolean | null>
}): Promise<void> {
  const supabase = await createSupabaseServerClient()

  await supabase.from("audit_logs").insert({
    tenant_id: input.tenant_id,
    school_id: input.school_id,
    actor_user_id: input.actor_user_id,
    action: input.action,
    entity_type: input.entity_type,
    entity_id: input.entity_id,
    metadata: input.metadata ?? {},
  })
}

function mapGradesError(error: unknown): string {
  const message = error instanceof Error ? error.message : ""

  if (message === "PUBLISH_NOT_ALLOWED") {
    return "نشر الدرجات والتقارير متاح للإدارة فقط"
  }

  if (message === "EXAM_NOT_FOUND") {
    return "تعذر العثور على الاختبار داخل المدرسة الحالية"
  }

  if (message === "REPORT_CARD_NOT_FOUND") {
    return "تعذر العثور على التقرير داخل المدرسة الحالية"
  }

  if (message === "SCORE_OUT_OF_RANGE") {
    return "الدرجة خارج النطاق المسموح"
  }

  if (message === "SCORE_REQUIRED") {
    return "الدرجة مطلوبة لهذه الحالة"
  }

  if (message === "ABSENCE_SCORE_MUST_BE_EMPTY") {
    return "لا يتم إدخال درجة عند تسجيل الطالب كغائب أو معذور"
  }

  if (
    message === "ACADEMIC_YEAR_NOT_FOUND" ||
    message === "CLASS_NOT_FOUND" ||
    message === "SUBJECT_NOT_FOUND" ||
    message === "STUDENT_NOT_FOUND"
  ) {
    return "تعذر التحقق من ملكية السجل المحدد داخل المدرسة الحالية"
  }

  if (message === "STUDENT_NOT_ACTIVE") {
    return "لا يمكن تسجيل درجات لطالب غير نشط"
  }

  if (message === "ACTIVE_ENROLLMENT_NOT_FOUND") {
    return "الطالب غير مسجل بشكل نشط في الشعبة والسنة المحددة"
  }

  if (message === "CLASS_YEAR_MISMATCH") {
    return "الشعبة لا تتبع السنة الدراسية المحددة"
  }

  if (message === "TERM_NOT_FOUND" || message === "TERM_YEAR_MISMATCH") {
    return "الفصل الدراسي لا يتبع السنة الدراسية المحددة"
  }

  if (message === "SUBJECT_NOT_ASSIGNED_TO_GRADE") {
    return "المادة غير مربوطة بصف هذه الشعبة في السنة المحددة"
  }

  if (message.toLowerCase().includes("duplicate")) {
    return "يوجد سجل مماثل بالفعل"
  }

  return "تعذر حفظ بيانات الدرجات حاليًا"
}

export async function createExamAction(
  _previousState: GradesActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireGradesContext(gradesMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createExamSchema.safeParse({
    academic_year_id: formData.get("academic_year_id"),
    term_id: formData.get("term_id"),
    class_id: formData.get("class_id"),
    subject_id: formData.get("subject_id"),
    title: formData.get("title"),
    exam_date: formData.get("exam_date"),
    max_score: formData.get("max_score"),
    weight: formData.get("weight"),
    notes: formData.get("notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات الاختبار فشل"
    )
  }

  let examId: string

  try {
    const exam = await createExam(contextResult.data, parsedValues.data)
    examId = exam.id

    await writeGradesAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "grades.exam.created",
      entity_type: "exam",
      entity_id: exam.id,
      metadata: {
        class_id: exam.class_id,
        subject_id: exam.subject_id,
        academic_year_id: exam.academic_year_id,
      },
    })
  } catch (error) {
    return failure(mapGradesError(error))
  }

  revalidatePath(appRoutes.grades)
  revalidatePath(appRoutes.gradesExams)
  redirect(appRoutes.gradesExamDetails(examId))
}

export async function saveExamResultAction(
  _previousState: GradesActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireGradesContext(gradesMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = saveExamResultSchema.safeParse({
    exam_id: formData.get("exam_id"),
    student_id: formData.get("student_id"),
    score: formData.get("score"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const result = await saveExamResult(contextResult.data, parsedValues.data)

    await writeGradesAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "grades.exam_result.saved",
      entity_type: "exam_result",
      entity_id: result.id,
      metadata: {
        exam_id: result.exam_id,
        student_id: result.student_id,
        class_id: result.class_id,
        subject_id: result.subject_id,
      },
    })
  } catch (error) {
    return failure(mapGradesError(error))
  }

  revalidatePath(appRoutes.gradesExamDetails(parsedValues.data.exam_id))
  return success({}, "تم حفظ درجة الطالب")
}

export async function saveBulkExamResultsAction(
  _previousState: GradesActionState,
  formData: FormData
): Promise<ActionResult<{ savedCount: number }>> {
  const contextResult = await requireGradesContext(gradesMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const examId = String(formData.get("exam_id") ?? "")
  const studentIds = formData.getAll("student_id").map(String)
  let savedCount = 0

  if (!z.string().uuid().safeParse(examId).success) {
    return validationFailure({ exam_id: ["الاختبار مطلوب"] })
  }

  try {
    for (const studentId of studentIds) {
      const scoreValue = formData.get(`score_${studentId}`)
      const statusValue = formData.get(`status_${studentId}`)
      const notesValue = formData.get(`notes_${studentId}`)
      const parsedValues = saveExamResultSchema.safeParse({
        exam_id: examId,
        student_id: studentId,
        score: scoreValue,
        status: statusValue,
        notes: notesValue,
      })

      if (!parsedValues.success) {
        continue
      }

      await saveExamResult(contextResult.data, parsedValues.data)
      savedCount += 1
    }
  } catch (error) {
    return failure(mapGradesError(error))
  }

  revalidatePath(appRoutes.gradesExamDetails(examId))
  return success({ savedCount }, "تم حفظ الدرجات المدخلة")
}

export async function publishExamResultsAction(
  _previousState: GradesActionState,
  formData: FormData
): Promise<ActionResult<{ savedCount?: number }>> {
  const contextResult = await requireGradesContext(gradesPublishRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = publishExamResultsSchema.safeParse({
    exam_id: formData.get("exam_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  let publishedCount: number

  try {
    publishedCount = await publishExamResults(
      contextResult.data,
      parsedValues.data.exam_id
    )

    await writeGradesAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "grades.exam_results.published",
      entity_type: "exam",
      entity_id: parsedValues.data.exam_id,
      metadata: {
        published_count: publishedCount,
      },
    })
  } catch (error) {
    return failure(mapGradesError(error))
  }

  revalidatePath(appRoutes.grades)
  revalidatePath(appRoutes.gradesExams)
  revalidatePath(appRoutes.gradesExamDetails(parsedValues.data.exam_id))
  return success(
    { savedCount: publishedCount },
    `تم نشر ${publishedCount} نتيجة`
  )
}

export async function createGradeEntryAction(
  _previousState: GradesActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireGradesContext(gradesMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createGradeEntrySchema.safeParse({
    academic_year_id: formData.get("academic_year_id"),
    term_id: formData.get("term_id"),
    class_id: formData.get("class_id"),
    subject_id: formData.get("subject_id"),
    student_id: formData.get("student_id"),
    category: formData.get("category"),
    title: formData.get("title"),
    score: formData.get("score"),
    max_score: formData.get("max_score"),
    weight: formData.get("weight"),
    recorded_on: formData.get("recorded_on"),
    notes: formData.get("notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات الدرجة فشل"
    )
  }

  try {
    const entry = await createGradeEntry(contextResult.data, parsedValues.data)

    await writeGradesAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "grades.grade_entry.created",
      entity_type: "grade_entry",
      entity_id: entry.id,
      metadata: {
        class_id: entry.class_id,
        subject_id: entry.subject_id,
        student_id: entry.student_id,
      },
    })
  } catch (error) {
    return failure(mapGradesError(error))
  }

  revalidatePath(appRoutes.grades)
  revalidatePath(appRoutes.gradeEntries)
  return success({}, "تم حفظ الدرجة")
}

export async function generateReportCardAction(
  _previousState: GradesActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireGradesContext(gradesMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = generateReportCardSchema.safeParse({
    academic_year_id: formData.get("academic_year_id"),
    term_id: formData.get("term_id"),
    class_id: formData.get("class_id"),
    student_id: formData.get("student_id"),
    teacher_remarks: formData.get("teacher_remarks"),
    admin_notes: formData.get("admin_notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات التقرير فشل"
    )
  }

  let reportCardId: string

  try {
    const reportCard = await generateReportCard(
      contextResult.data,
      parsedValues.data
    )
    reportCardId = reportCard.id

    await writeGradesAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "grades.report_card.generated",
      entity_type: "report_card",
      entity_id: reportCard.id,
      metadata: {
        class_id: reportCard.class_id,
        student_id: reportCard.student_id,
        academic_year_id: reportCard.academic_year_id,
      },
    })
  } catch (error) {
    return failure(mapGradesError(error))
  }

  revalidatePath(appRoutes.grades)
  revalidatePath(appRoutes.reportCards)
  redirect(appRoutes.reportCardDetails(reportCardId))
}

export async function publishReportCardAction(
  _previousState: GradesActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireGradesContext(gradesPublishRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = reportCardIdSchema.safeParse({
    report_card_id: formData.get("report_card_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const reportCard = await updateReportCardStatus(
      contextResult.data,
      parsedValues.data.report_card_id,
      "published"
    )

    await writeGradesAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "grades.report_card.published",
      entity_type: "report_card",
      entity_id: reportCard.id,
      metadata: {
        student_id: reportCard.student_id,
        class_id: reportCard.class_id,
      },
    })
  } catch (error) {
    return failure(mapGradesError(error))
  }

  revalidatePath(appRoutes.reportCards)
  revalidatePath(appRoutes.reportCardDetails(parsedValues.data.report_card_id))
  return success({}, "تم نشر التقرير")
}
