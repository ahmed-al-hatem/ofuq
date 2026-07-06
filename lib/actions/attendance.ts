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
import { requireAttendanceContext } from "@/lib/attendance/context"
import {
  closeAttendanceSession,
  createAttendanceSession,
} from "@/lib/attendance/attendance-sessions"
import {
  recordManualAttendance,
  recordQrAttendance,
} from "@/lib/attendance/attendance-records"
import {
  reviewAbsenceExcuse,
  submitAbsenceExcuse,
} from "@/lib/attendance/absence-excuses"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const attendanceMutationRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

const attendanceReviewRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
] as const

const attendanceSessionMethodValues = ["manual", "qr"] as const
const attendanceStatusValues = ["present", "absent", "late"] as const
const excuseReviewStatusValues = ["approved", "rejected"] as const

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))

const optionalTimeSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || /^\d{2}:\d{2}$/.test(value), {
    message: "الوقت غير صالح",
  })

const requiredDateSchema = z
  .string()
  .trim()
  .min(1, "التاريخ مطلوب")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "التاريخ غير صالح")

const createAttendanceSessionSchema = z
  .object({
    academic_year_id: z.string().uuid("السنة الدراسية مطلوبة"),
    class_id: z.string().uuid("الشعبة مطلوبة"),
    term_id: z
      .string()
      .trim()
      .transform((value) => (value === "" ? null : value))
      .refine((value) => value === null || z.string().uuid().safeParse(value).success, {
        message: "الفصل الدراسي غير صالح",
      }),
    session_date: requiredDateSchema,
    method: z.enum(attendanceSessionMethodValues),
    starts_at: optionalTimeSchema,
    ends_at: optionalTimeSchema,
    notes: optionalTextSchema,
  })
  .refine(
    (value) =>
      !value.starts_at || !value.ends_at || value.starts_at < value.ends_at,
    {
      message: "وقت البداية يجب أن يكون قبل وقت النهاية",
      path: ["ends_at"],
    }
  )

const recordManualAttendanceSchema = z.object({
  attendance_session_id: z.string().uuid("جلسة الحضور مطلوبة"),
  student_id: z.string().uuid("الطالب مطلوب"),
  status: z.enum(attendanceStatusValues),
  notes: optionalTextSchema,
})

const recordQrAttendanceSchema = z.object({
  attendance_session_id: z.string().uuid("جلسة الحضور مطلوبة"),
  qr_token: z
    .string()
    .trim()
    .min(1, "رمز الطالب مطلوب")
    .uuid("رمز الطالب غير صالح"),
})

const closeAttendanceSessionSchema = z.object({
  attendance_session_id: z.string().uuid("جلسة الحضور مطلوبة"),
})

const submitAbsenceExcuseSchema = z.object({
  attendance_record_id: z.string().uuid("سجل الحضور مطلوب"),
  reason: z.string().trim().min(1, "سبب العذر مطلوب"),
})

const reviewAbsenceExcuseSchema = z.object({
  excuse_id: z.string().uuid("العذر مطلوب"),
  status: z.enum(excuseReviewStatusValues),
  review_notes: optionalTextSchema,
})

export type AttendanceActionState =
  | ActionResult<{ redirectTo?: string }>
  | null

async function writeAttendanceAuditLog(input: {
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

function mapAttendanceError(error: unknown): string {
  const message = error instanceof Error ? error.message : ""

  if (message === "ATTENDANCE_SESSION_NOT_FOUND") {
    return "تعذر العثور على جلسة الحضور داخل المدرسة الحالية"
  }

  if (message === "ATTENDANCE_SESSION_NOT_OPEN") {
    return "جلسة الحضور ليست مفتوحة"
  }

  if (message === "ACADEMIC_YEAR_NOT_FOUND") {
    return "السنة الدراسية لا تتبع المدرسة الحالية"
  }

  if (message === "CLASS_NOT_FOUND" || message === "CLASS_YEAR_MISMATCH") {
    return "الشعبة لا تتبع السنة الدراسية أو المدرسة الحالية"
  }

  if (message === "TERM_NOT_FOUND" || message === "TERM_YEAR_MISMATCH") {
    return "الفصل الدراسي لا يتبع السنة الدراسية المحددة"
  }

  if (message === "STUDENT_NOT_FOUND" || message === "QR_STUDENT_NOT_FOUND") {
    return "تعذر العثور على الطالب داخل المدرسة الحالية"
  }

  if (message === "STUDENT_NOT_ACTIVE") {
    return "لا يمكن تسجيل حضور طالب غير نشط"
  }

  if (message === "ACTIVE_ENROLLMENT_NOT_FOUND") {
    return "الطالب غير مسجل بشكل نشط في شعبة هذه الجلسة"
  }

  if (message === "ATTENDANCE_RECORD_NOT_FOUND") {
    return "تعذر العثور على سجل الحضور داخل المدرسة الحالية"
  }

  if (message === "ATTENDANCE_RECORD_NOT_EXCUSABLE") {
    return "يمكن تقديم العذر فقط لسجل غياب أو تأخر"
  }

  if (message === "ABSENCE_EXCUSE_NOT_FOUND") {
    return "تعذر العثور على العذر داخل المدرسة الحالية"
  }

  if (message.toLowerCase().includes("duplicate")) {
    return "يوجد سجل مماثل بالفعل"
  }

  return "تعذر حفظ بيانات الحضور حاليًا"
}

export async function createAttendanceSessionAction(
  _previousState: AttendanceActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireAttendanceContext(attendanceMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createAttendanceSessionSchema.safeParse({
    academic_year_id: formData.get("academic_year_id"),
    class_id: formData.get("class_id"),
    term_id: formData.get("term_id"),
    session_date: formData.get("session_date"),
    method: formData.get("method"),
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
    notes: formData.get("notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات جلسة الحضور فشل"
    )
  }

  let sessionId: string

  try {
    const session = await createAttendanceSession(
      contextResult.data,
      parsedValues.data
    )
    sessionId = session.id

    await writeAttendanceAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "attendance.session.created",
      entity_type: "attendance_session",
      entity_id: session.id,
      metadata: {
        class_id: session.class_id,
        academic_year_id: session.academic_year_id,
        method: session.method,
      },
    })
  } catch (error) {
    return failure(mapAttendanceError(error))
  }

  revalidatePath(appRoutes.attendance)
  revalidatePath(appRoutes.attendanceSessions)
  redirect(appRoutes.attendanceSessionDetails(sessionId))
}

export async function closeAttendanceSessionAction(
  _previousState: AttendanceActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireAttendanceContext(attendanceMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = closeAttendanceSessionSchema.safeParse({
    attendance_session_id: formData.get("attendance_session_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const session = await closeAttendanceSession(
      contextResult.data,
      parsedValues.data.attendance_session_id
    )

    await writeAttendanceAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "attendance.session.closed",
      entity_type: "attendance_session",
      entity_id: session.id,
      metadata: {
        class_id: session.class_id,
        academic_year_id: session.academic_year_id,
      },
    })
  } catch (error) {
    return failure(mapAttendanceError(error))
  }

  revalidatePath(appRoutes.attendance)
  revalidatePath(appRoutes.attendanceSessions)
  revalidatePath(
    appRoutes.attendanceSessionDetails(parsedValues.data.attendance_session_id)
  )
  return success({}, "تم إغلاق جلسة الحضور")
}

export async function recordManualAttendanceAction(
  _previousState: AttendanceActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireAttendanceContext(attendanceMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = recordManualAttendanceSchema.safeParse({
    attendance_session_id: formData.get("attendance_session_id"),
    student_id: formData.get("student_id"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const record = await recordManualAttendance(
      contextResult.data,
      parsedValues.data
    )

    await writeAttendanceAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "attendance.record.manual_saved",
      entity_type: "attendance_record",
      entity_id: record.id,
      metadata: {
        session_id: record.attendance_session_id,
        student_id: record.student_id,
        status: record.status,
      },
    })
  } catch (error) {
    return failure(mapAttendanceError(error))
  }

  revalidatePath(
    appRoutes.attendanceSessionDetails(parsedValues.data.attendance_session_id)
  )
  return success({}, "تم حفظ الحضور")
}

export async function recordQrAttendanceAction(
  _previousState: AttendanceActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireAttendanceContext(attendanceMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = recordQrAttendanceSchema.safeParse({
    attendance_session_id: formData.get("attendance_session_id"),
    qr_token: formData.get("qr_token"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من رمز الطالب فشل"
    )
  }

  try {
    const record = await recordQrAttendance(contextResult.data, parsedValues.data)

    await writeAttendanceAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "attendance.record.qr_saved",
      entity_type: "attendance_record",
      entity_id: record.id,
      metadata: {
        session_id: record.attendance_session_id,
        student_id: record.student_id,
        status: record.status,
      },
    })
  } catch (error) {
    return failure(mapAttendanceError(error))
  }

  revalidatePath(
    appRoutes.attendanceSessionDetails(parsedValues.data.attendance_session_id)
  )
  return success({}, "تم تسجيل الطالب عبر الرمز")
}

export async function submitAbsenceExcuseAction(
  _previousState: AttendanceActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireAttendanceContext(attendanceMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = submitAbsenceExcuseSchema.safeParse({
    attendance_record_id: formData.get("attendance_record_id"),
    reason: formData.get("reason"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات العذر فشل"
    )
  }

  try {
    const excuse = await submitAbsenceExcuse(
      contextResult.data,
      parsedValues.data
    )

    await writeAttendanceAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "attendance.excuse.submitted",
      entity_type: "absence_excuse",
      entity_id: excuse.id,
      metadata: {
        attendance_record_id: excuse.attendance_record_id,
        student_id: excuse.student_id,
      },
    })
  } catch (error) {
    return failure(mapAttendanceError(error))
  }

  revalidatePath(appRoutes.attendanceExcuses)
  return success({}, "تم تقديم العذر")
}

export async function reviewAbsenceExcuseAction(
  _previousState: AttendanceActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireAttendanceContext(attendanceReviewRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = reviewAbsenceExcuseSchema.safeParse({
    excuse_id: formData.get("excuse_id"),
    status: formData.get("status"),
    review_notes: formData.get("review_notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من قرار العذر فشل"
    )
  }

  try {
    const excuse = await reviewAbsenceExcuse(
      contextResult.data,
      parsedValues.data
    )

    await writeAttendanceAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: `attendance.excuse.${excuse.status}`,
      entity_type: "absence_excuse",
      entity_id: excuse.id,
      metadata: {
        attendance_record_id: excuse.attendance_record_id,
        student_id: excuse.student_id,
      },
    })
  } catch (error) {
    return failure(mapAttendanceError(error))
  }

  revalidatePath(appRoutes.attendanceExcuses)
  return success({}, "تم تحديث العذر")
}
