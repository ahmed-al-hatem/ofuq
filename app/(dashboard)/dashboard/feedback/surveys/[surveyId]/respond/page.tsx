import Link from "next/link"
import { ClipboardCheck, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import { SurveyResponseForm } from "@/app/(dashboard)/dashboard/feedback/_components/feedback-forms"
import { appRoutes } from "@/constants/routes"
import {
  feedbackSurveyResponseRoles,
  listFeedbackStudents,
  requireFeedbackContext,
} from "@/lib/feedback/context"
import {
  getSurveyDetails,
  isSurveyAcceptingResponses,
} from "@/lib/feedback/surveys"

function formatDate(value: string | null) {
  if (!value) {
    return "غير محدد"
  }

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default async function FeedbackSurveyRespondPage({
  params,
}: {
  params: Promise<{ surveyId: string }>
}) {
  const { surveyId } = await params
  const contextResult = await requireFeedbackContext(feedbackSurveyResponseRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الرد على الاستبيان" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى صفحة الرد"
          description={contextResult.error}
        />
      </div>
    )
  }

  let survey: Awaited<ReturnType<typeof getSurveyDetails>>

  try {
    survey = await getSurveyDetails(contextResult.data, surveyId)
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الرد على الاستبيان" />
        <EmptyState
          icon={ClipboardCheck}
          title="الاستبيان غير متاح"
          description="تعذر العثور على الاستبيان أو لم يعد ضمن نطاق وصولك."
        />
      </div>
    )
  }

  if (survey.has_response) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="الرد على الاستبيان"
          actions={
            <Link
              href={appRoutes.feedbackSurveyDetails(survey.id)}
              className={buttonVariants({ variant: "outline" })}
            >
              العودة للتفاصيل
            </Link>
          }
        />
        <EmptyState
          icon={ClipboardCheck}
          title="تم إرسال الرد مسبقًا"
          description="هذا الاستبيان يقبل ردًا واحدًا فقط لكل مستخدم داخل المدرسة الحالية."
        />
      </div>
    )
  }

  if (!isSurveyAcceptingResponses(survey)) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="الرد على الاستبيان"
          actions={
            <Link
              href={appRoutes.feedbackSurveyDetails(survey.id)}
              className={buttonVariants({ variant: "outline" })}
            >
              العودة للتفاصيل
            </Link>
          }
        />
        <EmptyState
          icon={ClipboardCheck}
          title="الاستبيان غير مفتوح للرد"
          description={`حالة الاستبيان الحالية لا تسمح باستقبال الردود. وقت الإغلاق المسجل: ${formatDate(
            survey.closes_at
          )}.`}
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
        title={`الرد على: ${survey.title}`}
        description="أرسل ردًا واحدًا آمنًا على هذا الاستبيان، مع تحقق الخادم من الأهلية ومنع التكرار."
        actions={
          <Link
            href={appRoutes.feedbackSurveyDetails(survey.id)}
            className={buttonVariants({ variant: "outline" })}
          >
            العودة للتفاصيل
          </Link>
        }
      />

      <SurveyResponseForm
        surveyId={survey.id}
        questions={survey.questions}
        students={students}
      />
    </div>
  )
}
