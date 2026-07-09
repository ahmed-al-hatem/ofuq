import { Percent, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { FormDialog } from "@/components/shared/form-dialog"
import { PageHeader } from "@/components/shared/page-header"
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
import { listAcademicYears, listTerms } from "@/lib/academic/academic-structure"
import { requireFinanceContext } from "@/lib/finance/context"
import {
  listDiscountTypes,
  listStudentDiscounts,
} from "@/lib/finance/discounts"
import { listActiveStudents } from "@/lib/finance/shared"
import {
  DISCOUNT_STATUS_LABELS_AR,
  DISCOUNT_STATUS_TONES,
  DISCOUNT_VALUE_TYPE_LABELS_AR,
  STUDENT_DISCOUNT_STATUS_LABELS_AR,
  STUDENT_DISCOUNT_STATUS_TONES,
} from "@/types/finance"
import { DiscountTypeForm, StudentDiscountForm } from "../_components/finance-forms"

const financeRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.ACCOUNTANT,
] as const

export default async function FinanceDiscountsPage() {
  const contextResult = await requireFinanceContext(financeRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الخصومات" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الخصومات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [students, academicYears, terms, discountTypes, studentDiscounts] =
    await Promise.all([
      listActiveStudents(contextResult.data),
      listAcademicYears(contextResult.data),
      listTerms(contextResult.data),
      listDiscountTypes(contextResult.data),
      listStudentDiscounts(contextResult.data),
    ])
  const studentById = new Map(students.map((student) => [student.id, student]))
  const discountTypeById = new Map(
    discountTypes.map((discountType) => [discountType.id, discountType])
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الخصومات"
        description="تعريف أنواع الخصومات وتعيينها للطلاب حتى تحتسب عند توليد الفواتير."
        actions={
          <FormDialog
            trigger={<Button size="lg" />}
            triggerLabel="نوع خصم جديد"
            title="إضافة نوع خصم"
            description="نموذج سريع لتعريف نوع خصم جديد من دون مغادرة صفحة الخصومات."
            size="md"
          >
            <DiscountTypeForm
              surface="plain"
              cancelSlot={
                <DialogClose render={<Button variant="outline" type="button" />}>
                  إلغاء
                </DialogClose>
              }
            />
          </FormDialog>
        }
      />

      <section className="grid gap-6 xl:max-w-4xl">
        <StudentDiscountForm
          students={students}
          discountTypes={discountTypes}
          academicYears={academicYears}
          terms={terms}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>أنواع الخصومات</CardTitle>
            <CardDescription>تعريفات قابلة لإعادة الاستخدام.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {discountTypes.length === 0 ? (
              <EmptyState
                icon={Percent}
                title="لا توجد أنواع خصم"
                description="أضف نوع خصم لاستخدامه مع الطلاب."
              />
            ) : (
              discountTypes.map((discountType) => (
                <div
                  key={discountType.id}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">{discountType.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {DISCOUNT_VALUE_TYPE_LABELS_AR[discountType.value_type]} -{" "}
                        {Number(discountType.value)}
                      </p>
                    </div>
                    <StatusBadge status={DISCOUNT_STATUS_TONES[discountType.status]}>
                      {DISCOUNT_STATUS_LABELS_AR[discountType.status]}
                    </StatusBadge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>خصومات الطلاب</CardTitle>
            <CardDescription>خصومات نشطة أو مؤرشفة حسب الطالب.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {studentDiscounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                لا توجد خصومات مخصصة للطلاب بعد.
              </p>
            ) : (
              studentDiscounts.map((studentDiscount) => (
                <div
                  key={studentDiscount.id}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">
                        {studentById.get(studentDiscount.student_id)?.full_name ??
                          "طالب غير معروف"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {discountTypeById.get(studentDiscount.discount_type_id)
                          ?.name ?? "خصم غير معروف"}
                      </p>
                    </div>
                    <StatusBadge
                      status={STUDENT_DISCOUNT_STATUS_TONES[studentDiscount.status]}
                    >
                      {STUDENT_DISCOUNT_STATUS_LABELS_AR[studentDiscount.status]}
                    </StatusBadge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
