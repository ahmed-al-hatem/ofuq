import { CalendarRange, ShieldAlert } from "lucide-react"

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
import { USER_ROLES } from "@/constants/roles"
import { requireAcademicContext } from "@/lib/academic/context"
import { listAcademicYears, listTerms } from "@/lib/academic/academic-structure"
import {
  ACADEMIC_YEAR_STATUS_LABELS_AR,
  ACADEMIC_YEAR_STATUS_TONES,
  TERM_STATUS_LABELS_AR,
  TERM_STATUS_TONES,
} from "@/types/academic"
import { AcademicYearForm, TermForm } from "../_components/academic-forms"

const academicReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
  }).format(new Date(value))
}

export default async function AcademicYearsPage() {
  const contextResult = await requireAcademicContext(academicReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="السنوات والفصول"
          description="إدارة السنوات الدراسية والفصول داخل المدرسة الحالية."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى السنوات الدراسية"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [academicYears, terms] = await Promise.all([
    listAcademicYears(contextResult.data),
    listTerms(contextResult.data),
  ])
  const canMutate =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN
  const academicYearById = new Map(
    academicYears.map((academicYear) => [academicYear.id, academicYear])
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="السنوات والفصول"
        description="السنوات والفصول محصورة تلقائيًا في المستأجر والمدرسة من العضوية النشطة."
      />

      {canMutate ? (
        <section className="grid gap-4 xl:grid-cols-2">
          <AcademicYearForm />
          <TermForm academicYears={academicYears} />
        </section>
      ) : null}

      {academicYears.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="لا توجد سنوات دراسية بعد"
          description="ابدأ بإنشاء سنة دراسية، ثم أضف الفصول المرتبطة بها."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {academicYears.map((academicYear) => (
            <Card key={academicYear.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{academicYear.name}</CardTitle>
                    <CardDescription dir="ltr">{academicYear.code}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {academicYear.is_current ? (
                      <StatusBadge status="success">الحالية</StatusBadge>
                    ) : null}
                    <StatusBadge
                      status={ACADEMIC_YEAR_STATUS_TONES[academicYear.status]}
                    >
                      {ACADEMIC_YEAR_STATUS_LABELS_AR[academicYear.status]}
                    </StatusBadge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    تاريخ البداية
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {formatDate(academicYear.starts_on)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    تاريخ النهاية
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {formatDate(academicYear.ends_on)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">الفصول الدراسية</h2>
        {terms.length === 0 ? (
          <EmptyState
            title="لا توجد فصول دراسية بعد"
            description="أضف فصلًا دراسيًا بعد إنشاء السنة الدراسية المناسبة."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {terms.map((term) => (
              <Card key={term.id} className="border-border/70 shadow-sm">
                <CardHeader className="gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <CardTitle>{term.name}</CardTitle>
                      <CardDescription>
                        {academicYearById.get(term.academic_year_id)?.name ??
                          "سنة غير معروفة"}
                      </CardDescription>
                    </div>
                    <StatusBadge status={TERM_STATUS_TONES[term.status]}>
                      {TERM_STATUS_LABELS_AR[term.status]}
                    </StatusBadge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      الترتيب
                    </p>
                    <p className="mt-1 text-sm leading-6">{term.term_order}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      البداية
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {formatDate(term.starts_on)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      النهاية
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {formatDate(term.ends_on)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
