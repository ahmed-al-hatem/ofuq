import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

import { getPublicSupabaseEnv } from "@/lib/env"

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getPublicSupabaseEnv()

  return createServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // Server Components cannot always set cookies. Server Actions and middleware can.
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 })
        } catch {
          // Server Components cannot always set cookies. Server Actions and middleware can.
        }
      },
    },
  })
}
