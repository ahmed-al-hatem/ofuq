import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TablesInsert } from "@/types/database"
import type { ClassSection, GradeLevel } from "@/types/academic"
import type { FeeItem, FeeItemType, FeeStructure } from "@/types/finance"
import type { FinanceModuleContext } from "@/lib/finance/context"
import {
  assertAcademicYear,
  assertClassSection,
  assertGradeLevel,
  trimToNull,
} from "@/lib/finance/shared"

export type CreateFeeStructureInput = {
  academic_year_id: string
  grade_level_id: string | null
  class_id: string | null
  name: string
  description: string | null
  currency_code: string
}

export type CreateFeeItemInput = {
  fee_structure_id: string
  name: string
  description: string | null
  item_type: FeeItemType
  amount: number
  due_date: string | null
  sort_order: number
}

export async function listFeeStructures(
  context: FinanceModuleContext
): Promise<FeeStructure[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("fee_structures")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data
}

export async function listFeeItems(
  context: FinanceModuleContext
): Promise<FeeItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("fee_items")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data
}

export async function countActiveFeeStructures(
  context: FinanceModuleContext
): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from("fee_structures")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")

  if (error) {
    return 0
  }

  return count ?? 0
}

export async function assertFeeStructure(
  context: FinanceModuleContext,
  feeStructureId: string
): Promise<FeeStructure> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("fee_structures")
    .select("*")
    .eq("id", feeStructureId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("FEE_STRUCTURE_NOT_FOUND")
  }

  return data
}

export async function listActiveFeeItemsForStructure(
  context: FinanceModuleContext,
  feeStructureId: string
): Promise<FeeItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("fee_items")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("fee_structure_id", feeStructureId)
    .eq("status", "active")
    .order("sort_order", { ascending: true })

  if (error || !data) {
    return []
  }

  return data
}

async function validateFeeStructureScope(
  context: FinanceModuleContext,
  input: CreateFeeStructureInput
): Promise<{
  gradeLevel: GradeLevel | null
  classSection: ClassSection | null
}> {
  await assertAcademicYear(context, input.academic_year_id)

  const gradeLevel = input.grade_level_id
    ? await assertGradeLevel(context, input.grade_level_id)
    : null
  const classSection = input.class_id
    ? await assertClassSection(context, input.class_id, input.academic_year_id)
    : null

  if (
    gradeLevel &&
    classSection &&
    classSection.grade_level_id !== gradeLevel.id
  ) {
    throw new Error("FEE_STRUCTURE_SCOPE_MISMATCH")
  }

  return { gradeLevel, classSection }
}

export async function createFeeStructure(
  context: FinanceModuleContext,
  input: CreateFeeStructureInput
): Promise<FeeStructure> {
  const supabase = await createSupabaseServerClient()
  await validateFeeStructureScope(context, input)

  const feeStructureRecord: TablesInsert<"fee_structures"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    academic_year_id: input.academic_year_id,
    grade_level_id: input.grade_level_id,
    class_id: input.class_id,
    name: input.name.trim(),
    description: trimToNull(input.description),
    currency_code: input.currency_code.trim().toUpperCase(),
    created_by_user_id: context.user_id,
  }

  const { data, error } = await supabase
    .from("fee_structures")
    .insert(feeStructureRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createFeeItem(
  context: FinanceModuleContext,
  input: CreateFeeItemInput
): Promise<FeeItem> {
  const supabase = await createSupabaseServerClient()
  await assertFeeStructure(context, input.fee_structure_id)

  const feeItemRecord: TablesInsert<"fee_items"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    fee_structure_id: input.fee_structure_id,
    name: input.name.trim(),
    description: trimToNull(input.description),
    item_type: input.item_type,
    amount: input.amount,
    due_date: input.due_date,
    sort_order: input.sort_order,
  }

  const { data, error } = await supabase
    .from("fee_items")
    .insert(feeItemRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
