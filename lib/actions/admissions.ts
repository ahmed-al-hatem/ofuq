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
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  approveAdmissionAndCreateStudent,
  createAdmission,
  updateAdmissionStatus,
} from "@/lib/students/admissions"
import { requireStudentContext } from "@/lib/students/context"
import type { GuardianRelation, StudentGender } from "@/types/students"

const admissionRoleValues = ["father", "mother", "guardian", "other"] as const
const studentGenderValues = ["male", "female"] as const
const reviewableStatusValues = ["pending", "rejected", "cancelled"] as const

const admissionFieldToNull = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))

const optionalEmailSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.string().email().safeParse(value).success,
    "البريد الإلكتروني غير صحيح"
  )
  .transform((value) => (value === "" ? null : value))

const optionalDateSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "تاريخ الميلاد غير صالح"
  )
  .transform((value) => (value === "" ? null : value))

const createAdmissionSchema = z.object({
  student_first_name: z.string().trim().min(1, "الاسم الأول مطلوب"),
  student_middle_name: admissionFieldToNull,
  student_last_name: z.string().trim().min(1, "اسم العائلة مطلوب"),
  gender: z
    .union([z.enum(studentGenderValues), z.literal("")])
    .transform((value) => (value === "" ? null : (value as StudentGender | null))),
  birth_date: optionalDateSchema,
  nationality: admissionFieldToNull,
  guardian_name: z.string().trim().min(1, "اسم ولي الأمر مطلوب"),
  guardian_email: optionalEmailSchema,
  guardian_phone: z.string().trim().min(1, "رقم هاتف ولي الأمر مطلوب"),
  guardian_relation: z.enum(admissionRoleValues),
  notes: admissionFieldToNull,
})

const updateAdmissionStatusSchema = z.object({
  admission_id: z.string().uuid(),
  status: z.enum(reviewableStatusValues),
  decision_notes: admissionFieldToNull,
})

const approveAdmissionSchema = z.object({
  admission_id: z.string().uuid(),
  decision_notes: admissionFieldToNull,
})

const admissionCreateAllowedRoles = [
  USER_ROLES.PARENT,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.SYSTEM_ADMIN,
] as const

const admissionManageAllowedRoles = [
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.SYSTEM_ADMIN,
] as const

export type CreateAdmissionActionState =
  | ActionResult<{ redirectTo: string }>
  | null

async function writeAuditLog(input: {
  actor_user_id: string
  tenant_id: string
  school_id: string
  action: string
  entity_id: string
  metadata?: Record<string, string | null>
}): Promise<void> {
  const supabase = await createSupabaseServerClient()

  await supabase.from("audit_logs").insert({
    tenant_id: input.tenant_id,
    school_id: input.school_id,
    actor_user_id: input.actor_user_id,
    action: input.action,
    entity_type: "student_module",
    entity_id: input.entity_id,
    metadata: input.metadata ?? {},
  })
}

export async function createAdmissionAction(
  _previousState: CreateAdmissionActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string }>> {
  const contextResult = await requireStudentContext(admissionCreateAllowedRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createAdmissionSchema.safeParse({
    student_first_name: formData.get("student_first_name"),
    student_middle_name: formData.get("student_middle_name"),
    student_last_name: formData.get("student_last_name"),
    gender: formData.get("gender"),
    birth_date: formData.get("birth_date"),
    nationality: formData.get("nationality"),
    guardian_name: formData.get("guardian_name"),
    guardian_email: formData.get("guardian_email"),
    guardian_phone: formData.get("guardian_phone"),
    guardian_relation: formData.get("guardian_relation"),
    notes: formData.get("notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات طلب القبول فشل"
    )
  }

  try {
    const admission = await createAdmission(contextResult.data, {
      ...parsedValues.data,
      guardian_relation: parsedValues.data.guardian_relation as GuardianRelation,
    })

    await writeAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "admission.created",
      entity_id: admission.id,
      metadata: {
        status: admission.status,
      },
    })
  } catch {
    return failure("تعذر إنشاء طلب القبول حاليًا")
  }

  revalidatePath(appRoutes.admissions)
  redirect(appRoutes.admissions)
}

export async function updateAdmissionStatusAction(
  formData: FormData
): Promise<void> {
  const contextResult = await requireStudentContext(admissionManageAllowedRoles)

  if (!contextResult.ok) {
    redirect(appRoutes.admissions)
  }

  const parsedValues = updateAdmissionStatusSchema.safeParse({
    admission_id: formData.get("admission_id"),
    status: formData.get("status"),
    decision_notes: formData.get("decision_notes"),
  })

  if (!parsedValues.success) {
    redirect(appRoutes.admissions)
  }

  try {
    const updatedAdmission = await updateAdmissionStatus(
      contextResult.data,
      parsedValues.data.admission_id,
      {
        status: parsedValues.data.status,
        decision_notes: parsedValues.data.decision_notes,
      }
    )

    if (updatedAdmission) {
      await writeAuditLog({
        actor_user_id: contextResult.data.user_id,
        tenant_id: contextResult.data.tenant_id,
        school_id: contextResult.data.school_id,
        action: `admission.${updatedAdmission.status}`,
        entity_id: updatedAdmission.id,
        metadata: {
          status: updatedAdmission.status,
        },
      })
    }
  } catch {
    redirect(appRoutes.admissions)
  }

  revalidatePath(appRoutes.admissions)
  redirect(appRoutes.admissions)
}

export async function approveAdmissionAction(
  formData: FormData
): Promise<void> {
  const contextResult = await requireStudentContext(admissionManageAllowedRoles)

  if (!contextResult.ok) {
    redirect(appRoutes.admissions)
  }

  const parsedValues = approveAdmissionSchema.safeParse({
    admission_id: formData.get("admission_id"),
    decision_notes: formData.get("decision_notes"),
  })

  if (!parsedValues.success) {
    redirect(appRoutes.admissions)
  }

  try {
    const approvalResult = await approveAdmissionAndCreateStudent(
      contextResult.data,
      parsedValues.data.admission_id,
      parsedValues.data.decision_notes
    )

    if (approvalResult) {
      await writeAuditLog({
        actor_user_id: contextResult.data.user_id,
        tenant_id: contextResult.data.tenant_id,
        school_id: contextResult.data.school_id,
        action: "admission.approved",
        entity_id: parsedValues.data.admission_id,
        metadata: {
          student_id: approvalResult.student_id,
          student_number: approvalResult.student_number,
        },
      })

      await writeAuditLog({
        actor_user_id: contextResult.data.user_id,
        tenant_id: contextResult.data.tenant_id,
        school_id: contextResult.data.school_id,
        action: "student.created_from_admission",
        entity_id: approvalResult.student_id,
        metadata: {
          student_number: approvalResult.student_number,
          admission_id: parsedValues.data.admission_id,
        },
      })
    }
  } catch {
    redirect(appRoutes.admissions)
  }

  revalidatePath(appRoutes.admissions)
  revalidatePath(appRoutes.students)
  redirect(appRoutes.admissions)
}
