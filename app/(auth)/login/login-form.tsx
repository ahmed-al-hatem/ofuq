"use client"

import { useActionState } from "react"
import Link from "next/link"
import { useFormStatus } from "react-dom"
import { ArrowLeft, GraduationCap, ShieldCheck } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { signInWithEmail, type AuthActionState } from "@/lib/actions/auth"
import { cn } from "@/lib/utils"
import { GoogleLoginButton } from "./_components/google-login-button"

const initialState: AuthActionState = null

type LoginFormProps = {
  alternateHref: string
  alternateLabel: string
  audience: "portal" | "staff"
  description: string
  googleLabel: string
  submitLabel: string
  title: string
}

const audienceConfig = {
  portal: {
    badge: "بوابة المتابعة",
    badgeClassName: "bg-secondary text-secondary-foreground",
    cardClassName: "border-secondary/18 shadow-secondary/8",
    icon: GraduationCap,
    iconClassName: "bg-secondary/14 text-secondary",
  },
  staff: {
    badge: "وصول تشغيلي",
    badgeClassName: "bg-primary text-primary-foreground",
    cardClassName: "border-primary/18 shadow-primary/8",
    icon: ShieldCheck,
    iconClassName: "bg-primary/14 text-primary",
  },
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "جاري التحقق من بيانات الدخول..." : label}
    </Button>
  )
}

export function LoginForm({
  alternateHref,
  alternateLabel,
  audience,
  description,
  googleLabel,
  submitLabel,
  title,
}: LoginFormProps) {
  const [state, formAction] = useActionState(signInWithEmail, initialState)
  const emailErrors = state?.ok === false ? state.fieldErrors?.email ?? [] : []
  const passwordErrors =
    state?.ok === false ? state.fieldErrors?.password ?? [] : []
  const formError = state?.ok === false ? state.error : null
  const config = audienceConfig[audience]
  const AudienceIcon = config.icon

  return (
    <Card
      className={cn(
        "mx-auto w-full border-border/70 bg-card/95 shadow-xl backdrop-blur",
        config.cardClassName
      )}
    >
      <CardHeader className="items-center gap-4 text-center">
        <Badge className={cn("w-fit rounded-full px-3 py-1", config.badgeClassName)}>
          {config.badge}
        </Badge>
        <div className={cn("flex size-12 items-center justify-center rounded-2xl", config.iconClassName)}>
          <AudienceIcon className="size-5" />
        </div>
        <div className="flex flex-col gap-2">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup>
            <Field data-invalid={emailErrors.length > 0 || undefined}>
              <FieldLabel htmlFor="email">البريد الإلكتروني</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                dir="ltr"
                autoComplete="email"
                placeholder="name@example.com"
                aria-invalid={emailErrors.length > 0}
                required
              />
              <FieldError>{emailErrors[0]}</FieldError>
            </Field>

            <Field data-invalid={passwordErrors.length > 0 || undefined}>
              <FieldLabel htmlFor="password">كلمة المرور</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                dir="ltr"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={passwordErrors.length > 0}
                required
              />
              <FieldError>{passwordErrors[0]}</FieldError>
            </Field>
          </FieldGroup>

          <div className="flex justify-start">
            <Link
              href={appRoutes.loginResetPassword}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>

          {formError ? (
            <Alert variant="destructive" className="border-destructive/25 bg-destructive/6">
              <AlertTitle>تعذر تسجيل الدخول</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <SubmitButton label={submitLabel} />
        </form>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-3 border-t border-border/60 pt-4">
        <GoogleLoginButton label={googleLabel} />
        <Link
          href={alternateHref}
          className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {alternateLabel}
          <ArrowLeft className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  )
}
