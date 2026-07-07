import { ShieldAlert, Syringe } from "lucide-react"

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
import { requireStudentCareContext, listStudentCareStudents } from "@/lib/student-care/context"
import { listVaccinations } from "@/lib/student-care/vaccinations"
import {
  VACCINATION_STATUS_LABELS_AR,
  VACCINATION_STATUS_TONES,
} from "@/types/student-care"
import { VaccinationForm } from "../_components/student-care-forms"

const studentCareAdminRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
] as const

function formatDate(value: string | null) {
  if (!value) {
    return "غير محدد"
  }

  return new Intl.DateTimeFormat("ar", { dateStyle: "medium" }).format(
    new Date(value)
  )
}

export default async function StudentCareVaccinationsPage() {
  const contextResult = await requireStudentCareContext(studentCareAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="التطعيمات" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى التطعيمات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [students, vaccinations] = await Promise.all([
    listStudentCareStudents(contextResult.data, { activeOnly: true }),
    listVaccinations(contextResult.data),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="التطعيمات"
        description="متابعة مبسطة لسجلات التطعيم دون تذكيرات أو تنبيهات خارجية."
      />

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.25fr]">
        <VaccinationForm students={students} />

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>سجل التطعيمات</CardTitle>
            <CardDescription>
              تعرض القائمة اسم التطعيم والحالة وتواريخ الجرعات المرتبطة بالطالب.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {vaccinations.length === 0 ? (
              <EmptyState
                icon={Syringe}
                title="لا توجد تطعيمات بعد"
                description="أضف أول سجل تطعيم لطالب نشط داخل المدرسة الحالية."
              />
            ) : (
              <table className="w-full min-w-[900px] text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-3 text-start font-medium">الطالب</th>
                    <th className="py-3 text-start font-medium">التطعيم</th>
                    <th className="py-3 text-start font-medium">الجرعة</th>
                    <th className="py-3 text-start font-medium">تاريخ التطعيم</th>
                    <th className="py-3 text-start font-medium">الجرعة القادمة</th>
                    <th className="py-3 text-start font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccinations.map((vaccination) => (
                    <tr key={vaccination.id} className="border-b border-border/60">
                      <td className="py-3">
                        {vaccination.students?.full_name ?? "طالب غير معروف"}
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          {vaccination.students?.student_number ?? "-"}
                        </p>
                      </td>
                      <td className="py-3">{vaccination.vaccine_name}</td>
                      <td className="py-3 text-muted-foreground">
                        {vaccination.dose_label ?? "-"}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(vaccination.vaccinated_on)}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(vaccination.next_due_on)}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={VACCINATION_STATUS_TONES[vaccination.status]}>
                          {VACCINATION_STATUS_LABELS_AR[vaccination.status]}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
