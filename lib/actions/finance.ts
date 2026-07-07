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
import { createDiscountType, assignStudentDiscount } from "@/lib/finance/discounts"
import {
  createFeeItem,
  createFeeStructure,
} from "@/lib/finance/fee-structures"
import { requireFinanceContext } from "@/lib/finance/context"
import {
  cancelInvoice,
  generateInvoiceFromFeeStructure,
  issueInvoice,
} from "@/lib/finance/invoices"
import { recordManualPayment } from "@/lib/finance/payments"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const financeMutationRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.ACCOUNTANT,
] as const

const feeItemTypeValues = [
  "tuition",
  "registration",
  "transport",
  "books",
  "uniform",
  "activity",
  "exam",
  "other",
] as const

const discountValueTypeValues = ["percentage", "fixed_amount"] as const

const paymentMethodValues = [
  "cash",
  "bank_transfer",
  "card",
  "cheque",
  "online",
  "other",
] as const

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))

const optionalDateSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))

const optionalUuidSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || z.string().uuid().safeParse(value).success, {
    message: "القيمة المحددة غير صالحة",
  })

const moneySchema = z
  .union([z.string(), z.number()])
  .transform((value) => Number(String(value).trim()))
  .refine((value) => Number.isFinite(value), {
    message: "يجب إدخال مبلغ صالح",
  })
  .transform((value) => Math.round(value * 100) / 100)

const nonNegativeMoneySchema = moneySchema.refine((value) => value >= 0, {
  message: "المبلغ يجب ألا يكون سالبًا",
})

const positiveMoneySchema = moneySchema.refine((value) => value > 0, {
  message: "المبلغ يجب أن يكون أكبر من صفر",
})

const optionalIntegerSchema = z
  .union([z.string(), z.number(), z.null()])
  .transform((value) => {
    if (value === null) {
      return 0
    }

    const stringValue = String(value).trim()
    return stringValue === "" ? 0 : Number(stringValue)
  })
  .refine((value) => Number.isInteger(value), {
    message: "يجب إدخال رقم صحيح",
  })

const createFeeStructureSchema = z.object({
  academic_year_id: z.string().uuid("السنة الدراسية مطلوبة"),
  grade_level_id: optionalUuidSchema,
  class_id: optionalUuidSchema,
  name: z.string().trim().min(1, "اسم الخطة مطلوب"),
  description: optionalTextSchema,
  currency_code: z
    .string()
    .trim()
    .min(3, "رمز العملة مطلوب")
    .max(3, "رمز العملة يجب أن يتكون من 3 أحرف")
    .transform((value) => value.toUpperCase())
    .refine((value) => /^[A-Z]{3}$/.test(value), {
      message: "رمز العملة يجب أن يكون بصيغة مثل USD",
    }),
})

const createFeeItemSchema = z.object({
  fee_structure_id: z.string().uuid("خطة الرسوم مطلوبة"),
  name: z.string().trim().min(1, "اسم بند الرسوم مطلوب"),
  description: optionalTextSchema,
  item_type: z.enum(feeItemTypeValues),
  amount: nonNegativeMoneySchema,
  due_date: optionalDateSchema,
  sort_order: optionalIntegerSchema,
})

const createDiscountTypeSchema = z
  .object({
    name: z.string().trim().min(1, "اسم الخصم مطلوب"),
    description: optionalTextSchema,
    value_type: z.enum(discountValueTypeValues),
    value: nonNegativeMoneySchema,
  })
  .refine(
    (value) =>
      value.value_type === "fixed_amount" ||
      (value.value >= 0 && value.value <= 100),
    {
      message: "النسبة المئوية يجب أن تكون بين 0 و 100",
      path: ["value"],
    }
  )

const assignStudentDiscountSchema = z
  .object({
    student_id: z.string().uuid("الطالب مطلوب"),
    discount_type_id: z.string().uuid("نوع الخصم مطلوب"),
    academic_year_id: z.string().uuid("السنة الدراسية مطلوبة"),
    term_id: optionalUuidSchema,
    starts_on: optionalDateSchema,
    ends_on: optionalDateSchema,
    notes: optionalTextSchema,
  })
  .refine(
    (value) =>
      !value.starts_on || !value.ends_on || value.starts_on <= value.ends_on,
    {
      message: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية",
      path: ["ends_on"],
    }
  )

const generateInvoiceSchema = z.object({
  student_id: z.string().uuid("الطالب مطلوب"),
  academic_year_id: z.string().uuid("السنة الدراسية مطلوبة"),
  term_id: optionalUuidSchema,
  fee_structure_id: z.string().uuid("خطة الرسوم مطلوبة"),
  due_date: optionalDateSchema,
  notes: optionalTextSchema,
})

const invoiceIdSchema = z.object({
  invoice_id: z.string().uuid("الفاتورة مطلوبة"),
})

const recordPaymentSchema = z.object({
  invoice_id: z.string().uuid("الفاتورة مطلوبة"),
  amount: positiveMoneySchema,
  payment_method: z.enum(paymentMethodValues),
  paid_at: z
    .string()
    .trim()
    .min(1, "تاريخ الدفع مطلوب")
    .transform((value) => new Date(value).toISOString()),
  reference_number: optionalTextSchema,
  notes: optionalTextSchema,
})

export type FinanceActionState = ActionResult<{ redirectTo?: string }> | null

async function writeFinanceAuditLog(input: {
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

function mapFinanceError(error: unknown): string {
  const message = error instanceof Error ? error.message : ""

  if (message === "FEE_STRUCTURE_NOT_FOUND") {
    return "تعذر العثور على خطة الرسوم داخل المدرسة الحالية"
  }

  if (message === "FEE_STRUCTURE_NOT_ACTIVE") {
    return "خطة الرسوم المحددة غير نشطة"
  }

  if (message === "FEE_STRUCTURE_YEAR_MISMATCH") {
    return "خطة الرسوم لا تتبع السنة الدراسية المحددة"
  }

  if (message === "FEE_STRUCTURE_HAS_NO_ITEMS") {
    return "لا يمكن توليد فاتورة من خطة رسوم بلا بنود نشطة"
  }

  if (message === "FEE_STRUCTURE_SCOPE_MISMATCH") {
    return "الصف الدراسي لا يطابق الشعبة المحددة في خطة الرسوم"
  }

  if (message === "DISCOUNT_TYPE_NOT_FOUND") {
    return "نوع الخصم غير نشط أو لا يتبع المدرسة الحالية"
  }

  if (message === "DISCOUNT_DATE_ORDER_INVALID") {
    return "تاريخ بداية الخصم يجب أن يكون قبل تاريخ النهاية"
  }

  if (message === "INVOICE_NOT_FOUND") {
    return "تعذر العثور على الفاتورة داخل المدرسة الحالية"
  }

  if (message === "INVOICE_CANNOT_BE_ISSUED") {
    return "يمكن إصدار الفواتير في حالة المسودة فقط"
  }

  if (message === "INVOICE_HAS_PAYMENTS") {
    return "لا يمكن إلغاء فاتورة لديها دفعات مكتملة"
  }

  if (message === "INVOICE_CANNOT_BE_CANCELLED") {
    return "لا يمكن إلغاء هذه الفاتورة في حالتها الحالية"
  }

  if (message === "INVOICE_TERMINAL") {
    return "لا يمكن تسجيل دفعة على فاتورة ملغاة أو باطلة"
  }

  if (message === "PAYMENT_OVERPAID") {
    return "مبلغ الدفعة أكبر من الرصيد المتبقي، ولا يسمح بالدفع الزائد في هذه المرحلة"
  }

  if (message === "PAYMENT_AMOUNT_INVALID") {
    return "مبلغ الدفعة يجب أن يكون أكبر من صفر"
  }

  if (
    message === "ACADEMIC_YEAR_NOT_FOUND" ||
    message === "TERM_NOT_FOUND" ||
    message === "GRADE_LEVEL_NOT_FOUND" ||
    message === "CLASS_NOT_FOUND" ||
    message === "STUDENT_NOT_FOUND"
  ) {
    return "تعذر التحقق من ملكية السجل المحدد داخل المدرسة الحالية"
  }

  if (message === "CLASS_YEAR_MISMATCH") {
    return "الشعبة لا تتبع السنة الدراسية المحددة"
  }

  if (message.toLowerCase().includes("duplicate")) {
    return "يوجد سجل مماثل بالفعل داخل المدرسة الحالية"
  }

  return "تعذر حفظ بيانات المالية حاليًا"
}

export async function createFeeStructureAction(
  _previousState: FinanceActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFinanceContext(financeMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createFeeStructureSchema.safeParse({
    academic_year_id: formData.get("academic_year_id"),
    grade_level_id: formData.get("grade_level_id"),
    class_id: formData.get("class_id"),
    name: formData.get("name"),
    description: formData.get("description"),
    currency_code: formData.get("currency_code") || "USD",
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات خطة الرسوم فشل"
    )
  }

  try {
    const feeStructure = await createFeeStructure(
      contextResult.data,
      parsedValues.data
    )

    await writeFinanceAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "finance.fee_structure.created",
      entity_type: "fee_structure",
      entity_id: feeStructure.id,
      metadata: {
        academic_year_id: feeStructure.academic_year_id,
        grade_level_id: feeStructure.grade_level_id,
        class_id: feeStructure.class_id,
      },
    })
  } catch (error) {
    return failure(mapFinanceError(error))
  }

  revalidatePath(appRoutes.finance)
  revalidatePath(appRoutes.financeFees)
  redirect(appRoutes.financeFees)
}

export async function createFeeItemAction(
  _previousState: FinanceActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFinanceContext(financeMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createFeeItemSchema.safeParse({
    fee_structure_id: formData.get("fee_structure_id"),
    name: formData.get("name"),
    description: formData.get("description"),
    item_type: formData.get("item_type"),
    amount: formData.get("amount"),
    due_date: formData.get("due_date"),
    sort_order: formData.get("sort_order"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات بند الرسوم فشل"
    )
  }

  try {
    const feeItem = await createFeeItem(contextResult.data, parsedValues.data)

    await writeFinanceAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "finance.fee_item.created",
      entity_type: "fee_item",
      entity_id: feeItem.id,
      metadata: {
        fee_structure_id: feeItem.fee_structure_id,
        amount: Number(feeItem.amount),
      },
    })
  } catch (error) {
    return failure(mapFinanceError(error))
  }

  revalidatePath(appRoutes.finance)
  revalidatePath(appRoutes.financeFees)
  redirect(appRoutes.financeFees)
}

export async function createDiscountTypeAction(
  _previousState: FinanceActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFinanceContext(financeMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = createDiscountTypeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    value_type: formData.get("value_type"),
    value: formData.get("value"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات نوع الخصم فشل"
    )
  }

  try {
    const discountType = await createDiscountType(
      contextResult.data,
      parsedValues.data
    )

    await writeFinanceAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "finance.discount_type.created",
      entity_type: "discount_type",
      entity_id: discountType.id,
      metadata: {
        value_type: discountType.value_type,
        value: Number(discountType.value),
      },
    })
  } catch (error) {
    return failure(mapFinanceError(error))
  }

  revalidatePath(appRoutes.finance)
  revalidatePath(appRoutes.financeDiscounts)
  redirect(appRoutes.financeDiscounts)
}

export async function assignStudentDiscountAction(
  _previousState: FinanceActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFinanceContext(financeMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = assignStudentDiscountSchema.safeParse({
    student_id: formData.get("student_id"),
    discount_type_id: formData.get("discount_type_id"),
    academic_year_id: formData.get("academic_year_id"),
    term_id: formData.get("term_id"),
    starts_on: formData.get("starts_on"),
    ends_on: formData.get("ends_on"),
    notes: formData.get("notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات خصم الطالب فشل"
    )
  }

  try {
    const studentDiscount = await assignStudentDiscount(
      contextResult.data,
      parsedValues.data
    )

    await writeFinanceAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "finance.student_discount.assigned",
      entity_type: "student_discount",
      entity_id: studentDiscount.id,
      metadata: {
        student_id: studentDiscount.student_id,
        discount_type_id: studentDiscount.discount_type_id,
        academic_year_id: studentDiscount.academic_year_id,
        term_id: studentDiscount.term_id,
      },
    })
  } catch (error) {
    return failure(mapFinanceError(error))
  }

  revalidatePath(appRoutes.finance)
  revalidatePath(appRoutes.financeDiscounts)
  redirect(appRoutes.financeDiscounts)
}

export async function generateInvoiceAction(
  _previousState: FinanceActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFinanceContext(financeMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = generateInvoiceSchema.safeParse({
    student_id: formData.get("student_id"),
    academic_year_id: formData.get("academic_year_id"),
    term_id: formData.get("term_id"),
    fee_structure_id: formData.get("fee_structure_id"),
    due_date: formData.get("due_date"),
    notes: formData.get("notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات الفاتورة فشل"
    )
  }

  let invoiceId = ""

  try {
    const invoice = await generateInvoiceFromFeeStructure(
      contextResult.data,
      parsedValues.data
    )
    invoiceId = invoice.id

    await writeFinanceAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "finance.invoice.generated",
      entity_type: "invoice",
      entity_id: invoice.id,
      metadata: {
        invoice_number: invoice.invoice_number,
        student_id: invoice.student_id,
        total_amount: Number(invoice.total_amount),
      },
    })
  } catch (error) {
    return failure(mapFinanceError(error))
  }

  revalidatePath(appRoutes.finance)
  revalidatePath(appRoutes.financeInvoices)
  redirect(appRoutes.financeInvoiceDetails(invoiceId))
}

export async function issueInvoiceAction(
  _previousState: FinanceActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFinanceContext(financeMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = invoiceIdSchema.safeParse({
    invoice_id: formData.get("invoice_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const invoice = await issueInvoice(
      contextResult.data,
      parsedValues.data.invoice_id
    )

    await writeFinanceAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "finance.invoice.issued",
      entity_type: "invoice",
      entity_id: invoice.id,
      metadata: {
        invoice_number: invoice.invoice_number,
      },
    })
  } catch (error) {
    return failure(mapFinanceError(error))
  }

  revalidatePath(appRoutes.finance)
  revalidatePath(appRoutes.financeInvoices)
  return success({}, "تم إصدار الفاتورة")
}

export async function cancelInvoiceAction(
  _previousState: FinanceActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFinanceContext(financeMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = invoiceIdSchema.safeParse({
    invoice_id: formData.get("invoice_id"),
  })

  if (!parsedValues.success) {
    return validationFailure(parsedValues.error.flatten().fieldErrors)
  }

  try {
    const invoice = await cancelInvoice(
      contextResult.data,
      parsedValues.data.invoice_id
    )

    await writeFinanceAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "finance.invoice.cancelled",
      entity_type: "invoice",
      entity_id: invoice.id,
      metadata: {
        invoice_number: invoice.invoice_number,
      },
    })
  } catch (error) {
    return failure(mapFinanceError(error))
  }

  revalidatePath(appRoutes.finance)
  revalidatePath(appRoutes.financeInvoices)
  return success({}, "تم إلغاء الفاتورة")
}

export async function recordPaymentAction(
  _previousState: FinanceActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireFinanceContext(financeMutationRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = recordPaymentSchema.safeParse({
    invoice_id: formData.get("invoice_id"),
    amount: formData.get("amount"),
    payment_method: formData.get("payment_method"),
    paid_at: formData.get("paid_at") || new Date().toISOString(),
    reference_number: formData.get("reference_number"),
    notes: formData.get("notes"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من بيانات الدفعة فشل"
    )
  }

  try {
    const payment = await recordManualPayment(
      contextResult.data,
      parsedValues.data
    )

    await writeFinanceAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "finance.payment.recorded",
      entity_type: "payment",
      entity_id: payment.id,
      metadata: {
        invoice_id: payment.invoice_id,
        student_id: payment.student_id,
        amount: Number(payment.amount),
        payment_method: payment.payment_method,
      },
    })
  } catch (error) {
    return failure(mapFinanceError(error))
  }

  revalidatePath(appRoutes.finance)
  revalidatePath(appRoutes.financeInvoices)
  revalidatePath(appRoutes.financePayments)
  return success({}, "تم تسجيل الدفعة")
}
