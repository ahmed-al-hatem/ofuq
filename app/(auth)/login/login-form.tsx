"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { LockKeyhole, Mail } from "lucide-react"

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
import { signInWithEmail, type AuthActionState } from "@/lib/actions/auth"

const initialState: AuthActionState = null

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "جاري تسجيل الدخول..." : "الدخول إلى لوحة التحكم"}
    </Button>
  )
}

export function LoginForm() {
  const [state, formAction] = useActionState(signInWithEmail, initialState)
  const emailErrors = state?.ok === false ? state.fieldErrors?.email ?? [] : []
  const passwordErrors =
    state?.ok === false ? state.fieldErrors?.password ?? [] : []
  const formError = state?.ok === false ? state.error : null

  return (
    <Card className="self-center border-border/70 shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Mail />
        </div>
        <div className="flex flex-col gap-1">
          <CardTitle>تسجيل الدخول</CardTitle>
          <CardDescription>
            استخدم البريد الإلكتروني وكلمة المرور للدخول إلى لوحة التحكم.
          </CardDescription>
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

          {formError ? (
            <div
              role="alert"
              className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {formError}
            </div>
          ) : null}

          <SubmitButton />
        </form>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-3">
        <Button type="button" variant="outline" size="lg" disabled className="w-full">
          <LockKeyhole data-icon="inline-start" />
          تسجيل Google قريبًا
        </Button>
        <Badge variant="outline" className="justify-center rounded-full py-1">
          الوصول الإداري يبقى على الخادم فقط
        </Badge>
      </CardFooter>
    </Card>
  )
}
