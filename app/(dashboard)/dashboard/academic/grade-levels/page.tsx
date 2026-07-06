import { Layers3, ShieldAlert } from "lucide-react"

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
import { listGradeLevels } from "@/lib/academic/academic-structure"
import {
  GRADE_LEVEL_STAGE_LABELS_AR,
  GRADE_LEVEL_STATUS_LABELS_AR,
  GRADE_LEVEL_STATUS_TONES,
} from "@/types/academic"
import { GradeLevelForm } from "../_components/academic-forms"

const academicReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

export default async function GradeLevelsPage() {
  const contextResult = await requireAcademicContext(academicReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="الصفوف الدراسية"
          description="تعريف الصفوف والمراحل داخل المدرسة الحالية."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الصفوف"
          description={contextResult.error}
        />
      </div>
    )
  }

  const gradeLevels = await listGradeLevels(contextResult.data)
  const canMutate =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الصفوف الدراسية"
        description="الصفوف هي الأساس الذي ستستخدمه الشعب، المواد، والتقارير لاحقًا."
      />

      {canMutate ? <GradeLevelForm /> : null}

      {gradeLevels.length === 0 ? (
        <EmptyState
          icon={Layers3}
          title="لا توجد صفوف دراسية بعد"
          description="أضف الصفوف بالترتيب المناسب قبل إنشاء الشعب."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gradeLevels.map((gradeLevel) => (
            <Card key={gradeLevel.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{gradeLevel.name}</CardTitle>
                    <CardDescription dir="ltr">{gradeLevel.code}</CardDescription>
                  </div>
                  <StatusBadge
                    status={GRADE_LEVEL_STATUS_TONES[gradeLevel.status]}
                  >
                    {GRADE_LEVEL_STATUS_LABELS_AR[gradeLevel.status]}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    المرحلة
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {GRADE_LEVEL_STAGE_LABELS_AR[gradeLevel.stage]}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    الترتيب
                  </p>
                  <p className="mt-1 text-sm leading-6">{gradeLevel.grade_order}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
