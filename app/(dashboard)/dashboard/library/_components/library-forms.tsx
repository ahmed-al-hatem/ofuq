"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import type { ReactNode } from "react"

import { FormActions } from "@/components/shared/form-actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import {
  createBookCatalogAction,
  createBookCopyAction,
  issueBookLoanAction,
  markBookCopyDamagedAction,
  markBookCopyLostAction,
  returnBookLoanAction,
  type LibraryActionState,
} from "@/lib/actions/library"
import type { BookCatalogOption } from "@/lib/library/catalog"
import type { BookCopyOption } from "@/lib/library/copies"
import type { Student } from "@/types/students"
import {
  BOOK_COPY_CONDITION_LABELS_AR,
  type BookCopyCondition,
} from "@/types/library"

const initialState: LibraryActionState = null
type FormSurface = "card" | "plain"

const bookCopyConditionOptions = [
  "new",
  "good",
  "fair",
  "poor",
  "damaged",
] as const satisfies readonly BookCopyCondition[]

function SubmitButton({
  label,
  pendingLabel,
  variant = "default",
  size = "default",
}: {
  label: string
  pendingLabel: string
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost"
  size?: "default" | "sm" | "lg"
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant={variant} size={size} disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  )
}

function FormMessage({ state }: { state: LibraryActionState }) {
  if (!state) {
    return null
  }

  if (!state.ok) {
    return (
      <div
        role="alert"
        className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
      >
        {state.error}
      </div>
    )
  }

  if (!state.message) {
    return null
  }

  return (
    <div className="rounded-md border border-secondary/20 bg-secondary/5 px-3 py-2 text-sm text-secondary">
      {state.message}
    </div>
  )
}

function getFieldErrors(state: LibraryActionState) {
  return state?.ok === false ? state.fieldErrors ?? {} : {}
}

function getCopyOptionLabel(copy: BookCopyOption) {
  const copyCode = copy.barcode ?? copy.accession_number ?? "بدون رقم"
  const location = copy.shelf_location ? ` - ${copy.shelf_location}` : ""

  return `${copy.book_catalog?.title ?? "كتاب غير معروف"} - ${copyCode}${location}`
}

export function BookCatalogForm() {
  const [state, formAction] = useActionState(
    createBookCatalogAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إضافة كتاب إلى الفهرس</CardTitle>
        <CardDescription>
          يسجل الفهرس بيانات الكتاب العامة، أما النسخ الفعلية فتضاف من صفحة النسخ.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.title?.length)}>
              <FieldLabel htmlFor="book-title">العنوان</FieldLabel>
              <Input id="book-title" name="title" required />
              <FieldError>{fieldErrors.title?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.subtitle?.length)}>
              <FieldLabel htmlFor="book-subtitle">العنوان الفرعي</FieldLabel>
              <Input id="book-subtitle" name="subtitle" />
              <FieldError>{fieldErrors.subtitle?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.author?.length)}>
              <FieldLabel htmlFor="book-author">المؤلف</FieldLabel>
              <Input id="book-author" name="author" />
              <FieldError>{fieldErrors.author?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.publisher?.length)}>
              <FieldLabel htmlFor="book-publisher">الناشر</FieldLabel>
              <Input id="book-publisher" name="publisher" />
              <FieldError>{fieldErrors.publisher?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.publication_year?.length)}>
              <FieldLabel htmlFor="book-year">سنة النشر</FieldLabel>
              <Input id="book-year" name="publication_year" type="number" dir="ltr" />
              <FieldError>{fieldErrors.publication_year?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.isbn?.length)}>
              <FieldLabel htmlFor="book-isbn">ISBN</FieldLabel>
              <Input id="book-isbn" name="isbn" dir="ltr" />
              <FieldError>{fieldErrors.isbn?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.category?.length)}>
              <FieldLabel htmlFor="book-category">التصنيف</FieldLabel>
              <Input id="book-category" name="category" />
              <FieldError>{fieldErrors.category?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.language?.length)}>
              <FieldLabel htmlFor="book-language">اللغة</FieldLabel>
              <Input id="book-language" name="language" defaultValue="ar" dir="ltr" />
              <FieldError>{fieldErrors.language?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.cover_image_url?.length)}>
              <FieldLabel htmlFor="book-cover-url">رابط صورة الغلاف</FieldLabel>
              <Input id="book-cover-url" name="cover_image_url" type="url" dir="ltr" />
              <FieldError>{fieldErrors.cover_image_url?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.description?.length)}>
              <FieldLabel htmlFor="book-description">الوصف</FieldLabel>
              <Textarea id="book-description" name="description" />
              <FieldError>{fieldErrors.description?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="حفظ الكتاب" pendingLabel="جاري الحفظ..." size="lg" />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function BookCopyForm({
  catalogOptions,
  surface = "card",
  cancelSlot,
}: {
  catalogOptions: BookCatalogOption[]
  surface?: FormSurface
  cancelSlot?: ReactNode
}) {
  const [state, formAction] = useActionState(createBookCopyAction, initialState)
  const fieldErrors = getFieldErrors(state)
  const form = (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field data-invalid={Boolean(fieldErrors.catalog_id?.length)}>
          <FieldLabel htmlFor="copy-catalog">الكتاب</FieldLabel>
          <NativeSelect id="copy-catalog" name="catalog_id" className="w-full" required>
            <NativeSelectOption value="">اختر الكتاب</NativeSelectOption>
            {catalogOptions.map((catalog) => (
              <NativeSelectOption key={catalog.id} value={catalog.id}>
                {catalog.title}
                {catalog.author ? ` - ${catalog.author}` : ""}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.catalog_id?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.condition?.length)}>
          <FieldLabel htmlFor="copy-condition">حالة النسخة</FieldLabel>
          <NativeSelect id="copy-condition" name="condition" className="w-full" defaultValue="good" required>
            {bookCopyConditionOptions.map((condition) => (
              <NativeSelectOption key={condition} value={condition}>
                {BOOK_COPY_CONDITION_LABELS_AR[condition]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.condition?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.barcode?.length)}>
          <FieldLabel htmlFor="copy-barcode">الباركود</FieldLabel>
          <Input id="copy-barcode" name="barcode" dir="ltr" />
          <FieldError>{fieldErrors.barcode?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.accession_number?.length)}>
          <FieldLabel htmlFor="copy-accession">رقم القيد</FieldLabel>
          <Input id="copy-accession" name="accession_number" dir="ltr" />
          <FieldError>{fieldErrors.accession_number?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.shelf_location?.length)}>
          <FieldLabel htmlFor="copy-shelf">موقع الرف</FieldLabel>
          <Input id="copy-shelf" name="shelf_location" />
          <FieldError>{fieldErrors.shelf_location?.[0]}</FieldError>
        </Field>
        <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.notes?.length)}>
          <FieldLabel htmlFor="copy-notes">ملاحظات</FieldLabel>
          <Textarea id="copy-notes" name="notes" />
          <FieldError>{fieldErrors.notes?.[0]}</FieldError>
        </Field>
      </FieldGroup>
      <FormMessage state={state} />
      <FormActions
        submitLabel="حفظ النسخة"
        pendingLabel="جاري الحفظ..."
        cancelSlot={cancelSlot}
      />
    </form>
  )

  if (surface === "plain") {
    return form
  }

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إضافة نسخة كتاب</CardTitle>
        <CardDescription>
          النسخة تمثل كتابًا فعليًا على الرف ويمكن إعارتها لطالب واحد فقط في كل مرة.
        </CardDescription>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  )
}

export function IssueBookLoanForm({
  copyOptions,
  students,
}: {
  copyOptions: BookCopyOption[]
  students: Student[]
}) {
  const [state, formAction] = useActionState(issueBookLoanAction, initialState)
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إعارة كتاب لطالب</CardTitle>
        <CardDescription>
          يتم التحقق من الطالب والنسخة وحالة الإعارة داخل المدرسة الحالية على الخادم.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.copy_id?.length)}>
              <FieldLabel htmlFor="loan-copy">نسخة الكتاب</FieldLabel>
              <NativeSelect id="loan-copy" name="copy_id" className="w-full" required>
                <NativeSelectOption value="">اختر النسخة المتاحة</NativeSelectOption>
                {copyOptions.map((copy) => (
                  <NativeSelectOption key={copy.id} value={copy.id}>
                    {getCopyOptionLabel(copy)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.copy_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.student_id?.length)}>
              <FieldLabel htmlFor="loan-student">الطالب</FieldLabel>
              <NativeSelect id="loan-student" name="student_id" className="w-full" required>
                <NativeSelectOption value="">اختر الطالب</NativeSelectOption>
                {students.map((student) => (
                  <NativeSelectOption key={student.id} value={student.id}>
                    {student.full_name} - {student.student_number}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.student_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.due_at?.length)}>
              <FieldLabel htmlFor="loan-due-at">موعد الاستحقاق</FieldLabel>
              <Input id="loan-due-at" name="due_at" type="datetime-local" dir="ltr" required />
              <FieldError>{fieldErrors.due_at?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.notes?.length)}>
              <FieldLabel htmlFor="loan-notes">ملاحظات</FieldLabel>
              <Textarea id="loan-notes" name="notes" />
              <FieldError>{fieldErrors.notes?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="تسجيل الإعارة" pendingLabel="جاري التسجيل..." size="lg" />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function ReturnBookLoanForm({ loanId }: { loanId: string }) {
  const [state, formAction] = useActionState(returnBookLoanAction, initialState)
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إرجاع الكتاب</CardTitle>
        <CardDescription>
          عند الإرجاع تعود النسخة إلى الحالة المتاحة ما لم تكن محددة كمفقودة أو تالفة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="loan_id" value={loanId} />
          <Field data-invalid={Boolean(fieldErrors.return_notes?.length)}>
            <FieldLabel htmlFor="return-notes">ملاحظات الإرجاع</FieldLabel>
            <Textarea id="return-notes" name="return_notes" />
            <FieldError>{fieldErrors.return_notes?.[0]}</FieldError>
          </Field>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="تأكيد الإرجاع" pendingLabel="جاري الإرجاع..." size="lg" />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function BookCopyStatusActions({ copyId }: { copyId: string }) {
  const [lostState, lostAction] = useActionState(
    markBookCopyLostAction,
    initialState
  )
  const [damagedState, damagedAction] = useActionState(
    markBookCopyDamagedAction,
    initialState
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <form action={lostAction}>
          <input type="hidden" name="copy_id" value={copyId} />
          <SubmitButton
            label="تعليم كمفقودة"
            pendingLabel="جاري الحفظ..."
            variant="outline"
            size="sm"
          />
        </form>
        <form action={damagedAction}>
          <input type="hidden" name="copy_id" value={copyId} />
          <SubmitButton
            label="تعليم كتالفة"
            pendingLabel="جاري الحفظ..."
            variant="outline"
            size="sm"
          />
        </form>
      </div>
      <FormMessage state={lostState} />
      <FormMessage state={damagedState} />
    </div>
  )
}
