import Link from "next/link"
import { ClipboardList, ShieldAlert } from "lucide-react"

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
  getAttendanceSessionById,
  loadEnrolledStudentsForSession,
} from "@/lib/attendance/attendance-sessions"
import { listAttendanceRecordsForSession } from "@/lib/attendance/attendance-records"
import {
  ATTENDANCE_SESSION_METHOD_LABELS_AR,
  ATTENDANCE_SESSION_STATUS_LABELS_AR,
  ATTENDANCE_SESSION_STATUS_TONES,
  ATTENDANCE_STATUS_LABELS_AR,
  ATTENDANCE_STATUS_TONES,
} from "@/types/attendance"
import {
  CloseSessionForm,
  ManualAttendanceForm,
  QrAttendanceForm,
  SubmitExcuseForm,
} from "../../_components/attendance-forms"

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

type AttendanceSessionDetailsPageProps = {
  params: Promise<{
    sessionId: string
  }>
}

export default async function AttendanceSessionDetailsPage({
  params,
}: AttendanceSessionDetailsPageProps) {
  const { sessionId } = await params
  const contextResult = await requireAttendanceContext(attendanceReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل جلسة الحضور" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى جلسة الحضور"
          description={contextResult.error}
        />
      </div>
    )
  }

  let session
  try {
    session = await getAttendanceSessionById(contextResult.data, sessionId)
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل جلسة الحضور" />
        <EmptyState
          icon={ShieldAlert}
          title="الجلسة غير متاحة"
          description="تعذر العثور على جلسة الحضور داخل المدرسة الحالية."
        />
      </div>
    )
  }

  const [enrollments, records] = await Promise.all([
    loadEnrolledStudentsForSession(contextResult.data, sessionId),
    listAttendanceRecordsForSession(contextResult.data, sessionId),
  ])
  const recordsByStudentId = new Map(
    records.map((record) => [record.student_id, record])
  )
  const isOpen = session.status === "open"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="تفاصيل جلسة الحضور"
        description="سجل حضور الطلاب المسجلين نشطًا في شعبة هذه الجلسة فقط."
        actions={
          <Link
            href={appRoutes.attendanceSessions}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            العودة للجلسات
          </Link>
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle>{session.classes?.name ?? "شعبة غير معروفة"}</CardTitle>
              <CardDescription>{formatDate(session.session_date)}</CardDescription>
            </div>
            <StatusBadge status={ATTENDANCE_SESSION_STATUS_TONES[session.status]}>
              {ATTENDANCE_SESSION_STATUS_LABELS_AR[session.status]}
            </StatusBadge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              السنة الدراسية
            </p>
            <p className="mt-1 text-sm leading-6">
              {session.academic_years?.name ?? "غير محددة"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">الفصل</p>
            <p className="mt-1 text-sm leading-6">
              {session.terms?.name ?? "غير محدد"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              الطريقة
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
        </CardContent>
      </Card>

      {isOpen ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>الطلاب المسجلون</CardTitle>
              <CardDescription>
                الحفظ اليدوي يحدث كتحديث آمن لسجل الطالب داخل الجلسة.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {enrollments.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title="لا يوجد طلاب مسجلون في هذه الشعبة"
                  description="يجب وجود تسجيل نشط للطالب في الشعبة والسنة قبل تسجيل الحضور."
                />
              ) : (
                enrollments.map((enrollment) => {
                  const record = recordsByStudentId.get(enrollment.student_id)

                  return (
                    <div
                      key={enrollment.id}
                      className="grid gap-3 rounded-2xl border border-border/60 bg-background p-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)]"
                    >
                      <div className="flex flex-col gap-2">
                        <div>
                          <p className="font-medium">
                            {enrollment.student?.full_name ?? "طالب غير معروف"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.student?.student_number ?? "بدون رقم"}
                          </p>
                        </div>
                        {record ? (
                          <StatusBadge status={ATTENDANCE_STATUS_TONES[record.status]}>
                            {ATTENDANCE_STATUS_LABELS_AR[record.status]}
                          </StatusBadge>
                        ) : (
                          <StatusBadge>لم يسجل بعد</StatusBadge>
                        )}
                      </div>
                      <div className="flex flex-col gap-3">
                        <ManualAttendanceForm
                          sessionId={session.id}
                          studentId={enrollment.student_id}
                          currentStatus={record?.status}
                        />
                        {record ? <SubmitExcuseForm record={record} /> : null}
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
          <div className="flex flex-col gap-4">
            <QrAttendanceForm sessionId={session.id} />
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>إغلاق الجلسة</CardTitle>
                <CardDescription>
                  بعد الإغلاق لا يمكن تسجيل حضور جديد في هذه الجلسة.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CloseSessionForm sessionId={session.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="الجلسة مغلقة"
          description="لا يمكن تعديل سجلات الحضور إلا عندما تكون الجلسة مفتوحة."
        />
      )}
    </div>
  )
}
