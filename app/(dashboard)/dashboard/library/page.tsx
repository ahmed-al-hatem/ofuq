import Link from "next/link"
import {
  BookCopy,
  BookOpen,
  ClockAlert,
  LibraryBig,
  ShieldAlert,
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
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import { getLibraryCatalogTotals } from "@/lib/library/catalog"
import { getLibraryCopyTotals } from "@/lib/library/copies"
import { requireLibraryContext } from "@/lib/library/context"
import { getLibraryLoanTotals, listBookLoans } from "@/lib/library/loans"

const libraryReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.LIBRARIAN,
  USER_ROLES.TEACHER,
  USER_ROLES.ACCOUNTANT,
] as const

function canManageLibrary(role: string) {
  return (
    role === USER_ROLES.SYSTEM_ADMIN ||
    role === USER_ROLES.SCHOOL_ADMIN ||
    role === USER_ROLES.LIBRARIAN
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default async function LibraryOverviewPage() {
  const contextResult = await requireLibraryContext(libraryReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="المكتبة"
          description="فهرس كتب ونسخ فعلية وإعارات طلابية أساسية."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى وحدة المكتبة"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [catalogTotals, copyTotals, loanTotals, recentLoans] =
    await Promise.all([
      getLibraryCatalogTotals(contextResult.data),
      getLibraryCopyTotals(contextResult.data),
      getLibraryLoanTotals(contextResult.data),
      listBookLoans(contextResult.data, 5),
    ])
  const canManage = canManageLibrary(contextResult.data.role)
  const cards = [
    {
      title: "إجمالي الكتب",
      value: catalogTotals.catalogCount,
      description: "كتب نشطة أو غير مؤرشفة في الفهرس",
      href: appRoutes.libraryCatalog,
      icon: LibraryBig,
    },
    {
      title: "النسخ المتاحة",
      value: copyTotals.availableCopiesCount,
      description: "نسخ يمكن إعارتها الآن",
      href: appRoutes.libraryCopies,
      icon: BookCopy,
    },
    {
      title: "الإعارات النشطة",
      value: loanTotals.activeLoansCount,
      description: "كتب ما زالت لدى الطلاب",
      href: appRoutes.libraryLoans,
      icon: BookOpen,
    },
    {
      title: "الإعارات المتأخرة",
      value: loanTotals.overdueLoansCount,
      description: "إعارات نشطة تجاوزت تاريخ الاستحقاق",
      href: appRoutes.libraryOverdue,
      icon: ClockAlert,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="المكتبة"
        description="أساس تشغيلي لفهرس الكتب والنسخ والإعارات دون غرامات مالية أو تكامل باركود خارجي."
        actions={
          canManage ? (
            <>
              <Link
                href={appRoutes.newLibraryLoan}
                className={buttonVariants({ size: "lg" })}
              >
                إعارة كتاب
              </Link>
              <Link
                href={appRoutes.newLibraryCatalog}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                إضافة كتاب
              </Link>
            </>
          ) : null
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>أحدث الإعارات</CardTitle>
            <CardDescription>آخر عمليات الإعارة والإرجاع في المدرسة.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentLoans.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد إعارات بعد.</p>
            ) : (
              recentLoans.map((loan) => (
                <Link
                  key={loan.id}
                  href={appRoutes.libraryLoanDetails(loan.id)}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <p className="font-medium">
                    {loan.book_catalog?.title ?? "كتاب غير معروف"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {loan.students?.full_name ?? "طالب غير معروف"} - الاستحقاق{" "}
                    {formatDate(loan.due_at)}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>روابط سريعة</CardTitle>
            <CardDescription>العمليات الأساسية لوحدة المكتبة.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href={appRoutes.libraryCatalog} className={buttonVariants({ variant: "outline" })}>
              فهرس الكتب
            </Link>
            <Link href={appRoutes.libraryCopies} className={buttonVariants({ variant: "outline" })}>
              نسخ الكتب
            </Link>
            <Link href={appRoutes.libraryLoans} className={buttonVariants({ variant: "outline" })}>
              الإعارات
            </Link>
            {canManage ? (
              <Link href={appRoutes.newLibraryLoan} className={buttonVariants()}>
                إعارة كتاب
              </Link>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
