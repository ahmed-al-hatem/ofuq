import { LibraryBig, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requirePortalContext } from "@/lib/portal/context"
import { listPortalLibraryLoans } from "@/lib/portal/library"
import {
  BOOK_LOAN_STATUS_LABELS_AR,
  BOOK_LOAN_STATUS_TONES,
} from "@/types/library"

function formatDateTime(value: string | null) {
  if (!value) {
    return "غير متوفر"
  }

  return new Intl.DateTimeFormat("ar-SY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default async function PortalLibraryPage() {
  const contextResult = await requirePortalContext()

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="المكتبة" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى بيانات المكتبة"
          description={contextResult.error}
        />
      </div>
    )
  }

  const loans = await listPortalLibraryLoans(contextResult.data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="المكتبة"
        description="عرض قراءة فقط لسجلات الإعارة والاسترجاع المرتبطة بالطلاب المسموح بعرضهم."
        actions={<StatusBadge status="info">عرض فقط</StatusBadge>}
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>الإعارات</CardTitle>
          <CardDescription>
            لا يمكن من هذه الصفحة إصدار إعارة أو استرجاع كتاب.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {loans.length === 0 ? (
            <EmptyState
              icon={LibraryBig}
              title="لا توجد إعارات مكتبية"
              description="لا توجد سجلات إعارة مرتبطة بهذا النطاق حاليًا."
            />
          ) : (
            loans.map((loan) => (
              <div
                key={loan.id}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{loan.book_title}</p>
                    <p className="text-sm text-muted-foreground">
                      {loan.student_name} - {loan.student_number}
                    </p>
                  </div>
                  <StatusBadge status={BOOK_LOAN_STATUS_TONES[loan.status]}>
                    {BOOK_LOAN_STATUS_LABELS_AR[loan.status]}
                  </StatusBadge>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      تاريخ الإعارة
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {formatDateTime(loan.borrowed_at)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      تاريخ الاستحقاق
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {formatDateTime(loan.due_at)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      تاريخ الإرجاع
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {formatDateTime(loan.returned_at)}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  رمز النسخة: {loan.accession_number ?? loan.barcode ?? "غير متوفر"}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
