import { ShieldAlert } from "lucide-react"

import { PortalOverview } from "@/components/portal/portal-overview"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { requirePortalContext } from "@/lib/portal/context"
import { getPortalOverviewSummary } from "@/lib/portal/portal-summary"

export default async function PortalHomePage() {
  const contextResult = await requirePortalContext()

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="بوابة المتابعة" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى البوابة"
          description={contextResult.error}
        />
      </div>
    )
  }

  const context = contextResult.data
  const summary = await getPortalOverviewSummary(context)

  return <PortalOverview summary={summary} />
}
