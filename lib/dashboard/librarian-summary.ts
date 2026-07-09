import "server-only"

import { buildLibrarianDashboardSummary } from "@/lib/dashboard/builders"
import { createListItem, formatDateTimeLabel } from "@/lib/dashboard/shared"
import { getLibraryCatalogTotals } from "@/lib/library/catalog"
import { getLibraryCopyTotals, listBookCopies } from "@/lib/library/copies"
import { getLibraryLoanTotals, listBookLoans } from "@/lib/library/loans"
import { appRoutes } from "@/constants/routes"
import type { LibraryModuleContext } from "@/lib/library/context"
import type { DashboardScope } from "@/types/dashboard"

function toLibraryContext(scope: DashboardScope): LibraryModuleContext {
  return {
    user_id: scope.user_id,
    role: scope.role,
    tenant_id: scope.tenant_id,
    school_id: scope.school_id,
    membership: {
      id: "",
      user_id: scope.user_id,
      tenant_id: scope.tenant_id,
      school_id: scope.school_id,
      role: scope.role,
      status: "active",
      is_primary: true,
    },
  }
}

export async function getLibrarianDashboardSummary(scope: DashboardScope) {
  const context = toLibraryContext(scope)
  const [catalogTotals, copyTotals, allCopies, loanTotals, recentLoans] =
    await Promise.all([
      getLibraryCatalogTotals(context),
      getLibraryCopyTotals(context),
      listBookCopies(context),
      getLibraryLoanTotals(context),
      listBookLoans(context, 4),
    ])

  return buildLibrarianDashboardSummary({
    catalogCount: catalogTotals.catalogCount,
    copiesCount: allCopies.filter((copy) => copy.status !== "archived").length,
    availableCopiesCount: copyTotals.availableCopiesCount,
    activeLoansCount: loanTotals.activeLoansCount,
    overdueLoansCount: loanTotals.overdueLoansCount,
    recentLoans: recentLoans.map((loan) =>
      createListItem({
        id: loan.id,
        title: loan.book_catalog?.title ?? "إعارة مكتبية",
        description: `${loan.students?.full_name ?? "طالب غير معروف"} · ${formatDateTimeLabel(loan.borrowed_at)}`,
        meta: loan.is_overdue ? "تحتاج متابعة" : "ضمن الحركة الحالية",
        href: appRoutes.libraryLoanDetails(loan.id),
      })
    ),
  })
}
