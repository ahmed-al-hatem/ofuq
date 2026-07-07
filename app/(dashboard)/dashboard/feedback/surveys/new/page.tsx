import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import { SurveyForm } from "@/app/(dashboard)/dashboard/feedback/_components/feedback-forms"
import { appRoutes } from "@/constants/routes"
import { listClasses, listGradeLevels } from "@/lib/academic/academic-structure"
import {
  feedbackManagementRoles,
  requireFeedbackContext,
} from "@/lib/feedback/context"

export default async function NewFeedbackSurveyPage() {
  const contextResult = await requireFeedbackContext(feedbackManagementRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="استبيان جديد" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى النموذج"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [gradeLevels, classes] = await Promise.all([
    listGradeLevels(contextResult.data),
    listClasses(contextResult.data),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="استبيان جديد"
        description="أنشئ مسودة استبيان جديدة ثم أضف أسئلتها من صفحة التفاصيل."
        actions={
          <Link
            href={appRoutes.feedbackSurveys}
            className={buttonVariants({ variant: "outline" })}
          >
            العودة للاستبيانات
          </Link>
        }
      />

      <SurveyForm gradeLevels={gradeLevels} classes={classes} />
    </div>
  )
}
