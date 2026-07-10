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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import {
  updateBrandingSettingsAction,
  updateLocalizationSettingsAction,
  updateMessageTemplateAction,
  updateModuleFlagsSettingsAction,
  updateSchoolIdentitySettingsAction,
  type SettingsActionState,
} from "@/lib/actions/settings"
import {
  ACADEMIC_WEEK_START_OPTIONS,
  SETTINGS_DIRECTION_OPTIONS,
  SETTINGS_LOCALE_OPTIONS,
  SETTINGS_MODULE_DEFINITIONS,
  SETTINGS_PLACEHOLDER_WARNING,
  type SettingsModuleFlagKey,
} from "@/lib/settings/constants"
import type {
  MessageTemplate,
  MessageTemplateStatus,
} from "@/types/settings"
import {
  MESSAGE_TEMPLATE_CHANNEL_LABELS_AR,
  MESSAGE_TEMPLATE_STATUS_LABELS_AR,
} from "@/types/settings"
import type { SchoolBrandingSettings } from "@/lib/settings/school-settings"

const initialState: SettingsActionState = null

const messageTemplateStatusOptions = [
  "draft",
  "active",
  "archived",
] as const satisfies readonly MessageTemplateStatus[]

function SubmitButton({
  label,
  pendingLabel,
  variant = "default",
  size = "default",
}: {
  label: string
  pendingLabel: string
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost"
  size?: "default" | "sm" | "lg"
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant={variant} size={size} disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  )
}

function FormMessage({ state }: { state: SettingsActionState }) {
  if (!state) {
    return null
  }

  if (!state.ok) {
    return (
      <div
        role="alert"
        className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
      >
        {state.error}
      </div>
    )
  }

  if (!state.message) {
    return null
  }

  return (
    <div className="rounded-md border border-secondary/20 bg-secondary/5 px-3 py-2 text-sm text-secondary">
      {state.message}
    </div>
  )
}

function getFieldErrors(state: SettingsActionState) {
  return state?.ok === false ? state.fieldErrors ?? {} : {}
}

export function SchoolIdentityForm({
  schoolDisplayName,
}: {
  schoolDisplayName: string | null
}) {
  const [state, formAction] = useActionState(
    updateSchoolIdentitySettingsAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إعدادات المدرسة</CardTitle>
        <CardDescription>
          يحدد هذا النموذج اسم العرض الداخلي المستخدم في الواجهة دون تغيير سجل
          المدرسة الأساسي.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <Field data-invalid={Boolean(fieldErrors.school_display_name?.length)}>
            <FieldLabel htmlFor="school-display-name">اسم العرض</FieldLabel>
            <Input
              id="school-display-name"
              name="school_display_name"
              defaultValue={schoolDisplayName ?? ""}
              aria-invalid={Boolean(fieldErrors.school_display_name?.length)}
            />
            <FieldDescription>
              يستخدم للاسم الظاهر في شاشة الإعدادات والبطاقات الداخلية فقط.
            </FieldDescription>
            <FieldError>{fieldErrors.school_display_name?.[0]}</FieldError>
          </Field>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="حفظ إعدادات المدرسة"
              pendingLabel="جاري الحفظ..."
              size="lg"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function BrandingSettingsForm({
  branding,
}: {
  branding: SchoolBrandingSettings
}) {
  const [state, formAction] = useActionState(
    updateBrandingSettingsAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>الهوية البصرية</CardTitle>
        <CardDescription>
          {SETTINGS_PLACEHOLDER_WARNING} لا يوجد رفع شعار أو ملفات في هذه المرحلة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.interface_name?.length)}>
              <FieldLabel htmlFor="branding-interface-name">اسم الواجهة</FieldLabel>
              <Input
                id="branding-interface-name"
                name="interface_name"
                defaultValue={branding.interface_name ?? ""}
                aria-invalid={Boolean(fieldErrors.interface_name?.length)}
              />
              <FieldError>{fieldErrors.interface_name?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.logo_hint?.length)}>
              <FieldLabel htmlFor="branding-logo-hint">حالة الشعار</FieldLabel>
              <Input
                id="branding-logo-hint"
                name="logo_hint"
                defaultValue={branding.logo_hint ?? ""}
                aria-invalid={Boolean(fieldErrors.logo_hint?.length)}
              />
              <FieldDescription>
                مثال: `قيد المراجعة` أو `بانتظار اعتماد الأصل`.
              </FieldDescription>
              <FieldError>{fieldErrors.logo_hint?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.primary_color?.length)}>
              <FieldLabel htmlFor="branding-primary-color">اللون الأساسي</FieldLabel>
              <Input
                id="branding-primary-color"
                name="primary_color"
                defaultValue={branding.primary_color ?? ""}
                dir="ltr"
                aria-invalid={Boolean(fieldErrors.primary_color?.length)}
              />
              <FieldError>{fieldErrors.primary_color?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.secondary_color?.length)}>
              <FieldLabel htmlFor="branding-secondary-color">اللون الثانوي</FieldLabel>
              <Input
                id="branding-secondary-color"
                name="secondary_color"
                defaultValue={branding.secondary_color ?? ""}
                dir="ltr"
                aria-invalid={Boolean(fieldErrors.secondary_color?.length)}
              />
              <FieldError>{fieldErrors.secondary_color?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.accent_color?.length)}>
              <FieldLabel htmlFor="branding-accent-color">لون التمييز</FieldLabel>
              <Input
                id="branding-accent-color"
                name="accent_color"
                defaultValue={branding.accent_color ?? ""}
                dir="ltr"
                aria-invalid={Boolean(fieldErrors.accent_color?.length)}
              />
              <FieldError>{fieldErrors.accent_color?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="حفظ الهوية البصرية"
              pendingLabel="جاري الحفظ..."
              size="lg"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function LocalizationSettingsForm({
  timezone,
  locale,
  direction,
  academicWeekStart,
}: {
  timezone: string
  locale: string
  direction: "rtl" | "ltr"
  academicWeekStart: number
}) {
  const [state, formAction] = useActionState(
    updateLocalizationSettingsAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>اللغة والمنطقة</CardTitle>
        <CardDescription>
          تحفظ هذه القيم داخل المدرسة الحالية وتستخدم كأساس محلي للواجهة
          والتقارير لاحقًا.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.timezone?.length)}>
              <FieldLabel htmlFor="settings-timezone">المنطقة الزمنية</FieldLabel>
              <Input
                id="settings-timezone"
                name="timezone"
                defaultValue={timezone}
                dir="ltr"
                aria-invalid={Boolean(fieldErrors.timezone?.length)}
              />
              <FieldError>{fieldErrors.timezone?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.locale?.length)}>
              <FieldLabel htmlFor="settings-locale">اللغة</FieldLabel>
              <NativeSelect
                id="settings-locale"
                name="locale"
                className="w-full"
                defaultValue={locale}
                aria-invalid={Boolean(fieldErrors.locale?.length)}
              >
                {SETTINGS_LOCALE_OPTIONS.map((option) => (
                  <NativeSelectOption key={option.value} value={option.value}>
                    {option.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.locale?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.direction?.length)}>
              <FieldLabel htmlFor="settings-direction">اتجاه الواجهة</FieldLabel>
              <NativeSelect
                id="settings-direction"
                name="direction"
                className="w-full"
                defaultValue={direction}
                aria-invalid={Boolean(fieldErrors.direction?.length)}
              >
                {SETTINGS_DIRECTION_OPTIONS.map((option) => (
                  <NativeSelectOption key={option.value} value={option.value}>
                    {option.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.direction?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.academic_week_start?.length)}>
              <FieldLabel htmlFor="settings-week-start">بداية الأسبوع الأكاديمي</FieldLabel>
              <NativeSelect
                id="settings-week-start"
                name="academic_week_start"
                className="w-full"
                defaultValue={String(academicWeekStart)}
                aria-invalid={Boolean(fieldErrors.academic_week_start?.length)}
              >
                {ACADEMIC_WEEK_START_OPTIONS.map((option) => (
                  <NativeSelectOption key={option.value} value={option.value}>
                    {option.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.academic_week_start?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="حفظ اللغة والمنطقة"
              pendingLabel="جاري الحفظ..."
              size="lg"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function ModuleFlagsForm({
  moduleFlags,
}: {
  moduleFlags: Record<SettingsModuleFlagKey, boolean>
}) {
  const [state, formAction] = useActionState(
    updateModuleFlagsSettingsAction,
    initialState
  )

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>مفاتيح الوحدات</CardTitle>
        <CardDescription>
          هذه المفاتيح محفوظة كأساس إعدادات فقط. لا يتم تعطيل أي سلوك تشغيلي فعلي
          في هذه المرحلة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldSet className="gap-4">
            <FieldLegend>الوحدات الحالية</FieldLegend>
            <div className="grid gap-3 md:grid-cols-2">
              {SETTINGS_MODULE_DEFINITIONS.map((moduleDefinition) => (
                <Field
                  key={moduleDefinition.key}
                  orientation="horizontal"
                  className="rounded-2xl border border-border/60 p-4"
                >
                  <input
                    id={`module-${moduleDefinition.key}`}
                    name={moduleDefinition.key}
                    type="checkbox"
                    defaultChecked={moduleFlags[moduleDefinition.key]}
                    className="size-4 accent-primary"
                  />
                  <div className="flex flex-1 flex-col gap-1">
                    <FieldLabel htmlFor={`module-${moduleDefinition.key}`}>
                      {moduleDefinition.label}
                    </FieldLabel>
                    <FieldDescription>
                      {moduleDefinition.description}
                    </FieldDescription>
                  </div>
                </Field>
              ))}
            </div>
          </FieldSet>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="حفظ مفاتيح الوحدات"
              pendingLabel="جاري الحفظ..."
              size="lg"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function MessageTemplateForm({
  template,
}: {
  template: MessageTemplate
}) {
  const [state, formAction] = useActionState(
    updateMessageTemplateAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>{template.title}</CardTitle>
        <CardDescription>
          {template.template_key} -{" "}
          {MESSAGE_TEMPLATE_CHANNEL_LABELS_AR[template.channel]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="id" value={template.id} />
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.title?.length)}>
              <FieldLabel htmlFor={`template-title-${template.id}`}>العنوان</FieldLabel>
              <Input
                id={`template-title-${template.id}`}
                name="title"
                defaultValue={template.title}
                aria-invalid={Boolean(fieldErrors.title?.length)}
              />
              <FieldError>{fieldErrors.title?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.status?.length)}>
              <FieldLabel htmlFor={`template-status-${template.id}`}>الحالة</FieldLabel>
              <NativeSelect
                id={`template-status-${template.id}`}
                name="status"
                className="w-full"
                defaultValue={template.status}
                aria-invalid={Boolean(fieldErrors.status?.length)}
              >
                {messageTemplateStatusOptions.map((status) => (
                  <NativeSelectOption key={status} value={status}>
                    {MESSAGE_TEMPLATE_STATUS_LABELS_AR[status]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.status?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor={`template-channel-${template.id}`}>القناة</FieldLabel>
              <Input
                id={`template-channel-${template.id}`}
                value={MESSAGE_TEMPLATE_CHANNEL_LABELS_AR[template.channel]}
                disabled
              />
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.body?.length)}>
              <FieldLabel htmlFor={`template-body-${template.id}`}>النص</FieldLabel>
              <Textarea
                id={`template-body-${template.id}`}
                name="body"
                defaultValue={template.body}
                aria-invalid={Boolean(fieldErrors.body?.length)}
              />
              <FieldDescription>
                هذا القالب محفوظ محليًا فقط ولا يرسل عبر مزود خارجي في هذه المرحلة.
              </FieldDescription>
              <FieldError>{fieldErrors.body?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="حفظ القالب"
              pendingLabel="جاري الحفظ..."
              variant="outline"
              size="sm"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
