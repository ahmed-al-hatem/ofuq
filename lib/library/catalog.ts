import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TablesInsert } from "@/types/database"
import type { BookCatalog, BookCopy } from "@/types/library"
import type { LibraryModuleContext } from "@/lib/library/context"

export type CreateBookCatalogInput = {
  title: string
  subtitle: string | null
  author: string | null
  publisher: string | null
  publication_year: number | null
  isbn: string | null
  category: string | null
  language: string | null
  description: string | null
  cover_image_url: string | null
}

export type BookCatalogListItem = BookCatalog & {
  copies_count: number
  available_copies_count: number
}

export type BookCatalogOption = Pick<BookCatalog, "id" | "title" | "author">

export type BookCatalogDetail = {
  catalog: BookCatalog
  copies: BookCopy[]
}

export function trimToNull(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

export async function assertBookCatalog(
  context: LibraryModuleContext,
  catalogId: string
): Promise<BookCatalog> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("book_catalog")
    .select("*")
    .eq("id", catalogId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("BOOK_CATALOG_NOT_FOUND")
  }

  return data
}

export async function listBookCatalog(
  context: LibraryModuleContext
): Promise<BookCatalogListItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data: catalogRows, error } = await supabase
    .from("book_catalog")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })

  if (error || !catalogRows) {
    return []
  }

  const { data: copyRows } = await supabase
    .from("book_copies")
    .select("catalog_id, status")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)

  return catalogRows.map((catalog) => {
    const copies = copyRows?.filter((copy) => copy.catalog_id === catalog.id) ?? []

    return {
      ...catalog,
      copies_count: copies.length,
      available_copies_count: copies.filter(
        (copy) => copy.status === "available"
      ).length,
    }
  })
}

export async function listBookCatalogOptions(
  context: LibraryModuleContext
): Promise<BookCatalogOption[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("book_catalog")
    .select("id, title, author")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")
    .order("title", { ascending: true })

  if (error || !data) {
    return []
  }

  return data
}

export async function loadBookCatalogDetail(
  context: LibraryModuleContext,
  catalogId: string
): Promise<BookCatalogDetail | null> {
  const catalog = await assertBookCatalog(context, catalogId).catch(() => null)

  if (!catalog) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const { data: copies } = await supabase
    .from("book_copies")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("catalog_id", catalog.id)
    .order("created_at", { ascending: false })

  return {
    catalog,
    copies: copies ?? [],
  }
}

export async function createBookCatalog(
  context: LibraryModuleContext,
  input: CreateBookCatalogInput
): Promise<BookCatalog> {
  const supabase = await createSupabaseServerClient()
  const record: TablesInsert<"book_catalog"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    title: input.title.trim(),
    subtitle: trimToNull(input.subtitle),
    author: trimToNull(input.author),
    publisher: trimToNull(input.publisher),
    publication_year: input.publication_year,
    isbn: trimToNull(input.isbn),
    category: trimToNull(input.category),
    language: trimToNull(input.language) ?? "ar",
    description: trimToNull(input.description),
    cover_image_url: trimToNull(input.cover_image_url),
    created_by_user_id: context.user_id,
  }

  const { data, error } = await supabase
    .from("book_catalog")
    .insert(record)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getLibraryCatalogTotals(
  context: LibraryModuleContext
): Promise<{ catalogCount: number }> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from("book_catalog")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .neq("status", "archived")

  return { catalogCount: error ? 0 : count ?? 0 }
}
