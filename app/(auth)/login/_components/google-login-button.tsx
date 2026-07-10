"use client"

import { useState } from "react"
import { Globe, Info } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

type GoogleLoginButtonProps = {
  label: string
}

const googleInfoMessage =
  "تسجيل الدخول عبر Google غير مفعّل في النسخة المحلية، وسيتم تفعيله عند إعداد مزود OAuth."

export function GoogleLoginButton({ label }: GoogleLoginButtonProps) {
  const [showMessage, setShowMessage] = useState(false)

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => setShowMessage(true)}
      >
        <Globe data-icon="inline-start" />
        {label}
      </Button>

      {showMessage ? (
        <Alert className="border-border/70 bg-muted/60 text-start">
          <Info className="size-4" />
          <AlertTitle>خيار تجريبي جاهز للربط</AlertTitle>
          <AlertDescription>{googleInfoMessage}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
