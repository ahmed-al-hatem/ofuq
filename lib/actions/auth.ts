"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { appRoutes } from "@/constants/routes"
import {
  failure,
  type ActionResult,
  validationFailure,
} from "@/lib/actions/action-result"
import { getPrimaryMembership, getUserProfile } from "@/lib/auth/session"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "يجب إدخال بريد إلكتروني صحيح" }),
  password: z.string().min(1, { message: "يجب إدخال كلمة المرور" }),
})

export type AuthActionState = ActionResult<{ redirectTo: string }> | null

function mapAuthErrorMessage(message?: string): string {
  const normalizedMessage = message?.toLowerCase() ?? ""

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("user not found")
  ) {
    return "بيانات الدخول غير صحيحة"
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "يرجى تأكيد البريد الإلكتروني أولاً"
  }

  return "حدث خطأ غير متوقع، حاول مرة أخرى"
}

async function performSignOut(): Promise<ActionResult<{ redirectTo: string }>> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return failure("تعذر تسجيل الخروج حاليًا، حاول مرة أخرى")
  }

  return {
    ok: true,
    data: {
      redirectTo: appRoutes.login,
    },
  }
}

export async function signInWithEmail(
  _previousState: AuthActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string }>> {
  const parsedValues = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من البيانات فشل"
    )
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsedValues.data)

  if (error || !data.user) {
    return failure(mapAuthErrorMessage(error?.message))
  }

  const profile = await getUserProfile(data.user.id)

  if (!profile) {
    await supabase.auth.signOut()
    return failure("لا يوجد ملف مستخدم مرتبط بهذا الحساب")
  }

  const membership = await getPrimaryMembership(data.user.id)

  if (!membership || membership.status !== "active") {
    await supabase.auth.signOut()
    return failure("لا توجد عضوية نشطة مرتبطة بهذا الحساب")
  }

  redirect(appRoutes.dashboard)
}

export async function signOut(): Promise<ActionResult<{ redirectTo: string }>> {
  const result = await performSignOut()

  if (!result.ok) {
    return result
  }

  redirect(result.data.redirectTo)
}

export async function signOutFromForm(): Promise<void> {
  const result = await performSignOut()

  if (result.ok) {
    redirect(result.data.redirectTo)
  }
}
