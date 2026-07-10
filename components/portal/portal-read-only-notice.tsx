import { Eye, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type PortalReadOnlyNoticeProps = {
  title?: string
  description?: string
  notes?: string[]
  className?: string
}

export function PortalReadOnlyNotice({
  title = "هذه البيانات للعرض فقط",
  description = "يتم تحديث بيانات البوابة من قبل المدرسة، لذلك قد تظهر بعض السجلات أو التغييرات بعد اعتمادها داخل النظام.",
  notes,
  className,
}: PortalReadOnlyNoticeProps) {
  return (
    <Card
      className={cn(
        "border-border/70 bg-linear-to-br from-background via-background to-secondary/5 shadow-sm",
        className
      )}
    >
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-secondary/10 text-secondary">
            <Eye className="size-5" />
          </div>
          <Badge variant="outline" className="rounded-full">
            يتم التحديث من قبل المدرسة
          </Badge>
        </div>
        <div className="flex flex-col gap-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-sm leading-6">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      {notes?.length ? (
        <CardContent className="pt-0">
          <div className="grid gap-2 sm:grid-cols-2">
            {notes.map((note) => (
              <div
                key={note}
                className="flex items-start gap-2 rounded-2xl border border-border/60 bg-background/80 px-3 py-3 text-sm text-muted-foreground"
              >
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-secondary" />
                <span className="leading-6">{note}</span>
              </div>
            ))}
          </div>
        </CardContent>
      ) : null}
    </Card>
  )
}
