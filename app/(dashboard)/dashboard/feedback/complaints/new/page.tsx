import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import { ComplaintForm } from "@/app/(dashboard)/dashboard/feedback/_components/feedback-forms"
import { appRoutes } from "@/constants/routes"
import {
  feedbackStaffRoles,
  listFeedbackStudents,
  requireFeedbackContext,
} from "@/lib/feedback/context"

export default async function NewFeedbackComplaintPage() {
  const contextResult = await requireFeedbackContext(feedbackStaffRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="شكوى جديدة" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى النموذج"
          description={contextResult.error}
        />
      </div>
    )
  }

  const students = await listFeedbackStudents(contextResult.data, {
    activeOnly: true,
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="شكوى جديدة"
        description="استخدم هذا النموذج لتسجيل شكوى تشغيلية مرتبطة بمدرستك الحالية."
        actions={
          <Link
            href={appRoutes.feedbackComplaints}
            className={buttonVariants({ variant: "outline" })}
          >
            العودة للشكاوى
          </Link>
        }
      />

      <ComplaintForm students={students} />
    </div>
  )
}
