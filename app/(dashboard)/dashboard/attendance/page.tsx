import Link from "next/link"
import { CalendarCheck2, ShieldAlert } from "lucide-react"

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
import { requireAttendanceContext } from "@/lib/attendance/context"
import {
  listAttendanceSessions,
  listTodaysAttendanceSessions,
} from "@/lib/attendance/attendance-sessions"
import {
  ATTENDANCE_SESSION_METHOD_LABELS_AR,
  ATTENDANCE_SESSION_STATUS_LABELS_AR,
  ATTENDANCE_SESSION_STATUS_TONES,
} from "@/types/attendance"

const attendanceReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
  }).format(new Date(value))
}

export default async function AttendanceOverviewPage() {
  const contextResult = await requireAttendanceContext(attendanceReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="الحضور"
          description="إدارة الحضور اليدوي وحضور رمز QR داخل المدرسة الحالية."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى وحدة الحضور"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [todaySessions, recentSessions] = await Promise.all([
    listTodaysAttendanceSessions(contextResult.data),
    listAttendanceSessions(contextResult.data, 5),
  ])
  const openSessions = recentSessions.filter((session) => session.status === "open")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الحضور"
        description="جلسات حضور مرتبطة بالسنة والشعبة، مع تسجيل يدوي أو عبر رمز الطالب."
        actions={
          <>
            <Link
              href={appRoutes.newAttendanceSession}
              className={buttonVariants({ size: "lg" })}
            >
              جلسة جديدة
            </Link>
            <Link
              href={appRoutes.attendanceExcuses}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              الأعذار
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>جلسات اليوم</CardDescription>
            <CardTitle className="text-3xl">{todaySessions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status="info">تاريخ اليوم فقط</StatusBadge>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>جلسات مفتوحة</CardDescription>
            <CardTitle className="text-3xl">{openSessions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status="success">جاهزة للتسجيل</StatusBadge>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>آخر الجلسات</CardDescription>
            <CardTitle className="text-3xl">{recentSessions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={appRoutes.attendanceSessions}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              عرض كل الجلسات
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">أحدث جلسات الحضور</h2>
        {recentSessions.length === 0 ? (
          <EmptyState
            icon={CalendarCheck2}
            title="لا توجد جلسات حضور بعد"
            description="ابدأ بإنشاء جلسة حضور لشعبة لديها طلاب مسجلون بشكل نشط."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recentSessions.map((session) => (
              <Card key={session.id} className="border-border/70 shadow-sm">
                <CardHeader className="gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <CardTitle>
                        {session.classes?.name ?? "شعبة غير معروفة"}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(session.session_date)}
                      </CardDescription>
                    </div>
                    <StatusBadge
                      status={ATTENDANCE_SESSION_STATUS_TONES[session.status]}
                    >
                      {ATTENDANCE_SESSION_STATUS_LABELS_AR[session.status]}
                    </StatusBadge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>{session.academic_years?.name ?? "سنة غير معروفة"}</span>
                    <span>{ATTENDANCE_SESSION_METHOD_LABELS_AR[session.method]}</span>
                  </div>
                  <Link
                    href={appRoutes.attendanceSessionDetails(session.id)}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    فتح الجلسة
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>نطاق المرحلة</CardTitle>
          <CardDescription>
            هذه المرحلة تؤسس الحضور اليدوي ورمز QR فقط، دون كاميرا أو منارات أو ربط بالجداول.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBadge status="info">
            كل العمليات تتحقق من العضوية النشطة والسياق المدرسي على الخادم.
          </StatusBadge>
        </CardContent>
      </Card>
    </div>
  )
}
