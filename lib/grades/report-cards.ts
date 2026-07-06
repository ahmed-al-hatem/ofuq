import "server-only"

import { USER_ROLES } from "@/constants/roles"
import type { GradesModuleContext } from "@/lib/grades/context"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TablesInsert } from "@/types/database"
import type {
  BasicReportCardSummary,
  ReportCard,
  ReportCardStatus,
} from "@/types/grades"

export type GenerateReportCardInput = {
  academic_year_id: string
  term_id: string | null
  class_id: string
  student_id: string
  teacher_remarks: string | null
  admin_notes: string | null
}

export type ReportCardListItem = ReportCard & {
  academic_years: { name: string } | null
  terms: { name: string } | null
  classes: { name: string; section: string } | null
  students: { full_name: string; student_number: string } | null
}

export type ReportCardDetails = ReportCardListItem & {
  user_profiles: { full_name: string } | null
}

type ScorePart = {
  subject_id: string
  subject_name: string
  score: number
  max_score: number
}

function trimToNull(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

function percentage(totalScore: number, maxScore: number): number | null {
  if (maxScore <= 0) {
    return null
  }

  return Math.round((totalScore / maxScore) * 10000) / 100
}

async function resolveReportCardEnrollment(
  context: GradesModuleContext,
  input: Pick<
    GenerateReportCardInput,
    "academic_year_id" | "term_id" | "class_id" | "student_id"
  >
): Promise<{ class_enrollment_id: string }> {
  const supabase = await createSupabaseServerClient()
  const { data: academicYear, error: yearError } = await supabase
    .from("academic_years")
    .select("id")
    .eq("id", input.academic_year_id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (yearError || !academicYear) {
    throw new Error("ACADEMIC_YEAR_NOT_FOUND")
  }

  const { data: classSection, error: classError } = await supabase
    .from("classes")
    .select("id, academic_year_id")
    .eq("id", input.class_id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (classError || !classSection) {
    throw new Error("CLASS_NOT_FOUND")
  }

  if (classSection.academic_year_id !== input.academic_year_id) {
    throw new Error("CLASS_YEAR_MISMATCH")
  }

  if (input.term_id) {
    const { data: term, error: termError } = await supabase
      .from("terms")
      .select("id, academic_year_id")
      .eq("id", input.term_id)
      .eq("tenant_id", context.tenant_id)
      .eq("school_id", context.school_id)
      .maybeSingle()

    if (termError || !term) {
      throw new Error("TERM_NOT_FOUND")
    }

    if (term.academic_year_id !== input.academic_year_id) {
      throw new Error("TERM_YEAR_MISMATCH")
    }
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, status")
    .eq("id", input.student_id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (studentError || !student) {
    throw new Error("STUDENT_NOT_FOUND")
  }

  if (student.status !== "active") {
    throw new Error("STUDENT_NOT_ACTIVE")
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("class_enrollments")
    .select("id")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("academic_year_id", input.academic_year_id)
    .eq("class_id", input.class_id)
    .eq("student_id", input.student_id)
    .eq("status", "active")
    .maybeSingle()

  if (enrollmentError || !enrollment) {
    throw new Error("ACTIVE_ENROLLMENT_NOT_FOUND")
  }

  return { class_enrollment_id: enrollment.id }
}

function buildSummary(parts: ScorePart[]): BasicReportCardSummary {
  const subjects = new Map<
    string,
    { subject_name: string; total_score: number; max_score: number }
  >()

  for (const part of parts) {
    const current = subjects.get(part.subject_id) ?? {
      subject_name: part.subject_name,
      total_score: 0,
      max_score: 0,
    }

    current.total_score += part.score
    current.max_score += part.max_score
    subjects.set(part.subject_id, current)
  }

  const subjectSummaries = [...subjects.entries()].map(([subjectId, value]) => ({
    subject_id: subjectId,
    subject_name: value.subject_name,
    total_score: Math.round(value.total_score * 100) / 100,
    max_score: Math.round(value.max_score * 100) / 100,
    percentage: percentage(value.total_score, value.max_score),
  }))

  const totalScore = subjectSummaries.reduce(
    (sum, subject) => sum + subject.total_score,
    0
  )
  const maxScore = subjectSummaries.reduce(
    (sum, subject) => sum + subject.max_score,
    0
  )

  return {
    subjects: subjectSummaries,
    overall: {
      total_score: Math.round(totalScore * 100) / 100,
      max_score: Math.round(maxScore * 100) / 100,
      percentage: percentage(totalScore, maxScore),
    },
  }
}

async function buildReportCardSummary(
  context: GradesModuleContext,
  input: Pick<
    GenerateReportCardInput,
    "academic_year_id" | "term_id" | "class_id" | "student_id"
  >
): Promise<BasicReportCardSummary> {
  const supabase = await createSupabaseServerClient()
  let examQuery = supabase
    .from("exam_results")
    .select("score, exams(max_score), subjects(id, name)")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("academic_year_id", input.academic_year_id)
    .eq("class_id", input.class_id)
    .eq("student_id", input.student_id)
    .in("status", ["entered", "published"])
    .not("score", "is", null)

  let entryQuery = supabase
    .from("grade_entries")
    .select("score, max_score, subjects(id, name)")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("academic_year_id", input.academic_year_id)
    .eq("class_id", input.class_id)
    .eq("student_id", input.student_id)
    .in("status", ["entered", "published"])

  if (input.term_id) {
    examQuery = examQuery.eq("term_id", input.term_id)
    entryQuery = entryQuery.eq("term_id", input.term_id)
  }

  const [{ data: examRows }, { data: entryRows }] = await Promise.all([
    examQuery,
    entryQuery,
  ])

  const examParts =
    examRows?.flatMap((row) => {
      const subject = Array.isArray(row.subjects) ? row.subjects[0] : row.subjects
      const exam = Array.isArray(row.exams) ? row.exams[0] : row.exams

      if (!subject || !exam || row.score === null) {
        return []
      }

      return [
        {
          subject_id: subject.id,
          subject_name: subject.name,
          score: Number(row.score),
          max_score: Number(exam.max_score),
        },
      ]
    }) ?? []

  const entryParts =
    entryRows?.flatMap((row) => {
      const subject = Array.isArray(row.subjects) ? row.subjects[0] : row.subjects

      if (!subject) {
        return []
      }

      return [
        {
          subject_id: subject.id,
          subject_name: subject.name,
          score: Number(row.score),
          max_score: Number(row.max_score),
        },
      ]
    }) ?? []

  return buildSummary([...examParts, ...entryParts])
}

export async function listReportCards(
  context: GradesModuleContext,
  limit = 50
): Promise<ReportCardListItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("report_cards")
    .select(
      "*, academic_years(name), terms(name), classes(name, section), students(full_name, student_number)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("generated_at", { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data as unknown as ReportCardListItem[]
}

export async function getReportCardById(
  context: GradesModuleContext,
  reportCardId: string
): Promise<ReportCardDetails> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("report_cards")
    .select(
      "*, academic_years(name), terms(name), classes(name, section), students(full_name, student_number), user_profiles(full_name)"
    )
    .eq("id", reportCardId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("REPORT_CARD_NOT_FOUND")
  }

  return data as unknown as ReportCardDetails
}

export async function generateReportCard(
  context: GradesModuleContext,
  input: GenerateReportCardInput
): Promise<ReportCard> {
  const supabase = await createSupabaseServerClient()
  const enrollment = await resolveReportCardEnrollment(context, input)
  const summary = await buildReportCardSummary(context, input)
  const generatedAt = new Date().toISOString()

  let existingQuery = supabase
    .from("report_cards")
    .select("id")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("academic_year_id", input.academic_year_id)
    .eq("student_id", input.student_id)

  existingQuery = input.term_id
    ? existingQuery.eq("term_id", input.term_id)
    : existingQuery.is("term_id", null)

  const { data: existing, error: existingError } =
    await existingQuery.maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  const reportCardRecord: TablesInsert<"report_cards"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    academic_year_id: input.academic_year_id,
    term_id: input.term_id,
    class_id: input.class_id,
    student_id: input.student_id,
    class_enrollment_id: enrollment.class_enrollment_id,
    summary,
    teacher_remarks: trimToNull(input.teacher_remarks),
    admin_notes: trimToNull(input.admin_notes),
    generated_by_user_id: context.user_id,
    generated_at: generatedAt,
  }

  if (existing) {
    const { data, error } = await supabase
      .from("report_cards")
      .update(reportCardRecord)
      .eq("id", existing.id)
      .eq("tenant_id", context.tenant_id)
      .eq("school_id", context.school_id)
      .select("*")
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  const { data, error } = await supabase
    .from("report_cards")
    .insert(reportCardRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateReportCardStatus(
  context: GradesModuleContext,
  reportCardId: string,
  status: ReportCardStatus
): Promise<ReportCard> {
  if (
    status === "published" &&
    context.role !== USER_ROLES.SYSTEM_ADMIN &&
    context.role !== USER_ROLES.SCHOOL_ADMIN
  ) {
    throw new Error("PUBLISH_NOT_ALLOWED")
  }

  const supabase = await createSupabaseServerClient()
  await getReportCardById(context, reportCardId)

  const { data, error } = await supabase
    .from("report_cards")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", reportCardId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
