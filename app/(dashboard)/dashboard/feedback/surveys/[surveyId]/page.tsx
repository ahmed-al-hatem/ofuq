import Link from "next/link"
import { ClipboardList, FileText, ShieldAlert } from "lucide-react"

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
import {
  SurveyQuestionForm,
  SurveyWorkflowActions,
} from "@/app/(dashboard)/dashboard/feedback/_components/feedback-forms"
import { USER_ROLE_LABELS_AR } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import {
  feedbackManagementRoles,
  feedbackSurveyResponseRoles,
  requireFeedbackContext,
} from "@/lib/feedback/context"
import {
  getSurveyDetails,
  isSurveyAcceptingResponses,
} from "@/lib/feedback/surveys"
import {
  SURVEY_STATUS_LABELS_AR,
  SURVEY_STATUS_TONES,
  SURVEY_TARGET_TYPE_LABELS_AR,
  SURVEY_QUESTION_TYPE_LABELS_AR,
  parseSurveyChoiceOptions,
  parseSurveyRatingOptions,
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

function formatTarget(survey: Awaited<ReturnType<typeof getSurveyDetails>>) {
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

function formatQuestionMeta(
  question: Awaited<ReturnType<typeof getSurveyDetails>>["questions"][number]
) {
  if (
    question.question_type === "single_choice" ||
    question.question_type === "multiple_choice"
  ) {
    const options = parseSurveyChoiceOptions(question.options)
    return options.length > 0 ? `الخيارات: ${options.join("، ")}` : "بدون خيارات"
  }

  if (question.question_type === "rating") {
    const ratingOptions = parseSurveyRatingOptions(question.options)
    return `التقييم من ${ratingOptions.min} إلى ${ratingOptions.max}`
  }

  return question.is_required ? "إلزامي" : "اختياري"
}

export default async function FeedbackSurveyDetailsPage({
  params,
}: {
  params: Promise<{ surveyId: string }>
}) {
  const { surveyId } = await params
  const contextResult = await requireFeedbackContext(feedbackSurveyResponseRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل الاستبيان" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الاستبيان"
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
        <PageHeader title="تفاصيل الاستبيان" />
        <EmptyState
          icon={ClipboardList}
          title="الاستبيان غير موجود"
          description="تعذر العثور على الاستبيان داخل المدرسة الحالية أو ضمن نطاق وصولك."
        />
      </div>
    )
  }

  const canManage = canManageFeedback(contextResult.data.role)
  const canRespond =
    isSurveyAcceptingResponses(survey) &&
    survey.questions.length > 0 &&
    !survey.has_response
  const nextSortOrder =
    survey.questions.reduce(
      (maxValue, question) => Math.max(maxValue, question.sort_order),
      -1
    ) + 1

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={survey.title}
        description={survey.description ?? "استبيان مدرسي بسيط ضمن نطاق المدرسة الحالية."}
        actions={
          <>
            <Link
              href={appRoutes.feedbackSurveys}
              className={buttonVariants({ variant: "outline" })}
            >
              العودة للاستبيانات
            </Link>
            {canRespond ? (
              <Link href={appRoutes.feedbackSurveyRespond(survey.id)} className={buttonVariants({ size: "lg" })}>
                الرد على الاستبيان
              </Link>
            ) : null}
            {canManage ? (
              <Link
                href={appRoutes.feedbackSurveyResponses(survey.id)}
                className={buttonVariants({ variant: "outline" })}
              >
                عرض الردود
              </Link>
            ) : null}
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>الحالة</CardDescription>
            <CardTitle>
              <StatusBadge status={SURVEY_STATUS_TONES[survey.status]}>
                {SURVEY_STATUS_LABELS_AR[survey.status]}
              </StatusBadge>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>الجمهور</CardDescription>
            <CardTitle className="text-lg">{formatTarget(survey)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>نشر في</CardDescription>
            <CardTitle className="text-base">{formatDate(survey.published_at)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>عدد الردود</CardDescription>
            <CardTitle className="text-2xl">{survey.response_count}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>معلومات الجدولة</CardTitle>
          <CardDescription>
            فتح في {formatDate(survey.opens_at)} - يغلق في {formatDate(survey.closes_at)}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">أنشئ بواسطة</p>
            <p className="mt-1 text-sm leading-6">
              {survey.creator?.display_name ?? survey.creator?.full_name ?? "مستخدم غير معروف"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">وقت النشر</p>
            <p className="mt-1 text-sm leading-6">{formatDate(survey.published_at)}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">وقت الإغلاق</p>
            <p className="mt-1 text-sm leading-6">{formatDate(survey.closed_at)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>الأسئلة</CardTitle>
          <CardDescription>
            تظهر الأسئلة بالترتيب الحالي كما ستظهر في نموذج الرد.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {survey.questions.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="لا توجد أسئلة بعد"
              description="أضف أول سؤال بينما يبقى الاستبيان في حالة المسودة."
            />
          ) : (
            survey.questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">
                      {index + 1}. {question.question_text}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {SURVEY_QUESTION_TYPE_LABELS_AR[question.question_type]}
                    </p>
                  </div>
                  <StatusBadge status={question.is_required ? "info" : "neutral"}>
                    {question.is_required ? "إلزامي" : "اختياري"}
                  </StatusBadge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {formatQuestionMeta(question)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {canManage ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {survey.status === "draft" ? (
            <SurveyQuestionForm surveyId={survey.id} nextSortOrder={nextSortOrder} />
          ) : null}
          <SurveyWorkflowActions surveyId={survey.id} status={survey.status} />
        </section>
      ) : null}
    </div>
  )
}
