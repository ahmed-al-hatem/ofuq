import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { PortalContext } from "@/types/portal"
import type {
  AbsenceExcuseStatus,
  AttendanceRecordMethod,
  AttendanceSessionMethod,
  AttendanceStatus,
} from "@/types/attendance"

type MaybeArray<T> = T | T[] | null

export type PortalAttendanceRecordItem = {
  id: string
  student_id: string
  status: AttendanceStatus
  method: AttendanceRecordMethod
  recorded_at: string
  notes: string | null
  student_name: string
  student_number: string
  class_name: string | null
  class_section: string | null
  session_date: string | null
  session_method: AttendanceSessionMethod | null
  excuse_status: AbsenceExcuseStatus | null
}

function takeSingle<T>(value: MaybeArray<T>): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value
}

export async function listPortalAttendanceRecords(
  context: PortalContext
): Promise<PortalAttendanceRecordItem[]> {
  if (context.linked_student_ids.length === 0) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("attendance_records")
    .select(
      "id, student_id, status, method, recorded_at, notes, students(full_name, student_number), classes(name, section), attendance_sessions(session_date, method), absence_excuses(status)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .in("student_id", context.linked_student_ids)
    .order("recorded_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map((row) => {
    const student = takeSingle(row.students)
    const classInfo = takeSingle(row.classes)
    const session = takeSingle(row.attendance_sessions)
    const excuse = takeSingle(row.absence_excuses)

    return {
      id: row.id,
      student_id: row.student_id,
      status: row.status,
      method: row.method,
      recorded_at: row.recorded_at,
      notes: row.notes,
      student_name: student?.full_name ?? "طالب غير معروف",
      student_number: student?.student_number ?? "-",
      class_name: classInfo?.name ?? null,
      class_section: classInfo?.section ?? null,
      session_date: session?.session_date ?? null,
      session_method: session?.method ?? null,
      excuse_status: excuse?.status ?? null,
    }
  })
}
