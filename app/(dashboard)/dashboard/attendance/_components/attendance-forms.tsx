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
  closeAttendanceSessionAction,
  createAttendanceSessionAction,
  recordManualAttendanceAction,
  recordQrAttendanceAction,
  reviewAbsenceExcuseAction,
  submitAbsenceExcuseAction,
  type AttendanceActionState,
} from "@/lib/actions/attendance"
import type { AcademicYear, ClassSection, Term } from "@/types/academic"
import type {
  AttendanceRecord,
  AttendanceSessionMethod,
  AttendanceStatus,
  AbsenceExcuseStatus,
} from "@/types/attendance"
import {
  ATTENDANCE_SESSION_METHOD_LABELS_AR,
  ATTENDANCE_STATUS_LABELS_AR,
} from "@/types/attendance"

const initialState: AttendanceActionState = null

const sessionMethodOptions = [
  "manual",
  "qr",
] as const satisfies readonly AttendanceSessionMethod[]

const attendanceStatusOptions = [
  "present",
  "absent",
  "late",
] as const satisfies readonly AttendanceStatus[]

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

function FormMessage({ state }: { state: AttendanceActionState }) {
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

function getFieldErrors(state: AttendanceActionState) {
  return state?.ok === false ? state.fieldErrors ?? {} : {}
}

export function AttendanceSessionForm({
  academicYears,
  classes,
  terms,
}: {
  academicYears: AcademicYear[]
  classes: ClassSection[]
  terms: Term[]
}) {
  const [state, formAction] = useActionState(
    createAttendanceSessionAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إنشاء جلسة حضور</CardTitle>
        <CardDescription>
          المستأجر والمدرسة يحددان على الخادم من العضوية النشطة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.academic_year_id?.length)}>
              <FieldLabel htmlFor="attendance-academic-year">
                السنة الدراسية
              </FieldLabel>
              <NativeSelect
                id="attendance-academic-year"
                name="academic_year_id"
                className="w-full"
                required
              >
                <NativeSelectOption value="">اختر السنة</NativeSelectOption>
                {academicYears.map((year) => (
                  <NativeSelectOption key={year.id} value={year.id}>
                    {year.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.academic_year_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.class_id?.length)}>
              <FieldLabel htmlFor="attendance-class">الشعبة</FieldLabel>
              <NativeSelect
                id="attendance-class"
                name="class_id"
                className="w-full"
                required
              >
                <NativeSelectOption value="">اختر الشعبة</NativeSelectOption>
                {classes.map((classSection) => (
                  <NativeSelectOption key={classSection.id} value={classSection.id}>
                    {classSection.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.class_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.term_id?.length)}>
              <FieldLabel htmlFor="attendance-term">الفصل الدراسي</FieldLabel>
              <NativeSelect
                id="attendance-term"
                name="term_id"
                className="w-full"
              >
                <NativeSelectOption value="">بدون فصل محدد</NativeSelectOption>
                {terms.map((term) => (
                  <NativeSelectOption key={term.id} value={term.id}>
                    {term.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.term_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.session_date?.length)}>
              <FieldLabel htmlFor="attendance-session-date">
                تاريخ الجلسة
              </FieldLabel>
              <Input
                id="attendance-session-date"
                name="session_date"
                type="date"
                dir="ltr"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
              <FieldError>{fieldErrors.session_date?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.method?.length)}>
              <FieldLabel htmlFor="attendance-method">طريقة التسجيل</FieldLabel>
              <NativeSelect
                id="attendance-method"
                name="method"
                className="w-full"
                defaultValue="manual"
              >
                {sessionMethodOptions.map((method) => (
                  <NativeSelectOption key={method} value={method}>
                    {ATTENDANCE_SESSION_METHOD_LABELS_AR[method]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.method?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.starts_at?.length)}>
              <FieldLabel htmlFor="attendance-starts-at">وقت البداية</FieldLabel>
              <Input id="attendance-starts-at" name="starts_at" type="time" dir="ltr" />
              <FieldError>{fieldErrors.starts_at?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.ends_at?.length)}>
              <FieldLabel htmlFor="attendance-ends-at">وقت النهاية</FieldLabel>
              <Input id="attendance-ends-at" name="ends_at" type="time" dir="ltr" />
              <FieldError>{fieldErrors.ends_at?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="attendance-notes">ملاحظات</FieldLabel>
              <Textarea id="attendance-notes" name="notes" />
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="إنشاء الجلسة" pendingLabel="جاري الإنشاء..." size="lg" />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function ManualAttendanceForm({
  sessionId,
  studentId,
  currentStatus,
}: {
  sessionId: string
  studentId: string
  currentStatus?: AttendanceStatus
}) {
  const [state, formAction] = useActionState(
    recordManualAttendanceAction,
    initialState
  )

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="attendance_session_id" value={sessionId} />
      <input type="hidden" name="student_id" value={studentId} />
      <NativeSelect
        name="status"
        className="min-w-28"
        defaultValue={currentStatus ?? "present"}
      >
        {attendanceStatusOptions.map((status) => (
          <NativeSelectOption key={status} value={status}>
            {ATTENDANCE_STATUS_LABELS_AR[status]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <Input
        name="notes"
        placeholder="ملاحظة"
        className="h-8 min-w-36 flex-1"
      />
      <SubmitButton label="حفظ" pendingLabel="..." size="sm" />
      <FormMessage state={state} />
    </form>
  )
}

export function QrAttendanceForm({ sessionId }: { sessionId: string }) {
  const [state, formAction] = useActionState(
    recordQrAttendanceAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>تسجيل عبر رمز الطالب</CardTitle>
        <CardDescription>
          أدخل أو امسح رمز QR الخاص بالطالب. لا يتم تسجيل الرمز في سجلات التدقيق.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="attendance_session_id" value={sessionId} />
          <Field data-invalid={Boolean(fieldErrors.qr_token?.length)}>
            <FieldLabel htmlFor="qr-token">رمز الطالب</FieldLabel>
            <Input
              id="qr-token"
              name="qr_token"
              dir="ltr"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              required
            />
            <FieldError>{fieldErrors.qr_token?.[0]}</FieldError>
          </Field>
          <FormMessage state={state} />
          <SubmitButton label="تسجيل حضور" pendingLabel="جاري التسجيل..." />
        </form>
      </CardContent>
    </Card>
  )
}

export function CloseSessionForm({ sessionId }: { sessionId: string }) {
  const [state, formAction] = useActionState(
    closeAttendanceSessionAction,
    initialState
  )

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="attendance_session_id" value={sessionId} />
      <SubmitButton
        label="إغلاق الجلسة"
        pendingLabel="جاري الإغلاق..."
        variant="outline"
      />
      <FormMessage state={state} />
    </form>
  )
}

export function SubmitExcuseForm({
  record,
}: {
  record: Pick<AttendanceRecord, "id" | "status">
}) {
  const [state, formAction] = useActionState(
    submitAbsenceExcuseAction,
    initialState
  )

  if (record.status !== "absent" && record.status !== "late") {
    return null
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="attendance_record_id" value={record.id} />
      <Textarea
        name="reason"
        placeholder="سبب العذر"
        className="min-h-16 text-sm"
        required
      />
      <SubmitButton label="تقديم عذر" pendingLabel="..." size="sm" variant="outline" />
      <FormMessage state={state} />
    </form>
  )
}

export function ReviewExcuseForm({
  excuseId,
  status,
}: {
  excuseId: string
  status: Extract<AbsenceExcuseStatus, "approved" | "rejected">
}) {
  const [state, formAction] = useActionState(
    reviewAbsenceExcuseAction,
    initialState
  )

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="excuse_id" value={excuseId} />
      <input type="hidden" name="status" value={status} />
      <Textarea
        name="review_notes"
        placeholder="ملاحظات المراجعة"
        className="min-h-16 text-sm"
      />
      <SubmitButton
        label={status === "approved" ? "قبول العذر" : "رفض العذر"}
        pendingLabel="جاري الحفظ..."
        size="sm"
        variant={status === "approved" ? "default" : "destructive"}
      />
      <FormMessage state={state} />
    </form>
  )
}
