"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { appRoutes } from "@/constants/routes"
import {
  failure,
  success,
  type ActionResult,
  validationFailure,
} from "@/lib/actions/action-result"
import {
  addComplaintUpdate,
  assignComplaint,
  changeComplaintStatus,
  createComplaint,
  getComplaintDetails,
  resolveComplaint,
} from "@/lib/feedback/complaints"
import {
  feedbackManagementRoles,
  feedbackStaffRoles,
  feedbackSurveyResponseRoles,
  requireFeedbackContext,
} from "@/lib/feedback/context"
import {
  addSurveyQuestion,
  archiveSurvey,
  closeSurvey,
  createSurvey,
  getSurveyDetails,
  publishSurvey,
  submitSurveyResponse,
} from "@/lib/feedback/surveys"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  parseSurveyChoiceOptions,
  parseSurveyRatingOptions,
  type SurveyQuestion,
  type SurveyResponseAnswers,
} from "@/types/feedback"

const complaintCategoryValues = [
  "academic",
  "behavior",
  "finance",
  "transport",
  "facility",
  "communication",
  "staff",
  "other",
] as const

const complaintPriorityValues = ["low", "medium", "high", "urgent"] as const

const complaintStatusValues = [
  "in_review",
  "rejected",
  "cancelled",
] as const

const complaintUpdateTypeValues = ["comment", "internal_note"] as const

const surveyTargetTypeValues = [
  "school",
  "role",
  "grade_level",
  "class",
] as const

const surveyRoleValues = [
  "system_admin",
  "school_admin",
  "teacher",
  "parent",
  "student",
  "accountant",
  "librarian",
] as const

const surveyQuestionTypeValues = [
  "short_text",
  "long_text",
  "single_choice",
  "multiple_choice",
  "rating",
  "yes_no",
] as const

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))

const requiredUuidSchema = z.string().uuid("المعرف المحدد غير صالح")

const optionalUuidSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .refine(
    (value) => value === null || z.string().uuid().safeParse(value).success,
    "المعرف المحدد غير صالح"
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

const createComplaintSchema = z.object({
  student_id: optionalUuidSchema,
  category: z.enum(complaintCategoryValues),
  priority: z.enum(complaintPriorityValues),
  title: z.string().trim().min(1, "عنوان الشكوى مطلوب"),
  description: z.string().trim().min(1, "وصف الشكوى مطلوب"),
})

const addComplaintUpdateSchema = z.object({
  complaint_id: requiredUuidSchema,
  body: z.string().trim().min(1, "نص التحديث مطلوب"),
  update_type: z.enum(complaintUpdateTypeValues),
})

const assignComplaintSchema = z.object({
  complaint_id: requiredUuidSchema,
  assigned_to_user_id: optionalUuidSchema,
})

const updateComplaintStatusSchema = z
  .object({
    complaint_id: requiredUuidSchema,
    status: z.enum(complaintStatusValues),
    note: optionalTextSchema,
  })
  .refine(
    (value) => value.status !== "rejected" || Boolean(value.note),
    {
      message: "يرجى كتابة سبب الرفض",
      path: ["note"],
    }
  )

const resolveComplaintSchema = z.object({
  complaint_id: requiredUuidSchema,
  resolution_summary: z.string().trim().min(1, "ملخص الحل مطلوب"),
})

const createSurveySchema = z
  .object({
    title: z.string().trim().min(1, "عنوان الاستبيان مطلوب"),
    description: optionalTextSchema,
    target_type: z.enum(surveyTargetTypeValues),
    target_role: z.preprocess(
      (value) => {
        const normalizedValue = String(value ?? "").trim()
        return normalizedValue === "" ? null : normalizedValue
      },
      z.enum(surveyRoleValues).nullable()
    ),
    grade_level_id: optionalUuidSchema,
    class_id: optionalUuidSchema,
    opens_at: optionalDateTimeSchema,
    closes_at: optionalDateTimeSchema,
  })
  .refine(
    (value) => value.target_type !== "role" || Boolean(value.target_role),
    {
      message: "يجب اختيار الدور المستهدف",
      path: ["target_role"],
    }
  )
  .refine(
    (value) =>
      value.target_type !== "grade_level" || Boolean(value.grade_level_id),
    {
      message: "يجب اختيار الصف الدراسي",
      path: ["grade_level_id"],
    }
  )
  .refine((value) => value.target_type !== "class" || Boolean(value.class_id), {
    message: "يجب اختيار الشعبة",
    path: ["class_id"],
  })
  .refine(
    (value) =>
      !value.opens_at ||
      !value.closes_at ||
      value.closes_at > value.opens_at,
    {
      message: "موعد الإغلاق يجب أن يكون بعد موعد الفتح",
      path: ["closes_at"],
    }
  )

const addSurveyQuestionSchema = z.object({
  survey_id: requiredUuidSchema,
  question_text: z.string().trim().min(1, "نص السؤال مطلوب"),
  question_type: z.enum(surveyQuestionTypeValues),
  options_text: optionalTextSchema,
  rating_min: z.preprocess(
    (value) => (value === null || value === "" ? null : value),
    z.coerce.number().int().min(1).max(10).nullable()
  ),
  rating_max: z.preprocess(
    (value) => (value === null || value === "" ? null : value),
    z.coerce.number().int().min(2).max(10).nullable()
  ),
  sort_order: z.coerce
    .number({ message: "ترتيب السؤال غير صالح" })
    .int("ترتيب السؤال غير صالح")
    .min(0, "ترتيب السؤال غير صالح"),
  is_required: z.boolean(),
})

const surveyIdSchema = z.object({
  survey_id: requiredUuidSchema,
})

const submitSurveyResponseSchema = z.object({
  survey_id: requiredUuidSchema,
  student_id: optionalUuidSchema,
})

export type FeedbackActionState =
  | ActionResult<{ redirectTo?: string }>
  | null

async function writeFeedbackAuditLog(input: {
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

function parseCheckboxValue(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1"
}

function buildQuestionFieldName(questionId: string) {
  return `question_${questionId}`
}

function collectSurveyAnswers(
  questions: SurveyQuestion[],
  formData: FormData
): {
  answers: SurveyResponseAnswers
  fieldErrors: Record<string, string[]>
} {
  const answers: SurveyResponseAnswers = {}
  const fieldErrors: Record<string, string[]> = {}

  for (const question of questions) {
    const fieldName = buildQuestionFieldName(question.id)

    if (
      question.question_type === "short_text" ||
      question.question_type === "long_text"
    ) {
      const value = String(formData.get(fieldName) ?? "").trim()

      if (!value && question.is_required) {
        fieldErrors[fieldName] = ["هذا السؤال مطلوب"]
      }

      answers[question.id] = value || null
      continue
    }

    if (question.question_type === "single_choice") {
      const value = String(formData.get(fieldName) ?? "").trim()
      const choices = parseSurveyChoiceOptions(question.options)

      if (!value && question.is_required) {
        fieldErrors[fieldName] = ["يرجى اختيار إجابة واحدة"]
      } else if (value && !choices.includes(value)) {
        fieldErrors[fieldName] = ["الإجابة المحددة غير متاحة"]
      }

      answers[question.id] = value || null
      continue
    }

    if (question.question_type === "multiple_choice") {
      const values = Array.from(
        new Set(
          formData
            .getAll(fieldName)
            .map((value) => String(value).trim())
            .filter(Boolean)
        )
      )
      const choices = parseSurveyChoiceOptions(question.options)

      if (values.length === 0 && question.is_required) {
        fieldErrors[fieldName] = ["يرجى اختيار إجابة واحدة على الأقل"]
      } else if (values.some((value) => !choices.includes(value))) {
        fieldErrors[fieldName] = ["توجد إجابة غير مدعومة في هذا السؤال"]
      }

      answers[question.id] = values.length > 0 ? values : null
      continue
    }

    if (question.question_type === "rating") {
      const rawValue = String(formData.get(fieldName) ?? "").trim()
      const ratingOptions = parseSurveyRatingOptions(question.options)

      if (!rawValue) {
        if (question.is_required) {
          fieldErrors[fieldName] = ["يرجى اختيار قيمة التقييم"]
        }

        answers[question.id] = null
        continue
      }

      const rating = Number(rawValue)

      if (
        Number.isNaN(rating) ||
        rating < ratingOptions.min ||
        rating > ratingOptions.max
      ) {
        fieldErrors[fieldName] = ["قيمة التقييم غير صالحة"]
      }

      answers[question.id] = rating
      continue
    }

    const yesNoValue = String(formData.get(fieldName) ?? "").trim()

    if (!yesNoValue) {
      if (question.is_required) {
        fieldErrors[fieldName] = ["يرجى اختيار نعم أو لا"]
      }

      answers[question.id] = null
      continue
    }

    if (yesNoValue !== "yes" && yesNoValue !== "no") {
      fieldErrors[fieldName] = ["الإجابة المحددة غير صالحة"]
    }

    answers[question.id] = yesNoValue === "yes"
  }

  return {
    answers,
    fieldErrors,
  }
}

function mapFeedbackError(error: unknown): string {
  const message = error instanceof Error ? error.message : ""

  if (
    message === "COMPLAINT_NOT_FOUND" ||
    message === "SURVEY_NOT_FOUND"
  ) {
    return "تعذر العثور على السجل المطلوب داخل المدرسة الحالية"
  }

  if (message === "COMPLAINT_STUDENT_NOT_FOUND" || message === "SURVEY_STUDENT_NOT_FOUND") {
    return "الطالب المحدد لا يتبع المدرسة الحالية"
  }

  if (message === "ASSIGNED_USER_NOT_FOUND") {
    return "المستخدم المحدد للتعيين لا يملك عضوية نشطة داخل المدرسة الحالية"
  }

  if (
    message === "COMPLAINT_ASSIGN_NOT_ALLOWED" ||
    message === "COMPLAINT_STATUS_CHANGE_NOT_ALLOWED" ||
    message === "COMPLAINT_RESOLVE_NOT_ALLOWED" ||
    message === "COMPLAINT_INTERNAL_NOTE_NOT_ALLOWED"
  ) {
    return "هذا الإجراء متاح لإدارة المدرسة فقط"
  }

  if (message === "COMPLAINT_ALREADY_FINALIZED") {
    return "لا يمكن تعديل الشكوى بعد إغلاقها أو رفضها"
  }

  if (message === "COMPLAINT_STATUS_TRANSITION_NOT_ALLOWED") {
    return "لا يمكن تنفيذ انتقال الحالة المطلوب من الحالة الحالية"
  }

  if (message === "COMPLAINT_REJECTION_NOTE_REQUIRED") {
    return "يرجى كتابة سبب الرفض قبل حفظ التحديث"
  }

  if (
    message === "SURVEY_GRADE_LEVEL_NOT_FOUND" ||
    message === "SURVEY_CLASS_NOT_FOUND" ||
    message === "SURVEY_TARGET_REQUIRED"
  ) {
    return "تعذر التحقق من الجمهور المستهدف داخل المدرسة الحالية"
  }

  if (message === "SURVEY_TIME_ORDER_INVALID") {
    return "موعد الإغلاق يجب أن يكون بعد موعد الفتح"
  }

  if (message === "SURVEY_QUESTION_DRAFT_ONLY") {
    return "يمكن إضافة الأسئلة إلى الاستبيانات في حالة المسودة فقط"
  }

  if (message === "SURVEY_QUESTION_OPTIONS_REQUIRED") {
    return "أسئلة الاختيار تحتاج إلى خيارين على الأقل"
  }

  if (message === "SURVEY_RATING_RANGE_INVALID") {
    return "نطاق التقييم غير صالح"
  }

  if (message === "SURVEY_PUBLISH_DRAFT_ONLY") {
    return "يمكن نشر الاستبيان من حالة المسودة فقط"
  }

  if (message === "SURVEY_REQUIRES_QUESTION") {
    return "يجب إضافة سؤال واحد على الأقل قبل نشر الاستبيان"
  }

  if (message === "SURVEY_CLOSES_TOO_EARLY") {
    return "تاريخ إغلاق الاستبيان يجب أن يكون بعد وقت النشر"
  }

  if (message === "SURVEY_CLOSE_PUBLISHED_ONLY") {
    return "يمكن إغلاق الاستبيانات المنشورة فقط"
  }

  if (message === "SURVEY_ALREADY_ARCHIVED") {
    return "الاستبيان مؤرشف بالفعل"
  }

  if (message === "SURVEY_NOT_OPEN") {
    return "الاستبيان غير متاح حاليًا لتلقي الردود"
  }

  if (message === "SURVEY_RESPONSE_ALREADY_EXISTS") {
    return "تم إرسال ردك على هذا الاستبيان مسبقًا"
  }

  if (message === "SURVEY_ANSWERS_INVALID") {
    return "صيغة الردود المرسلة غير صالحة"
  }

  if (message.toLowerCase().includes("duplicate")) {
    return "يوجد سجل مماثل بالفعل داخل المدرسة الحالية"
  }

  return "تعذر حفظ بيانات الشكاوى والاستبيانات حاليًا"
}

export async function createComplaintAction(
  _previousState: FeedbackActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFeedbackContext(feedbackStaffRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createComplaintSchema.safeParse({
    student_id: formData.get("student_id"),
    category: formData.get("category") || "other",
    priority: formData.get("priority") || "medium",
    title: formData.get("title"),
    description: formData.get("description"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات الشكوى فشل"
    )
  }

  let complaintId = ""

  try {
    const complaint = await createComplaint(contextResult.data, parsedValues.data)
    complaintId = complaint.id

    await writeFeedbackAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "feedback.complaint.created",
      entity_type: "complaint",
      entity_id: complaint.id,
      metadata: {
        complaint_id: complaint.id,
        student_id: complaint.student_id,
      },
    })
  } catch (error) {
    return failure(mapFeedbackError(error))
  }

  revalidatePath(appRoutes.feedback)
  revalidatePath(appRoutes.feedbackComplaints)
  redirect(appRoutes.feedbackComplaintDetails(complaintId))
}

export async function addComplaintUpdateAction(
  _previousState: FeedbackActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFeedbackContext(feedbackStaffRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = addComplaintUpdateSchema.safeParse({
    complaint_id: formData.get("complaint_id"),
    body: formData.get("body"),
    update_type: formData.get("update_type") || "comment",
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من تحديث الشكوى فشل"
    )
  }

  try {
    const update = await addComplaintUpdate(contextResult.data, parsedValues.data)

    await writeFeedbackAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "feedback.complaint.updated",
      entity_type: "complaint_update",
      entity_id: update.id,
      metadata: {
        complaint_id: update.complaint_id,
      },
    })
  } catch (error) {
    return failure(mapFeedbackError(error))
  }

  revalidatePath(appRoutes.feedback)
  revalidatePath(appRoutes.feedbackComplaints)
  revalidatePath(appRoutes.feedbackComplaintDetails(parsedValues.data.complaint_id))
  return success({}, "تمت إضافة التحديث")
}

export async function assignComplaintAction(
  _previousState: FeedbackActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFeedbackContext(feedbackManagementRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = assignComplaintSchema.safeParse({
    complaint_id: formData.get("complaint_id"),
    assigned_to_user_id: formData.get("assigned_to_user_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const complaint = await assignComplaint(contextResult.data, parsedValues.data)

    await writeFeedbackAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "feedback.complaint.assigned",
      entity_type: "complaint",
      entity_id: complaint.id,
      metadata: {
        complaint_id: complaint.id,
      },
    })
  } catch (error) {
    return failure(mapFeedbackError(error))
  }

  revalidatePath(appRoutes.feedback)
  revalidatePath(appRoutes.feedbackComplaints)
  revalidatePath(appRoutes.feedbackComplaintDetails(parsedValues.data.complaint_id))
  return success({}, "تم تحديث التعيين")
}

export async function updateComplaintStatusAction(
  _previousState: FeedbackActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFeedbackContext(feedbackManagementRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = updateComplaintStatusSchema.safeParse({
    complaint_id: formData.get("complaint_id"),
    status: formData.get("status"),
    note: formData.get("note"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const before = await getComplaintDetails(
      contextResult.data,
      parsedValues.data.complaint_id
    )
    const complaint = await changeComplaintStatus(
      contextResult.data,
      parsedValues.data
    )

    await writeFeedbackAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "feedback.complaint.status_changed",
      entity_type: "complaint",
      entity_id: complaint.id,
      metadata: {
        complaint_id: complaint.id,
        old_status: before.status,
        new_status: complaint.status,
      },
    })
  } catch (error) {
    return failure(mapFeedbackError(error))
  }

  revalidatePath(appRoutes.feedback)
  revalidatePath(appRoutes.feedbackComplaints)
  revalidatePath(appRoutes.feedbackComplaintDetails(parsedValues.data.complaint_id))
  return success({}, "تم تحديث حالة الشكوى")
}

export async function resolveComplaintAction(
  _previousState: FeedbackActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFeedbackContext(feedbackManagementRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = resolveComplaintSchema.safeParse({
    complaint_id: formData.get("complaint_id"),
    resolution_summary: formData.get("resolution_summary"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const before = await getComplaintDetails(
      contextResult.data,
      parsedValues.data.complaint_id
    )
    const complaint = await resolveComplaint(contextResult.data, parsedValues.data)

    await writeFeedbackAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "feedback.complaint.resolved",
      entity_type: "complaint",
      entity_id: complaint.id,
      metadata: {
        complaint_id: complaint.id,
        old_status: before.status,
        new_status: complaint.status,
      },
    })
  } catch (error) {
    return failure(mapFeedbackError(error))
  }

  revalidatePath(appRoutes.feedback)
  revalidatePath(appRoutes.feedbackComplaints)
  revalidatePath(appRoutes.feedbackComplaintDetails(parsedValues.data.complaint_id))
  return success({}, "تم حل الشكوى")
}

export async function createSurveyAction(
  _previousState: FeedbackActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFeedbackContext(feedbackManagementRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createSurveySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    target_type: formData.get("target_type"),
    target_role: formData.get("target_role"),
    grade_level_id: formData.get("grade_level_id"),
    class_id: formData.get("class_id"),
    opens_at: formData.get("opens_at"),
    closes_at: formData.get("closes_at"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات الاستبيان فشل"
    )
  }

  let surveyId = ""

  try {
    const survey = await createSurvey(contextResult.data, parsedValues.data)
    surveyId = survey.id

    await writeFeedbackAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "feedback.survey.created",
      entity_type: "survey",
      entity_id: survey.id,
      metadata: {
        survey_id: survey.id,
      },
    })
  } catch (error) {
    return failure(mapFeedbackError(error))
  }

  revalidatePath(appRoutes.feedback)
  revalidatePath(appRoutes.feedbackSurveys)
  redirect(appRoutes.feedbackSurveyDetails(surveyId))
}

export async function addSurveyQuestionAction(
  _previousState: FeedbackActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFeedbackContext(feedbackManagementRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = addSurveyQuestionSchema.safeParse({
    survey_id: formData.get("survey_id"),
    question_text: formData.get("question_text"),
    question_type: formData.get("question_type"),
    options_text: formData.get("options_text"),
    rating_min:
      formData.get("rating_min") === null || formData.get("rating_min") === ""
        ? null
        : formData.get("rating_min"),
    rating_max:
      formData.get("rating_max") === null || formData.get("rating_max") === ""
        ? null
        : formData.get("rating_max"),
    sort_order: formData.get("sort_order") || 0,
    is_required: parseCheckboxValue(formData.get("is_required")),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من السؤال فشل"
    )
  }

  if (
    parsedValues.data.question_type === "rating" &&
    parsedValues.data.rating_min !== null &&
    parsedValues.data.rating_max !== null &&
    parsedValues.data.rating_max <= parsedValues.data.rating_min
  ) {
    return validationFailure({
      rating_max: ["الحد الأعلى يجب أن يكون أكبر من الحد الأدنى"],
    })
  }

  try {
    const question = await addSurveyQuestion(contextResult.data, parsedValues.data)

    await writeFeedbackAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "feedback.survey.question_added",
      entity_type: "survey_question",
      entity_id: question.id,
      metadata: {
        survey_id: question.survey_id,
        question_id: question.id,
      },
    })
  } catch (error) {
    return failure(mapFeedbackError(error))
  }

  revalidatePath(appRoutes.feedbackSurveys)
  revalidatePath(appRoutes.feedbackSurveyDetails(parsedValues.data.survey_id))
  revalidatePath(appRoutes.feedbackSurveyRespond(parsedValues.data.survey_id))
  return success({}, "تمت إضافة السؤال")
}

export async function publishSurveyAction(
  _previousState: FeedbackActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFeedbackContext(feedbackManagementRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = surveyIdSchema.safeParse({
    survey_id: formData.get("survey_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const survey = await publishSurvey(contextResult.data, parsedValues.data.survey_id)

    await writeFeedbackAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "feedback.survey.published",
      entity_type: "survey",
      entity_id: survey.id,
      metadata: {
        survey_id: survey.id,
      },
    })
  } catch (error) {
    return failure(mapFeedbackError(error))
  }

  revalidatePath(appRoutes.feedback)
  revalidatePath(appRoutes.feedbackSurveys)
  revalidatePath(appRoutes.feedbackSurveyDetails(parsedValues.data.survey_id))
  revalidatePath(appRoutes.feedbackSurveyRespond(parsedValues.data.survey_id))
  return success({}, "تم نشر الاستبيان")
}

export async function closeSurveyAction(
  _previousState: FeedbackActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFeedbackContext(feedbackManagementRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = surveyIdSchema.safeParse({
    survey_id: formData.get("survey_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const survey = await closeSurvey(contextResult.data, parsedValues.data.survey_id)

    await writeFeedbackAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "feedback.survey.closed",
      entity_type: "survey",
      entity_id: survey.id,
      metadata: {
        survey_id: survey.id,
      },
    })
  } catch (error) {
    return failure(mapFeedbackError(error))
  }

  revalidatePath(appRoutes.feedback)
  revalidatePath(appRoutes.feedbackSurveys)
  revalidatePath(appRoutes.feedbackSurveyDetails(parsedValues.data.survey_id))
  revalidatePath(appRoutes.feedbackSurveyRespond(parsedValues.data.survey_id))
  return success({}, "تم إغلاق الاستبيان")
}

export async function archiveSurveyAction(
  _previousState: FeedbackActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFeedbackContext(feedbackManagementRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = surveyIdSchema.safeParse({
    survey_id: formData.get("survey_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const survey = await archiveSurvey(contextResult.data, parsedValues.data.survey_id)

    await writeFeedbackAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "feedback.survey.archived",
      entity_type: "survey",
      entity_id: survey.id,
      metadata: {
        survey_id: survey.id,
      },
    })
  } catch (error) {
    return failure(mapFeedbackError(error))
  }

  revalidatePath(appRoutes.feedback)
  revalidatePath(appRoutes.feedbackSurveys)
  revalidatePath(appRoutes.feedbackSurveyDetails(parsedValues.data.survey_id))
  return success({}, "تمت أرشفة الاستبيان")
}

export async function submitSurveyResponseAction(
  _previousState: FeedbackActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFeedbackContext(feedbackSurveyResponseRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedBaseValues = submitSurveyResponseSchema.safeParse({
    survey_id: formData.get("survey_id"),
    student_id: formData.get("student_id"),
  })

  if (!parsedBaseValues.success) {
    return validationFailure(parsedBaseValues.error.flatten().fieldErrors)
  }

  let surveyDetails: Awaited<ReturnType<typeof getSurveyDetails>>

  try {
    surveyDetails = await getSurveyDetails(
      contextResult.data,
      parsedBaseValues.data.survey_id
    )
  } catch (error) {
    return failure(mapFeedbackError(error))
  }

  const { answers, fieldErrors } = collectSurveyAnswers(
    surveyDetails.questions,
    formData
  )

  if (Object.keys(fieldErrors).length > 0) {
    return validationFailure(fieldErrors, "التحقق من إجابات الاستبيان فشل")
  }

  try {
    const response = await submitSurveyResponse(contextResult.data, {
      survey_id: parsedBaseValues.data.survey_id,
      student_id: parsedBaseValues.data.student_id,
      answers,
    })

    await writeFeedbackAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "feedback.survey.response_submitted",
      entity_type: "survey_response",
      entity_id: response.id,
      metadata: {
        survey_id: response.survey_id,
        response_id: response.id,
        student_id: response.student_id,
      },
    })
  } catch (error) {
    return failure(mapFeedbackError(error))
  }

  revalidatePath(appRoutes.feedback)
  revalidatePath(appRoutes.feedbackSurveys)
  revalidatePath(appRoutes.feedbackSurveyDetails(parsedBaseValues.data.survey_id))
  revalidatePath(appRoutes.feedbackSurveyRespond(parsedBaseValues.data.survey_id))
  revalidatePath(appRoutes.feedbackSurveyResponses(parsedBaseValues.data.survey_id))
  redirect(appRoutes.feedbackSurveyDetails(parsedBaseValues.data.survey_id))
}
