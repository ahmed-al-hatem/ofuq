import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { assertBookCatalog, trimToNull } from "@/lib/library/catalog"
import { assertAvailableBookCopy, assertBookCopy } from "@/lib/library/copies"
import type { TablesInsert } from "@/types/database"
import type { BookLoan } from "@/types/library"
import type { LibraryModuleContext } from "@/lib/library/context"
import type { Student } from "@/types/students"

export type IssueBookLoanInput = {
  copy_id: string
  student_id: string
  due_at: string
  notes: string | null
}

export type ReturnBookLoanInput = {
  loan_id: string
  return_notes: string | null
}

export type BookLoanListItem = BookLoan & {
  book_catalog: { title: string } | null
  book_copies: {
    barcode: string | null
    accession_number: string | null
    shelf_location: string | null
  } | null
  students: { full_name: string; student_number: string } | null
  is_overdue: boolean
}

export type BookLoanDetail = BookLoanListItem

async function assertActiveStudent(
  context: LibraryModuleContext,
  studentId: string
): Promise<Student> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")
    .maybeSingle()

  if (error || !data) {
    throw new Error("STUDENT_NOT_FOUND")
  }

  return data
}

async function assertNoActiveCopyLoan(
  context: LibraryModuleContext,
  copyId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("book_loans")
    .select("id")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("copy_id", copyId)
    .eq("status", "active")
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (data) {
    throw new Error("BOOK_COPY_ACTIVE_LOAN_EXISTS")
  }
}

export function isLoanOverdue(loan: Pick<BookLoan, "status" | "due_at">) {
  return loan.status === "active" && new Date(loan.due_at) < new Date()
}

export async function listBookLoans(
  context: LibraryModuleContext,
  limit?: number
): Promise<BookLoanListItem[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("book_loans")
    .select(
      "*, book_catalog(title), book_copies(barcode, accession_number, shelf_location), students(full_name, student_number)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("borrowed_at", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return (data as unknown as BookLoanListItem[]).map((loan) => ({
    ...loan,
    is_overdue: isLoanOverdue(loan),
  }))
}

export async function loadBookLoanDetail(
  context: LibraryModuleContext,
  loanId: string
): Promise<BookLoanDetail | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("book_loans")
    .select(
      "*, book_catalog(title), book_copies(barcode, accession_number, shelf_location), students(full_name, student_number)"
    )
    .eq("id", loanId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  const loan = data as unknown as BookLoanListItem

  return {
    ...loan,
    is_overdue: isLoanOverdue(loan),
  }
}

export async function issueBookLoan(
  context: LibraryModuleContext,
  input: IssueBookLoanInput
): Promise<BookLoan> {
  const supabase = await createSupabaseServerClient()
  const borrowedAt = new Date()
  const dueAt = new Date(input.due_at)

  if (Number.isNaN(dueAt.getTime()) || dueAt <= borrowedAt) {
    throw new Error("BOOK_LOAN_DUE_DATE_INVALID")
  }

  await assertActiveStudent(context, input.student_id)
  const copy = await assertAvailableBookCopy(context, input.copy_id)
  const catalog = await assertBookCatalog(context, copy.catalog_id)

  if (catalog.id !== copy.catalog_id) {
    throw new Error("BOOK_COPY_CATALOG_MISMATCH")
  }

  await assertNoActiveCopyLoan(context, copy.id)

  const { data: lockedCopy, error: lockError } = await supabase
    .from("book_copies")
    .update({ status: "loaned" })
    .eq("id", copy.id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "available")
    .select("*")
    .maybeSingle()

  if (lockError || !lockedCopy) {
    throw new Error("BOOK_COPY_NOT_AVAILABLE")
  }

  const record: TablesInsert<"book_loans"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    copy_id: lockedCopy.id,
    catalog_id: lockedCopy.catalog_id,
    student_id: input.student_id,
    issued_by_user_id: context.user_id,
    borrowed_at: borrowedAt.toISOString(),
    due_at: dueAt.toISOString(),
    status: "active",
    notes: trimToNull(input.notes),
  }

  const { data, error } = await supabase
    .from("book_loans")
    .insert(record)
    .select("*")
    .single()

  if (error) {
    await supabase
      .from("book_copies")
      .update({ status: "available" })
      .eq("id", lockedCopy.id)
      .eq("tenant_id", context.tenant_id)
      .eq("school_id", context.school_id)

    throw new Error(error.message)
  }

  return data
}

export async function returnBookLoan(
  context: LibraryModuleContext,
  input: ReturnBookLoanInput
): Promise<BookLoan> {
  const supabase = await createSupabaseServerClient()
  const detail = await loadBookLoanDetail(context, input.loan_id)

  if (!detail) {
    throw new Error("BOOK_LOAN_NOT_FOUND")
  }

  if (detail.status !== "active") {
    throw new Error("BOOK_LOAN_NOT_ACTIVE")
  }

  const copy = await assertBookCopy(context, detail.copy_id)
  const returnedAt = new Date().toISOString()
  const { data, error } = await supabase
    .from("book_loans")
    .update({
      status: "returned",
      returned_at: returnedAt,
      returned_by_user_id: context.user_id,
      return_notes: trimToNull(input.return_notes),
    })
    .eq("id", detail.id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")
    .select("*")
    .single()

  if (error || !data) {
    throw new Error("BOOK_LOAN_NOT_ACTIVE")
  }

  if (copy.status === "loaned") {
    await supabase
      .from("book_copies")
      .update({ status: "available" })
      .eq("id", copy.id)
      .eq("tenant_id", context.tenant_id)
      .eq("school_id", context.school_id)
      .eq("status", "loaned")
  }

  return data
}

export async function getLibraryLoanTotals(
  context: LibraryModuleContext
): Promise<{ activeLoansCount: number; overdueLoansCount: number }> {
  const loans = await listBookLoans(context)
  const activeLoans = loans.filter((loan) => loan.status === "active")

  return {
    activeLoansCount: activeLoans.length,
    overdueLoansCount: activeLoans.filter((loan) => loan.is_overdue).length,
  }
}
