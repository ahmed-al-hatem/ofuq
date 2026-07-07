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
  cancelTimetableSlotAction,
  createRoomAction,
  createTeacherSubjectAssignmentAction,
  createTimetableSlotAction,
  type TimetableActionState,
} from "@/lib/actions/timetable"
import type { AcademicYear, ClassSection, GradeLevel, Subject, Term } from "@/types/academic"
import type { TeacherOption } from "@/lib/timetable/teacher-subject-assignments"
import type { Room, TimetableDayOfWeek } from "@/types/timetable"
import { TIMETABLE_DAY_LABELS_AR } from "@/types/timetable"

const initialState: TimetableActionState = null

const timetableDayOptions = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const satisfies readonly TimetableDayOfWeek[]

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

function FormMessage({ state }: { state: TimetableActionState }) {
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

function getFieldErrors(state: TimetableActionState) {
  return state?.ok === false ? state.fieldErrors ?? {} : {}
}

export function RoomForm() {
  const [state, formAction] = useActionState(createRoomAction, initialState)
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إضافة غرفة</CardTitle>
        <CardDescription>
          الغرفة تستخدم اختياريًا لمنع تعارضات الجدول، وليست نظام حجز مستقل.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.name?.length)}>
              <FieldLabel htmlFor="room-name">اسم الغرفة</FieldLabel>
              <Input id="room-name" name="name" required />
              <FieldError>{fieldErrors.name?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.code?.length)}>
              <FieldLabel htmlFor="room-code">رمز الغرفة</FieldLabel>
              <Input id="room-code" name="code" dir="ltr" />
              <FieldError>{fieldErrors.code?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.capacity?.length)}>
              <FieldLabel htmlFor="room-capacity">السعة</FieldLabel>
              <Input
                id="room-capacity"
                name="capacity"
                type="number"
                min="1"
                inputMode="numeric"
                dir="ltr"
              />
              <FieldError>{fieldErrors.capacity?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.location?.length)}>
              <FieldLabel htmlFor="room-location">الموقع</FieldLabel>
              <Input id="room-location" name="location" />
              <FieldError>{fieldErrors.location?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="حفظ الغرفة" pendingLabel="جاري الحفظ..." size="lg" />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function TeacherSubjectAssignmentForm({
  academicYears,
  teachers,
  subjects,
  gradeLevels,
  classes,
}: {
  academicYears: AcademicYear[]
  teachers: TeacherOption[]
  subjects: Subject[]
  gradeLevels: GradeLevel[]
  classes: ClassSection[]
}) {
  const [state, formAction] = useActionState(
    createTeacherSubjectAssignmentAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>تكليف معلم بمادة</CardTitle>
        <CardDescription>
          يجب أن يكون المعلم صاحب عضوية معلم نشطة، وأن يكون التكليف لصف أو شعبة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.academic_year_id?.length)}>
              <FieldLabel htmlFor="assignment-academic-year">السنة الدراسية</FieldLabel>
              <NativeSelect id="assignment-academic-year" name="academic_year_id" className="w-full" required>
                <NativeSelectOption value="">اختر السنة</NativeSelectOption>
                {academicYears.map((year) => (
                  <NativeSelectOption key={year.id} value={year.id}>
                    {year.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.academic_year_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.teacher_user_id?.length)}>
              <FieldLabel htmlFor="assignment-teacher">المعلم</FieldLabel>
              <NativeSelect id="assignment-teacher" name="teacher_user_id" className="w-full" required>
                <NativeSelectOption value="">اختر المعلم</NativeSelectOption>
                {teachers.map((teacher) => (
                  <NativeSelectOption key={teacher.id} value={teacher.id}>
                    {teacher.display_name ?? teacher.full_name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.teacher_user_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.subject_id?.length)}>
              <FieldLabel htmlFor="assignment-subject">المادة</FieldLabel>
              <NativeSelect id="assignment-subject" name="subject_id" className="w-full" required>
                <NativeSelectOption value="">اختر المادة</NativeSelectOption>
                {subjects.map((subject) => (
                  <NativeSelectOption key={subject.id} value={subject.id}>
                    {subject.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.subject_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.grade_level_id?.length)}>
              <FieldLabel htmlFor="assignment-grade-level">الصف الدراسي</FieldLabel>
              <NativeSelect id="assignment-grade-level" name="grade_level_id" className="w-full">
                <NativeSelectOption value="">بدون صف عام</NativeSelectOption>
                {gradeLevels.map((gradeLevel) => (
                  <NativeSelectOption key={gradeLevel.id} value={gradeLevel.id}>
                    {gradeLevel.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.grade_level_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.class_id?.length)}>
              <FieldLabel htmlFor="assignment-class">الشعبة</FieldLabel>
              <NativeSelect id="assignment-class" name="class_id" className="w-full">
                <NativeSelectOption value="">بدون شعبة محددة</NativeSelectOption>
                {classes.map((classSection) => (
                  <NativeSelectOption key={classSection.id} value={classSection.id}>
                    {classSection.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.class_id?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="حفظ التكليف" pendingLabel="جاري الحفظ..." size="lg" />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function TimetableSlotForm({
  academicYears,
  terms,
  classes,
  subjects,
  teachers,
  rooms,
}: {
  academicYears: AcademicYear[]
  terms: Term[]
  classes: ClassSection[]
  subjects: Subject[]
  teachers: TeacherOption[]
  rooms: Room[]
}) {
  const [state, formAction] = useActionState(
    createTimetableSlotAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إضافة حصة يدوية</CardTitle>
        <CardDescription>
          سيتم منع تعارض الشعبة والمعلم والغرفة على الخادم قبل الحفظ.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.academic_year_id?.length)}>
              <FieldLabel htmlFor="slot-academic-year">السنة الدراسية</FieldLabel>
              <NativeSelect id="slot-academic-year" name="academic_year_id" className="w-full" required>
                <NativeSelectOption value="">اختر السنة</NativeSelectOption>
                {academicYears.map((year) => (
                  <NativeSelectOption key={year.id} value={year.id}>
                    {year.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.academic_year_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.term_id?.length)}>
              <FieldLabel htmlFor="slot-term">الفصل الدراسي</FieldLabel>
              <NativeSelect id="slot-term" name="term_id" className="w-full">
                <NativeSelectOption value="">بدون فصل محدد</NativeSelectOption>
                {terms.map((term) => (
                  <NativeSelectOption key={term.id} value={term.id}>
                    {term.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.term_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.class_id?.length)}>
              <FieldLabel htmlFor="slot-class">الشعبة</FieldLabel>
              <NativeSelect id="slot-class" name="class_id" className="w-full" required>
                <NativeSelectOption value="">اختر الشعبة</NativeSelectOption>
                {classes.map((classSection) => (
                  <NativeSelectOption key={classSection.id} value={classSection.id}>
                    {classSection.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.class_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.subject_id?.length)}>
              <FieldLabel htmlFor="slot-subject">المادة</FieldLabel>
              <NativeSelect id="slot-subject" name="subject_id" className="w-full" required>
                <NativeSelectOption value="">اختر المادة</NativeSelectOption>
                {subjects.map((subject) => (
                  <NativeSelectOption key={subject.id} value={subject.id}>
                    {subject.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.subject_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.teacher_user_id?.length)}>
              <FieldLabel htmlFor="slot-teacher">المعلم</FieldLabel>
              <NativeSelect id="slot-teacher" name="teacher_user_id" className="w-full" required>
                <NativeSelectOption value="">اختر المعلم</NativeSelectOption>
                {teachers.map((teacher) => (
                  <NativeSelectOption key={teacher.id} value={teacher.id}>
                    {teacher.display_name ?? teacher.full_name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.teacher_user_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.room_id?.length)}>
              <FieldLabel htmlFor="slot-room">الغرفة</FieldLabel>
              <NativeSelect id="slot-room" name="room_id" className="w-full">
                <NativeSelectOption value="">بدون غرفة</NativeSelectOption>
                {rooms.map((room) => (
                  <NativeSelectOption key={room.id} value={room.id}>
                    {room.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.room_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.day_of_week?.length)}>
              <FieldLabel htmlFor="slot-day">اليوم</FieldLabel>
              <NativeSelect id="slot-day" name="day_of_week" className="w-full" required>
                {timetableDayOptions.map((day) => (
                  <NativeSelectOption key={day} value={day}>
                    {TIMETABLE_DAY_LABELS_AR[day]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.day_of_week?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.starts_at?.length)}>
              <FieldLabel htmlFor="slot-starts-at">وقت البداية</FieldLabel>
              <Input id="slot-starts-at" name="starts_at" type="time" dir="ltr" required />
              <FieldError>{fieldErrors.starts_at?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.ends_at?.length)}>
              <FieldLabel htmlFor="slot-ends-at">وقت النهاية</FieldLabel>
              <Input id="slot-ends-at" name="ends_at" type="time" dir="ltr" required />
              <FieldError>{fieldErrors.ends_at?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="slot-notes">ملاحظات</FieldLabel>
              <Textarea id="slot-notes" name="notes" />
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="حفظ الحصة" pendingLabel="جاري الحفظ..." size="lg" />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function CancelTimetableSlotForm({ slotId }: { slotId: string }) {
  const [state, formAction] = useActionState(
    cancelTimetableSlotAction,
    initialState
  )

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="timetable_slot_id" value={slotId} />
      <SubmitButton
        label="إلغاء الحصة"
        pendingLabel="جاري الإلغاء..."
        variant="outline"
        size="sm"
      />
      <FormMessage state={state} />
    </form>
  )
}
