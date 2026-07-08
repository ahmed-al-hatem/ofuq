import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { PortalContext } from "@/types/portal"
import type { BookLoanStatus } from "@/types/library"

type MaybeArray<T> = T | T[] | null

export type PortalLibraryLoanItem = {
  id: string
  student_id: string
  student_name: string
  student_number: string
  status: BookLoanStatus
  borrowed_at: string
  due_at: string
  returned_at: string | null
  book_title: string
  barcode: string | null
  accession_number: string | null
}

function takeSingle<T>(value: MaybeArray<T>): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value
}

export async function listPortalLibraryLoans(
  context: PortalContext
): Promise<PortalLibraryLoanItem[]> {
  if (context.linked_student_ids.length === 0) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("book_loans")
    .select(
      "id, student_id, status, borrowed_at, due_at, returned_at, students(full_name, student_number), book_catalog(title), book_copies(barcode, accession_number)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .in("student_id", context.linked_student_ids)
    .order("borrowed_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map((row) => {
    const student = takeSingle(row.students)
    const catalog = takeSingle(row.book_catalog)
    const copy = takeSingle(row.book_copies)

    return {
      id: row.id,
      student_id: row.student_id,
      student_name: student?.full_name ?? "طالب غير معروف",
      student_number: student?.student_number ?? "-",
      status: row.status,
      borrowed_at: row.borrowed_at,
      due_at: row.due_at,
      returned_at: row.returned_at,
      book_title: catalog?.title ?? "كتاب غير معروف",
      barcode: copy?.barcode ?? null,
      accession_number: copy?.accession_number ?? null,
    }
  })
}
