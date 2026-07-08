import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { listPortalEnrollmentScope } from "@/lib/portal/students"
import type { PortalContext } from "@/types/portal"
import type { TimetableDayOfWeek, TimetableSlotStatus } from "@/types/timetable"

type MaybeArray<T> = T | T[] | null

export type PortalTimetableSlotItem = {
  id: string
  class_id: string
  student_ids: string[]
  class_name: string
  class_section: string
  subject_name: string
  teacher_name: string | null
  room_name: string | null
  day_of_week: TimetableDayOfWeek
  starts_at: string
  ends_at: string
  status: TimetableSlotStatus
  notes: string | null
}

function takeSingle<T>(value: MaybeArray<T>): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value
}

export async function listPortalTimetableSlots(
  context: PortalContext
): Promise<PortalTimetableSlotItem[]> {
  const enrollmentScope = await listPortalEnrollmentScope(context)
  const classIds = [...new Set(enrollmentScope.map((item) => item.class_id))]

  if (classIds.length === 0) {
    return []
  }

  const studentsByClassId = new Map<string, string[]>()
  for (const item of enrollmentScope) {
    const studentIds = studentsByClassId.get(item.class_id) ?? []
    studentIds.push(item.student_id)
    studentsByClassId.set(item.class_id, studentIds)
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("timetable_slots")
    .select(
      "id, class_id, day_of_week, starts_at, ends_at, status, notes, classes(name, section), subjects(name), teacher:user_profiles!timetable_slots_teacher_user_id_fkey(full_name), rooms(name)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .in("class_id", classIds)
    .eq("status", "active")
    .order("day_of_week", { ascending: true })
    .order("starts_at", { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map((row) => {
    const classInfo = takeSingle(row.classes)
    const subject = takeSingle(row.subjects)
    const teacher = takeSingle(row.teacher)
    const room = takeSingle(row.rooms)

    return {
      id: row.id,
      class_id: row.class_id,
      student_ids: studentsByClassId.get(row.class_id) ?? [],
      class_name: classInfo?.name ?? "شعبة غير معروفة",
      class_section: classInfo?.section ?? "",
      subject_name: subject?.name ?? "مادة غير معروفة",
      teacher_name: teacher?.full_name ?? null,
      room_name: room?.name ?? null,
      day_of_week: row.day_of_week,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      status: row.status,
      notes: row.notes,
    }
  })
}
