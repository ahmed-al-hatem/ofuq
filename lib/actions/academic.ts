"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import {
  failure,
  type ActionResult,
  validationFailure,
} from "@/lib/actions/action-result"
import { requireAcademicContext } from "@/lib/academic/context"
import {
  assignSubjectToGradeLevel,
  createAcademicYear,
  createClass,
  createGradeLevel,
  createSubject,
  createTerm,
  enrollStudentInClass,
} from "@/lib/academic/academic-structure"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const academicMutationRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
] as const

const gradeLevelStageValues = [
  "kindergarten",
  "primary",
  "middle",
  "secondary",
  "other",
] as const

const subjectTypeValues = ["core", "elective", "activity", "other"] as const

const requiredDateSchema = z
  .string()
  .trim()
  .min(1, "التاريخ مطلوب")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "التاريخ غير صالح")

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))

const optionalPositiveNumberSchema = z
  .union([z.string(), z.number(), z.null()])
  .transform((value) => {
    if (value === null) {
      return null
    }

    const stringValue = String(value).trim()
    return stringValue === "" ? null : Number(stringValue)
  })
  .refine((value) => value === null || Number.isInteger(value), {
    message: "يجب إدخال رقم صحيح",
  })
  .refine((value) => value === null || value > 0, {
    message: "يجب أن يكون الرقم أكبر من صفر",
  })

const positiveNumberSchema = z
  .union([z.string(), z.number()])
  .transform((value) => Number(String(value).trim()))
  .refine((value) => Number.isInteger(value), {
    message: "يجب إدخال رقم صحيح",
  })
  .refine((value) => value > 0, {
    message: "يجب أن يكون الرقم أكبر من صفر",
  })

const sortOrderSchema = z
  .union([z.string(), z.number()])
  .transform((value) => {
    const stringValue = String(value).trim()
    return stringValue === "" ? 0 : Number(stringValue)
  })
  .refine((value) => Number.isInteger(value), {
    message: "يجب إدخال رقم صحيح",
  })

const createAcademicYearSchema = z
  .object({
    name: z.string().trim().min(1, "اسم السنة الدراسية مطلوب"),
    code: z.string().trim().min(1, "رمز السنة الدراسية مطلوب"),
    starts_on: requiredDateSchema,
    ends_on: requiredDateSchema,
    is_current: z.boolean(),
  })
  .refine((value) => value.starts_on < value.ends_on, {
    message: "يجب أن يكون تاريخ البداية قبل تاريخ النهاية",
    path: ["ends_on"],
  })

const createTermSchema = z
  .object({
    academic_year_id: z.string().uuid("السنة الدراسية مطلوبة"),
    name: z.string().trim().min(1, "اسم الفصل مطلوب"),
    code: z.string().trim().min(1, "رمز الفصل مطلوب"),
    term_order: positiveNumberSchema,
    starts_on: requiredDateSchema,
    ends_on: requiredDateSchema,
  })
  .refine((value) => value.starts_on < value.ends_on, {
    message: "يجب أن يكون تاريخ البداية قبل تاريخ النهاية",
    path: ["ends_on"],
  })

const createGradeLevelSchema = z.object({
  name: z.string().trim().min(1, "اسم المرحلة مطلوب"),
  code: z.string().trim().min(1, "رمز المرحلة مطلوب"),
  grade_order: positiveNumberSchema,
  stage: z.enum(gradeLevelStageValues),
})

const createClassSchema = z.object({
  academic_year_id: z.string().uuid("السنة الدراسية مطلوبة"),
  grade_level_id: z.string().uuid("الصف الدراسي مطلوب"),
  name: z.string().trim().min(1, "اسم الشعبة مطلوب"),
  section: z.string().trim().min(1, "رمز الشعبة مطلوب"),
  capacity: optionalPositiveNumberSchema,
  room_name: optionalTextSchema,
})

const createSubjectSchema = z.object({
  name: z.string().trim().min(1, "اسم المادة مطلوب"),
  code: z.string().trim().min(1, "رمز المادة مطلوب"),
  subject_type: z.enum(subjectTypeValues),
  description: optionalTextSchema,
})

const assignSubjectToGradeLevelSchema = z.object({
  academic_year_id: z.string().uuid("السنة الدراسية مطلوبة"),
  grade_level_id: z.string().uuid("الصف الدراسي مطلوب"),
  subject_id: z.string().uuid("المادة مطلوبة"),
  weekly_periods: optionalPositiveNumberSchema,
  is_required: z.boolean(),
  sort_order: sortOrderSchema,
})

const enrollStudentInClassSchema = z.object({
  academic_year_id: z.string().uuid("السنة الدراسية مطلوبة"),
  class_id: z.string().uuid("الشعبة مطلوبة"),
  student_id: z.string().uuid("الطالب مطلوب"),
  enrolled_on: requiredDateSchema,
})

export type AcademicActionState =
  | ActionResult<{ redirectTo: string }>
  | null

async function writeAcademicAuditLog(input: {
  actor_user_id: string
  tenant_id: string
  school_id: string
  action: string
  entity_id: string
  metadata?: Record<string, string | number | boolean | null>
}): Promise<void> {
  const supabase = await createSupabaseServerClient()

  await supabase.from("audit_logs").insert({
    tenant_id: input.tenant_id,
    school_id: input.school_id,
    actor_user_id: input.actor_user_id,
    action: input.action,
    entity_type: "academic_module",
    entity_id: input.entity_id,
    metadata: input.metadata ?? {},
  })
}

function mapAcademicError(error: unknown): string {
  const message = error instanceof Error ? error.message : ""

  if (message === "TERM_OUTSIDE_ACADEMIC_YEAR") {
    return "تواريخ الفصل يجب أن تكون داخل السنة الدراسية المحددة"
  }

  if (message === "ACTIVE_ENROLLMENT_EXISTS") {
    return "الطالب لديه تسجيل نشط بالفعل في هذه السنة الدراسية"
  }

  if (message === "CLASS_YEAR_MISMATCH") {
    return "الشعبة لا تتبع السنة الدراسية المحددة"
  }

  if (
    message === "ACADEMIC_YEAR_NOT_FOUND" ||
    message === "GRADE_LEVEL_NOT_FOUND" ||
    message === "SUBJECT_NOT_FOUND" ||
    message === "CLASS_NOT_FOUND" ||
    message === "STUDENT_NOT_FOUND"
  ) {
    return "تعذر التحقق من ملكية السجل المحدد داخل المدرسة الحالية"
  }

  if (message.toLowerCase().includes("duplicate")) {
    return "يوجد سجل بنفس البيانات داخل المدرسة الحالية"
  }

  return "تعذر حفظ البيانات حاليًا"
}

export async function createAcademicYearAction(
  _previousState: AcademicActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string }>> {
  const contextResult = await requireAcademicContext(academicMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createAcademicYearSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    starts_on: formData.get("starts_on"),
    ends_on: formData.get("ends_on"),
    is_current: formData.get("is_current") === "on",
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات السنة الدراسية فشل"
    )
  }

  try {
    const academicYear = await createAcademicYear(
      contextResult.data,
      parsedValues.data
    )

    await writeAcademicAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "academic_year.created",
      entity_id: academicYear.id,
      metadata: {
        code: academicYear.code,
        is_current: academicYear.is_current,
      },
    })
  } catch (error) {
    return failure(mapAcademicError(error))
  }

  revalidatePath(appRoutes.academic)
  revalidatePath(appRoutes.academicYears)
  redirect(appRoutes.academicYears)
}

export async function createTermAction(
  _previousState: AcademicActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string }>> {
  const contextResult = await requireAcademicContext(academicMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createTermSchema.safeParse({
    academic_year_id: formData.get("academic_year_id"),
    name: formData.get("name"),
    code: formData.get("code"),
    term_order: formData.get("term_order"),
    starts_on: formData.get("starts_on"),
    ends_on: formData.get("ends_on"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات الفصل فشل"
    )
  }

  try {
    const term = await createTerm(contextResult.data, parsedValues.data)

    await writeAcademicAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "term.created",
      entity_id: term.id,
      metadata: {
        academic_year_id: term.academic_year_id,
        code: term.code,
      },
    })
  } catch (error) {
    return failure(mapAcademicError(error))
  }

  revalidatePath(appRoutes.academic)
  revalidatePath(appRoutes.academicYears)
  redirect(appRoutes.academicYears)
}

export async function createGradeLevelAction(
  _previousState: AcademicActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string }>> {
  const contextResult = await requireAcademicContext(academicMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createGradeLevelSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    grade_order: formData.get("grade_order"),
    stage: formData.get("stage"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات الصف فشل"
    )
  }

  try {
    const gradeLevel = await createGradeLevel(
      contextResult.data,
      parsedValues.data
    )

    await writeAcademicAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "grade_level.created",
      entity_id: gradeLevel.id,
      metadata: {
        code: gradeLevel.code,
        stage: gradeLevel.stage,
      },
    })
  } catch (error) {
    return failure(mapAcademicError(error))
  }

  revalidatePath(appRoutes.academic)
  revalidatePath(appRoutes.academicGradeLevels)
  redirect(appRoutes.academicGradeLevels)
}

export async function createClassAction(
  _previousState: AcademicActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string }>> {
  const contextResult = await requireAcademicContext(academicMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createClassSchema.safeParse({
    academic_year_id: formData.get("academic_year_id"),
    grade_level_id: formData.get("grade_level_id"),
    name: formData.get("name"),
    section: formData.get("section"),
    capacity: formData.get("capacity"),
    room_name: formData.get("room_name"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات الشعبة فشل"
    )
  }

  try {
    const classSection = await createClass(contextResult.data, parsedValues.data)

    await writeAcademicAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "class.created",
      entity_id: classSection.id,
      metadata: {
        academic_year_id: classSection.academic_year_id,
        grade_level_id: classSection.grade_level_id,
      },
    })
  } catch (error) {
    return failure(mapAcademicError(error))
  }

  revalidatePath(appRoutes.academic)
  revalidatePath(appRoutes.academicClasses)
  redirect(appRoutes.academicClasses)
}

export async function createSubjectAction(
  _previousState: AcademicActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string }>> {
  const contextResult = await requireAcademicContext(academicMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createSubjectSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    subject_type: formData.get("subject_type"),
    description: formData.get("description"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات المادة فشل"
    )
  }

  try {
    const subject = await createSubject(contextResult.data, parsedValues.data)

    await writeAcademicAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "subject.created",
      entity_id: subject.id,
      metadata: {
        code: subject.code,
        subject_type: subject.subject_type,
      },
    })
  } catch (error) {
    return failure(mapAcademicError(error))
  }

  revalidatePath(appRoutes.academic)
  revalidatePath(appRoutes.academicSubjects)
  redirect(appRoutes.academicSubjects)
}

export async function assignSubjectToGradeLevelAction(
  _previousState: AcademicActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string }>> {
  const contextResult = await requireAcademicContext(academicMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = assignSubjectToGradeLevelSchema.safeParse({
    academic_year_id: formData.get("academic_year_id"),
    grade_level_id: formData.get("grade_level_id"),
    subject_id: formData.get("subject_id"),
    weekly_periods: formData.get("weekly_periods"),
    is_required: formData.get("is_required") === "on",
    sort_order: formData.get("sort_order"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات ربط المادة فشل"
    )
  }

  try {
    const assignment = await assignSubjectToGradeLevel(
      contextResult.data,
      parsedValues.data
    )

    await writeAcademicAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "grade_level_subject.assigned",
      entity_id: assignment.id,
      metadata: {
        academic_year_id: assignment.academic_year_id,
        grade_level_id: assignment.grade_level_id,
        subject_id: assignment.subject_id,
      },
    })
  } catch (error) {
    return failure(mapAcademicError(error))
  }

  revalidatePath(appRoutes.academic)
  revalidatePath(appRoutes.academicSubjects)
  redirect(appRoutes.academicSubjects)
}

export async function enrollStudentInClassAction(
  _previousState: AcademicActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string }>> {
  const contextResult = await requireAcademicContext(academicMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = enrollStudentInClassSchema.safeParse({
    academic_year_id: formData.get("academic_year_id"),
    class_id: formData.get("class_id"),
    student_id: formData.get("student_id"),
    enrolled_on: formData.get("enrolled_on"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات تسجيل الطالب فشل"
    )
  }

  try {
    const enrollment = await enrollStudentInClass(
      contextResult.data,
      parsedValues.data
    )

    await writeAcademicAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "student.enrolled",
      entity_id: enrollment.id,
      metadata: {
        academic_year_id: enrollment.academic_year_id,
        class_id: enrollment.class_id,
        student_id: enrollment.student_id,
        grade_level_id: enrollment.grade_level_id,
      },
    })
  } catch (error) {
    return failure(mapAcademicError(error))
  }

  revalidatePath(appRoutes.academic)
  revalidatePath(appRoutes.academicEnrollments)
  redirect(appRoutes.academicEnrollments)
}
