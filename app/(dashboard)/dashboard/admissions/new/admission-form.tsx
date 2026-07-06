"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"

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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import {
  createAdmissionAction,
  type CreateAdmissionActionState,
} from "@/lib/actions/admissions"
import {
  GUARDIAN_RELATION_LABELS_AR,
  STUDENT_GENDER_LABELS_AR,
} from "@/types/students"

const initialState: CreateAdmissionActionState = null

const guardianRelationOptions = [
  "guardian",
  "father",
  "mother",
  "other",
] as const

const studentGenderOptions = ["male", "female"] as const

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "جاري إرسال الطلب..." : "إرسال طلب القبول"}
    </Button>
  )
}

export function AdmissionForm() {
  const [state, formAction] = useActionState(createAdmissionAction, initialState)
  const fieldErrors = state?.ok === false ? state.fieldErrors ?? {} : {}
  const formError = state?.ok === false ? state.error : null

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>بيانات الطلب</CardTitle>
        <CardDescription>
          يتم ربط الطلب تلقائيًا بالمستأجر والمدرسة من العضوية النشطة الحالية.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.student_first_name?.length)}>
              <FieldLabel htmlFor="student_first_name">الاسم الأول</FieldLabel>
              <Input id="student_first_name" name="student_first_name" required />
              <FieldError>{fieldErrors.student_first_name?.[0]}</FieldError>
            </Field>

            <Field data-invalid={Boolean(fieldErrors.student_last_name?.length)}>
              <FieldLabel htmlFor="student_last_name">اسم العائلة</FieldLabel>
              <Input id="student_last_name" name="student_last_name" required />
              <FieldError>{fieldErrors.student_last_name?.[0]}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="student_middle_name">الاسم الأوسط</FieldLabel>
              <Input id="student_middle_name" name="student_middle_name" />
            </Field>

            <Field data-invalid={Boolean(fieldErrors.gender?.length)}>
              <FieldLabel htmlFor="gender">الجنس</FieldLabel>
              <NativeSelect id="gender" name="gender" className="w-full">
                <NativeSelectOption value="">غير محدد</NativeSelectOption>
                {studentGenderOptions.map((option) => (
                  <NativeSelectOption key={option} value={option}>
                    {STUDENT_GENDER_LABELS_AR[option]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.gender?.[0]}</FieldError>
            </Field>

            <Field data-invalid={Boolean(fieldErrors.birth_date?.length)}>
              <FieldLabel htmlFor="birth_date">تاريخ الميلاد</FieldLabel>
              <Input id="birth_date" name="birth_date" type="date" dir="ltr" />
              <FieldError>{fieldErrors.birth_date?.[0]}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="nationality">الجنسية</FieldLabel>
              <Input id="nationality" name="nationality" />
            </Field>

            <Field data-invalid={Boolean(fieldErrors.guardian_name?.length)}>
              <FieldLabel htmlFor="guardian_name">اسم ولي الأمر</FieldLabel>
              <Input id="guardian_name" name="guardian_name" required />
              <FieldError>{fieldErrors.guardian_name?.[0]}</FieldError>
            </Field>

            <Field data-invalid={Boolean(fieldErrors.guardian_phone?.length)}>
              <FieldLabel htmlFor="guardian_phone">رقم هاتف ولي الأمر</FieldLabel>
              <Input
                id="guardian_phone"
                name="guardian_phone"
                dir="ltr"
                inputMode="tel"
                required
              />
              <FieldError>{fieldErrors.guardian_phone?.[0]}</FieldError>
            </Field>

            <Field data-invalid={Boolean(fieldErrors.guardian_email?.length)}>
              <FieldLabel htmlFor="guardian_email">البريد الإلكتروني</FieldLabel>
              <Input
                id="guardian_email"
                name="guardian_email"
                type="email"
                dir="ltr"
                inputMode="email"
              />
              <FieldError>{fieldErrors.guardian_email?.[0]}</FieldError>
            </Field>

            <Field data-invalid={Boolean(fieldErrors.guardian_relation?.length)}>
              <FieldLabel htmlFor="guardian_relation">صلة القرابة</FieldLabel>
              <NativeSelect
                id="guardian_relation"
                name="guardian_relation"
                className="w-full"
                defaultValue="guardian"
              >
                {guardianRelationOptions.map((option) => (
                  <NativeSelectOption key={option} value={option}>
                    {GUARDIAN_RELATION_LABELS_AR[option]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.guardian_relation?.[0]}</FieldError>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="notes">ملاحظات إضافية</FieldLabel>
              <Textarea
                id="notes"
                name="notes"
                placeholder="أي تفاصيل مفيدة لإدارة المدرسة قبل المراجعة."
              />
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

          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
