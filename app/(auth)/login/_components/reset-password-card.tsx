"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { appRoutes } from "@/constants/routes"

const successMessage =
  "واجهة إعادة التعيين جاهزة للربط بخدمة البريد. لم يتم إرسال بريد فعلي في النسخة المحلية."

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function ResetPasswordCard() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setSubmitted(false)
      setError("يرجى إدخال البريد الإلكتروني")
      return
    }

    if (!isValidEmail(normalizedEmail)) {
      setSubmitted(false)
      setError("يرجى إدخال بريد إلكتروني صحيح")
      return
    }

    setError(null)
    setSubmitted(true)
  }

  return (
    <Card className="border-border/70 bg-card/95 shadow-xl shadow-primary/5">
      <CardHeader className="gap-4">
        <div className="flex size-14 items-center justify-center rounded-3xl bg-accent/15 text-foreground">
          <Mail className="size-6" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl">إعادة تعيين كلمة المرور</CardTitle>
          <CardDescription>
            أدخل بريدك الإلكتروني، وسنرسل لك تعليمات إعادة التعيين عند تفعيل
            خدمة البريد.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FieldGroup>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="email">البريد الإلكتروني</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                dir="ltr"
                inputMode="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (submitted) {
                    setSubmitted(false)
                  }
                  if (error) {
                    setError(null)
                  }
                }}
                aria-invalid={error ? true : undefined}
                required
              />
              <FieldError>{error ?? ""}</FieldError>
            </Field>
          </FieldGroup>

          <Button type="submit" size="lg" className="w-full">
            إرسال رابط إعادة التعيين
          </Button>
        </form>

        {submitted ? (
          <Alert className="border-secondary/25 bg-secondary/8">
            <CheckCircle2 className="size-4 text-secondary" />
            <AlertTitle>تم تجهيز التدفق بصريًا</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-border/70 bg-muted/60">
            <ShieldCheck className="size-4" />
            <AlertTitle>معلومة مهمة</AlertTitle>
            <AlertDescription>
              إرسال البريد غير مفعّل بعد، لذا تبقى هذه الصفحة واجهة جاهزة للربط
              لاحقًا فقط.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-3">
        <Link href={appRoutes.loginStaff} className={buttonVariants({ variant: "outline" })}>
          دخول الموظفين والإدارة
        </Link>
        <Link href={appRoutes.loginPortal} className={buttonVariants({ variant: "ghost" })}>
          بوابة الطالب وولي الأمر
          <ArrowLeft data-icon="inline-start" />
        </Link>
      </CardFooter>
    </Card>
  )
}
