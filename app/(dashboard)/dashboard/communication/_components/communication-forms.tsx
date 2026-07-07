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
import { USER_ROLE_LABELS_AR, USER_ROLES, type UserRole } from "@/constants/roles"
import {
  archiveAnnouncementAction,
  archiveMessageAction,
  cancelSchoolEventAction,
  createAnnouncementAction,
  createSchoolEventAction,
  markMessageReadAction,
  markNotificationReadAction,
  publishAnnouncementAction,
  sendMessageAction,
  type CommunicationActionState,
} from "@/lib/actions/communication"
import type { CommunicationUserOption } from "@/lib/communication/messages"
import type { ClassSection, GradeLevel } from "@/types/academic"
import type { Student } from "@/types/students"
import {
  ANNOUNCEMENT_TARGET_TYPE_LABELS_AR,
  SCHOOL_EVENT_TARGET_TYPE_LABELS_AR,
  type AnnouncementTargetType,
  type SchoolEventTargetType,
} from "@/types/communication"

const initialState: CommunicationActionState = null

const announcementTargetOptions = [
  "school",
  "role",
  "grade_level",
  "class",
] as const satisfies readonly AnnouncementTargetType[]

const schoolEventTargetOptions = [
  "school",
  "grade_level",
  "class",
] as const satisfies readonly SchoolEventTargetType[]

const roleOptions = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
  USER_ROLES.PARENT,
  USER_ROLES.STUDENT,
  USER_ROLES.ACCOUNTANT,
  USER_ROLES.LIBRARIAN,
] as const satisfies readonly UserRole[]

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

function FormMessage({ state }: { state: CommunicationActionState }) {
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

function getFieldErrors(state: CommunicationActionState) {
  return state?.ok === false ? state.fieldErrors ?? {} : {}
}

export function MessageForm({
  recipients,
  students,
}: {
  recipients: CommunicationUserOption[]
  students: Student[]
}) {
  const [state, formAction] = useActionState(sendMessageAction, initialState)
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إرسال رسالة داخلية</CardTitle>
        <CardDescription>
          يتم التحقق من عضوية المستلمين داخل المدرسة الحالية على الخادم.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.recipient_user_ids?.length)}>
              <FieldLabel htmlFor="message-recipients">المستلمون</FieldLabel>
              <select
                id="message-recipients"
                name="recipient_user_ids"
                multiple
                className="min-h-36 w-full rounded-md border border-input bg-input/20 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                required
              >
                {recipients.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.display_name ?? recipient.full_name} -{" "}
                    {USER_ROLE_LABELS_AR[recipient.role]}
                  </option>
                ))}
              </select>
              <FieldError>{fieldErrors.recipient_user_ids?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.related_student_id?.length)}>
              <FieldLabel htmlFor="message-student">طالب مرتبط</FieldLabel>
              <NativeSelect id="message-student" name="related_student_id" className="w-full">
                <NativeSelectOption value="">بدون طالب مرتبط</NativeSelectOption>
                {students.map((student) => (
                  <NativeSelectOption key={student.id} value={student.id}>
                    {student.full_name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.related_student_id?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.subject?.length)}>
              <FieldLabel htmlFor="message-subject">الموضوع</FieldLabel>
              <Input id="message-subject" name="subject" required />
              <FieldError>{fieldErrors.subject?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.body?.length)}>
              <FieldLabel htmlFor="message-body">نص الرسالة</FieldLabel>
              <Textarea id="message-body" name="body" required />
              <FieldError>{fieldErrors.body?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="إرسال الرسالة" pendingLabel="جاري الإرسال..." size="lg" />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function AnnouncementForm({
  gradeLevels,
  classes,
}: {
  gradeLevels: GradeLevel[]
  classes: ClassSection[]
}) {
  const [state, formAction] = useActionState(
    createAnnouncementAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إنشاء إعلان</CardTitle>
        <CardDescription>
          ينشأ الإعلان كمسودة، ويمكن نشره من صفحة الإعلانات.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.title?.length)}>
              <FieldLabel htmlFor="announcement-title">العنوان</FieldLabel>
              <Input id="announcement-title" name="title" required />
              <FieldError>{fieldErrors.title?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.target_type?.length)}>
              <FieldLabel htmlFor="announcement-target-type">الجمهور</FieldLabel>
              <NativeSelect id="announcement-target-type" name="target_type" className="w-full" required>
                {announcementTargetOptions.map((targetType) => (
                  <NativeSelectOption key={targetType} value={targetType}>
                    {ANNOUNCEMENT_TARGET_TYPE_LABELS_AR[targetType]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.target_type?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.target_role?.length)}>
              <FieldLabel htmlFor="announcement-target-role">الدور المستهدف</FieldLabel>
              <NativeSelect id="announcement-target-role" name="target_role" className="w-full">
                <NativeSelectOption value="">بدون دور</NativeSelectOption>
                {roleOptions.map((role) => (
                  <NativeSelectOption key={role} value={role}>
                    {USER_ROLE_LABELS_AR[role]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.target_role?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.grade_level_id?.length)}>
              <FieldLabel htmlFor="announcement-grade-level">الصف الدراسي</FieldLabel>
              <NativeSelect id="announcement-grade-level" name="grade_level_id" className="w-full">
                <NativeSelectOption value="">بدون صف</NativeSelectOption>
                {gradeLevels.map((gradeLevel) => (
                  <NativeSelectOption key={gradeLevel.id} value={gradeLevel.id}>
                    {gradeLevel.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.grade_level_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.class_id?.length)}>
              <FieldLabel htmlFor="announcement-class">الشعبة</FieldLabel>
              <NativeSelect id="announcement-class" name="class_id" className="w-full">
                <NativeSelectOption value="">بدون شعبة</NativeSelectOption>
                {classes.map((classSection) => (
                  <NativeSelectOption key={classSection.id} value={classSection.id}>
                    {classSection.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.class_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.expires_at?.length)}>
              <FieldLabel htmlFor="announcement-expires-at">ينتهي في</FieldLabel>
              <Input id="announcement-expires-at" name="expires_at" type="datetime-local" dir="ltr" />
              <FieldError>{fieldErrors.expires_at?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.body?.length)}>
              <FieldLabel htmlFor="announcement-body">نص الإعلان</FieldLabel>
              <Textarea id="announcement-body" name="body" required />
              <FieldError>{fieldErrors.body?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="حفظ الإعلان" pendingLabel="جاري الحفظ..." size="lg" />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function SchoolEventForm({
  gradeLevels,
  classes,
}: {
  gradeLevels: GradeLevel[]
  classes: ClassSection[]
}) {
  const [state, formAction] = useActionState(
    createSchoolEventAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إنشاء حدث مدرسي</CardTitle>
        <CardDescription>
          الأحداث بسيطة ولا تتضمن مزامنة تقويم أو تكرار في هذه المرحلة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.title?.length)}>
              <FieldLabel htmlFor="event-title">العنوان</FieldLabel>
              <Input id="event-title" name="title" required />
              <FieldError>{fieldErrors.title?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.location?.length)}>
              <FieldLabel htmlFor="event-location">الموقع</FieldLabel>
              <Input id="event-location" name="location" />
              <FieldError>{fieldErrors.location?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.starts_at?.length)}>
              <FieldLabel htmlFor="event-starts-at">يبدأ في</FieldLabel>
              <Input id="event-starts-at" name="starts_at" type="datetime-local" dir="ltr" required />
              <FieldError>{fieldErrors.starts_at?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.ends_at?.length)}>
              <FieldLabel htmlFor="event-ends-at">ينتهي في</FieldLabel>
              <Input id="event-ends-at" name="ends_at" type="datetime-local" dir="ltr" required />
              <FieldError>{fieldErrors.ends_at?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.target_type?.length)}>
              <FieldLabel htmlFor="event-target-type">الجمهور</FieldLabel>
              <NativeSelect id="event-target-type" name="target_type" className="w-full" required>
                {schoolEventTargetOptions.map((targetType) => (
                  <NativeSelectOption key={targetType} value={targetType}>
                    {SCHOOL_EVENT_TARGET_TYPE_LABELS_AR[targetType]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.target_type?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.grade_level_id?.length)}>
              <FieldLabel htmlFor="event-grade-level">الصف الدراسي</FieldLabel>
              <NativeSelect id="event-grade-level" name="grade_level_id" className="w-full">
                <NativeSelectOption value="">بدون صف</NativeSelectOption>
                {gradeLevels.map((gradeLevel) => (
                  <NativeSelectOption key={gradeLevel.id} value={gradeLevel.id}>
                    {gradeLevel.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.grade_level_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.class_id?.length)}>
              <FieldLabel htmlFor="event-class">الشعبة</FieldLabel>
              <NativeSelect id="event-class" name="class_id" className="w-full">
                <NativeSelectOption value="">بدون شعبة</NativeSelectOption>
                {classes.map((classSection) => (
                  <NativeSelectOption key={classSection.id} value={classSection.id}>
                    {classSection.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.class_id?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.description?.length)}>
              <FieldLabel htmlFor="event-description">الوصف</FieldLabel>
              <Textarea id="event-description" name="description" />
              <FieldError>{fieldErrors.description?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="حفظ الحدث" pendingLabel="جاري الحفظ..." size="lg" />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function MessageReadArchiveForms({
  messageId,
  canMarkRead,
}: {
  messageId: string
  canMarkRead: boolean
}) {
  const [readState, readAction] = useActionState(
    markMessageReadAction,
    initialState
  )
  const [archiveState, archiveAction] = useActionState(
    archiveMessageAction,
    initialState
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {canMarkRead ? (
          <form action={readAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="message_id" value={messageId} />
            <SubmitButton label="تعليم كمقروءة" pendingLabel="جاري الحفظ..." size="sm" />
          </form>
        ) : null}
        <form action={archiveAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="message_id" value={messageId} />
          <SubmitButton
            label="أرشفة"
            pendingLabel="جاري الأرشفة..."
            variant="outline"
            size="sm"
          />
        </form>
      </div>
      <FormMessage state={readState} />
      <FormMessage state={archiveState} />
    </div>
  )
}

export function AnnouncementActions({ announcementId }: { announcementId: string }) {
  const [publishState, publishAction] = useActionState(
    publishAnnouncementAction,
    initialState
  )
  const [archiveState, archiveAction] = useActionState(
    archiveAnnouncementAction,
    initialState
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <form action={publishAction}>
          <input type="hidden" name="announcement_id" value={announcementId} />
          <SubmitButton label="نشر" pendingLabel="جاري النشر..." size="sm" />
        </form>
        <form action={archiveAction}>
          <input type="hidden" name="announcement_id" value={announcementId} />
          <SubmitButton
            label="أرشفة"
            pendingLabel="جاري الأرشفة..."
            variant="outline"
            size="sm"
          />
        </form>
      </div>
      <FormMessage state={publishState} />
      <FormMessage state={archiveState} />
    </div>
  )
}

export function CancelSchoolEventForm({ eventId }: { eventId: string }) {
  const [state, formAction] = useActionState(
    cancelSchoolEventAction,
    initialState
  )

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="school_event_id" value={eventId} />
      <SubmitButton
        label="إلغاء الحدث"
        pendingLabel="جاري الإلغاء..."
        variant="outline"
        size="sm"
      />
      <FormMessage state={state} />
    </form>
  )
}

export function MarkNotificationReadForm({
  notificationId,
}: {
  notificationId: string
}) {
  const [state, formAction] = useActionState(
    markNotificationReadAction,
    initialState
  )

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="notification_id" value={notificationId} />
      <SubmitButton label="تعليم كمقروء" pendingLabel="جاري الحفظ..." size="sm" />
      <FormMessage state={state} />
    </form>
  )
}
