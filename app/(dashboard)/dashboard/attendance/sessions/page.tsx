import Link from "next/link"
import { ClipboardList, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { FormSheet } from "@/components/shared/form-sheet"
import { PageHeader } from "@/components/shared/page-header"
import { PageSection } from "@/components/shared/page-section"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SheetClose } from "@/components/ui/sheet"
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import {
  listAcademicYears,
  listClasses,
  listTerms,
} from "@/lib/academic/academic-structure"
import { requireAttendanceContext } from "@/lib/attendance/context"
import { listAttendanceSessions } from "@/lib/attendance/attendance-sessions"
import {
  ATTENDANCE_SESSION_METHOD_LABELS_AR,
  ATTENDANCE_SESSION_STATUS_LABELS_AR,
  ATTENDANCE_SESSION_STATUS_TONES,
} from "@/types/attendance"
import { AttendanceSessionForm } from "../_components/attendance-forms"

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

export default async function AttendanceSessionsPage() {
  const contextResult = await requireAttendanceContext(attendanceReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="جلسات الحضور" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى جلسات الحضور"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [sessions, academicYears, classes, terms] = await Promise.all([
    listAttendanceSessions(contextResult.data),
    listAcademicYears(contextResult.data),
    listClasses(contextResult.data),
    listTerms(contextResult.data),
  ])

  return (
    <PageShell>
      <PageHeader
        title="جلسات الحضور"
        description="قائمة الجلسات مرتبة من الأحدث، ومحصورة في المدرسة الحالية."
        actions={
          <>
            <FormSheet
              trigger={<Button size="lg" />}
              triggerLabel="جلسة جديدة"
              title="جلسة حضور جديدة"
              description="أنشئ جلسة حضور بسرعة ثم تابع إدارة الجلسات من نفس الصفحة."
              width="lg"
            >
              <AttendanceSessionForm
                academicYears={academicYears}
                classes={classes}
                terms={terms}
                surface="plain"
                cancelSlot={
                  <SheetClose render={<Button variant="outline" type="button" />}>
                    إلغاء
                  </SheetClose>
                }
              />
            </FormSheet>
            <Link
              href={appRoutes.newAttendanceSession}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              فتح الصفحة الكاملة
            </Link>
          </>
        }
      />

      <PageSection
        title="قائمة الجلسات"
        description="استخدم الإجراء السريع أعلاه لإنشاء جلسة جديدة، أو افتح الصفحة الكاملة عندما تحتاج مسارًا مباشرًا."
        contentClassName={
          sessions.length === 0 ? undefined : "grid gap-4 md:grid-cols-2"
        }
      >
        {sessions.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="لا توجد جلسات حضور بعد"
            description="أنشئ أول جلسة حضور، ثم سجل الطلاب يدويًا أو عبر رمز QR."
          />
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{session.classes?.name ?? "شعبة غير معروفة"}</CardTitle>
                    <CardDescription>{formatDate(session.session_date)}</CardDescription>
                  </div>
                  <StatusBadge
                    status={ATTENDANCE_SESSION_STATUS_TONES[session.status]}
                  >
                    {ATTENDANCE_SESSION_STATUS_LABELS_AR[session.status]}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      السنة الدراسية
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {session.academic_years?.name ?? "غير محددة"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      طريقة التسجيل
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {ATTENDANCE_SESSION_METHOD_LABELS_AR[session.method]}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      منفذ الجلسة
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {session.user_profiles?.full_name ?? "غير محدد"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      السجلات
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {session.attendance_records?.[0]?.count ?? 0}
                    </p>
                  </div>
                </div>
                <Link
                  href={appRoutes.attendanceSessionDetails(session.id)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  فتح التفاصيل
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </PageSection>
    </PageShell>
  )
}
