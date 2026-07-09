import { GraduationCap, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { FormSheet } from "@/components/shared/form-sheet"
import { PageHeader } from "@/components/shared/page-header"
import { PageSection } from "@/components/shared/page-section"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SheetClose } from "@/components/ui/sheet"
import { USER_ROLES } from "@/constants/roles"
import { requireAcademicContext } from "@/lib/academic/context"
import {
  listAcademicYears,
  listClasses,
  listGradeLevels,
} from "@/lib/academic/academic-structure"
import {
  CLASS_STATUS_LABELS_AR,
  CLASS_STATUS_TONES,
} from "@/types/academic"
import { ClassForm } from "../_components/academic-forms"

const academicReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

export default async function ClassesPage() {
  const contextResult = await requireAcademicContext(academicReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="الشعب"
          description="إدارة الشعب داخل السنوات والصفوف الدراسية."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الشعب"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [academicYears, gradeLevels, classes] = await Promise.all([
    listAcademicYears(contextResult.data),
    listGradeLevels(contextResult.data),
    listClasses(contextResult.data),
  ])
  const canMutate =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN
  const academicYearById = new Map(
    academicYears.map((academicYear) => [academicYear.id, academicYear])
  )
  const gradeLevelById = new Map(
    gradeLevels.map((gradeLevel) => [gradeLevel.id, gradeLevel])
  )

  return (
    <PageShell>
      <PageHeader
        title="الشعب"
        description="كل شعبة ترتبط بسنة دراسية وصف دراسي داخل المدرسة الحالية."
        actions={
          canMutate ? (
            <FormSheet
              trigger={<Button size="lg" />}
              triggerLabel="إضافة شعبة"
              title="إضافة شعبة"
              description="أنشئ شعبة جديدة مع إبقاء قائمة الشعب أمامك للمراجعة السريعة."
              width="lg"
            >
              <ClassForm
                academicYears={academicYears}
                gradeLevels={gradeLevels}
                surface="plain"
                cancelSlot={
                  <SheetClose render={<Button variant="outline" type="button" />}>
                    إلغاء
                  </SheetClose>
                }
              />
            </FormSheet>
          ) : null
        }
      />

      <PageSection
        title="قائمة الشعب"
        description="تابع الشعب حسب السنة والصف والسعة دون مغادرة شاشة الإدارة الرئيسية."
        contentClassName={
          classes.length === 0 ? undefined : "grid gap-4 md:grid-cols-2"
        }
      >
        {classes.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="لا توجد شعب مطابقة حاليًا"
            description="أضف سنة دراسية وصفًا دراسيًا أولًا، ثم أنشئ الشعبة المناسبة من الإجراء أعلاه."
          />
        ) : (
          classes.map((classSection) => (
            <Card key={classSection.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{classSection.name}</CardTitle>
                    <CardDescription>
                      {gradeLevelById.get(classSection.grade_level_id)?.name ??
                        "صف غير معروف"}
                    </CardDescription>
                  </div>
                  <StatusBadge status={CLASS_STATUS_TONES[classSection.status]}>
                    {CLASS_STATUS_LABELS_AR[classSection.status]}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    السنة الدراسية
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {academicYearById.get(classSection.academic_year_id)?.name ??
                      "سنة غير معروفة"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    الرمز
                  </p>
                  <p className="mt-1 text-sm leading-6" dir="ltr">
                    {classSection.section}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    السعة
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {classSection.capacity ?? "غير محددة"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    الغرفة
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {classSection.room_name ?? "غير محددة"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </PageSection>
    </PageShell>
  )
}
