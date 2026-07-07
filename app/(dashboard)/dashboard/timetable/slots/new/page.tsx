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
import { requireTimetableContext } from "@/lib/timetable/context"
import { listRooms } from "@/lib/timetable/rooms"
import { listTeacherOptions } from "@/lib/timetable/teacher-subject-assignments"
import { TimetableSlotForm } from "../../_components/timetable-forms"

const timetableMutationRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
] as const

export default async function NewTimetableSlotPage() {
  const contextResult = await requireTimetableContext(timetableMutationRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="حصة جدول جديدة" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن إنشاء حصة جدول"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [academicYears, terms, classes, subjects, teachers, rooms] =
    await Promise.all([
      listAcademicYears(contextResult.data),
      listTerms(contextResult.data),
      listClasses(contextResult.data),
      listSubjects(contextResult.data),
      listTeacherOptions(contextResult.data),
      listRooms(contextResult.data),
    ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="حصة جدول جديدة"
        description="أدخل الحصة يدويًا. سيمنع الخادم تعارض الشعبة والمعلم والغرفة."
        actions={
          <Link
            href={appRoutes.timetableSlots}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            العودة للحصص
          </Link>
        }
      />
      <TimetableSlotForm
        academicYears={academicYears}
        terms={terms}
        classes={classes}
        subjects={subjects}
        teachers={teachers}
        rooms={rooms.filter((room) => room.status === "active")}
      />
    </div>
  )
}
