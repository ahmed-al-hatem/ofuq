import type { ActionResult } from "@/lib/actions/action-result"
import { failure, success } from "@/lib/actions/action-result"
import type { SchoolId, TenantId } from "@/types/tenant"

export type TenantContext = {
  tenant_id?: TenantId | null
  school_id?: SchoolId | null
  tenantId?: TenantId | null
  schoolId?: SchoolId | null
}

export function requireTenant(
  context: TenantContext | null | undefined
): ActionResult<{ tenant_id: TenantId; school_id: SchoolId | null }> {
  const tenantId = context?.tenant_id ?? context?.tenantId
  const schoolId = context?.school_id ?? context?.schoolId ?? null

  if (!tenantId) {
    return failure("سياق المستأجر غير متوفر")
  }

  return success({
    tenant_id: tenantId,
    school_id: schoolId,
  })
}

export function requireSchoolContext(
  context: TenantContext | null | undefined
): ActionResult<{ tenant_id: TenantId; school_id: SchoolId }> {
  const tenantResult = requireTenant(context)

  if (!tenantResult.ok) {
    return tenantResult
  }

  if (!tenantResult.data.school_id) {
    return failure("سياق المدرسة غير متوفر لهذا الإجراء")
  }

  return success({
    tenant_id: tenantResult.data.tenant_id,
    school_id: tenantResult.data.school_id,
  })
}
