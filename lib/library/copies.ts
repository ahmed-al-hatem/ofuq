import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { assertBookCatalog, trimToNull } from "@/lib/library/catalog"
import type { TablesInsert } from "@/types/database"
import type { BookCopy, BookCopyCondition, BookCopyStatus } from "@/types/library"
import type { LibraryModuleContext } from "@/lib/library/context"

export type CreateBookCopyInput = {
  catalog_id: string
  barcode: string | null
  accession_number: string | null
  shelf_location: string | null
  condition: BookCopyCondition
  notes: string | null
}

export type BookCopyListItem = BookCopy & {
  book_catalog: { title: string; author: string | null } | null
}

export type BookCopyOption = Pick<
  BookCopy,
  "id" | "barcode" | "accession_number" | "shelf_location" | "catalog_id"
> & {
  book_catalog: { title: string } | null
}

export async function assertBookCopy(
  context: LibraryModuleContext,
  copyId: string
): Promise<BookCopy> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("book_copies")
    .select("*")
    .eq("id", copyId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("BOOK_COPY_NOT_FOUND")
  }

  return data
}

export async function assertAvailableBookCopy(
  context: LibraryModuleContext,
  copyId: string
): Promise<BookCopy> {
  const copy = await assertBookCopy(context, copyId)

  if (copy.status !== "available") {
    throw new Error("BOOK_COPY_NOT_AVAILABLE")
  }

  return copy
}

export async function listBookCopies(
  context: LibraryModuleContext
): Promise<BookCopyListItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("book_copies")
    .select("*, book_catalog(title, author)")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data as unknown as BookCopyListItem[]
}

export async function listAvailableBookCopyOptions(
  context: LibraryModuleContext
): Promise<BookCopyOption[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("book_copies")
    .select("id, barcode, accession_number, shelf_location, catalog_id, book_catalog(title)")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "available")
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data as unknown as BookCopyOption[]
}

export async function createBookCopy(
  context: LibraryModuleContext,
  input: CreateBookCopyInput
): Promise<BookCopy> {
  const supabase = await createSupabaseServerClient()
  const catalog = await assertBookCatalog(context, input.catalog_id)

  if (catalog.status !== "active") {
    throw new Error("BOOK_CATALOG_NOT_ACTIVE")
  }

  const record: TablesInsert<"book_copies"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    catalog_id: catalog.id,
    barcode: trimToNull(input.barcode),
    accession_number: trimToNull(input.accession_number),
    shelf_location: trimToNull(input.shelf_location),
    condition: input.condition,
    status: "available",
    notes: trimToNull(input.notes),
    created_by_user_id: context.user_id,
  }

  const { data, error } = await supabase
    .from("book_copies")
    .insert(record)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateBookCopyStatus(
  context: LibraryModuleContext,
  copyId: string,
  status: BookCopyStatus
): Promise<BookCopy> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("book_copies")
    .update({ status })
    .eq("id", copyId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error("BOOK_COPY_NOT_FOUND")
  }

  return data
}

export async function markBookCopyLost(
  context: LibraryModuleContext,
  copyId: string
): Promise<BookCopy> {
  await assertBookCopy(context, copyId)

  return updateBookCopyStatus(context, copyId, "lost")
}

export async function markBookCopyDamaged(
  context: LibraryModuleContext,
  copyId: string
): Promise<BookCopy> {
  await assertBookCopy(context, copyId)

  return updateBookCopyStatus(context, copyId, "damaged")
}

export async function getLibraryCopyTotals(
  context: LibraryModuleContext
): Promise<{ availableCopiesCount: number }> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from("book_copies")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "available")

  return { availableCopiesCount: error ? 0 : count ?? 0 }
}
