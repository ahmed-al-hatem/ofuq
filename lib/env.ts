type PublicSupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
}

type ServerSupabaseEnv = PublicSupabaseEnv & {
  SUPABASE_SERVICE_ROLE_KEY: string
}

function requireEnv(key: keyof NodeJS.ProcessEnv): string {
  const value = process.env[key]

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  return {
    NEXT_PUBLIC_SUPABASE_URL: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  }
}

export function getServerSupabaseEnv(): ServerSupabaseEnv {
  if (typeof window !== "undefined") {
    throw new Error("Server Supabase env must not be read in the browser")
  }

  return {
    ...getPublicSupabaseEnv(),
    SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  }
}
