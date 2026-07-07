import Link from "next/link"
import {
  CheckCircle2,
  ListChecks,
  MessageSquareText,
  Search,
  TriangleAlert,
} from "lucide-react"

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
  countComplaintsByStatuses,
} from "@/lib/feedback/complaints"
import {
  feedbackManagementRoles,
  feedbackStaffRoles,
  requireFeedbackContext,
} from "@/lib/feedback/context"
import {
  countSurveyResponses,
  countSurveysByStatus,
} from "@/lib/feedback/surveys"

function canManageFeedback(role: string) {
  return feedbackManagementRoles.includes(role as (typeof feedbackManagementRoles)[number])
}

export default async function FeedbackOverviewPage() {
  const contextResult = await requireFeedbackContext(feedbackStaffRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الشكاوى والاستبيانات" />
        <EmptyState
          icon={TriangleAlert}
          title="لا يمكن الوصول إلى الوحدة"
          description={contextResult.error}
        />
      </div>
    )
  }

  const canManage = canManageFeedback(contextResult.data.role)
  const [openComplaintsCount, inReviewComplaintsCount, resolvedComplaintsCount, publishedSurveysCount, totalResponsesCount] =
    await Promise.all([
      countComplaintsByStatuses(contextResult.data, ["submitted", "in_review"]),
      countComplaintsByStatuses(contextResult.data, ["in_review"]),
      countComplaintsByStatuses(contextResult.data, ["resolved"]),
      countSurveysByStatus(contextResult.data, "published"),
      countSurveyResponses(contextResult.data),
    ])

  const cards = [
    {
      title: "الشكاوى المفتوحة",
      value: openComplaintsCount,
      description: "شكاوى مفتوحة ضمن نطاق وصولك الحالي.",
      href: appRoutes.feedbackComplaints,
      icon: TriangleAlert,
    },
    {
      title: "الشكاوى قيد المراجعة",
      value: inReviewComplaintsCount,
      description: "حالات تم نقلها إلى المراجعة ولم تُغلق بعد.",
      href: appRoutes.feedbackComplaints,
      icon: Search,
    },
    {
      title: "الشكاوى المحلولة",
      value: resolvedComplaintsCount,
      description: "شكاوى أُغلقت كحالات محلولة داخل المدرسة الحالية.",
      href: appRoutes.feedbackComplaints,
      icon: CheckCircle2,
    },
    {
      title: "الاستبيانات المنشورة",
      value: publishedSurveysCount,
      description: "استبيانات منشورة ومتاحة للعرض أو الرد بحسب الصلاحية.",
      href: appRoutes.feedbackSurveys,
      icon: ListChecks,
    },
    {
      title: "إجمالي الردود",
      value: totalResponsesCount,
      description: canManage
        ? "إجمالي ردود الاستبيانات داخل المدرسة الحالية."
        : "إجمالي ردودك المرسلة على الاستبيانات المتاحة لك.",
      href: appRoutes.feedbackSurveys,
      icon: MessageSquareText,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الشكاوى والاستبيانات"
        description="أساس تشغيلي بسيط لتقديم الشكاوى، مراجعتها، وإنشاء الاستبيانات والرد عليها داخل المدرسة الحالية."
        actions={
          <>
            <Link href={appRoutes.newFeedbackComplaint} className={buttonVariants({ size: "lg" })}>
              شكوى جديدة
            </Link>
            {canManage ? (
              <Link
                href={appRoutes.newFeedbackSurvey}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                استبيان جديد
              </Link>
            ) : null}
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <Card key={card.title} className="border-border/70 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <CardDescription>{card.title}</CardDescription>
                  <CardTitle className="text-2xl">{card.value}</CardTitle>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-primary">
                  <Icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {card.description}
                </p>
                <Link
                  href={card.href}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  فتح الصفحة
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
