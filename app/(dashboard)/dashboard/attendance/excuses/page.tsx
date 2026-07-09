import { FileText, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { FormDialog } from "@/components/shared/form-dialog"
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
import { DialogClose } from "@/components/ui/dialog"
import { USER_ROLES } from "@/constants/roles"
import { requireAttendanceContext } from "@/lib/attendance/context"
import { listAbsenceExcuses } from "@/lib/attendance/absence-excuses"
import {
  ABSENCE_EXCUSE_STATUS_LABELS_AR,
  ABSENCE_EXCUSE_STATUS_TONES,
  ATTENDANCE_STATUS_LABELS_AR,
} from "@/types/attendance"
import { ReviewExcuseForm } from "../_components/attendance-forms"

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

export default async function AbsenceExcusesPage() {
  const contextResult = await requireAttendanceContext(attendanceReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="أعذار الغياب" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى أعذار الغياب"
          description={contextResult.error}
        />
      </div>
    )
  }

  const excuses = await listAbsenceExcuses(contextResult.data)
  const canReview =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN

  return (
    <PageShell>
      <PageHeader
        title="أعذار الغياب"
        description="مراجعة أعذار الغياب أو التأخر داخل المدرسة الحالية."
      />

      <PageSection
        title="طلبات الأعذار"
        description="راجع سبب العذر وسجل الملاحظات من نافذة سريعة مع إبقاء قائمة الطلبات مرئية."
        contentClassName={
          excuses.length === 0 ? undefined : "grid gap-4 md:grid-cols-2"
        }
      >
        {excuses.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="لا توجد أعذار بعد"
            description="عند تقديم عذر من صفحة جلسة الحضور سيظهر هنا للمراجعة."
          />
        ) : (
          excuses.map((excuse) => {
            const sessionDate =
              excuse.attendance_records?.attendance_sessions?.session_date
            const recordStatus = excuse.attendance_records?.status

            return (
              <Card key={excuse.id} className="border-border/70 shadow-sm">
                <CardHeader className="gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <CardTitle>
                        {excuse.students?.full_name ?? "طالب غير معروف"}
                      </CardTitle>
                      <CardDescription>
                        {sessionDate ? formatDate(sessionDate) : "جلسة غير معروفة"}
                      </CardDescription>
                    </div>
                    <StatusBadge status={ABSENCE_EXCUSE_STATUS_TONES[excuse.status]}>
                      {ABSENCE_EXCUSE_STATUS_LABELS_AR[excuse.status]}
                    </StatusBadge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                      <p className="text-xs font-medium text-muted-foreground">
                        رقم الطالب
                      </p>
                      <p className="mt-1 text-sm leading-6">
                        {excuse.students?.student_number ?? "غير محدد"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                      <p className="text-xs font-medium text-muted-foreground">
                        حالة السجل
                      </p>
                      <p className="mt-1 text-sm leading-6">
                        {recordStatus
                          ? ATTENDANCE_STATUS_LABELS_AR[
                              recordStatus as keyof typeof ATTENDANCE_STATUS_LABELS_AR
                            ]
                          : "غير محددة"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      سبب العذر
                    </p>
                    <p className="mt-1 text-sm leading-6">{excuse.reason}</p>
                  </div>
                  {canReview && excuse.status === "pending" ? (
                    <div className="flex flex-wrap gap-3">
                      <FormDialog
                        trigger={<Button size="sm" />}
                        triggerLabel="قبول العذر"
                        title="قبول عذر الغياب"
                        description="أضف ملاحظات المراجعة ثم احفظ القرار من نفس الصفحة."
                      >
                        <ReviewExcuseForm
                          excuseId={excuse.id}
                          status="approved"
                          cancelSlot={
                            <DialogClose
                              render={<Button variant="outline" type="button" />}
                            >
                              إلغاء
                            </DialogClose>
                          }
                        />
                      </FormDialog>
                      <FormDialog
                        trigger={<Button variant="destructive" size="sm" />}
                        triggerLabel="رفض العذر"
                        title="رفض عذر الغياب"
                        description="سجل سبب الرفض أو أي ملاحظات داخلية قبل الحفظ."
                      >
                        <ReviewExcuseForm
                          excuseId={excuse.id}
                          status="rejected"
                          cancelSlot={
                            <DialogClose
                              render={<Button variant="outline" type="button" />}
                            >
                              إلغاء
                            </DialogClose>
                          }
                        />
                      </FormDialog>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          })
        )}
      </PageSection>
    </PageShell>
  )
}
