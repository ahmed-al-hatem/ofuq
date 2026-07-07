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
  archiveAnnouncement,
  createAnnouncement,
  publishAnnouncement,
} from "@/lib/communication/announcements"
import { requireCommunicationContext } from "@/lib/communication/context"
import {
  cancelSchoolEvent,
  createSchoolEvent,
} from "@/lib/communication/events"
import {
  archiveMessageForRecipient,
  markMessageAsRead,
  sendMessage,
} from "@/lib/communication/messages"
import { markNotificationAsRead } from "@/lib/communication/notifications"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const communicationManagementRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
] as const

const messagingRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
  USER_ROLES.ACCOUNTANT,
  USER_ROLES.LIBRARIAN,
] as const

const notificationRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
  USER_ROLES.ACCOUNTANT,
  USER_ROLES.LIBRARIAN,
] as const

const announcementTargetTypeValues = [
  "school",
  "role",
  "grade_level",
  "class",
] as const

const announcementStatusRoleValues = [
  "system_admin",
  "school_admin",
  "teacher",
  "parent",
  "student",
  "accountant",
  "librarian",
] as const

const schoolEventTargetTypeValues = ["school", "grade_level", "class"] as const

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

const optionalDateTimeSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || !Number.isNaN(new Date(value).getTime()), {
    message: "التاريخ والوقت غير صالحين",
  })
  .transform((value) => (value ? new Date(value).toISOString() : null))

const requiredDateTimeSchema = z
  .string()
  .trim()
  .min(1, "التاريخ والوقت مطلوبان")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "التاريخ والوقت غير صالحين",
  })
  .transform((value) => new Date(value).toISOString())

const sendMessageSchema = z.object({
  recipient_user_ids: z
    .array(z.string().uuid("المستلم غير صالح"))
    .min(1, "يجب اختيار مستلم واحد على الأقل"),
  subject: z.string().trim().min(1, "موضوع الرسالة مطلوب"),
  body: z.string().trim().min(1, "نص الرسالة مطلوب"),
  related_student_id: optionalUuidSchema,
})

const messageIdSchema = z.object({
  message_id: z.string().uuid("الرسالة مطلوبة"),
})

const createAnnouncementSchema = z
  .object({
    title: z.string().trim().min(1, "عنوان الإعلان مطلوب"),
    body: z.string().trim().min(1, "نص الإعلان مطلوب"),
    target_type: z.enum(announcementTargetTypeValues),
    target_role: z.preprocess(
      (value) => {
        const normalizedValue = String(value ?? "").trim()
        return normalizedValue === "" ? null : normalizedValue
      },
      z.enum(announcementStatusRoleValues).nullable()
    ),
    grade_level_id: optionalUuidSchema,
    class_id: optionalUuidSchema,
    expires_at: optionalDateTimeSchema,
  })
  .refine((value) => value.target_type !== "role" || Boolean(value.target_role), {
    message: "يجب اختيار الدور المستهدف",
    path: ["target_role"],
  })
  .refine(
    (value) => value.target_type !== "grade_level" || Boolean(value.grade_level_id),
    {
      message: "يجب اختيار الصف الدراسي",
      path: ["grade_level_id"],
    }
  )
  .refine((value) => value.target_type !== "class" || Boolean(value.class_id), {
    message: "يجب اختيار الشعبة",
    path: ["class_id"],
  })

const announcementIdSchema = z.object({
  announcement_id: z.string().uuid("الإعلان مطلوب"),
})

const createSchoolEventSchema = z
  .object({
    title: z.string().trim().min(1, "عنوان الحدث مطلوب"),
    description: optionalTextSchema,
    starts_at: requiredDateTimeSchema,
    ends_at: requiredDateTimeSchema,
    location: optionalTextSchema,
    target_type: z.enum(schoolEventTargetTypeValues),
    grade_level_id: optionalUuidSchema,
    class_id: optionalUuidSchema,
  })
  .refine((value) => value.starts_at < value.ends_at, {
    message: "وقت البداية يجب أن يكون قبل وقت النهاية",
    path: ["ends_at"],
  })
  .refine(
    (value) => value.target_type !== "grade_level" || Boolean(value.grade_level_id),
    {
      message: "يجب اختيار الصف الدراسي",
      path: ["grade_level_id"],
    }
  )
  .refine((value) => value.target_type !== "class" || Boolean(value.class_id), {
    message: "يجب اختيار الشعبة",
    path: ["class_id"],
  })

const schoolEventIdSchema = z.object({
  school_event_id: z.string().uuid("الحدث مطلوب"),
})

const notificationIdSchema = z.object({
  notification_id: z.string().uuid("الإشعار مطلوب"),
})

export type CommunicationActionState =
  | ActionResult<{ redirectTo?: string }>
  | null

async function writeCommunicationAuditLog(input: {
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

function mapCommunicationError(error: unknown): string {
  const message = error instanceof Error ? error.message : ""

  if (message === "MESSAGE_REQUIRES_RECIPIENT") {
    return "يجب اختيار مستلم واحد على الأقل"
  }

  if (message === "RECIPIENT_NOT_FOUND") {
    return "أحد المستلمين لا يملك عضوية نشطة في المدرسة الحالية"
  }

  if (message === "RELATED_STUDENT_NOT_FOUND") {
    return "الطالب المرتبط لا يتبع المدرسة الحالية"
  }

  if (message === "MESSAGE_NOT_FOUND" || message === "MESSAGE_RECIPIENT_NOT_FOUND") {
    return "تعذر العثور على الرسالة داخل نطاقك الحالي"
  }

  if (
    message === "GRADE_LEVEL_NOT_FOUND" ||
    message === "CLASS_NOT_FOUND" ||
    message === "ANNOUNCEMENT_TARGET_REQUIRED" ||
    message === "SCHOOL_EVENT_TARGET_REQUIRED"
  ) {
    return "تعذر التحقق من الجمهور المستهدف داخل المدرسة الحالية"
  }

  if (message === "ANNOUNCEMENT_NOT_FOUND") {
    return "تعذر العثور على الإعلان داخل المدرسة الحالية"
  }

  if (message === "ANNOUNCEMENT_ARCHIVED") {
    return "لا يمكن نشر إعلان مؤرشف"
  }

  if (message === "ANNOUNCEMENT_EXPIRES_TOO_EARLY") {
    return "تاريخ انتهاء الإعلان يجب أن يكون في المستقبل"
  }

  if (message === "SCHOOL_EVENT_NOT_FOUND") {
    return "تعذر العثور على الحدث داخل المدرسة الحالية"
  }

  if (message === "SCHOOL_EVENT_NOT_SCHEDULED") {
    return "يمكن إلغاء الأحداث المجدولة فقط"
  }

  if (message === "SCHOOL_EVENT_TIME_ORDER") {
    return "وقت البداية يجب أن يكون قبل وقت النهاية"
  }

  if (message === "NOTIFICATION_NOT_FOUND") {
    return "تعذر العثور على الإشعار داخل نطاقك الحالي"
  }

  if (message.toLowerCase().includes("duplicate")) {
    return "يوجد سجل مماثل بالفعل"
  }

  return "تعذر حفظ بيانات التواصل حاليًا"
}

export async function sendMessageAction(
  _previousState: CommunicationActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireCommunicationContext(messagingRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = sendMessageSchema.safeParse({
    recipient_user_ids: formData.getAll("recipient_user_ids"),
    subject: formData.get("subject"),
    body: formData.get("body"),
    related_student_id: formData.get("related_student_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات الرسالة فشل"
    )
  }

  let messageId = ""

  try {
    const message = await sendMessage(contextResult.data, parsedValues.data)
    messageId = message.id

    await writeCommunicationAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "communication.message.sent",
      entity_type: "message",
      entity_id: message.id,
      metadata: {
        recipient_count: parsedValues.data.recipient_user_ids.length,
        related_student_id: message.related_student_id,
      },
    })
  } catch (error) {
    return failure(mapCommunicationError(error))
  }

  revalidatePath(appRoutes.communication)
  revalidatePath(appRoutes.communicationMessages)
  redirect(appRoutes.communicationMessageDetails(messageId))
}

export async function markMessageReadAction(
  _previousState: CommunicationActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireCommunicationContext(messagingRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = messageIdSchema.safeParse({
    message_id: formData.get("message_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const recipient = await markMessageAsRead(
      contextResult.data,
      parsedValues.data.message_id
    )

    await writeCommunicationAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "communication.message.read",
      entity_type: "message",
      entity_id: recipient.message_id,
      metadata: {},
    })
  } catch (error) {
    return failure(mapCommunicationError(error))
  }

  revalidatePath(appRoutes.communicationMessages)
  revalidatePath(appRoutes.communicationMessageDetails(parsedValues.data.message_id))
  return success({}, "تم تعليم الرسالة كمقروءة")
}

export async function archiveMessageAction(
  _previousState: CommunicationActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireCommunicationContext(messagingRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = messageIdSchema.safeParse({
    message_id: formData.get("message_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const recipient = await archiveMessageForRecipient(
      contextResult.data,
      parsedValues.data.message_id
    )

    await writeCommunicationAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "communication.message.archived",
      entity_type: "message",
      entity_id: recipient.message_id,
      metadata: {},
    })
  } catch (error) {
    return failure(mapCommunicationError(error))
  }

  revalidatePath(appRoutes.communicationMessages)
  revalidatePath(appRoutes.communicationMessageDetails(parsedValues.data.message_id))
  return success({}, "تم أرشفة الرسالة")
}

export async function createAnnouncementAction(
  _previousState: CommunicationActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireCommunicationContext(
    communicationManagementRoles
  )

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createAnnouncementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    target_type: formData.get("target_type"),
    target_role: formData.get("target_role"),
    grade_level_id: formData.get("grade_level_id"),
    class_id: formData.get("class_id"),
    expires_at: formData.get("expires_at"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات الإعلان فشل"
    )
  }

  try {
    const announcement = await createAnnouncement(
      contextResult.data,
      parsedValues.data
    )

    await writeCommunicationAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "communication.announcement.created",
      entity_type: "announcement",
      entity_id: announcement.id,
      metadata: { target_type: announcement.target_type },
    })
  } catch (error) {
    return failure(mapCommunicationError(error))
  }

  revalidatePath(appRoutes.communication)
  revalidatePath(appRoutes.communicationAnnouncements)
  redirect(appRoutes.communicationAnnouncements)
}

export async function publishAnnouncementAction(
  _previousState: CommunicationActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireCommunicationContext(
    communicationManagementRoles
  )

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = announcementIdSchema.safeParse({
    announcement_id: formData.get("announcement_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const announcement = await publishAnnouncement(
      contextResult.data,
      parsedValues.data.announcement_id
    )

    await writeCommunicationAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "communication.announcement.published",
      entity_type: "announcement",
      entity_id: announcement.id,
      metadata: { target_type: announcement.target_type },
    })
  } catch (error) {
    return failure(mapCommunicationError(error))
  }

  revalidatePath(appRoutes.communication)
  revalidatePath(appRoutes.communicationAnnouncements)
  return success({}, "تم نشر الإعلان")
}

export async function archiveAnnouncementAction(
  _previousState: CommunicationActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireCommunicationContext(
    communicationManagementRoles
  )

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = announcementIdSchema.safeParse({
    announcement_id: formData.get("announcement_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const announcement = await archiveAnnouncement(
      contextResult.data,
      parsedValues.data.announcement_id
    )

    await writeCommunicationAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "communication.announcement.archived",
      entity_type: "announcement",
      entity_id: announcement.id,
      metadata: { target_type: announcement.target_type },
    })
  } catch (error) {
    return failure(mapCommunicationError(error))
  }

  revalidatePath(appRoutes.communication)
  revalidatePath(appRoutes.communicationAnnouncements)
  return success({}, "تم أرشفة الإعلان")
}

export async function createSchoolEventAction(
  _previousState: CommunicationActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireCommunicationContext(
    communicationManagementRoles
  )

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createSchoolEventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
    location: formData.get("location"),
    target_type: formData.get("target_type"),
    grade_level_id: formData.get("grade_level_id"),
    class_id: formData.get("class_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات الحدث فشل"
    )
  }

  try {
    const event = await createSchoolEvent(contextResult.data, parsedValues.data)

    await writeCommunicationAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "communication.event.created",
      entity_type: "school_event",
      entity_id: event.id,
      metadata: { target_type: event.target_type },
    })
  } catch (error) {
    return failure(mapCommunicationError(error))
  }

  revalidatePath(appRoutes.communication)
  revalidatePath(appRoutes.communicationEvents)
  redirect(appRoutes.communicationEvents)
}

export async function cancelSchoolEventAction(
  _previousState: CommunicationActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireCommunicationContext(
    communicationManagementRoles
  )

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = schoolEventIdSchema.safeParse({
    school_event_id: formData.get("school_event_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const event = await cancelSchoolEvent(
      contextResult.data,
      parsedValues.data.school_event_id
    )

    await writeCommunicationAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "communication.event.cancelled",
      entity_type: "school_event",
      entity_id: event.id,
      metadata: {},
    })
  } catch (error) {
    return failure(mapCommunicationError(error))
  }

  revalidatePath(appRoutes.communication)
  revalidatePath(appRoutes.communicationEvents)
  return success({}, "تم إلغاء الحدث")
}

export async function markNotificationReadAction(
  _previousState: CommunicationActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireCommunicationContext(notificationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = notificationIdSchema.safeParse({
    notification_id: formData.get("notification_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  const schoolWide =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN

  try {
    const notification = await markNotificationAsRead(
      contextResult.data,
      parsedValues.data.notification_id,
      schoolWide
    )

    await writeCommunicationAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "notification.read",
      entity_type: "notification_log",
      entity_id: notification.id,
      metadata: { notification_type: notification.notification_type },
    })
  } catch (error) {
    return failure(mapCommunicationError(error))
  }

  revalidatePath(appRoutes.communicationNotifications)
  return success({}, "تم تعليم الإشعار كمقروء")
}
