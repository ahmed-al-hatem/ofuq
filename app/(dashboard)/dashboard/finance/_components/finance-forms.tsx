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
  assignStudentDiscountAction,
  cancelInvoiceAction,
  createDiscountTypeAction,
  createFeeItemAction,
  createFeeStructureAction,
  generateInvoiceAction,
  issueInvoiceAction,
  recordPaymentAction,
  type FinanceActionState,
} from "@/lib/actions/finance"
import type { AcademicYear, ClassSection, GradeLevel, Term } from "@/types/academic"
import type { Student } from "@/types/students"
import type { FeeItemType, FeeStructure, PaymentMethod } from "@/types/finance"
import {
  DISCOUNT_VALUE_TYPE_LABELS_AR,
  FEE_ITEM_TYPE_LABELS_AR,
  PAYMENT_METHOD_LABELS_AR,
} from "@/types/finance"

const initialState: FinanceActionState = null
type FormSurface = "card" | "plain"

const feeItemTypeOptions = [
  "tuition",
  "registration",
  "transport",
  "books",
  "uniform",
  "activity",
  "exam",
  "other",
] as const satisfies readonly FeeItemType[]

const discountValueTypeOptions = ["percentage", "fixed_amount"] as const

const paymentMethodOptions = [
  "cash",
  "bank_transfer",
  "card",
  "cheque",
  "online",
  "other",
] as const satisfies readonly PaymentMethod[]

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

function FormMessage({ state }: { state: FinanceActionState }) {
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

function getFieldErrors(state: FinanceActionState) {
  return state?.ok === false ? state.fieldErrors ?? {} : {}
}

export function FeeStructureForm({
  academicYears,
  gradeLevels,
  classes,
  surface = "card",
  cancelSlot,
}: {
  academicYears: AcademicYear[]
  gradeLevels: GradeLevel[]
  classes: ClassSection[]
  surface?: FormSurface
  cancelSlot?: ReactNode
}) {
  const [state, formAction] = useActionState(
    createFeeStructureAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)
  const form = (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field data-invalid={Boolean(fieldErrors.academic_year_id?.length)}>
          <FieldLabel htmlFor="fee-structure-year">السنة الدراسية</FieldLabel>
          <NativeSelect id="fee-structure-year" name="academic_year_id" className="w-full" required>
            <NativeSelectOption value="">اختر السنة</NativeSelectOption>
            {academicYears.map((year) => (
              <NativeSelectOption key={year.id} value={year.id}>
                {year.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.academic_year_id?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.name?.length)}>
          <FieldLabel htmlFor="fee-structure-name">اسم الخطة</FieldLabel>
          <Input id="fee-structure-name" name="name" required />
          <FieldError>{fieldErrors.name?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.grade_level_id?.length)}>
          <FieldLabel htmlFor="fee-structure-grade">الصف الدراسي</FieldLabel>
          <NativeSelect id="fee-structure-grade" name="grade_level_id" className="w-full">
            <NativeSelectOption value="">بدون صف محدد</NativeSelectOption>
            {gradeLevels.map((gradeLevel) => (
              <NativeSelectOption key={gradeLevel.id} value={gradeLevel.id}>
                {gradeLevel.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.grade_level_id?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.class_id?.length)}>
          <FieldLabel htmlFor="fee-structure-class">الشعبة</FieldLabel>
          <NativeSelect id="fee-structure-class" name="class_id" className="w-full">
            <NativeSelectOption value="">بدون شعبة محددة</NativeSelectOption>
            {classes.map((classSection) => (
              <NativeSelectOption key={classSection.id} value={classSection.id}>
                {classSection.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.class_id?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.currency_code?.length)}>
          <FieldLabel htmlFor="fee-structure-currency">العملة</FieldLabel>
          <Input id="fee-structure-currency" name="currency_code" defaultValue="USD" dir="ltr" required />
          <FieldError>{fieldErrors.currency_code?.[0]}</FieldError>
        </Field>
        <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.description?.length)}>
          <FieldLabel htmlFor="fee-structure-description">الوصف</FieldLabel>
          <Textarea id="fee-structure-description" name="description" />
          <FieldError>{fieldErrors.description?.[0]}</FieldError>
        </Field>
      </FieldGroup>
      <FormMessage state={state} />
      <FormActions
        submitLabel="حفظ خطة الرسوم"
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
        <CardTitle>إضافة خطة رسوم</CardTitle>
        <CardDescription>
          الخطة ترتبط بسنة دراسية ويمكن تخصيصها لصف أو شعبة عند الحاجة.
        </CardDescription>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  )
}

export function FeeItemForm({
  feeStructures,
  surface = "card",
  cancelSlot,
}: {
  feeStructures: FeeStructure[]
  surface?: FormSurface
  cancelSlot?: ReactNode
}) {
  const [state, formAction] = useActionState(createFeeItemAction, initialState)
  const fieldErrors = getFieldErrors(state)
  const form = (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field data-invalid={Boolean(fieldErrors.fee_structure_id?.length)}>
          <FieldLabel htmlFor="fee-item-structure">خطة الرسوم</FieldLabel>
          <NativeSelect id="fee-item-structure" name="fee_structure_id" className="w-full" required>
            <NativeSelectOption value="">اختر الخطة</NativeSelectOption>
            {feeStructures.map((feeStructure) => (
              <NativeSelectOption key={feeStructure.id} value={feeStructure.id}>
                {feeStructure.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.fee_structure_id?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.name?.length)}>
          <FieldLabel htmlFor="fee-item-name">اسم البند</FieldLabel>
          <Input id="fee-item-name" name="name" required />
          <FieldError>{fieldErrors.name?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.item_type?.length)}>
          <FieldLabel htmlFor="fee-item-type">نوع البند</FieldLabel>
          <NativeSelect id="fee-item-type" name="item_type" className="w-full" required>
            {feeItemTypeOptions.map((itemType) => (
              <NativeSelectOption key={itemType} value={itemType}>
                {FEE_ITEM_TYPE_LABELS_AR[itemType]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.item_type?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.amount?.length)}>
          <FieldLabel htmlFor="fee-item-amount">المبلغ</FieldLabel>
          <Input id="fee-item-amount" name="amount" type="number" min="0" step="0.01" dir="ltr" required />
          <FieldError>{fieldErrors.amount?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.due_date?.length)}>
          <FieldLabel htmlFor="fee-item-due-date">تاريخ الاستحقاق</FieldLabel>
          <Input id="fee-item-due-date" name="due_date" type="date" dir="ltr" />
          <FieldError>{fieldErrors.due_date?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.sort_order?.length)}>
          <FieldLabel htmlFor="fee-item-sort-order">الترتيب</FieldLabel>
          <Input id="fee-item-sort-order" name="sort_order" type="number" defaultValue="0" dir="ltr" />
          <FieldError>{fieldErrors.sort_order?.[0]}</FieldError>
        </Field>
        <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.description?.length)}>
          <FieldLabel htmlFor="fee-item-description">الوصف</FieldLabel>
          <Textarea id="fee-item-description" name="description" />
          <FieldError>{fieldErrors.description?.[0]}</FieldError>
        </Field>
      </FieldGroup>
      <FormMessage state={state} />
      <FormActions
        submitLabel="حفظ بند الرسوم"
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
        <CardTitle>إضافة بند رسوم</CardTitle>
        <CardDescription>
          يتم استخدام البنود النشطة عند توليد الفواتير من خطة الرسوم.
        </CardDescription>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  )
}

export function DiscountTypeForm({
  surface = "card",
  cancelSlot,
}: {
  surface?: FormSurface
  cancelSlot?: ReactNode
}) {
  const [state, formAction] = useActionState(
    createDiscountTypeAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)
  const form = (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field data-invalid={Boolean(fieldErrors.name?.length)}>
          <FieldLabel htmlFor="discount-type-name">اسم الخصم</FieldLabel>
          <Input id="discount-type-name" name="name" required />
          <FieldError>{fieldErrors.name?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.value_type?.length)}>
          <FieldLabel htmlFor="discount-value-type">طريقة الخصم</FieldLabel>
          <NativeSelect id="discount-value-type" name="value_type" className="w-full" required>
            {discountValueTypeOptions.map((valueType) => (
              <NativeSelectOption key={valueType} value={valueType}>
                {DISCOUNT_VALUE_TYPE_LABELS_AR[valueType]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.value_type?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.value?.length)}>
          <FieldLabel htmlFor="discount-value">القيمة</FieldLabel>
          <Input id="discount-value" name="value" type="number" min="0" step="0.01" dir="ltr" required />
          <FieldError>{fieldErrors.value?.[0]}</FieldError>
        </Field>
        <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.description?.length)}>
          <FieldLabel htmlFor="discount-description">الوصف</FieldLabel>
          <Textarea id="discount-description" name="description" />
          <FieldError>{fieldErrors.description?.[0]}</FieldError>
        </Field>
      </FieldGroup>
      <FormMessage state={state} />
      <FormActions
        submitLabel="حفظ نوع الخصم"
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
        <CardTitle>إضافة نوع خصم</CardTitle>
        <CardDescription>
          الخصم قد يكون نسبة مئوية أو مبلغًا ثابتًا، ويتم احتسابه عند توليد الفاتورة.
        </CardDescription>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  )
}

export function StudentDiscountForm({
  students,
  discountTypes,
  academicYears,
  terms,
  surface = "card",
  cancelSlot,
}: {
  students: Student[]
  discountTypes: { id: string; name: string }[]
  academicYears: AcademicYear[]
  terms: Term[]
  surface?: FormSurface
  cancelSlot?: ReactNode
}) {
  const [state, formAction] = useActionState(
    assignStudentDiscountAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)
  const form = (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field data-invalid={Boolean(fieldErrors.student_id?.length)}>
          <FieldLabel htmlFor="student-discount-student">الطالب</FieldLabel>
          <NativeSelect id="student-discount-student" name="student_id" className="w-full" required>
            <NativeSelectOption value="">اختر الطالب</NativeSelectOption>
            {students.map((student) => (
              <NativeSelectOption key={student.id} value={student.id}>
                {student.full_name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.student_id?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.discount_type_id?.length)}>
          <FieldLabel htmlFor="student-discount-type">نوع الخصم</FieldLabel>
          <NativeSelect id="student-discount-type" name="discount_type_id" className="w-full" required>
            <NativeSelectOption value="">اختر الخصم</NativeSelectOption>
            {discountTypes.map((discountType) => (
              <NativeSelectOption key={discountType.id} value={discountType.id}>
                {discountType.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.discount_type_id?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.academic_year_id?.length)}>
          <FieldLabel htmlFor="student-discount-year">السنة الدراسية</FieldLabel>
          <NativeSelect id="student-discount-year" name="academic_year_id" className="w-full" required>
            <NativeSelectOption value="">اختر السنة</NativeSelectOption>
            {academicYears.map((year) => (
              <NativeSelectOption key={year.id} value={year.id}>
                {year.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.academic_year_id?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.term_id?.length)}>
          <FieldLabel htmlFor="student-discount-term">الفصل الدراسي</FieldLabel>
          <NativeSelect id="student-discount-term" name="term_id" className="w-full">
            <NativeSelectOption value="">كل الفصول</NativeSelectOption>
            {terms.map((term) => (
              <NativeSelectOption key={term.id} value={term.id}>
                {term.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.term_id?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.starts_on?.length)}>
          <FieldLabel htmlFor="student-discount-starts">يبدأ في</FieldLabel>
          <Input id="student-discount-starts" name="starts_on" type="date" dir="ltr" />
          <FieldError>{fieldErrors.starts_on?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.ends_on?.length)}>
          <FieldLabel htmlFor="student-discount-ends">ينتهي في</FieldLabel>
          <Input id="student-discount-ends" name="ends_on" type="date" dir="ltr" />
          <FieldError>{fieldErrors.ends_on?.[0]}</FieldError>
        </Field>
        <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.notes?.length)}>
          <FieldLabel htmlFor="student-discount-notes">ملاحظات</FieldLabel>
          <Textarea id="student-discount-notes" name="notes" />
          <FieldError>{fieldErrors.notes?.[0]}</FieldError>
        </Field>
      </FieldGroup>
      <FormMessage state={state} />
      <FormActions
        submitLabel="حفظ خصم الطالب"
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
        <CardTitle>تعيين خصم لطالب</CardTitle>
        <CardDescription>
          يتم التحقق من الطالب ونوع الخصم والسنة الدراسية داخل المدرسة الحالية.
        </CardDescription>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  )
}

export function GenerateInvoiceForm({
  students,
  academicYears,
  terms,
  feeStructures,
}: {
  students: Student[]
  academicYears: AcademicYear[]
  terms: Term[]
  feeStructures: FeeStructure[]
}) {
  const [state, formAction] = useActionState(generateInvoiceAction, initialState)
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>توليد فاتورة</CardTitle>
        <CardDescription>
          لا يتم إرسال أي إجماليات من النموذج؛ يتم احتساب البنود والخصومات على الخادم.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.student_id?.length)}>
              <FieldLabel htmlFor="invoice-student">الطالب</FieldLabel>
              <NativeSelect id="invoice-student" name="student_id" className="w-full" required>
                <NativeSelectOption value="">اختر الطالب</NativeSelectOption>
                {students.map((student) => (
                  <NativeSelectOption key={student.id} value={student.id}>
                    {student.full_name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.student_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.academic_year_id?.length)}>
              <FieldLabel htmlFor="invoice-year">السنة الدراسية</FieldLabel>
              <NativeSelect id="invoice-year" name="academic_year_id" className="w-full" required>
                <NativeSelectOption value="">اختر السنة</NativeSelectOption>
                {academicYears.map((year) => (
                  <NativeSelectOption key={year.id} value={year.id}>
                    {year.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.academic_year_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.term_id?.length)}>
              <FieldLabel htmlFor="invoice-term">الفصل الدراسي</FieldLabel>
              <NativeSelect id="invoice-term" name="term_id" className="w-full">
                <NativeSelectOption value="">بدون فصل محدد</NativeSelectOption>
                {terms.map((term) => (
                  <NativeSelectOption key={term.id} value={term.id}>
                    {term.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.term_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.fee_structure_id?.length)}>
              <FieldLabel htmlFor="invoice-fee-structure">خطة الرسوم</FieldLabel>
              <NativeSelect id="invoice-fee-structure" name="fee_structure_id" className="w-full" required>
                <NativeSelectOption value="">اختر الخطة</NativeSelectOption>
                {feeStructures.map((feeStructure) => (
                  <NativeSelectOption key={feeStructure.id} value={feeStructure.id}>
                    {feeStructure.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.fee_structure_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.due_date?.length)}>
              <FieldLabel htmlFor="invoice-due-date">تاريخ الاستحقاق</FieldLabel>
              <Input id="invoice-due-date" name="due_date" type="date" dir="ltr" />
              <FieldError>{fieldErrors.due_date?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.notes?.length)}>
              <FieldLabel htmlFor="invoice-notes">ملاحظات</FieldLabel>
              <Textarea id="invoice-notes" name="notes" />
              <FieldError>{fieldErrors.notes?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="توليد الفاتورة" pendingLabel="جاري التوليد..." size="lg" />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function RecordPaymentForm({
  invoiceId,
  balanceAmount,
  defaultPaidAt,
  surface = "card",
  cancelSlot,
}: {
  invoiceId: string
  balanceAmount: number
  defaultPaidAt: string
  surface?: FormSurface
  cancelSlot?: ReactNode
}) {
  const [state, formAction] = useActionState(recordPaymentAction, initialState)
  const fieldErrors = getFieldErrors(state)
  const form = (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="invoice_id" value={invoiceId} />
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field data-invalid={Boolean(fieldErrors.amount?.length)}>
          <FieldLabel htmlFor="payment-amount">المبلغ</FieldLabel>
          <Input
            id="payment-amount"
            name="amount"
            type="number"
            min="0.01"
            max={balanceAmount}
            step="0.01"
            dir="ltr"
            required
          />
          <FieldError>{fieldErrors.amount?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.payment_method?.length)}>
          <FieldLabel htmlFor="payment-method">طريقة الدفع</FieldLabel>
          <NativeSelect id="payment-method" name="payment_method" className="w-full" required>
            {paymentMethodOptions.map((paymentMethod) => (
              <NativeSelectOption key={paymentMethod} value={paymentMethod}>
                {PAYMENT_METHOD_LABELS_AR[paymentMethod]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.payment_method?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.paid_at?.length)}>
          <FieldLabel htmlFor="payment-paid-at">وقت الدفع</FieldLabel>
          <Input id="payment-paid-at" name="paid_at" type="datetime-local" defaultValue={defaultPaidAt} dir="ltr" required />
          <FieldError>{fieldErrors.paid_at?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.reference_number?.length)}>
          <FieldLabel htmlFor="payment-reference">رقم المرجع</FieldLabel>
          <Input id="payment-reference" name="reference_number" dir="ltr" />
          <FieldError>{fieldErrors.reference_number?.[0]}</FieldError>
        </Field>
        <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.notes?.length)}>
          <FieldLabel htmlFor="payment-notes">ملاحظات</FieldLabel>
          <Textarea id="payment-notes" name="notes" />
          <FieldError>{fieldErrors.notes?.[0]}</FieldError>
        </Field>
      </FieldGroup>
      <FormMessage state={state} />
      <FormActions
        submitLabel="تسجيل الدفعة"
        pendingLabel="جاري التسجيل..."
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
        <CardTitle>تسجيل دفعة يدوية</CardTitle>
        <CardDescription>
          لا يسمح النظام بدفعة أكبر من الرصيد المتبقي لهذه الفاتورة.
        </CardDescription>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  )
}

export function IssueInvoiceForm({ invoiceId }: { invoiceId: string }) {
  const [state, formAction] = useActionState(issueInvoiceAction, initialState)

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="invoice_id" value={invoiceId} />
      <SubmitButton label="إصدار الفاتورة" pendingLabel="جاري الإصدار..." size="sm" />
      <FormMessage state={state} />
    </form>
  )
}

export function CancelInvoiceForm({ invoiceId }: { invoiceId: string }) {
  const [state, formAction] = useActionState(cancelInvoiceAction, initialState)

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="invoice_id" value={invoiceId} />
      <SubmitButton
        label="إلغاء الفاتورة"
        pendingLabel="جاري الإلغاء..."
        variant="outline"
        size="sm"
      />
      <FormMessage state={state} />
    </form>
  )
}
