import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import {
  listAcademicYears,
  listClasses,
  listSubjects,
  listTerms,
} from "@/lib/academic/academic-structure"
import { requireGradesContext } from "@/lib/grades/context"
import { ExamForm } from "../../_components/grades-forms"

const gradesMutationRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

export default async function NewGradesExamPage() {
  const contextResult = await requireGradesContext(gradesMutationRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="اختبار جديد" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن إنشاء اختبار"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [academicYears, classes, subjects, terms] = await Promise.all([
    listAcademicYears(contextResult.data),
    listClasses(contextResult.data),
    listSubjects(contextResult.data),
    listTerms(contextResult.data),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="اختبار جديد"
        description="أنشئ اختبارًا مرتبطًا بشعبة ومادة. سيتم اشتقاق الصف الدراسي والتحقق من الربط على الخادم."
        actions={
          <Link
            href={appRoutes.gradesExams}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            العودة للاختبارات
          </Link>
        }
      />
      <ExamForm
        academicYears={academicYears}
        classes={classes}
        subjects={subjects}
        terms={terms}
      />
    </div>
  )
}
