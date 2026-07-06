import type { NextRequest } from "next/server"

import { refreshSession } from "@/lib/supabase/middleware"

export async function proxy(request: NextRequest) {
  return refreshSession(request)
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
