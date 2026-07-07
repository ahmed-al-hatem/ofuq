import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ReportsModuleContext } from "@/lib/reports/context"
import type { TimetableOverviewReportRow } from "@/types/reports"
import { TIMETABLE_DAY_LABELS_AR } from "@/types/timetable"

export async function loadTimetableOverviewReport(
  context: ReportsModuleContext
): Promise<TimetableOverviewReportRow[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("timetable_slots")
    .select(
      "day_of_week, starts_at, ends_at, classes(name, section), subjects(name), rooms(name), user_profiles(full_name)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")
    .order("day_of_week", { ascending: true })
    .order("starts_at", { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map((slot) => {
    const classSection = Array.isArray(slot.classes)
      ? slot.classes[0]
      : slot.classes
    const subject = Array.isArray(slot.subjects)
      ? slot.subjects[0]
      : slot.subjects
    const room = Array.isArray(slot.rooms) ? slot.rooms[0] : slot.rooms
    const teacher = Array.isArray(slot.user_profiles)
      ? slot.user_profiles[0]
      : slot.user_profiles

    return {
      day: TIMETABLE_DAY_LABELS_AR[slot.day_of_week],
      class_name: classSection?.name ?? null,
      subject: subject?.name ?? null,
      teacher: teacher?.full_name ?? null,
      room: room?.name ?? null,
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
    }
  })
}
