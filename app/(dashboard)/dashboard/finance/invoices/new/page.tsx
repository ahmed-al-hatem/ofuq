import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import { listAcademicYears, listTerms } from "@/lib/academic/academic-structure"
import { requireFinanceContext } from "@/lib/finance/context"
import { listFeeStructures } from "@/lib/finance/fee-structures"
import { listActiveStudents } from "@/lib/finance/shared"
import { GenerateInvoiceForm } from "../../_components/finance-forms"

const financeRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.ACCOUNTANT,
] as const

export default async function NewFinanceInvoicePage() {
  const contextResult = await requireFinanceContext(financeRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="توليد فاتورة" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن توليد فاتورة"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [students, academicYears, terms, feeStructures] = await Promise.all([
    listActiveStudents(contextResult.data),
    listAcademicYears(contextResult.data),
    listTerms(contextResult.data),
    listFeeStructures(contextResult.data),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="توليد فاتورة"
        description="اختر الطالب وخطة الرسوم. البنود والخصومات والإجماليات تحتسب على الخادم."
        actions={
          <Link
            href={appRoutes.financeInvoices}
            className={buttonVariants({ variant: "outline" })}
          >
            العودة للفواتير
          </Link>
        }
      />
      <GenerateInvoiceForm
        students={students}
        academicYears={academicYears}
        terms={terms}
        feeStructures={feeStructures.filter(
          (feeStructure) => feeStructure.status === "active"
        )}
      />
    </div>
  )
}
