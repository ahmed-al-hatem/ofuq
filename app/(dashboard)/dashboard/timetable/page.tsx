import Link from "next/link"
import { CalendarDays, DoorOpen, ListChecks, ShieldAlert, UserCheck } from "lucide-react"

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
import { requireTimetableContext } from "@/lib/timetable/context"
import { countRooms } from "@/lib/timetable/rooms"
import { countTeacherSubjectAssignments } from "@/lib/timetable/teacher-subject-assignments"
import {
  countActiveTimetableSlots,
  listTimetableSlots,
} from "@/lib/timetable/timetable-slots"
import { TIMETABLE_DAY_LABELS_AR } from "@/types/timetable"

const timetableReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

function formatTime(value: string) {
  return value.slice(0, 5)
}

export default async function TimetableOverviewPage() {
  const contextResult = await requireTimetableContext(timetableReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="الجدول"
          description="إدارة الجدول الأسبوعي اليدوي مع منع التعارضات."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى وحدة الجدول"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [activeSlots, rooms, assignments, recentSlots] = await Promise.all([
    countActiveTimetableSlots(contextResult.data),
    countRooms(contextResult.data),
    countTeacherSubjectAssignments(contextResult.data),
    listTimetableSlots(contextResult.data, 5),
  ])
  const canMutate =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN

  const overviewCards = [
    {
      title: "الحصص النشطة",
      value: activeSlots,
      href: appRoutes.timetableSlots,
      icon: CalendarDays,
      description: "حصص أسبوعية يدوية دون توليد تلقائي.",
    },
    {
      title: "الغرف",
      value: rooms,
      href: appRoutes.timetableRooms,
      icon: DoorOpen,
      description: "تستخدم اختياريًا لمنع تعارض الغرف.",
    },
    {
      title: "تكليفات المعلمين",
      value: assignments,
      href: appRoutes.timetableAssignments,
      icon: UserCheck,
      description: "ربط المعلم بالمادة والصف أو الشعبة.",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الجدول"
        description="أساس الجدول اليدوي: حصص أسبوعية مع تحقق الخادم من تعارض الشعبة والمعلم والغرفة."
        actions={
          canMutate ? (
            <>
              <Link
                href={appRoutes.newTimetableSlot}
                className={buttonVariants({ size: "lg" })}
              >
                حصة جديدة
              </Link>
              <Link
                href={appRoutes.timetableAssignments}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                تكليف المعلمين
              </Link>
            </>
          ) : null
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {overviewCards.map((card) => {
          const Icon = card.icon

          return (
            <Card key={card.title} className="border-border/70 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <CardDescription>{card.title}</CardDescription>
                  <CardTitle className="text-3xl">{card.value}</CardTitle>
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

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">أحدث الحصص</h2>
        {recentSlots.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="لا توجد حصص في الجدول بعد"
            description="ابدأ بتكليف معلم بمادة، ثم أضف حصة يدوية غير متعارضة."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recentSlots.map((slot) => (
              <Card key={slot.id} className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>{TIMETABLE_DAY_LABELS_AR[slot.day_of_week]}</CardTitle>
                  <CardDescription dir="ltr">
                    {formatTime(slot.starts_at)} - {formatTime(slot.ends_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StatusBadge status={slot.status === "active" ? "success" : "warning"}>
                    {slot.status === "active" ? "نشطة" : "غير نشطة"}
                  </StatusBadge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>منع التعارضات</CardTitle>
          <CardDescription>
            عند حفظ حصة نشطة، يمنع الخادم أي تداخل زمني لنفس الشعبة أو المعلم أو الغرفة المحددة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBadge status="info">
            لا يوجد توليد تلقائي أو سحب وإفلات في هذه المرحلة.
          </StatusBadge>
        </CardContent>
      </Card>
    </div>
  )
}
