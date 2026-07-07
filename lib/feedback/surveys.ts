import "server-only"

import { USER_ROLES } from "@/constants/roles"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Json, TablesInsert } from "@/types/database"
import type {
  FeedbackContext,
} from "@/lib/feedback/context"
import type {
  Survey,
  SurveyQuestion,
  SurveyResponse,
  SurveyResponseAnswers,
  SurveyStatus,
  SurveyTargetType,
  SurveyQuestionType,
} from "@/types/feedback"

export type CreateSurveyInput = {
  title: string
  description: string | null
  target_type: SurveyTargetType
  target_role: Survey["target_role"]
  grade_level_id: string | null
  class_id: string | null
  opens_at: string | null
  closes_at: string | null
}

export type AddSurveyQuestionInput = {
  survey_id: string
  question_text: string
  question_type: SurveyQuestionType
  options_text: string | null
  rating_min: number | null
  rating_max: number | null
  is_required: boolean
  sort_order: number
}

export type SubmitSurveyResponseInput = {
  survey_id: string
  student_id: string | null
  answers: SurveyResponseAnswers
}

type SurveyProfile = {
  full_name: string
  display_name: string | null
} | null

export type SurveyListItem = Survey & {
  grade_levels: { name: string } | null
  classes: { name: string; section: string } | null
  creator: SurveyProfile
  response_count: number
}

export type SurveyDetails = Survey & {
  grade_levels: { name: string } | null
  classes: { name: string; section: string } | null
  creator: SurveyProfile
  questions: SurveyQuestion[]
  response_count: number
  has_response: boolean
}

export type SurveyResponseListItem = SurveyResponse & {
  respondent: SurveyProfile
  student: { full_name: string; student_number: string } | null
}

function trimToNull(value: string | null | undefined) {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

function isFeedbackManagementRole(role: FeedbackContext["role"]) {
  return (
    role === USER_ROLES.SYSTEM_ADMIN || role === USER_ROLES.SCHOOL_ADMIN
  )
}

function canRespondToRoleTarget(context: FeedbackContext, survey: Survey) {
  if (isFeedbackManagementRole(context.role)) {
    return true
  }

  if (survey.target_type !== "role") {
    return true
  }

  return survey.target_role === context.role
}

function canViewSurvey(context: FeedbackContext, survey: Survey) {
  if (isFeedbackManagementRole(context.role)) {
    return true
  }

  if (survey.status === "draft" || survey.status === "archived") {
    return false
  }

  return canRespondToRoleTarget(context, survey)
}

export function isSurveyAcceptingResponses(
  survey: Survey,
  now = new Date()
) {
  if (survey.status !== "published") {
    return false
  }

  if (survey.opens_at && new Date(survey.opens_at).getTime() > now.getTime()) {
    return false
  }

  if (survey.closes_at && new Date(survey.closes_at).getTime() < now.getTime()) {
    return false
  }

  return true
}

function buildQuestionOptions(input: AddSurveyQuestionInput): Json | null {
  if (
    input.question_type === "short_text" ||
    input.question_type === "long_text" ||
    input.question_type === "yes_no"
  ) {
    return null
  }

  if (
    input.question_type === "single_choice" ||
    input.question_type === "multiple_choice"
  ) {
    const choices = Array.from(
      new Set(
        (input.options_text ?? "")
          .split(/\r?\n/)
          .map((value) => value.trim())
          .filter(Boolean)
      )
    )

    if (choices.length < 2) {
      throw new Error("SURVEY_QUESTION_OPTIONS_REQUIRED")
    }

    return choices
  }

  const ratingMin = input.rating_min ?? 1
  const ratingMax = input.rating_max ?? 5

  if (
    Number.isNaN(ratingMin) ||
    Number.isNaN(ratingMax) ||
    ratingMin >= ratingMax
  ) {
    throw new Error("SURVEY_RATING_RANGE_INVALID")
  }

  return {
    min: ratingMin,
    max: ratingMax,
    step: 1,
  }
}

async function assertGradeLevel(
  context: FeedbackContext,
  gradeLevelId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("grade_levels")
    .select("id")
    .eq("id", gradeLevelId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("SURVEY_GRADE_LEVEL_NOT_FOUND")
  }
}

async function assertClass(
  context: FeedbackContext,
  classId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("SURVEY_CLASS_NOT_FOUND")
  }
}

async function assertSurveyStudent(
  context: FeedbackContext,
  studentId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("SURVEY_STUDENT_NOT_FOUND")
  }
}

async function assertSurveyTarget(
  context: FeedbackContext,
  input: CreateSurveyInput
): Promise<void> {
  if (input.target_type === "role" && !input.target_role) {
    throw new Error("SURVEY_TARGET_REQUIRED")
  }

  if (input.target_type === "grade_level") {
    if (!input.grade_level_id) {
      throw new Error("SURVEY_TARGET_REQUIRED")
    }

    await assertGradeLevel(context, input.grade_level_id)
  }

  if (input.target_type === "class") {
    if (!input.class_id) {
      throw new Error("SURVEY_TARGET_REQUIRED")
    }

    await assertClass(context, input.class_id)
  }
}

async function assertSurvey(
  context: FeedbackContext,
  surveyId: string
): Promise<Survey> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("surveys")
    .select("*")
    .eq("id", surveyId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("SURVEY_NOT_FOUND")
  }

  return data
}

async function loadSurveyResponseCountMap(
  context: FeedbackContext,
  surveyIds: string[]
): Promise<Map<string, number>> {
  if (surveyIds.length === 0) {
    return new Map()
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("survey_responses")
    .select("survey_id")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .in("survey_id", surveyIds)

  if (error || !data) {
    return new Map()
  }

  const counts = new Map<string, number>()

  for (const response of data) {
    counts.set(response.survey_id, (counts.get(response.survey_id) ?? 0) + 1)
  }

  return counts
}

export async function listSurveyQuestions(
  context: FeedbackContext,
  surveyId: string
): Promise<SurveyQuestion[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("survey_questions")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("survey_id", surveyId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (error || !data) {
    return []
  }

  return data
}

export async function listSurveys(
  context: FeedbackContext,
  options?: { limit?: number }
): Promise<SurveyListItem[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("surveys")
    .select(
      "*, grade_levels(name), classes(name, section), creator:user_profiles!surveys_created_by_user_id_fkey(full_name, display_name)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })

  if (!isFeedbackManagementRole(context.role)) {
    query = query.in("status", ["published", "closed"])
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  const visibleSurveys = data.filter((survey) => canViewSurvey(context, survey))
  const counts = await loadSurveyResponseCountMap(
    context,
    visibleSurveys.map((survey) => survey.id)
  )

  return visibleSurveys.map((survey) => ({
    ...(survey as SurveyListItem),
    response_count: counts.get(survey.id) ?? 0,
  }))
}

export async function getSurveyDetails(
  context: FeedbackContext,
  surveyId: string
): Promise<SurveyDetails> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("surveys")
    .select(
      "*, grade_levels(name), classes(name, section), creator:user_profiles!surveys_created_by_user_id_fkey(full_name, display_name)"
    )
    .eq("id", surveyId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data || !canViewSurvey(context, data)) {
    throw new Error("SURVEY_NOT_FOUND")
  }

  const [questions, responseCounts, existingResponse] = await Promise.all([
    listSurveyQuestions(context, surveyId),
    loadSurveyResponseCountMap(context, [surveyId]),
    supabase
      .from("survey_responses")
      .select("id")
      .eq("tenant_id", context.tenant_id)
      .eq("school_id", context.school_id)
      .eq("survey_id", surveyId)
      .eq("respondent_user_id", context.user_id)
      .maybeSingle(),
  ])

  return {
    ...(data as SurveyDetails),
    questions,
    response_count: responseCounts.get(surveyId) ?? 0,
    has_response: Boolean(existingResponse.data),
  }
}

export async function createSurvey(
  context: FeedbackContext,
  input: CreateSurveyInput
): Promise<Survey> {
  await assertSurveyTarget(context, input)

  if (input.opens_at && input.closes_at && input.closes_at <= input.opens_at) {
    throw new Error("SURVEY_TIME_ORDER_INVALID")
  }

  const supabase = await createSupabaseServerClient()
  const record: TablesInsert<"surveys"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    title: input.title.trim(),
    description: trimToNull(input.description),
    target_type: input.target_type,
    target_role: input.target_type === "role" ? input.target_role : null,
    grade_level_id:
      input.target_type === "grade_level" ? input.grade_level_id : null,
    class_id: input.target_type === "class" ? input.class_id : null,
    opens_at: input.opens_at,
    closes_at: input.closes_at,
    created_by_user_id: context.user_id,
    status: "draft",
  }

  const { data, error } = await supabase
    .from("surveys")
    .insert(record)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "SURVEY_CREATE_FAILED")
  }

  return data
}

export async function addSurveyQuestion(
  context: FeedbackContext,
  input: AddSurveyQuestionInput
): Promise<SurveyQuestion> {
  const survey = await assertSurvey(context, input.survey_id)

  if (survey.status !== "draft") {
    throw new Error("SURVEY_QUESTION_DRAFT_ONLY")
  }

  const supabase = await createSupabaseServerClient()
  const record: TablesInsert<"survey_questions"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    survey_id: survey.id,
    question_text: input.question_text.trim(),
    question_type: input.question_type,
    options: buildQuestionOptions(input),
    is_required: input.is_required,
    sort_order: input.sort_order,
  }

  const { data, error } = await supabase
    .from("survey_questions")
    .insert(record)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "SURVEY_QUESTION_CREATE_FAILED")
  }

  return data
}

export async function publishSurvey(
  context: FeedbackContext,
  surveyId: string
): Promise<Survey> {
  const survey = await assertSurvey(context, surveyId)

  if (survey.status !== "draft") {
    throw new Error("SURVEY_PUBLISH_DRAFT_ONLY")
  }

  const questions = await listSurveyQuestions(context, survey.id)

  if (questions.length === 0) {
    throw new Error("SURVEY_REQUIRES_QUESTION")
  }

  const publishedAt = new Date().toISOString()

  if (survey.closes_at && survey.closes_at <= publishedAt) {
    throw new Error("SURVEY_CLOSES_TOO_EARLY")
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("surveys")
    .update({
      status: "published",
      published_at: publishedAt,
      closed_at: null,
    })
    .eq("id", survey.id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "SURVEY_PUBLISH_FAILED")
  }

  return data
}

export async function closeSurvey(
  context: FeedbackContext,
  surveyId: string
): Promise<Survey> {
  const survey = await assertSurvey(context, surveyId)

  if (survey.status !== "published") {
    throw new Error("SURVEY_CLOSE_PUBLISHED_ONLY")
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("surveys")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
    })
    .eq("id", survey.id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "SURVEY_CLOSE_FAILED")
  }

  return data
}

export async function archiveSurvey(
  context: FeedbackContext,
  surveyId: string
): Promise<Survey> {
  const survey = await assertSurvey(context, surveyId)

  if (survey.status === "archived") {
    throw new Error("SURVEY_ALREADY_ARCHIVED")
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("surveys")
    .update({
      status: "archived",
    })
    .eq("id", survey.id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "SURVEY_ARCHIVE_FAILED")
  }

  return data
}

export async function listSurveyResponses(
  context: FeedbackContext,
  surveyId: string
): Promise<SurveyResponseListItem[]> {
  await assertSurvey(context, surveyId)

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("survey_responses")
    .select(
      "*, respondent:user_profiles!survey_responses_respondent_user_id_fkey(full_name, display_name), student:students(full_name, student_number)"
    )
    .eq("survey_id", surveyId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("submitted_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data as unknown as SurveyResponseListItem[]
}

export async function submitSurveyResponse(
  context: FeedbackContext,
  input: SubmitSurveyResponseInput
): Promise<SurveyResponse> {
  const survey = await assertSurvey(context, input.survey_id)

  if (!canViewSurvey(context, survey) || !canRespondToRoleTarget(context, survey)) {
    throw new Error("SURVEY_NOT_FOUND")
  }

  if (!isSurveyAcceptingResponses(survey)) {
    throw new Error("SURVEY_NOT_OPEN")
  }

  if (
    !input.answers ||
    Array.isArray(input.answers) ||
    typeof input.answers !== "object"
  ) {
    throw new Error("SURVEY_ANSWERS_INVALID")
  }

  if (input.student_id) {
    await assertSurveyStudent(context, input.student_id)
  }

  const supabase = await createSupabaseServerClient()
  const { data: existingResponse } = await supabase
    .from("survey_responses")
    .select("id")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("survey_id", survey.id)
    .eq("respondent_user_id", context.user_id)
    .maybeSingle()

  if (existingResponse) {
    throw new Error("SURVEY_RESPONSE_ALREADY_EXISTS")
  }

  const record: TablesInsert<"survey_responses"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    survey_id: survey.id,
    respondent_user_id: context.user_id,
    student_id: input.student_id,
    answers: input.answers as unknown as Json,
  }

  const { data, error } = await supabase
    .from("survey_responses")
    .insert(record)
    .select("*")
    .single()

  if (error || !data) {
    if (error?.message.toLowerCase().includes("duplicate")) {
      throw new Error("SURVEY_RESPONSE_ALREADY_EXISTS")
    }

    throw new Error(error?.message ?? "SURVEY_RESPONSE_CREATE_FAILED")
  }

  return data
}

export async function countSurveysByStatus(
  context: FeedbackContext,
  status: SurveyStatus
): Promise<number> {
  if (!isFeedbackManagementRole(context.role) && status !== "published") {
    return 0
  }

  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("surveys")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", status)

  if (!isFeedbackManagementRole(context.role)) {
    query = query.eq("status", "published")
  }

  const { count, error } = await query

  return error ? 0 : count ?? 0
}

export async function countSurveyResponses(
  context: FeedbackContext
): Promise<number> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("survey_responses")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)

  if (!isFeedbackManagementRole(context.role)) {
    query = query.eq("respondent_user_id", context.user_id)
  }

  const { count, error } = await query

  return error ? 0 : count ?? 0
}
