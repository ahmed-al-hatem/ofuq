import Link from "next/link"
import { CircleCheckBig, MessageSquareText, ShieldAlert } from "lucide-react"

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
  AssignComplaintForm,
  ComplaintStatusForm,
  ComplaintUpdateForm,
  ResolveComplaintForm,
} from "@/app/(dashboard)/dashboard/feedback/_components/feedback-forms"
import { appRoutes } from "@/constants/routes"
import { getComplaintDetails } from "@/lib/feedback/complaints"
import {
  feedbackManagementRoles,
  feedbackStaffRoles,
  listFeedbackUserOptions,
  requireFeedbackContext,
} from "@/lib/feedback/context"
import {
  COMPLAINT_CATEGORY_LABELS_AR,
  COMPLAINT_PRIORITY_LABELS_AR,
  COMPLAINT_PRIORITY_TONES,
  COMPLAINT_STATUS_LABELS_AR,
  COMPLAINT_STATUS_TONES,
  COMPLAINT_UPDATE_TYPE_LABELS_AR,
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

export default async function FeedbackComplaintDetailsPage({
  params,
}: {
  params: Promise<{ complaintId: string }>
}) {
  const { complaintId } = await params
  const contextResult = await requireFeedbackContext(feedbackStaffRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل الشكوى" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الشكوى"
          description={contextResult.error}
        />
      </div>
    )
  }

  let complaint: Awaited<ReturnType<typeof getComplaintDetails>>

  try {
    complaint = await getComplaintDetails(contextResult.data, complaintId)
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل الشكوى" />
        <EmptyState
          icon={MessageSquareText}
          title="الشكوى غير موجودة"
          description="تعذر العثور على الشكوى داخل المدرسة الحالية أو ضمن نطاق وصولك."
        />
      </div>
    )
  }

  const canManage = canManageFeedback(contextResult.data.role)
  const isFinalStatus =
    complaint.status === "resolved" ||
    complaint.status === "rejected" ||
    complaint.status === "cancelled"
  const assignableUsers = canManage
    ? await listFeedbackUserOptions(contextResult.data)
    : []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={complaint.title}
        description="تفاصيل الشكوى، التحديثات الزمنية، وإجراءات المتابعة المتاحة."
        actions={
          <Link
            href={appRoutes.feedbackComplaints}
            className={buttonVariants({ variant: "outline" })}
          >
            العودة للشكاوى
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>الحالة</CardDescription>
            <CardTitle>
              <StatusBadge status={COMPLAINT_STATUS_TONES[complaint.status]}>
                {COMPLAINT_STATUS_LABELS_AR[complaint.status]}
              </StatusBadge>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>الأولوية</CardDescription>
            <CardTitle>
              <StatusBadge status={COMPLAINT_PRIORITY_TONES[complaint.priority]}>
                {COMPLAINT_PRIORITY_LABELS_AR[complaint.priority]}
              </StatusBadge>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>الفئة</CardDescription>
            <CardTitle className="text-lg">
              {COMPLAINT_CATEGORY_LABELS_AR[complaint.category]}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>المكلّف</CardDescription>
            <CardTitle className="text-lg">
              {complaint.assigned_to?.display_name ??
                complaint.assigned_to?.full_name ??
                "غير معيّن"}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>وصف الشكوى</CardTitle>
          <CardDescription>
            قُدمت بواسطة{" "}
            {complaint.submitted_by?.display_name ??
              complaint.submitted_by?.full_name ??
              "مستخدم غير معروف"}{" "}
            في{" "}
            {formatDate(complaint.submitted_at)}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">الوصف</p>
            <p className="mt-2 text-sm leading-6">{complaint.description}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">بيانات إضافية</p>
            <div className="mt-2 flex flex-col gap-2 text-sm leading-6">
              <p>
                الطالب:{" "}
                {complaint.student
                  ? `${complaint.student.full_name} - ${complaint.student.student_number}`
                  : "بدون طالب مرتبط"}
              </p>
              <p>تاريخ الإغلاق: {formatDate(complaint.resolved_at)}</p>
              <p>
                أغلقها:{" "}
                {complaint.resolved_by?.display_name ??
                  complaint.resolved_by?.full_name ??
                  "غير محدد"}
              </p>
            </div>
          </div>
          {complaint.resolution_summary ? (
            <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4 md:col-span-2">
              <p className="text-xs font-medium text-secondary">ملخص الحل</p>
              <p className="mt-2 text-sm leading-6 text-secondary">
                {complaint.resolution_summary}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>التحديثات الزمنية</CardTitle>
          <CardDescription>
            تسلسل زمني للتعليقات والحالة والتعيينات المسجلة على الشكوى.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {complaint.updates.length === 0 ? (
            <EmptyState
              icon={CircleCheckBig}
              title="لا توجد تحديثات بعد"
              description="سيظهر هنا أي تعليق أو تغيير حالة أو تعيين جديد على الشكوى."
            />
          ) : (
            complaint.updates.map((update) => (
              <div
                key={update.id}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status="info">
                      {COMPLAINT_UPDATE_TYPE_LABELS_AR[update.update_type]}
                    </StatusBadge>
                    <span className="text-sm font-medium">
                      {update.author?.display_name ??
                        update.author?.full_name ??
                        "مستخدم غير معروف"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(update.created_at)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6">{update.body}</p>
                {update.old_status && update.new_status ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    من {COMPLAINT_STATUS_LABELS_AR[update.old_status]} إلى{" "}
                    {COMPLAINT_STATUS_LABELS_AR[update.new_status]}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        <ComplaintUpdateForm
          complaintId={complaint.id}
          allowInternalNote={canManage}
        />
        {canManage && !isFinalStatus ? (
          <AssignComplaintForm
            complaintId={complaint.id}
            users={assignableUsers}
            currentAssignedUserId={complaint.assigned_to_user_id}
          />
        ) : null}
        {canManage && !isFinalStatus ? (
          <ComplaintStatusForm
            complaintId={complaint.id}
            currentStatus={COMPLAINT_STATUS_LABELS_AR[complaint.status]}
          />
        ) : null}
        {canManage && !isFinalStatus ? (
          <ResolveComplaintForm complaintId={complaint.id} />
        ) : null}
      </section>
    </div>
  )
}
