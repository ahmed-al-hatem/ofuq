import type { ActionResult } from "@/lib/actions/action-result"
import { failure, success } from "@/lib/actions/action-result"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type AuthenticatedRequest = {
  userId: string
  email: string | null
}

export async function requireAuth(): Promise<ActionResult<AuthenticatedRequest>> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return failure("يجب تسجيل الدخول أولاً")
  }

  return success({
    userId: data.user.id,
    email: data.user.email ?? null,
  })
}
