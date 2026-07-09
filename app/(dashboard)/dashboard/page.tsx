import { EmptyState } from "@/components/shared/empty-state"
import { ShieldAlert } from "lucide-react"

import { RoleDashboard } from "@/components/dashboard/role-dashboard"
import { getAuthenticatedUser } from "@/lib/auth/session"
import { getRoleDashboardSummary } from "@/lib/dashboard/get-role-dashboard-summary"

export default async function DashboardPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="لا يمكن تحميل لوحة التحكم"
        description="تعذر الوصول إلى بيانات الحساب الحالية. يرجى إعادة تسجيل الدخول ثم المحاولة مرة أخرى."
      />
    )
  }

  const summary = await getRoleDashboardSummary(user)

  if (!summary) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="لا يمكن تحميل لوحة التحكم"
        description="لا تتوفر بيانات ملخص مناسبة للعضوية الحالية داخل المدرسة."
      />
    )
  }

  return <RoleDashboard summary={summary} />
}
