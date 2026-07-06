import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Student } from "@/types/students"
import type { StudentModuleContext } from "@/lib/students/context"

export async function listStudents(
  context: StudentModuleContext
): Promise<Student[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data
}

export async function getStudentById(
  context: StudentModuleContext,
  studentId: string
): Promise<Student | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data
}
