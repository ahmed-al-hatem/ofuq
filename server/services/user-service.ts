import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function getUserProfileByUserId(userId: string) {
  const supabase = await createSupabaseServerClient()

  return supabase.from("user_profiles").select("*").eq("id", userId).maybeSingle()
}
