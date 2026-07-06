import Link from "next/link"
import { ShieldAlert, Users2 } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import { requireStudentContext } from "@/lib/students/context"
import { listStudents } from "@/lib/students/students"
import {
  STUDENT_STATUS_LABELS_AR,
  STUDENT_STATUS_TONES,
} from "@/types/students"

const studentViewRoles = [
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.SYSTEM_ADMIN,
] as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
  }).format(new Date(value))
}

export default async function StudentsPage() {
  const contextResult = await requireStudentContext(studentViewRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="الطلاب"
          description="سجلات الطلاب الرسمية المرتبطة بطلبات القبول المعتمدة."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى سجلات الطلاب"
          description={contextResult.error}
        />
      </div>
    )
  }

  const students = await listStudents(contextResult.data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الطلاب"
        description="هذه السجلات تمثل الطلاب الرسميين بعد اعتماد طلبات القبول داخل المدرسة الحالية."
        actions={
          <Link href={appRoutes.admissions} className={buttonVariants({ variant: "outline", size: "lg" })}>
            العودة إلى القبول
          </Link>
        }
      />

      {students.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="لا توجد سجلات طلاب بعد"
          description="عند اعتماد أول طلب قبول سيتم إنشاء سجل الطالب الرسمي وظهوره هنا."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {students.map((student) => (
            <Card key={student.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle>{student.full_name}</CardTitle>
                    <CardDescription>{student.student_number}</CardDescription>
                  </div>
                  <StatusBadge status={STUDENT_STATUS_TONES[student.status]}>
                    {STUDENT_STATUS_LABELS_AR[student.status]}
                  </StatusBadge>
                </div>
              </CardHeader>

              <CardContent className="grid gap-3">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    تاريخ الالتحاق
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {formatDate(student.enrolled_at)}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    رقم QR التأسيسي
                  </p>
                  <p className="mt-1 text-sm leading-6" dir="ltr">
                    {student.qr_token}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
