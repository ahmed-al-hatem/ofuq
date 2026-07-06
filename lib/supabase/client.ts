import { createBrowserClient } from "@supabase/ssr"

import { getPublicSupabaseEnv } from "@/lib/env"
import type { Database } from "@/types/database"

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createSupabaseBrowserClient() {
  if (!browserClient) {
    const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
      getPublicSupabaseEnv()

    browserClient = createBrowserClient<Database>(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }

  return browserClient
}
