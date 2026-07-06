import type { ActionResult } from "@/lib/actions/action-result"
import { failure, success } from "@/lib/actions/action-result"
import { getAuthenticatedUser, getCurrentAuthUser } from "@/lib/auth/session"
import type { AuthenticatedUser, UserMembership } from "@/types/auth"

export type AuthenticatedRequest = {
  userId: string
  email: string | null
}

export async function requireAuth(): Promise<ActionResult<AuthenticatedRequest>> {
  const user = await getCurrentAuthUser()

  if (!user) {
    return failure("يجب تسجيل الدخول أولاً")
  }

  return success({
    userId: user.id,
    email: user.email ?? null,
  })
}

export async function requireAuthenticatedUser(): Promise<
  ActionResult<AuthenticatedUser>
> {
  const user = await getAuthenticatedUser()

  if (!user) {
    return failure("لا يمكن الوصول إلى بيانات الحساب الحالية")
  }

  return success(user)
}

export async function requireActiveMembership(): Promise<
  ActionResult<AuthenticatedUser & { membership: UserMembership }>
> {
  const authenticatedUser = await getAuthenticatedUser()

  if (!authenticatedUser) {
    return failure("لا يمكن الوصول إلى بيانات الحساب الحالية")
  }

  if (
    !authenticatedUser.membership ||
    authenticatedUser.membership.status !== "active"
  ) {
    return failure("لا توجد عضوية نشطة مرتبطة بهذا الحساب")
  }

  return success({
    ...authenticatedUser,
    membership: authenticatedUser.membership,
  })
}
