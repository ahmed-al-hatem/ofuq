import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TimetableModuleContext } from "@/lib/timetable/context"
import type { TimetableDayOfWeek } from "@/types/timetable"

export type TimetableConflictType = "class" | "teacher" | "room"

export type TimetableConflict = {
  type: TimetableConflictType
  slot_id: string
  starts_at: string
  ends_at: string
}

export type TimetableConflictInput = {
  academic_year_id: string
  term_id: string | null
  class_id: string
  teacher_user_id: string
  room_id: string | null
  day_of_week: TimetableDayOfWeek
  starts_at: string
  ends_at: string
}

function toConflict(
  type: TimetableConflictType,
  slot: { id: string; starts_at: string; ends_at: string } | null
): TimetableConflict | null {
  if (!slot) {
    return null
  }

  return {
    type,
    slot_id: slot.id,
    starts_at: slot.starts_at,
    ends_at: slot.ends_at,
  }
}

export function getTimetableConflictMessage(type: TimetableConflictType): string {
  if (type === "class") {
    return "الشعبة لديها حصة أخرى في هذا الوقت"
  }

  if (type === "teacher") {
    return "المعلم لديه حصة أخرى في هذا الوقت"
  }

  return "الغرفة محجوزة لحصة أخرى في هذا الوقت"
}

export async function findClassConflict(
  context: TimetableModuleContext,
  input: TimetableConflictInput
): Promise<TimetableConflict | null> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("timetable_slots")
    .select("id, starts_at, ends_at")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("academic_year_id", input.academic_year_id)
    .eq("class_id", input.class_id)
    .eq("day_of_week", input.day_of_week)
    .eq("status", "active")
    .lt("starts_at", input.ends_at)
    .gt("ends_at", input.starts_at)
    .limit(1)

  query = input.term_id ? query.eq("term_id", input.term_id) : query.is("term_id", null)

  const { data, error } = await query.maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return toConflict("class", data)
}

export async function findTeacherConflict(
  context: TimetableModuleContext,
  input: TimetableConflictInput
): Promise<TimetableConflict | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("timetable_slots")
    .select("id, starts_at, ends_at")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("academic_year_id", input.academic_year_id)
    .eq("teacher_user_id", input.teacher_user_id)
    .eq("day_of_week", input.day_of_week)
    .eq("status", "active")
    .lt("starts_at", input.ends_at)
    .gt("ends_at", input.starts_at)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return toConflict("teacher", data)
}

export async function findRoomConflict(
  context: TimetableModuleContext,
  input: TimetableConflictInput
): Promise<TimetableConflict | null> {
  if (!input.room_id) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("timetable_slots")
    .select("id, starts_at, ends_at")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("academic_year_id", input.academic_year_id)
    .eq("room_id", input.room_id)
    .eq("day_of_week", input.day_of_week)
    .eq("status", "active")
    .lt("starts_at", input.ends_at)
    .gt("ends_at", input.starts_at)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return toConflict("room", data)
}

export async function findTimetableConflicts(
  context: TimetableModuleContext,
  input: TimetableConflictInput
): Promise<TimetableConflict[]> {
  const [classConflict, teacherConflict, roomConflict] = await Promise.all([
    findClassConflict(context, input),
    findTeacherConflict(context, input),
    findRoomConflict(context, input),
  ])

  return [classConflict, teacherConflict, roomConflict].filter(
    (conflict): conflict is TimetableConflict => Boolean(conflict)
  )
}
