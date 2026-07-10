import { Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { AssistantPromptSuggestion } from "@/types/chat"

type AssistantPromptPanelProps = {
  prompts: AssistantPromptSuggestion[]
}

export function AssistantPromptPanel({ prompts }: AssistantPromptPanelProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
            <Sparkles className="size-4" />
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle>اقتراحات جاهزة</CardTitle>
            <CardDescription>
              بطاقات مقترحة لشكل الأسئلة المتوقع دعمها بعد ربط Gemini في Phase 25C.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="rounded-[1.5rem] border border-border/60 bg-muted/15 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{prompt.title}</p>
              <Badge variant="outline" className="rounded-full">
                مثال
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-foreground">{prompt.prompt}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {prompt.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
