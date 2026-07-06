import type { ActionResult } from "@/lib/actions/action-result"
import { failure, success } from "@/lib/actions/action-result"
import type { SchoolId, TenantId } from "@/types/tenant"

export type TenantContext = {
  tenantId: TenantId | null
  schoolId?: SchoolId | null
}

export function requireTenant(
  context: TenantContext | null | undefined
): ActionResult<{ tenantId: TenantId; schoolId: SchoolId | null }> {
  if (!context?.tenantId) {
    return failure("سياق المستأجر غير متوفر")
  }

  return success({
    tenantId: context.tenantId,
    schoolId: context.schoolId ?? null,
  })
}
