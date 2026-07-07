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
import {
  archiveAchievement,
  createAchievement,
  publishAchievement,
} from "@/lib/student-care/achievements"
import {
  closeClinicVisit,
  createClinicVisit,
} from "@/lib/student-care/clinic-visits"
import {
  createDisciplineRecord,
  reviewDisciplineRecord,
} from "@/lib/student-care/discipline"
import { upsertHealthRecord } from "@/lib/student-care/health-records"
import { requireStudentCareContext } from "@/lib/student-care/context"
import { createVaccination } from "@/lib/student-care/vaccinations"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const studentCareAdminRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
] as const

const studentCareTeacherRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

const vaccinationStatusValues = [
  "scheduled",
  "completed",
  "missed",
  "exempted",
  "unknown",
] as const

const disciplineIncidentTypeValues = [
  "behavior",
  "attendance",
  "uniform",
  "bullying",
  "damage",
  "academic_misconduct",
  "other",
] as const

const disciplineSeverityValues = [
  "low",
  "medium",
  "high",
  "critical",
] as const

const disciplineReviewStatusValues = ["reviewed", "resolved"] as const

const achievementCategoryValues = [
  "academic",
  "sports",
  "arts",
  "behavior",
  "attendance",
  "community",
  "competition",
  "other",
] as const

const achievementLevelValues = [
  "class",
  "school",
  "district",
  "regional",
  "national",
  "international",
] as const

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))

const requiredUuidSchema = z.string().uuid("المعرف المحدد غير صالح")

const optionalDateSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .refine(
    (value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "التاريخ غير صالح"
  )

const optionalDateTimeSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .refine(
    (value) => value === null || !Number.isNaN(new Date(value).getTime()),
    "التاريخ والوقت غير صالحين"
  )
  .transform((value) => (value ? new Date(value).toISOString() : null))

const requiredDateSchema = z
  .string()
  .trim()
  .min(1, "التاريخ مطلوب")
  .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), "التاريخ غير صالح")

const healthRecordSchema = z.object({
  student_id: requiredUuidSchema,
  blood_type: optionalTextSchema,
  allergies: optionalTextSchema,
  chronic_conditions: optionalTextSchema,
  medications: optionalTextSchema,
  emergency_notes: optionalTextSchema,
  doctor_name: optionalTextSchema,
  doctor_phone: optionalTextSchema,
})

const vaccinationSchema = z
  .object({
    student_id: requiredUuidSchema,
    vaccine_name: z.string().trim().min(1, "اسم التطعيم مطلوب"),
    dose_label: optionalTextSchema,
    vaccinated_on: optionalDateSchema,
    next_due_on: optionalDateSchema,
    status: z.enum(vaccinationStatusValues),
    notes: optionalTextSchema,
  })
  .refine(
    (value) =>
      !value.vaccinated_on ||
      !value.next_due_on ||
      value.next_due_on >= value.vaccinated_on,
    {
      message: "تاريخ الجرعة القادمة يجب أن يكون بعد أو مساويًا لتاريخ التطعيم",
      path: ["next_due_on"],
    }
  )

const clinicVisitSchema = z.object({
  student_id: requiredUuidSchema,
  visited_at: optionalDateTimeSchema,
  reason: z.string().trim().min(1, "سبب الزيارة مطلوب"),
  symptoms: optionalTextSchema,
  action_taken: optionalTextSchema,
  returned_to_class: z.boolean(),
  guardian_contacted: z.boolean(),
  referred_to_external_care: z.boolean(),
  notes: optionalTextSchema,
})

const clinicVisitIdSchema = z.object({
  visit_id: requiredUuidSchema,
})

const disciplineSchema = z.object({
  student_id: requiredUuidSchema,
  incident_date: requiredDateSchema,
  incident_type: z.enum(disciplineIncidentTypeValues),
  severity: z.enum(disciplineSeverityValues),
  title: z.string().trim().min(1, "عنوان السجل مطلوب"),
  description: z.string().trim().min(1, "وصف الحالة مطلوب"),
  action_taken: optionalTextSchema,
})

const reviewDisciplineSchema = z.object({
  record_id: requiredUuidSchema,
  status: z.enum(disciplineReviewStatusValues),
})

const achievementSchema = z.object({
  student_id: requiredUuidSchema,
  achievement_date: requiredDateSchema,
  title: z.string().trim().min(1, "عنوان الإنجاز مطلوب"),
  description: optionalTextSchema,
  category: z.enum(achievementCategoryValues),
  level: z.enum(achievementLevelValues),
})

const achievementIdSchema = z.object({
  achievement_id: requiredUuidSchema,
})

export type StudentCareActionState =
  | ActionResult<{ redirectTo?: string }>
  | null

async function writeStudentCareAuditLog(input: {
  actor_user_id: string
  tenant_id: string
  school_id: string
  action: string
  entity_type: string
  entity_id: string
  student_id: string
  status: string | null
}): Promise<void> {
  const supabase = await createSupabaseServerClient()

  await supabase.from("audit_logs").insert({
    tenant_id: input.tenant_id,
    school_id: input.school_id,
    actor_user_id: input.actor_user_id,
    action: input.action,
    entity_type: input.entity_type,
    entity_id: input.entity_id,
    metadata: {
      record_id: input.entity_id,
      status: input.status,
      student_id: input.student_id,
    },
  })
}

function parseCheckboxValue(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1"
}

function mapStudentCareError(error: unknown): string {
  const message = error instanceof Error ? error.message : ""

  if (message === "STUDENT_NOT_FOUND") {
    return "تعذر العثور على الطالب داخل المدرسة الحالية"
  }

  if (message === "STUDENT_NOT_ACTIVE") {
    return "يمكن إضافة السجلات الجديدة للطلاب النشطين فقط"
  }

  if (message === "CLINIC_VISIT_NOT_FOUND") {
    return "تعذر العثور على زيارة العيادة داخل المدرسة الحالية"
  }

  if (message === "CLINIC_VISIT_NOT_OPEN") {
    return "يمكن إغلاق الزيارات المفتوحة فقط"
  }

  if (message === "DISCIPLINE_RECORD_NOT_FOUND") {
    return "تعذر العثور على سجل الانضباط داخل المدرسة الحالية"
  }

  if (message === "DISCIPLINE_REVIEW_NOT_ALLOWED") {
    return "مراجعة سجلات الانضباط متاحة للإدارة فقط"
  }

  if (message === "DISCIPLINE_ALREADY_FINALIZED") {
    return "هذا السجل تمت مراجعته نهائيًا بالفعل"
  }

  if (message === "ACHIEVEMENT_NOT_FOUND") {
    return "تعذر العثور على الإنجاز داخل المدرسة الحالية"
  }

  if (message === "ACHIEVEMENT_PUBLISH_NOT_ALLOWED") {
    return "نشر وأرشفة الإنجازات متاحان للإدارة فقط"
  }

  if (message === "ACHIEVEMENT_ALREADY_ARCHIVED") {
    return "الإنجاز مؤرشف بالفعل"
  }

  if (message.toLowerCase().includes("duplicate")) {
    return "يوجد سجل مماثل بالفعل داخل المدرسة الحالية"
  }

  return "تعذر حفظ بيانات الرعاية الطلابية حاليًا"
}

export async function upsertHealthRecordAction(
  _previousState: StudentCareActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireStudentCareContext(studentCareAdminRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = healthRecordSchema.safeParse({
    student_id: formData.get("student_id"),
    blood_type: formData.get("blood_type"),
    allergies: formData.get("allergies"),
    chronic_conditions: formData.get("chronic_conditions"),
    medications: formData.get("medications"),
    emergency_notes: formData.get("emergency_notes"),
    doctor_name: formData.get("doctor_name"),
    doctor_phone: formData.get("doctor_phone"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من السجل الصحي فشل"
    )
  }

  try {
    const record = await upsertHealthRecord(contextResult.data, parsedValues.data)

    await writeStudentCareAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "student_care.health_record.upserted",
      entity_type: "health_record",
      entity_id: record.id,
      student_id: record.student_id,
      status: record.status,
    })
  } catch (error) {
    return failure(mapStudentCareError(error))
  }

  revalidatePath(appRoutes.studentCare)
  revalidatePath(appRoutes.studentCareHealth)
  revalidatePath(appRoutes.studentCareHealthDetails(parsedValues.data.student_id))
  redirect(appRoutes.studentCareHealthDetails(parsedValues.data.student_id))
}

export async function createVaccinationAction(
  _previousState: StudentCareActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireStudentCareContext(studentCareAdminRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = vaccinationSchema.safeParse({
    student_id: formData.get("student_id"),
    vaccine_name: formData.get("vaccine_name"),
    dose_label: formData.get("dose_label"),
    vaccinated_on: formData.get("vaccinated_on"),
    next_due_on: formData.get("next_due_on"),
    status: formData.get("status") || "unknown",
    notes: formData.get("notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من سجل التطعيم فشل"
    )
  }

  try {
    const record = await createVaccination(contextResult.data, parsedValues.data)

    await writeStudentCareAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "student_care.vaccination.created",
      entity_type: "vaccination",
      entity_id: record.id,
      student_id: record.student_id,
      status: record.status,
    })
  } catch (error) {
    return failure(mapStudentCareError(error))
  }

  revalidatePath(appRoutes.studentCare)
  revalidatePath(appRoutes.studentCareVaccinations)
  return success({}, "تمت إضافة سجل التطعيم")
}

export async function createClinicVisitAction(
  _previousState: StudentCareActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireStudentCareContext(studentCareAdminRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = clinicVisitSchema.safeParse({
    student_id: formData.get("student_id"),
    visited_at: formData.get("visited_at"),
    reason: formData.get("reason"),
    symptoms: formData.get("symptoms"),
    action_taken: formData.get("action_taken"),
    returned_to_class: parseCheckboxValue(formData.get("returned_to_class")),
    guardian_contacted: parseCheckboxValue(formData.get("guardian_contacted")),
    referred_to_external_care: parseCheckboxValue(
      formData.get("referred_to_external_care")
    ),
    notes: formData.get("notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من زيارة العيادة فشل"
    )
  }

  try {
    const visit = await createClinicVisit(contextResult.data, parsedValues.data)

    await writeStudentCareAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "student_care.clinic_visit.created",
      entity_type: "clinic_visit",
      entity_id: visit.id,
      student_id: visit.student_id,
      status: visit.status,
    })
  } catch (error) {
    return failure(mapStudentCareError(error))
  }

  revalidatePath(appRoutes.studentCare)
  revalidatePath(appRoutes.studentCareClinicVisits)
  redirect(appRoutes.studentCareClinicVisits)
}

export async function closeClinicVisitAction(
  _previousState: StudentCareActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireStudentCareContext(studentCareAdminRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = clinicVisitIdSchema.safeParse({
    visit_id: formData.get("visit_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const visit = await closeClinicVisit(
      contextResult.data,
      parsedValues.data.visit_id
    )

    await writeStudentCareAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "student_care.clinic_visit.closed",
      entity_type: "clinic_visit",
      entity_id: visit.id,
      student_id: visit.student_id,
      status: visit.status,
    })
  } catch (error) {
    return failure(mapStudentCareError(error))
  }

  revalidatePath(appRoutes.studentCare)
  revalidatePath(appRoutes.studentCareClinicVisits)
  return success({}, "تم إغلاق زيارة العيادة")
}

export async function createDisciplineRecordAction(
  _previousState: StudentCareActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireStudentCareContext(studentCareTeacherRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = disciplineSchema.safeParse({
    student_id: formData.get("student_id"),
    incident_date: formData.get("incident_date"),
    incident_type: formData.get("incident_type") || "other",
    severity: formData.get("severity") || "low",
    title: formData.get("title"),
    description: formData.get("description"),
    action_taken: formData.get("action_taken"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من سجل الانضباط فشل"
    )
  }

  try {
    const record = await createDisciplineRecord(
      contextResult.data,
      parsedValues.data
    )

    await writeStudentCareAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "student_care.discipline.created",
      entity_type: "discipline_record",
      entity_id: record.id,
      student_id: record.student_id,
      status: record.status,
    })
  } catch (error) {
    return failure(mapStudentCareError(error))
  }

  revalidatePath(appRoutes.studentCare)
  revalidatePath(appRoutes.studentCareDiscipline)
  redirect(appRoutes.studentCareDiscipline)
}

export async function reviewDisciplineRecordAction(
  _previousState: StudentCareActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireStudentCareContext(studentCareAdminRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = reviewDisciplineSchema.safeParse({
    record_id: formData.get("record_id"),
    status: formData.get("status"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const record = await reviewDisciplineRecord(
      contextResult.data,
      parsedValues.data
    )

    await writeStudentCareAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "student_care.discipline.reviewed",
      entity_type: "discipline_record",
      entity_id: record.id,
      student_id: record.student_id,
      status: record.status,
    })
  } catch (error) {
    return failure(mapStudentCareError(error))
  }

  revalidatePath(appRoutes.studentCare)
  revalidatePath(appRoutes.studentCareDiscipline)
  return success({}, "تم تحديث حالة سجل الانضباط")
}

export async function createAchievementAction(
  _previousState: StudentCareActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireStudentCareContext(studentCareTeacherRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = achievementSchema.safeParse({
    student_id: formData.get("student_id"),
    achievement_date: formData.get("achievement_date"),
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category") || "other",
    level: formData.get("level") || "school",
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات الإنجاز فشل"
    )
  }

  try {
    const achievement = await createAchievement(
      contextResult.data,
      parsedValues.data
    )

    await writeStudentCareAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "student_care.achievement.created",
      entity_type: "achievement",
      entity_id: achievement.id,
      student_id: achievement.student_id,
      status: achievement.status,
    })
  } catch (error) {
    return failure(mapStudentCareError(error))
  }

  revalidatePath(appRoutes.studentCare)
  revalidatePath(appRoutes.studentCareAchievements)
  redirect(appRoutes.studentCareAchievements)
}

export async function publishAchievementAction(
  _previousState: StudentCareActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireStudentCareContext(studentCareAdminRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = achievementIdSchema.safeParse({
    achievement_id: formData.get("achievement_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const achievement = await publishAchievement(
      contextResult.data,
      parsedValues.data.achievement_id
    )

    await writeStudentCareAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "student_care.achievement.published",
      entity_type: "achievement",
      entity_id: achievement.id,
      student_id: achievement.student_id,
      status: achievement.status,
    })
  } catch (error) {
    return failure(mapStudentCareError(error))
  }

  revalidatePath(appRoutes.studentCare)
  revalidatePath(appRoutes.studentCareAchievements)
  return success({}, "تم نشر الإنجاز")
}

export async function archiveAchievementAction(
  _previousState: StudentCareActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireStudentCareContext(studentCareAdminRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = achievementIdSchema.safeParse({
    achievement_id: formData.get("achievement_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const achievement = await archiveAchievement(
      contextResult.data,
      parsedValues.data.achievement_id
    )

    await writeStudentCareAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "student_care.achievement.archived",
      entity_type: "achievement",
      entity_id: achievement.id,
      student_id: achievement.student_id,
      status: achievement.status,
    })
  } catch (error) {
    return failure(mapStudentCareError(error))
  }

  revalidatePath(appRoutes.studentCare)
  revalidatePath(appRoutes.studentCareAchievements)
  return success({}, "تمت أرشفة الإنجاز")
}
