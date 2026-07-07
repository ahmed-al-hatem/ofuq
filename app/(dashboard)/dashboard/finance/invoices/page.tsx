import Link from "next/link"
import { FileText, ShieldAlert } from "lucide-react"

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
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import { requireFinanceContext } from "@/lib/finance/context"
import { listInvoices } from "@/lib/finance/invoices"
import { listActiveStudents } from "@/lib/finance/shared"
import {
  INVOICE_STATUS_LABELS_AR,
  INVOICE_STATUS_TONES,
} from "@/types/finance"

const financeRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.ACCOUNTANT,
] as const

function formatMoney(value: number) {
  return new Intl.NumberFormat("ar", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

export default async function FinanceInvoicesPage() {
  const contextResult = await requireFinanceContext(financeRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الفواتير" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الفواتير"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [invoices, students] = await Promise.all([
    listInvoices(contextResult.data),
    listActiveStudents(contextResult.data),
  ])
  const studentById = new Map(students.map((student) => [student.id, student]))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الفواتير"
        description="قائمة الفواتير مع إجمالي المبلغ والمدفوع والرصيد المتبقي."
        actions={
          <Link
            href={appRoutes.newFinanceInvoice}
            className={buttonVariants({ size: "lg" })}
          >
            توليد فاتورة
          </Link>
        }
      />

      {invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="لا توجد فواتير بعد"
          description="ابدأ بتوليد فاتورة من خطة رسوم نشطة."
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{invoice.invoice_number}</CardTitle>
                    <CardDescription>
                      {studentById.get(invoice.student_id)?.full_name ??
                        "طالب غير معروف"}
                    </CardDescription>
                  </div>
                  <StatusBadge status={INVOICE_STATUS_TONES[invoice.status]}>
                    {INVOICE_STATUS_LABELS_AR[invoice.status]}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      الإجمالي
                    </p>
                    <p className="mt-1 font-medium">
                      {formatMoney(Number(invoice.total_amount))}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      المدفوع
                    </p>
                    <p className="mt-1 font-medium">
                      {formatMoney(Number(invoice.paid_amount))}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      الرصيد
                    </p>
                    <p className="mt-1 font-medium">
                      {formatMoney(Number(invoice.balance_amount))}
                    </p>
                  </div>
                </div>
                <Link
                  href={appRoutes.financeInvoiceDetails(invoice.id)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  عرض التفاصيل
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
