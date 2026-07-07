import Link from "next/link"
import { CalendarDays, ShieldAlert } from "lucide-react"

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
import {
  listAcademicYears,
  listClasses,
  listSubjects,
  listTerms,
} from "@/lib/academic/academic-structure"
import { requireTimetableContext } from "@/lib/timetable/context"
import { listRooms } from "@/lib/timetable/rooms"
import { listTeacherOptions } from "@/lib/timetable/teacher-subject-assignments"
import { listTimetableSlots } from "@/lib/timetable/timetable-slots"
import {
  TIMETABLE_DAY_LABELS_AR,
  TIMETABLE_SLOT_STATUS_LABELS_AR,
  TIMETABLE_SLOT_STATUS_TONES,
} from "@/types/timetable"
import { CancelTimetableSlotForm } from "../_components/timetable-forms"

const timetableReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

function formatTime(value: string) {
  return value.slice(0, 5)
}

export default async function TimetableSlotsPage() {
  const contextResult = await requireTimetableContext(timetableReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="حصص الجدول" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى حصص الجدول"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [academicYears, classes, subjects, terms, teachers, rooms, slots] =
    await Promise.all([
      listAcademicYears(contextResult.data),
      listClasses(contextResult.data),
      listSubjects(contextResult.data),
      listTerms(contextResult.data),
      listTeacherOptions(contextResult.data),
      listRooms(contextResult.data),
      listTimetableSlots(contextResult.data),
    ])
  const canMutate =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN
  const yearById = new Map(academicYears.map((year) => [year.id, year]))
  const classById = new Map(classes.map((classSection) => [classSection.id, classSection]))
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]))
  const termById = new Map(terms.map((term) => [term.id, term]))
  const teacherById = new Map(teachers.map((teacher) => [teacher.id, teacher]))
  const roomById = new Map(rooms.map((room) => [room.id, room]))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="حصص الجدول"
        description="قائمة الحصص الأسبوعية اليدوية، مع منع التعارضات عند الإنشاء."
        actions={
          canMutate ? (
            <Link
              href={appRoutes.newTimetableSlot}
              className={buttonVariants({ size: "lg" })}
            >
              حصة جديدة
            </Link>
          ) : null
        }
      />

      {slots.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="لا توجد حصص بعد"
          description="أنشئ أول حصة بعد توفر سنة وشعبة ومادة وتكليف معلم."
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {slots.map((slot) => (
            <Card key={slot.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>
                      {TIMETABLE_DAY_LABELS_AR[slot.day_of_week]} -{" "}
                      {classById.get(slot.class_id)?.name ?? "شعبة غير معروفة"}
                    </CardTitle>
                    <CardDescription dir="ltr">
                      {formatTime(slot.starts_at)} - {formatTime(slot.ends_at)}
                    </CardDescription>
                  </div>
                  <StatusBadge status={TIMETABLE_SLOT_STATUS_TONES[slot.status]}>
                    {TIMETABLE_SLOT_STATUS_LABELS_AR[slot.status]}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      السنة / الفصل
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {yearById.get(slot.academic_year_id)?.name ?? "غير محددة"} /{" "}
                      {slot.term_id ? termById.get(slot.term_id)?.name ?? "غير محدد" : "بدون فصل"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      المادة
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {subjectById.get(slot.subject_id)?.name ?? "غير معروفة"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      المعلم
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {teacherById.get(slot.teacher_user_id)?.display_name ??
                        teacherById.get(slot.teacher_user_id)?.full_name ??
                        "غير معروف"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      الغرفة
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {slot.room_id ? roomById.get(slot.room_id)?.name ?? "غير معروفة" : "بدون غرفة"}
                    </p>
                  </div>
                </div>
                {canMutate && slot.status === "active" ? (
                  <CancelTimetableSlotForm slotId={slot.id} />
                ) : null}
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
