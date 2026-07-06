import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TenantId } from "@/types/tenant"

export async function getTenantById(tenantId: TenantId) {
  const supabase = await createSupabaseServerClient()

  return supabase.from("tenants").select("*").eq("id", tenantId).maybeSingle()
}
