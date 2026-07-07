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
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireTimetableContext } from "@/lib/timetable/context"
import { createRoom } from "@/lib/timetable/rooms"
import { createTeacherSubjectAssignment } from "@/lib/timetable/teacher-subject-assignments"
import {
  cancelTimetableSlot,
  createTimetableSlot,
  mapTimetableConflictError,
} from "@/lib/timetable/timetable-slots"

const timetableMutationRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
] as const

const timetableDayValues = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))

const optionalUuidSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || z.string().uuid().safeParse(value).success, {
    message: "القيمة المحددة غير صالحة",
  })

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

const requiredTimeSchema = z
  .string()
  .trim()
  .min(1, "الوقت مطلوب")
  .regex(/^\d{2}:\d{2}$/, "الوقت غير صالح")

const createRoomSchema = z.object({
  name: z.string().trim().min(1, "اسم الغرفة مطلوب"),
  code: optionalTextSchema,
  capacity: optionalPositiveNumberSchema,
  location: optionalTextSchema,
})

const createTeacherSubjectAssignmentSchema = z
  .object({
    academic_year_id: z.string().uuid("السنة الدراسية مطلوبة"),
    teacher_user_id: z.string().uuid("المعلم مطلوب"),
    subject_id: z.string().uuid("المادة مطلوبة"),
    grade_level_id: optionalUuidSchema,
    class_id: optionalUuidSchema,
  })
  .refine((value) => value.grade_level_id !== null || value.class_id !== null, {
    message: "يجب اختيار صف دراسي أو شعبة",
    path: ["grade_level_id"],
  })

const createTimetableSlotSchema = z
  .object({
    academic_year_id: z.string().uuid("السنة الدراسية مطلوبة"),
    term_id: optionalUuidSchema,
    class_id: z.string().uuid("الشعبة مطلوبة"),
    subject_id: z.string().uuid("المادة مطلوبة"),
    teacher_user_id: z.string().uuid("المعلم مطلوب"),
    room_id: optionalUuidSchema,
    day_of_week: z.enum(timetableDayValues),
    starts_at: requiredTimeSchema,
    ends_at: requiredTimeSchema,
    notes: optionalTextSchema,
  })
  .refine((value) => value.starts_at < value.ends_at, {
    message: "وقت البداية يجب أن يكون قبل وقت النهاية",
    path: ["ends_at"],
  })

const cancelTimetableSlotSchema = z.object({
  timetable_slot_id: z.string().uuid("حصة الجدول مطلوبة"),
})

export type TimetableActionState =
  | ActionResult<{ redirectTo?: string }>
  | null

async function writeTimetableAuditLog(input: {
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

function mapTimetableError(error: unknown): string {
  const message = error instanceof Error ? error.message : ""
  const conflictMessage = mapTimetableConflictError(message)

  if (conflictMessage) {
    return conflictMessage
  }

  if (message === "TEACHER_ASSIGNMENT_SCOPE_REQUIRED") {
    return "يجب تحديد صف دراسي أو شعبة لهذا التكليف"
  }

  if (message === "TEACHER_NOT_FOUND") {
    return "المعلم المحدد لا يملك عضوية معلم نشطة في المدرسة الحالية"
  }

  if (message === "TEACHER_ASSIGNMENT_NOT_FOUND") {
    return "لا يوجد تكليف نشط لهذا المعلم مع المادة والشعبة أو الصف المحدد"
  }

  if (message === "ROOM_NOT_FOUND") {
    return "الغرفة المحددة غير نشطة أو لا تتبع المدرسة الحالية"
  }

  if (message === "TIMETABLE_SLOT_NOT_FOUND") {
    return "تعذر العثور على حصة الجدول داخل المدرسة الحالية"
  }

  if (message === "CLASS_YEAR_MISMATCH") {
    return "الشعبة لا تتبع السنة الدراسية المحددة"
  }

  if (message === "CLASS_GRADE_LEVEL_MISMATCH") {
    return "الصف الدراسي لا يطابق الشعبة المحددة"
  }

  if (message === "SUBJECT_NOT_ASSIGNED_TO_GRADE") {
    return "المادة غير مربوطة بصف هذه الشعبة في السنة المحددة"
  }

  if (
    message === "ACADEMIC_YEAR_NOT_FOUND" ||
    message === "TERM_NOT_FOUND" ||
    message === "CLASS_NOT_FOUND" ||
    message === "GRADE_LEVEL_NOT_FOUND" ||
    message === "SUBJECT_NOT_FOUND"
  ) {
    return "تعذر التحقق من ملكية السجل المحدد داخل المدرسة الحالية"
  }

  if (message.toLowerCase().includes("duplicate")) {
    return "يوجد سجل مماثل بالفعل داخل المدرسة الحالية"
  }

  return "تعذر حفظ بيانات الجدول حاليًا"
}

export async function createRoomAction(
  _previousState: TimetableActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireTimetableContext(timetableMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createRoomSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    capacity: formData.get("capacity"),
    location: formData.get("location"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات الغرفة فشل"
    )
  }

  try {
    const room = await createRoom(contextResult.data, parsedValues.data)

    await writeTimetableAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "timetable.room.created",
      entity_type: "room",
      entity_id: room.id,
      metadata: {
        code: room.code,
      },
    })
  } catch (error) {
    return failure(mapTimetableError(error))
  }

  revalidatePath(appRoutes.timetable)
  revalidatePath(appRoutes.timetableRooms)
  redirect(appRoutes.timetableRooms)
}

export async function createTeacherSubjectAssignmentAction(
  _previousState: TimetableActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireTimetableContext(timetableMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createTeacherSubjectAssignmentSchema.safeParse({
    academic_year_id: formData.get("academic_year_id"),
    teacher_user_id: formData.get("teacher_user_id"),
    subject_id: formData.get("subject_id"),
    grade_level_id: formData.get("grade_level_id"),
    class_id: formData.get("class_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات تكليف المعلم فشل"
    )
  }

  try {
    const assignment = await createTeacherSubjectAssignment(
      contextResult.data,
      parsedValues.data
    )

    await writeTimetableAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "timetable.teacher_subject_assignment.created",
      entity_type: "teacher_subject_assignment",
      entity_id: assignment.id,
      metadata: {
        academic_year_id: assignment.academic_year_id,
        teacher_user_id: assignment.teacher_user_id,
        subject_id: assignment.subject_id,
        class_id: assignment.class_id,
        grade_level_id: assignment.grade_level_id,
      },
    })
  } catch (error) {
    return failure(mapTimetableError(error))
  }

  revalidatePath(appRoutes.timetable)
  revalidatePath(appRoutes.timetableAssignments)
  redirect(appRoutes.timetableAssignments)
}

export async function createTimetableSlotAction(
  _previousState: TimetableActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireTimetableContext(timetableMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createTimetableSlotSchema.safeParse({
    academic_year_id: formData.get("academic_year_id"),
    term_id: formData.get("term_id"),
    class_id: formData.get("class_id"),
    subject_id: formData.get("subject_id"),
    teacher_user_id: formData.get("teacher_user_id"),
    room_id: formData.get("room_id"),
    day_of_week: formData.get("day_of_week"),
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
    notes: formData.get("notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات حصة الجدول فشل"
    )
  }

  try {
    const slot = await createTimetableSlot(contextResult.data, parsedValues.data)

    await writeTimetableAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "timetable.slot.created",
      entity_type: "timetable_slot",
      entity_id: slot.id,
      metadata: {
        academic_year_id: slot.academic_year_id,
        class_id: slot.class_id,
        teacher_user_id: slot.teacher_user_id,
        subject_id: slot.subject_id,
        room_id: slot.room_id,
        day_of_week: slot.day_of_week,
      },
    })
  } catch (error) {
    return failure(mapTimetableError(error))
  }

  revalidatePath(appRoutes.timetable)
  revalidatePath(appRoutes.timetableSlots)
  redirect(appRoutes.timetableSlots)
}

export async function cancelTimetableSlotAction(
  _previousState: TimetableActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireTimetableContext(timetableMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = cancelTimetableSlotSchema.safeParse({
    timetable_slot_id: formData.get("timetable_slot_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const slot = await cancelTimetableSlot(
      contextResult.data,
      parsedValues.data.timetable_slot_id
    )

    await writeTimetableAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "timetable.slot.cancelled",
      entity_type: "timetable_slot",
      entity_id: slot.id,
      metadata: {
        class_id: slot.class_id,
        teacher_user_id: slot.teacher_user_id,
        room_id: slot.room_id,
      },
    })
  } catch (error) {
    return failure(mapTimetableError(error))
  }

  revalidatePath(appRoutes.timetable)
  revalidatePath(appRoutes.timetableSlots)
  return success({}, "تم إلغاء حصة الجدول")
}
