"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import {
  failure,
  success,
  type ActionResult,
  validationFailure,
} from "@/lib/actions/action-result"
import { createBookCatalog } from "@/lib/library/catalog"
import {
  createBookCopy,
  markBookCopyDamaged,
  markBookCopyLost,
} from "@/lib/library/copies"
import { requireLibraryContext } from "@/lib/library/context"
import { issueBookLoan, returnBookLoan } from "@/lib/library/loans"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const libraryMutationRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.LIBRARIAN,
] as const

const bookCopyConditionValues = [
  "new",
  "good",
  "fair",
  "poor",
  "damaged",
] as const

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))

const optionalYearSchema = z
  .union([z.string(), z.number(), z.null()])
  .transform((value) => {
    if (value === null) {
      return null
    }

    const stringValue = String(value).trim()
    return stringValue === "" ? null : Number(stringValue)
  })
  .refine((value) => value === null || Number.isInteger(value), {
    message: "سنة النشر يجب أن تكون رقمًا صحيحًا",
  })
  .refine((value) => value === null || (value >= 1000 && value <= 2100), {
    message: "سنة النشر خارج النطاق المقبول",
  })

const createBookCatalogSchema = z.object({
  title: z.string().trim().min(1, "عنوان الكتاب مطلوب"),
  subtitle: optionalTextSchema,
  author: optionalTextSchema,
  publisher: optionalTextSchema,
  publication_year: optionalYearSchema,
  isbn: optionalTextSchema,
  category: optionalTextSchema,
  language: optionalTextSchema,
  description: optionalTextSchema,
  cover_image_url: optionalTextSchema,
})

const createBookCopySchema = z.object({
  catalog_id: z.string().uuid("الكتاب مطلوب"),
  barcode: optionalTextSchema,
  accession_number: optionalTextSchema,
  shelf_location: optionalTextSchema,
  condition: z.enum(bookCopyConditionValues),
  notes: optionalTextSchema,
})

const issueBookLoanSchema = z.object({
  copy_id: z.string().uuid("نسخة الكتاب مطلوبة"),
  student_id: z.string().uuid("الطالب مطلوب"),
  due_at: z
    .string()
    .trim()
    .min(1, "تاريخ الاستحقاق مطلوب")
    .transform((value) => new Date(value).toISOString()),
  notes: optionalTextSchema,
})

const returnBookLoanSchema = z.object({
  loan_id: z.string().uuid("الإعارة مطلوبة"),
  return_notes: optionalTextSchema,
})

const copyIdSchema = z.object({
  copy_id: z.string().uuid("نسخة الكتاب مطلوبة"),
})

export type LibraryActionState = ActionResult<{ redirectTo?: string }> | null

async function writeLibraryAuditLog(input: {
  actor_user_id: string
  tenant_id: string
  school_id: string
  action: string
  entity_type: string
  entity_id: string
  metadata?: Record<string, string | number | boolean | null>
}): Promise<void> {
  const supabase = await createSupabaseServerClient()

  await supabase.from("audit_logs").insert({
    tenant_id: input.tenant_id,
    school_id: input.school_id,
    actor_user_id: input.actor_user_id,
    action: input.action,
    entity_type: input.entity_type,
    entity_id: input.entity_id,
    metadata: input.metadata ?? {},
  })
}

function mapLibraryError(error: unknown): string {
  const message = error instanceof Error ? error.message : ""

  if (message === "BOOK_CATALOG_NOT_FOUND") {
    return "تعذر العثور على الكتاب داخل المدرسة الحالية"
  }

  if (message === "BOOK_CATALOG_NOT_ACTIVE") {
    return "لا يمكن إضافة نسخة لكتاب غير نشط"
  }

  if (message === "BOOK_COPY_NOT_FOUND") {
    return "تعذر العثور على نسخة الكتاب داخل المدرسة الحالية"
  }

  if (message === "BOOK_COPY_NOT_AVAILABLE") {
    return "نسخة الكتاب غير متاحة للإعارة"
  }

  if (message === "BOOK_COPY_ACTIVE_LOAN_EXISTS") {
    return "توجد إعارة نشطة لهذه النسخة بالفعل"
  }

  if (message === "BOOK_LOAN_NOT_FOUND") {
    return "تعذر العثور على الإعارة داخل المدرسة الحالية"
  }

  if (message === "BOOK_LOAN_NOT_ACTIVE") {
    return "يمكن إرجاع الإعارات النشطة فقط"
  }

  if (message === "BOOK_LOAN_DUE_DATE_INVALID") {
    return "تاريخ الاستحقاق يجب أن يكون بعد وقت الإعارة"
  }

  if (message === "STUDENT_NOT_FOUND") {
    return "تعذر التحقق من الطالب النشط داخل المدرسة الحالية"
  }

  if (message.toLowerCase().includes("duplicate")) {
    return "يوجد سجل مماثل بالفعل داخل المدرسة الحالية"
  }

  return "تعذر حفظ بيانات المكتبة حاليًا"
}

export async function createBookCatalogAction(
  _previousState: LibraryActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireLibraryContext(libraryMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createBookCatalogSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    author: formData.get("author"),
    publisher: formData.get("publisher"),
    publication_year: formData.get("publication_year"),
    isbn: formData.get("isbn"),
    category: formData.get("category"),
    language: formData.get("language") || "ar",
    description: formData.get("description"),
    cover_image_url: formData.get("cover_image_url"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات الكتاب فشل"
    )
  }

  let catalogId = ""

  try {
    const catalog = await createBookCatalog(
      contextResult.data,
      parsedValues.data
    )
    catalogId = catalog.id

    await writeLibraryAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "library.catalog.created",
      entity_type: "book_catalog",
      entity_id: catalog.id,
      metadata: {
        catalog_id: catalog.id,
      },
    })
  } catch (error) {
    return failure(mapLibraryError(error))
  }

  revalidatePath(appRoutes.library)
  revalidatePath(appRoutes.libraryCatalog)
  redirect(appRoutes.libraryCatalogDetails(catalogId))
}

export async function createBookCopyAction(
  _previousState: LibraryActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireLibraryContext(libraryMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createBookCopySchema.safeParse({
    catalog_id: formData.get("catalog_id"),
    barcode: formData.get("barcode"),
    accession_number: formData.get("accession_number"),
    shelf_location: formData.get("shelf_location"),
    condition: formData.get("condition") || "good",
    notes: formData.get("notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات نسخة الكتاب فشل"
    )
  }

  try {
    const copy = await createBookCopy(contextResult.data, parsedValues.data)

    await writeLibraryAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "library.copy.created",
      entity_type: "book_copy",
      entity_id: copy.id,
      metadata: {
        catalog_id: copy.catalog_id,
        copy_id: copy.id,
      },
    })
  } catch (error) {
    return failure(mapLibraryError(error))
  }

  revalidatePath(appRoutes.library)
  revalidatePath(appRoutes.libraryCopies)
  redirect(appRoutes.libraryCopies)
}

export async function issueBookLoanAction(
  _previousState: LibraryActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireLibraryContext(libraryMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = issueBookLoanSchema.safeParse({
    copy_id: formData.get("copy_id"),
    student_id: formData.get("student_id"),
    due_at: formData.get("due_at"),
    notes: formData.get("notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات الإعارة فشل"
    )
  }

  let loanId = ""

  try {
    const loan = await issueBookLoan(contextResult.data, parsedValues.data)
    loanId = loan.id

    await writeLibraryAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "library.loan.issued",
      entity_type: "book_loan",
      entity_id: loan.id,
      metadata: {
        catalog_id: loan.catalog_id,
        copy_id: loan.copy_id,
        loan_id: loan.id,
        student_id: loan.student_id,
      },
    })
  } catch (error) {
    return failure(mapLibraryError(error))
  }

  revalidatePath(appRoutes.library)
  revalidatePath(appRoutes.libraryCopies)
  revalidatePath(appRoutes.libraryLoans)
  redirect(appRoutes.libraryLoanDetails(loanId))
}

export async function returnBookLoanAction(
  _previousState: LibraryActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireLibraryContext(libraryMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = returnBookLoanSchema.safeParse({
    loan_id: formData.get("loan_id"),
    return_notes: formData.get("return_notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const loan = await returnBookLoan(contextResult.data, parsedValues.data)

    await writeLibraryAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "library.loan.returned",
      entity_type: "book_loan",
      entity_id: loan.id,
      metadata: {
        catalog_id: loan.catalog_id,
        copy_id: loan.copy_id,
        loan_id: loan.id,
        student_id: loan.student_id,
      },
    })
  } catch (error) {
    return failure(mapLibraryError(error))
  }

  revalidatePath(appRoutes.library)
  revalidatePath(appRoutes.libraryCopies)
  revalidatePath(appRoutes.libraryLoans)
  return success({}, "تم إرجاع الكتاب")
}

export async function markBookCopyLostAction(
  _previousState: LibraryActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireLibraryContext(libraryMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = copyIdSchema.safeParse({
    copy_id: formData.get("copy_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const copy = await markBookCopyLost(
      contextResult.data,
      parsedValues.data.copy_id
    )

    await writeLibraryAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "library.copy.marked_lost",
      entity_type: "book_copy",
      entity_id: copy.id,
      metadata: {
        catalog_id: copy.catalog_id,
        copy_id: copy.id,
      },
    })
  } catch (error) {
    return failure(mapLibraryError(error))
  }

  revalidatePath(appRoutes.libraryCopies)
  return success({}, "تم تعليم النسخة كمفقودة")
}

export async function markBookCopyDamagedAction(
  _previousState: LibraryActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireLibraryContext(libraryMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = copyIdSchema.safeParse({
    copy_id: formData.get("copy_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const copy = await markBookCopyDamaged(
      contextResult.data,
      parsedValues.data.copy_id
    )

    await writeLibraryAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "library.copy.marked_damaged",
      entity_type: "book_copy",
      entity_id: copy.id,
      metadata: {
        catalog_id: copy.catalog_id,
        copy_id: copy.id,
      },
    })
  } catch (error) {
    return failure(mapLibraryError(error))
  }

  revalidatePath(appRoutes.libraryCopies)
  return success({}, "تم تعليم النسخة كتالفة")
}
