import { Receipt, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { FormDialog } from "@/components/shared/form-dialog"
import { FormSheet } from "@/components/shared/form-sheet"
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
import { SheetClose } from "@/components/ui/sheet"
import { USER_ROLES } from "@/constants/roles"
import {
  listAcademicYears,
  listClasses,
  listGradeLevels,
} from "@/lib/academic/academic-structure"
import { requireFinanceContext } from "@/lib/finance/context"
import { listFeeItems, listFeeStructures } from "@/lib/finance/fee-structures"
import {
  FEE_ITEM_TYPE_LABELS_AR,
  FEE_STRUCTURE_STATUS_LABELS_AR,
  FEE_STRUCTURE_STATUS_TONES,
} from "@/types/finance"
import { FeeItemForm, FeeStructureForm } from "../_components/finance-forms"

const financeRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.ACCOUNTANT,
] as const

function formatMoney(value: number, currency = "USD") {
  return new Intl.NumberFormat("ar", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export default async function FinanceFeesPage() {
  const contextResult = await requireFinanceContext(financeRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الرسوم" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الرسوم"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [academicYears, gradeLevels, classes, feeStructures, feeItems] =
    await Promise.all([
      listAcademicYears(contextResult.data),
      listGradeLevels(contextResult.data),
      listClasses(contextResult.data),
      listFeeStructures(contextResult.data),
      listFeeItems(contextResult.data),
    ])
  const feeItemsByStructure = new Map(
    feeStructures.map((feeStructure) => [
      feeStructure.id,
      feeItems.filter((item) => item.fee_structure_id === feeStructure.id),
    ])
  )

  return (
    <PageShell>
      <PageHeader
        title="الرسوم"
        description="تعريف خطط الرسوم وبنودها. المبالغ تستخدم لاحقًا عند توليد الفواتير من الخادم."
        actions={
          <>
            <FormSheet
              trigger={<Button size="lg" />}
              triggerLabel="خطة رسوم جديدة"
              title="إضافة خطة رسوم"
              description="أضف خطة رسوم جديدة مع بقائك داخل صفحة الرسوم."
              width="lg"
            >
              <FeeStructureForm
                academicYears={academicYears}
                gradeLevels={gradeLevels}
                classes={classes}
                surface="plain"
                cancelSlot={
                  <SheetClose render={<Button variant="outline" type="button" />}>
                    إلغاء
                  </SheetClose>
                }
              />
            </FormSheet>
            {feeStructures.length > 0 ? (
              <FormDialog
                trigger={<Button variant="outline" size="lg" />}
                triggerLabel="إضافة بند رسوم"
                title="إضافة بند رسوم"
                description="أضف بندًا جديدًا إلى خطة رسوم موجودة من دون مغادرة الصفحة."
                size="lg"
              >
                <FeeItemForm
                  feeStructures={feeStructures}
                  surface="plain"
                  cancelSlot={
                    <DialogClose render={<Button variant="outline" type="button" />}>
                      إلغاء
                    </DialogClose>
                  }
                />
              </FormDialog>
            ) : (
              <Button variant="outline" size="lg" disabled>
                أضف خطة رسوم أولًا
              </Button>
            )}
          </>
        }
      />

      <PageSection
        title="خطط الرسوم وبنودها"
        description="احتفظنا بهذه الصفحة كعرض تشغيلي كامل، بينما انتقلت عمليات الإضافة السريعة إلى النوافذ الجانبية والحوارية."
        contentClassName="grid gap-4 xl:grid-cols-2"
      >
        {feeStructures.length === 0 ? (
          <Card className="border-dashed border-border/70 shadow-sm xl:col-span-2">
            <CardContent className="pt-6">
              <EmptyState
                icon={Receipt}
                title="لا توجد خطط رسوم بعد"
                description="ابدأ بإضافة خطة رسوم، ثم أضف البنود المرتبطة بها لتصبح جاهزة لتوليد الفواتير."
              />
            </CardContent>
          </Card>
        ) : (
          feeStructures.map((feeStructure) => {
            const structureItems = feeItemsByStructure.get(feeStructure.id) ?? []

            return (
              <Card key={feeStructure.id} className="border-border/70 shadow-sm">
                <CardHeader className="gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <CardTitle>{feeStructure.name}</CardTitle>
                      <CardDescription>
                        {feeStructure.description ?? "لا توجد ملاحظات إضافية لهذه الخطة حاليًا."}
                      </CardDescription>
                    </div>
                    <StatusBadge
                      status={FEE_STRUCTURE_STATUS_TONES[feeStructure.status]}
                    >
                      {FEE_STRUCTURE_STATUS_LABELS_AR[feeStructure.status]}
                    </StatusBadge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {structureItems.length === 0 ? (
                    <EmptyState
                      icon={Receipt}
                      title="لا توجد بنود مرتبطة بعد"
                      description="أضف بند رسوم لهذه الخطة ليظهر هنا ضمن تفاصيلها."
                      size="compact"
                      className="bg-transparent shadow-none"
                    />
                  ) : (
                    structureItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm font-medium">
                            {formatMoney(Number(item.amount), feeStructure.currency_code)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {FEE_ITEM_TYPE_LABELS_AR[item.item_type]}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </PageSection>
    </PageShell>
  )
}
