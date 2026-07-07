import Link from "next/link"
import { ClipboardList, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { USER_ROLE_LABELS_AR } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import { listSurveys } from "@/lib/feedback/surveys"
import {
  feedbackManagementRoles,
  feedbackSurveyResponseRoles,
  requireFeedbackContext,
} from "@/lib/feedback/context"
import {
  SURVEY_STATUS_LABELS_AR,
  SURVEY_STATUS_TONES,
  SURVEY_TARGET_TYPE_LABELS_AR,
} from "@/types/feedback"

function canManageFeedback(role: string) {
  return feedbackManagementRoles.includes(role as (typeof feedbackManagementRoles)[number])
}

function formatDate(value: string | null) {
  if (!value) {
    return "غير محدد"
  }

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatTarget(survey: Awaited<ReturnType<typeof listSurveys>>[number]) {
  if (survey.target_type === "role" && survey.target_role) {
    return USER_ROLE_LABELS_AR[survey.target_role]
  }

  if (survey.target_type === "grade_level") {
    return survey.grade_levels?.name ?? "صف غير معروف"
  }

  if (survey.target_type === "class") {
    return survey.classes?.name ?? "شعبة غير معروفة"
  }

  return SURVEY_TARGET_TYPE_LABELS_AR[survey.target_type]
}

export default async function FeedbackSurveysPage() {
  const contextResult = await requireFeedbackContext(feedbackSurveyResponseRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الاستبيانات" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الاستبيانات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const canManage = canManageFeedback(contextResult.data.role)
  const surveys = await listSurveys(contextResult.data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الاستبيانات"
        description="يعرض هذا الجدول الاستبيانات المرئية لك، مع حالة النشر والإغلاق وعدد الردود."
        actions={
          canManage ? (
            <Link href={appRoutes.newFeedbackSurvey} className={buttonVariants({ size: "lg" })}>
              استبيان جديد
            </Link>
          ) : null
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>السجل</CardTitle>
          <CardDescription>
            الاستبيانات المنشورة تظهر للطاقم المسموح له بالرد، بينما ترى الإدارة كل الحالات.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {surveys.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="لا توجد استبيانات بعد"
              description="يمكن للإدارة إنشاء أول استبيان كمسودة ثم إضافة الأسئلة ونشره."
            />
          ) : (
            <table className="w-full min-w-[1180px] text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 text-start font-medium">العنوان</th>
                  <th className="py-3 text-start font-medium">الجمهور</th>
                  <th className="py-3 text-start font-medium">الحالة</th>
                  <th className="py-3 text-start font-medium">نشر في</th>
                  <th className="py-3 text-start font-medium">يغلق في</th>
                  <th className="py-3 text-start font-medium">عدد الردود</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((survey) => (
                  <tr key={survey.id} className="border-b border-border/60 align-top">
                    <td className="py-3">
                      <Link
                        href={appRoutes.feedbackSurveyDetails(survey.id)}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {survey.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {survey.description ?? "بدون وصف إضافي"}
                      </p>
                    </td>
                    <td className="py-3 text-muted-foreground">{formatTarget(survey)}</td>
                    <td className="py-3">
                      <StatusBadge status={SURVEY_STATUS_TONES[survey.status]}>
                        {SURVEY_STATUS_LABELS_AR[survey.status]}
                      </StatusBadge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDate(survey.published_at)}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDate(survey.closes_at)}
                    </td>
                    <td className="py-3 text-muted-foreground">{survey.response_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
