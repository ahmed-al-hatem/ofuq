import Link from "next/link"
import { Inbox, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { appRoutes } from "@/constants/routes"
import {
  feedbackManagementRoles,
  requireFeedbackContext,
} from "@/lib/feedback/context"
import {
  getSurveyDetails,
  listSurveyResponses,
} from "@/lib/feedback/surveys"
import {
  formatSurveyAnswerValue,
  isSurveyResponseAnswers,
} from "@/types/feedback"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default async function FeedbackSurveyResponsesPage({
  params,
}: {
  params: Promise<{ surveyId: string }>
}) {
  const { surveyId } = await params
  const contextResult = await requireFeedbackContext(feedbackManagementRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="ردود الاستبيان" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الردود"
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
        <PageHeader title="ردود الاستبيان" />
        <EmptyState
          icon={Inbox}
          title="الاستبيان غير موجود"
          description="تعذر العثور على الاستبيان داخل المدرسة الحالية."
        />
      </div>
    )
  }

  const responses = await listSurveyResponses(contextResult.data, surveyId)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`ردود الاستبيان: ${survey.title}`}
        description="يعرض هذا السجل ملخصات مضغوطة للردود دون تقديم JSON خام بشكل مربك."
        actions={
          <Link
            href={appRoutes.feedbackSurveyDetails(survey.id)}
            className={buttonVariants({ variant: "outline" })}
          >
            العودة للتفاصيل
          </Link>
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>الردود</CardTitle>
          <CardDescription>
            عدد الردود الحالي: {responses.length}. كل رد مرتبط بمستخدم واحد فقط.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {responses.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="لا توجد ردود بعد"
              description="ستظهر هنا الردود بمجرد نشر الاستبيان واستلام أول إجابة."
            />
          ) : (
            responses.map((response, index) => {
              const answers = isSurveyResponseAnswers(response.answers)
                ? response.answers
                : {}

              return (
                <div
                  key={response.id}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">
                        الرد #{index + 1} -{" "}
                        {response.respondent?.display_name ??
                          response.respondent?.full_name ??
                          "مستخدم غير معروف"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {response.student
                          ? `${response.student.full_name} - ${response.student.student_number}`
                          : "بدون طالب مرتبط"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(response.submitted_at)}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    {survey.questions.map((question) => (
                      <div key={question.id} className="rounded-xl border border-border/50 bg-background/80 p-3">
                        <p className="text-sm font-medium">{question.question_text}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatSurveyAnswerValue(answers[question.id] ?? null)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
