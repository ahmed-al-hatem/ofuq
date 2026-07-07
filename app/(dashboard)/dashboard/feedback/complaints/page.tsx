import Link from "next/link"
import { ShieldAlert, TriangleAlert } from "lucide-react"

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
import { appRoutes } from "@/constants/routes"
import { listComplaints } from "@/lib/feedback/complaints"
import { feedbackStaffRoles, requireFeedbackContext } from "@/lib/feedback/context"
import {
  COMPLAINT_CATEGORY_LABELS_AR,
  COMPLAINT_PRIORITY_LABELS_AR,
  COMPLAINT_PRIORITY_TONES,
  COMPLAINT_STATUS_LABELS_AR,
  COMPLAINT_STATUS_TONES,
} from "@/types/feedback"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default async function FeedbackComplaintsPage() {
  const contextResult = await requireFeedbackContext(feedbackStaffRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الشكاوى" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الشكاوى"
          description={contextResult.error}
        />
      </div>
    )
  }

  const complaints = await listComplaints(contextResult.data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الشكاوى"
        description="يعرض هذا الجدول الشكاوى المتاحة لك ضمن المدرسة الحالية، مع روابط سريعة لمراجعتها."
        actions={
          <Link href={appRoutes.newFeedbackComplaint} className={buttonVariants({ size: "lg" })}>
            شكوى جديدة
          </Link>
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>السجل</CardTitle>
          <CardDescription>
            يوضح الجدول عنوان الشكوى وفئتها وأولويتها وحالتها والطرفين المرتبطين بها.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {complaints.length === 0 ? (
            <EmptyState
              icon={TriangleAlert}
              title="لا توجد شكاوى بعد"
              description="ابدأ بإرسال أول شكوى تشغيلية داخل المدرسة الحالية."
            />
          ) : (
            <table className="w-full min-w-[1180px] text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 text-start font-medium">العنوان</th>
                  <th className="py-3 text-start font-medium">الفئة</th>
                  <th className="py-3 text-start font-medium">الأولوية</th>
                  <th className="py-3 text-start font-medium">الحالة</th>
                  <th className="py-3 text-start font-medium">مقدم الشكوى</th>
                  <th className="py-3 text-start font-medium">المكلّف</th>
                  <th className="py-3 text-start font-medium">تاريخ التقديم</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="border-b border-border/60 align-top">
                    <td className="py-3">
                      <Link
                        href={appRoutes.feedbackComplaintDetails(complaint.id)}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {complaint.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {complaint.students?.full_name ?? "بدون طالب مرتبط"}
                      </p>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {COMPLAINT_CATEGORY_LABELS_AR[complaint.category]}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={COMPLAINT_PRIORITY_TONES[complaint.priority]}>
                        {COMPLAINT_PRIORITY_LABELS_AR[complaint.priority]}
                      </StatusBadge>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={COMPLAINT_STATUS_TONES[complaint.status]}>
                        {COMPLAINT_STATUS_LABELS_AR[complaint.status]}
                      </StatusBadge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {complaint.submitted_by?.display_name ??
                        complaint.submitted_by?.full_name ??
                        "مستخدم غير معروف"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {complaint.assigned_to?.display_name ??
                        complaint.assigned_to?.full_name ??
                        "غير معيّن"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDate(complaint.submitted_at)}
                    </td>
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
