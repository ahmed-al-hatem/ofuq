import { createClient } from "@supabase/supabase-js"

import { getServerSupabaseEnv } from "@/lib/env"

let adminClient: ReturnType<typeof createClient> | null = null

export function createSupabaseAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createSupabaseAdminClient must only be used on the server")
  }

  if (!adminClient) {
    const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } =
      getServerSupabaseEnv()

    adminClient = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return adminClient
}
