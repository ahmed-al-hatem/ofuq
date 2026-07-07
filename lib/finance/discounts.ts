import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TablesInsert } from "@/types/database"
import type {
  DiscountType,
  DiscountValueType,
  StudentDiscount,
} from "@/types/finance"
import type { FinanceModuleContext } from "@/lib/finance/context"
import {
  assertAcademicYear,
  assertActiveStudent,
  assertTerm,
  trimToNull,
} from "@/lib/finance/shared"

export type CreateDiscountTypeInput = {
  name: string
  description: string | null
  value_type: DiscountValueType
  value: number
}

export type AssignStudentDiscountInput = {
  student_id: string
  discount_type_id: string
  academic_year_id: string
  term_id: string | null
  starts_on: string | null
  ends_on: string | null
  notes: string | null
}

export async function listDiscountTypes(
  context: FinanceModuleContext
): Promise<DiscountType[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("discount_types")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data
}

export async function listStudentDiscounts(
  context: FinanceModuleContext
): Promise<StudentDiscount[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("student_discounts")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data
}

export async function countActiveStudentDiscounts(
  context: FinanceModuleContext
): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from("student_discounts")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")

  if (error) {
    return 0
  }

  return count ?? 0
}

export async function assertActiveDiscountType(
  context: FinanceModuleContext,
  discountTypeId: string
): Promise<DiscountType> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("discount_types")
    .select("*")
    .eq("id", discountTypeId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")
    .maybeSingle()

  if (error || !data) {
    throw new Error("DISCOUNT_TYPE_NOT_FOUND")
  }

  return data
}

export async function listApplicableDiscountTypes(input: {
  context: FinanceModuleContext
  student_id: string
  academic_year_id: string
  term_id: string | null
  issue_date: string
}): Promise<DiscountType[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("student_discounts")
    .select("discount_type_id")
    .eq("tenant_id", input.context.tenant_id)
    .eq("school_id", input.context.school_id)
    .eq("student_id", input.student_id)
    .eq("academic_year_id", input.academic_year_id)
    .eq("status", "active")
    .or(`term_id.is.null,term_id.eq.${input.term_id ?? "00000000-0000-0000-0000-000000000000"}`)
    .or(`starts_on.is.null,starts_on.lte.${input.issue_date}`)
    .or(`ends_on.is.null,ends_on.gte.${input.issue_date}`)

  if (input.term_id) {
    query = query.or(`term_id.is.null,term_id.eq.${input.term_id}`)
  } else {
    query = query.is("term_id", null)
  }

  const { data: studentDiscounts, error } = await query

  if (error || !studentDiscounts?.length) {
    return []
  }

  const discountTypeIds = studentDiscounts.map(
    (discount) => discount.discount_type_id
  )
  const { data: discountTypes, error: discountTypesError } = await supabase
    .from("discount_types")
    .select("*")
    .eq("tenant_id", input.context.tenant_id)
    .eq("school_id", input.context.school_id)
    .eq("status", "active")
    .in("id", discountTypeIds)

  if (discountTypesError || !discountTypes) {
    return []
  }

  return discountTypes
}

export async function createDiscountType(
  context: FinanceModuleContext,
  input: CreateDiscountTypeInput
): Promise<DiscountType> {
  const supabase = await createSupabaseServerClient()
  const discountTypeRecord: TablesInsert<"discount_types"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    name: input.name.trim(),
    description: trimToNull(input.description),
    value_type: input.value_type,
    value: input.value,
    created_by_user_id: context.user_id,
  }

  const { data, error } = await supabase
    .from("discount_types")
    .insert(discountTypeRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function assignStudentDiscount(
  context: FinanceModuleContext,
  input: AssignStudentDiscountInput
): Promise<StudentDiscount> {
  const supabase = await createSupabaseServerClient()
  await assertActiveStudent(context, input.student_id)
  await assertActiveDiscountType(context, input.discount_type_id)
  await assertAcademicYear(context, input.academic_year_id)

  if (input.term_id) {
    await assertTerm(context, input.term_id, input.academic_year_id)
  }

  if (input.starts_on && input.ends_on && input.starts_on > input.ends_on) {
    throw new Error("DISCOUNT_DATE_ORDER_INVALID")
  }

  const studentDiscountRecord: TablesInsert<"student_discounts"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    student_id: input.student_id,
    discount_type_id: input.discount_type_id,
    academic_year_id: input.academic_year_id,
    term_id: input.term_id,
    starts_on: input.starts_on,
    ends_on: input.ends_on,
    notes: trimToNull(input.notes),
    created_by_user_id: context.user_id,
  }

  const { data, error } = await supabase
    .from("student_discounts")
    .insert(studentDiscountRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
