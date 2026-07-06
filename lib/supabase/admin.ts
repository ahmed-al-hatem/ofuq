import "server-only"

import { createClient } from "@supabase/supabase-js"

import { getServerSupabaseEnv } from "@/lib/env"
import type { Database } from "@/types/database"

let adminClient: ReturnType<typeof createClient<Database>> | null = null

export function createSupabaseAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createSupabaseAdminClient must only be used on the server")
  }

  if (!adminClient) {
    const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } =
      getServerSupabaseEnv()

    adminClient = createClient<Database>(
      NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }

  return adminClient
}
