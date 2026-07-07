import "server-only"

import { USER_ROLES } from "@/constants/roles"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  findTimetableConflicts,
  getTimetableConflictMessage,
} from "@/lib/timetable/conflicts"
import type { TimetableModuleContext } from "@/lib/timetable/context"
import { assertActiveRoom } from "@/lib/timetable/rooms"
import {
  assertActiveTeacherMembership,
  assertActiveTeacherSubjectAssignment,
} from "@/lib/timetable/teacher-subject-assignments"
import type { ClassSection, Subject, Term } from "@/types/academic"
import type { TablesInsert } from "@/types/database"
import type {
  TimetableDayOfWeek,
  TimetableSlot,
} from "@/types/timetable"

export type CreateTimetableSlotInput = {
  academic_year_id: string
  term_id: string | null
  class_id: string
  subject_id: string
  teacher_user_id: string
  room_id: string | null
  day_of_week: TimetableDayOfWeek
  starts_at: string
  ends_at: string
  notes: string | null
}

async function assertAcademicYear(
  context: TimetableModuleContext,
  academicYearId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("academic_years")
    .select("id")
    .eq("id", academicYearId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("ACADEMIC_YEAR_NOT_FOUND")
  }
}

async function assertTerm(
  context: TimetableModuleContext,
  academicYearId: string,
  termId: string
): Promise<Term> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("terms")
    .select("*")
    .eq("id", termId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("academic_year_id", academicYearId)
    .maybeSingle()

  if (error || !data) {
    throw new Error("TERM_NOT_FOUND")
  }

  return data
}

async function assertClassSection(
  context: TimetableModuleContext,
  classId: string
): Promise<ClassSection> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", classId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("CLASS_NOT_FOUND")
  }

  return data
}

async function assertSubject(
  context: TimetableModuleContext,
  subjectId: string
): Promise<Subject> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("SUBJECT_NOT_FOUND")
  }

  return data
}

async function assertSubjectAssignedToGrade(input: {
  context: TimetableModuleContext
  academic_year_id: string
  grade_level_id: string
  subject_id: string
}): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("grade_level_subjects")
    .select("subject_id")
    .eq("tenant_id", input.context.tenant_id)
    .eq("school_id", input.context.school_id)
    .eq("academic_year_id", input.academic_year_id)
    .eq("grade_level_id", input.grade_level_id)

  if (error) {
    throw new Error(error.message)
  }

  if (!data?.length) {
    return
  }

  if (!data.some((assignment) => assignment.subject_id === input.subject_id)) {
    throw new Error("SUBJECT_NOT_ASSIGNED_TO_GRADE")
  }
}

export async function listTimetableSlots(
  context: TimetableModuleContext,
  limit?: number
): Promise<TimetableSlot[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("timetable_slots")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })

  if (context.role === USER_ROLES.TEACHER) {
    query = query.eq("teacher_user_id", context.user_id)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data
}

export async function countActiveTimetableSlots(
  context: TimetableModuleContext
): Promise<number> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("timetable_slots")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")

  if (context.role === USER_ROLES.TEACHER) {
    query = query.eq("teacher_user_id", context.user_id)
  }

  const { count, error } = await query

  if (error) {
    return 0
  }

  return count ?? 0
}

export async function createTimetableSlot(
  context: TimetableModuleContext,
  input: CreateTimetableSlotInput
): Promise<TimetableSlot> {
  const supabase = await createSupabaseServerClient()

  await assertAcademicYear(context, input.academic_year_id)

  if (input.term_id) {
    await assertTerm(context, input.academic_year_id, input.term_id)
  }

  const classSection = await assertClassSection(context, input.class_id)

  if (classSection.academic_year_id !== input.academic_year_id) {
    throw new Error("CLASS_YEAR_MISMATCH")
  }

  await assertSubject(context, input.subject_id)
  await assertSubjectAssignedToGrade({
    context,
    academic_year_id: input.academic_year_id,
    grade_level_id: classSection.grade_level_id,
    subject_id: input.subject_id,
  })
  await assertActiveTeacherMembership(context, input.teacher_user_id)
  await assertActiveTeacherSubjectAssignment({
    context,
    academic_year_id: input.academic_year_id,
    class_id: input.class_id,
    grade_level_id: classSection.grade_level_id,
    subject_id: input.subject_id,
    teacher_user_id: input.teacher_user_id,
  })

  if (input.room_id) {
    await assertActiveRoom(context, input.room_id)
  }

  const conflicts = await findTimetableConflicts(context, {
    academic_year_id: input.academic_year_id,
    term_id: input.term_id,
    class_id: input.class_id,
    teacher_user_id: input.teacher_user_id,
    room_id: input.room_id,
    day_of_week: input.day_of_week,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
  })

  if (conflicts[0]) {
    throw new Error(`TIMETABLE_CONFLICT:${conflicts[0].type}`)
  }

  const slotRecord: TablesInsert<"timetable_slots"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    academic_year_id: input.academic_year_id,
    term_id: input.term_id,
    class_id: input.class_id,
    grade_level_id: classSection.grade_level_id,
    subject_id: input.subject_id,
    teacher_user_id: input.teacher_user_id,
    room_id: input.room_id,
    day_of_week: input.day_of_week,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    notes: input.notes,
    created_by_user_id: context.user_id,
  }

  const { data, error } = await supabase
    .from("timetable_slots")
    .insert(slotRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function cancelTimetableSlot(
  context: TimetableModuleContext,
  timetableSlotId: string
): Promise<TimetableSlot> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("timetable_slots")
    .update({ status: "cancelled" })
    .eq("id", timetableSlotId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .neq("status", "archived")
    .select("*")
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error("TIMETABLE_SLOT_NOT_FOUND")
  }

  return data
}

export function mapTimetableConflictError(message: string): string | null {
  if (!message.startsWith("TIMETABLE_CONFLICT:")) {
    return null
  }

  const conflictType = message.replace("TIMETABLE_CONFLICT:", "")

  if (
    conflictType !== "class" &&
    conflictType !== "teacher" &&
    conflictType !== "room"
  ) {
    return null
  }

  return getTimetableConflictMessage(conflictType)
}
