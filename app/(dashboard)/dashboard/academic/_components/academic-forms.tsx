"use client"

import type { ReactNode } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import { FormActions } from "@/components/shared/form-actions"
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
  assignSubjectToGradeLevelAction,
  createAcademicYearAction,
  createClassAction,
  createGradeLevelAction,
  createSubjectAction,
  createTermAction,
  enrollStudentInClassAction,
  type AcademicActionState,
} from "@/lib/actions/academic"
import type {
  AcademicYear,
  ClassSection,
  GradeLevel,
  GradeLevelStage,
  Subject,
  SubjectType,
} from "@/types/academic"
import {
  GRADE_LEVEL_STAGE_LABELS_AR,
  SUBJECT_TYPE_LABELS_AR,
} from "@/types/academic"
import type { Student } from "@/types/students"

const initialState: AcademicActionState = null
type FormSurface = "card" | "plain"

const gradeLevelStageOptions = [
  "kindergarten",
  "primary",
  "middle",
  "secondary",
  "other",
] as const satisfies readonly GradeLevelStage[]

const subjectTypeOptions = [
  "core",
  "elective",
  "activity",
  "other",
] as const satisfies readonly SubjectType[]

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string
  pendingLabel: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  )
}

function FormError({ state }: { state: AcademicActionState }) {
  const formError = state?.ok === false ? state.error : null

  if (!formError) {
    return null
  }

  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
    >
      {formError}
    </div>
  )
}

function getFieldErrors(state: AcademicActionState) {
  return state?.ok === false ? state.fieldErrors ?? {} : {}
}

export function AcademicYearForm() {
  const [state, formAction] = useActionState(
    createAcademicYearAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إضافة سنة دراسية</CardTitle>
        <CardDescription>
          يتم ربط السنة الدراسية بالمدرسة الحالية من العضوية النشطة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.name?.length)}>
              <FieldLabel htmlFor="academic-year-name">اسم السنة</FieldLabel>
              <Input id="academic-year-name" name="name" required />
              <FieldError>{fieldErrors.name?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.code?.length)}>
              <FieldLabel htmlFor="academic-year-code">الرمز</FieldLabel>
              <Input id="academic-year-code" name="code" dir="ltr" required />
              <FieldError>{fieldErrors.code?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.starts_on?.length)}>
              <FieldLabel htmlFor="academic-year-starts-on">تاريخ البداية</FieldLabel>
              <Input id="academic-year-starts-on" name="starts_on" type="date" dir="ltr" required />
              <FieldError>{fieldErrors.starts_on?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.ends_on?.length)}>
              <FieldLabel htmlFor="academic-year-ends-on">تاريخ النهاية</FieldLabel>
              <Input id="academic-year-ends-on" name="ends_on" type="date" dir="ltr" required />
              <FieldError>{fieldErrors.ends_on?.[0]}</FieldError>
            </Field>
            <Field orientation="horizontal" className="md:col-span-2">
              <input
                id="academic-year-is-current"
                name="is_current"
                type="checkbox"
                className="mt-1 size-4 rounded border-input accent-primary"
              />
              <FieldLabel htmlFor="academic-year-is-current">
                تعيينها كسنة دراسية حالية
              </FieldLabel>
            </Field>
          </FieldGroup>
          <FormError state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="حفظ السنة الدراسية" pendingLabel="جاري الحفظ..." />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function TermForm({
  academicYears,
}: {
  academicYears: AcademicYear[]
}) {
  const [state, formAction] = useActionState(createTermAction, initialState)
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إضافة فصل دراسي</CardTitle>
        <CardDescription>الفصل يجب أن يتبع سنة دراسية داخل المدرسة الحالية.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.academic_year_id?.length)}>
              <FieldLabel htmlFor="term-academic-year">السنة الدراسية</FieldLabel>
              <NativeSelect id="term-academic-year" name="academic_year_id" className="w-full" required>
                <NativeSelectOption value="">اختر السنة</NativeSelectOption>
                {academicYears.map((year) => (
                  <NativeSelectOption key={year.id} value={year.id}>
                    {year.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.academic_year_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.name?.length)}>
              <FieldLabel htmlFor="term-name">اسم الفصل</FieldLabel>
              <Input id="term-name" name="name" required />
              <FieldError>{fieldErrors.name?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.code?.length)}>
              <FieldLabel htmlFor="term-code">الرمز</FieldLabel>
              <Input id="term-code" name="code" dir="ltr" required />
              <FieldError>{fieldErrors.code?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.term_order?.length)}>
              <FieldLabel htmlFor="term-order">الترتيب</FieldLabel>
              <Input id="term-order" name="term_order" type="number" min="1" inputMode="numeric" dir="ltr" required />
              <FieldError>{fieldErrors.term_order?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.starts_on?.length)}>
              <FieldLabel htmlFor="term-starts-on">تاريخ البداية</FieldLabel>
              <Input id="term-starts-on" name="starts_on" type="date" dir="ltr" required />
              <FieldError>{fieldErrors.starts_on?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.ends_on?.length)}>
              <FieldLabel htmlFor="term-ends-on">تاريخ النهاية</FieldLabel>
              <Input id="term-ends-on" name="ends_on" type="date" dir="ltr" required />
              <FieldError>{fieldErrors.ends_on?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormError state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="حفظ الفصل" pendingLabel="جاري الحفظ..." />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function GradeLevelForm() {
  const [state, formAction] = useActionState(
    createGradeLevelAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إضافة صف دراسي</CardTitle>
        <CardDescription>الترتيب يستخدم لاحقًا في العرض والترحيل، دون تنفيذ الترحيل الآن.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.name?.length)}>
              <FieldLabel htmlFor="grade-level-name">اسم الصف</FieldLabel>
              <Input id="grade-level-name" name="name" required />
              <FieldError>{fieldErrors.name?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.code?.length)}>
              <FieldLabel htmlFor="grade-level-code">الرمز</FieldLabel>
              <Input id="grade-level-code" name="code" dir="ltr" required />
              <FieldError>{fieldErrors.code?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.grade_order?.length)}>
              <FieldLabel htmlFor="grade-level-order">الترتيب</FieldLabel>
              <Input id="grade-level-order" name="grade_order" type="number" min="1" inputMode="numeric" dir="ltr" required />
              <FieldError>{fieldErrors.grade_order?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.stage?.length)}>
              <FieldLabel htmlFor="grade-level-stage">المرحلة</FieldLabel>
              <NativeSelect id="grade-level-stage" name="stage" className="w-full" defaultValue="other">
                {gradeLevelStageOptions.map((stage) => (
                  <NativeSelectOption key={stage} value={stage}>
                    {GRADE_LEVEL_STAGE_LABELS_AR[stage]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.stage?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormError state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="حفظ الصف" pendingLabel="جاري الحفظ..." />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function ClassForm({
  academicYears,
  gradeLevels,
  surface = "card",
  cancelSlot,
}: {
  academicYears: AcademicYear[]
  gradeLevels: GradeLevel[]
  surface?: FormSurface
  cancelSlot?: ReactNode
}) {
  const [state, formAction] = useActionState(createClassAction, initialState)
  const fieldErrors = getFieldErrors(state)

  const form = (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field data-invalid={Boolean(fieldErrors.academic_year_id?.length)}>
          <FieldLabel htmlFor="class-academic-year">السنة الدراسية</FieldLabel>
          <NativeSelect
            id="class-academic-year"
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
        <Field data-invalid={Boolean(fieldErrors.grade_level_id?.length)}>
          <FieldLabel htmlFor="class-grade-level">الصف الدراسي</FieldLabel>
          <NativeSelect
            id="class-grade-level"
            name="grade_level_id"
            className="w-full"
            required
          >
            <NativeSelectOption value="">اختر الصف</NativeSelectOption>
            {gradeLevels.map((gradeLevel) => (
              <NativeSelectOption key={gradeLevel.id} value={gradeLevel.id}>
                {gradeLevel.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.grade_level_id?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.name?.length)}>
          <FieldLabel htmlFor="class-name">اسم الشعبة</FieldLabel>
          <Input id="class-name" name="name" required />
          <FieldError>{fieldErrors.name?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.section?.length)}>
          <FieldLabel htmlFor="class-section">رمز الشعبة</FieldLabel>
          <Input id="class-section" name="section" dir="ltr" required />
          <FieldError>{fieldErrors.section?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.capacity?.length)}>
          <FieldLabel htmlFor="class-capacity">السعة</FieldLabel>
          <Input
            id="class-capacity"
            name="capacity"
            type="number"
            min="1"
            inputMode="numeric"
            dir="ltr"
          />
          <FieldError>{fieldErrors.capacity?.[0]}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="class-room-name">الغرفة</FieldLabel>
          <Input id="class-room-name" name="room_name" />
        </Field>
      </FieldGroup>
      <FormError state={state} />
      <FormActions
        submitLabel="حفظ الشعبة"
        pendingLabel="جاري الحفظ..."
        cancelSlot={cancelSlot}
      />
    </form>
  )

  if (surface === "plain") {
    return form
  }

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إضافة شعبة</CardTitle>
        <CardDescription>
          الشعبة ترتبط بسنة دراسية وصف محددين من نفس المدرسة.
        </CardDescription>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  )
}

export function SubjectForm({
  surface = "card",
  cancelSlot,
}: {
  surface?: FormSurface
  cancelSlot?: ReactNode
}) {
  const [state, formAction] = useActionState(createSubjectAction, initialState)
  const fieldErrors = getFieldErrors(state)

  const form = (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field data-invalid={Boolean(fieldErrors.name?.length)}>
          <FieldLabel htmlFor="subject-name">اسم المادة</FieldLabel>
          <Input id="subject-name" name="name" required />
          <FieldError>{fieldErrors.name?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.code?.length)}>
          <FieldLabel htmlFor="subject-code">الرمز</FieldLabel>
          <Input id="subject-code" name="code" dir="ltr" required />
          <FieldError>{fieldErrors.code?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.subject_type?.length)}>
          <FieldLabel htmlFor="subject-type">نوع المادة</FieldLabel>
          <NativeSelect
            id="subject-type"
            name="subject_type"
            className="w-full"
            defaultValue="core"
          >
            {subjectTypeOptions.map((type) => (
              <NativeSelectOption key={type} value={type}>
                {SUBJECT_TYPE_LABELS_AR[type]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.subject_type?.[0]}</FieldError>
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel htmlFor="subject-description">الوصف</FieldLabel>
          <Textarea id="subject-description" name="description" />
        </Field>
      </FieldGroup>
      <FormError state={state} />
      <FormActions
        submitLabel="حفظ المادة"
        pendingLabel="جاري الحفظ..."
        cancelSlot={cancelSlot}
      />
    </form>
  )

  if (surface === "plain") {
    return form
  }

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إضافة مادة</CardTitle>
        <CardDescription>
          المادة لا تحمل أوزانًا أو إعدادات اختبارات في هذه المرحلة.
        </CardDescription>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  )
}

export function GradeLevelSubjectForm({
  academicYears,
  gradeLevels,
  subjects,
  surface = "card",
  cancelSlot,
}: {
  academicYears: AcademicYear[]
  gradeLevels: GradeLevel[]
  subjects: Subject[]
  surface?: FormSurface
  cancelSlot?: ReactNode
}) {
  const [state, formAction] = useActionState(
    assignSubjectToGradeLevelAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  const form = (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field data-invalid={Boolean(fieldErrors.academic_year_id?.length)}>
          <FieldLabel htmlFor="assignment-academic-year">السنة الدراسية</FieldLabel>
          <NativeSelect
            id="assignment-academic-year"
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
        <Field data-invalid={Boolean(fieldErrors.grade_level_id?.length)}>
          <FieldLabel htmlFor="assignment-grade-level">الصف الدراسي</FieldLabel>
          <NativeSelect
            id="assignment-grade-level"
            name="grade_level_id"
            className="w-full"
            required
          >
            <NativeSelectOption value="">اختر الصف</NativeSelectOption>
            {gradeLevels.map((gradeLevel) => (
              <NativeSelectOption key={gradeLevel.id} value={gradeLevel.id}>
                {gradeLevel.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.grade_level_id?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.subject_id?.length)}>
          <FieldLabel htmlFor="assignment-subject">المادة</FieldLabel>
          <NativeSelect
            id="assignment-subject"
            name="subject_id"
            className="w-full"
            required
          >
            <NativeSelectOption value="">اختر المادة</NativeSelectOption>
            {subjects.map((subject) => (
              <NativeSelectOption key={subject.id} value={subject.id}>
                {subject.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{fieldErrors.subject_id?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.weekly_periods?.length)}>
          <FieldLabel htmlFor="assignment-weekly-periods">الحصص الأسبوعية</FieldLabel>
          <Input
            id="assignment-weekly-periods"
            name="weekly_periods"
            type="number"
            min="1"
            inputMode="numeric"
            dir="ltr"
          />
          <FieldError>{fieldErrors.weekly_periods?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.sort_order?.length)}>
          <FieldLabel htmlFor="assignment-sort-order">ترتيب العرض</FieldLabel>
          <Input
            id="assignment-sort-order"
            name="sort_order"
            type="number"
            inputMode="numeric"
            dir="ltr"
            defaultValue="0"
          />
          <FieldError>{fieldErrors.sort_order?.[0]}</FieldError>
        </Field>
        <Field orientation="horizontal">
          <input
            id="assignment-is-required"
            name="is_required"
            type="checkbox"
            defaultChecked
            className="mt-1 size-4 rounded border-input accent-primary"
          />
          <FieldLabel htmlFor="assignment-is-required">مادة إلزامية</FieldLabel>
        </Field>
      </FieldGroup>
      <FormError state={state} />
      <FormActions
        submitLabel="حفظ الربط"
        pendingLabel="جاري الحفظ..."
        cancelSlot={cancelSlot}
      />
    </form>
  )

  if (surface === "plain") {
    return form
  }

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>ربط مادة بصف</CardTitle>
        <CardDescription>
          هذا الربط يؤسس الخطة الدراسية دون إنشاء جدول حصص.
        </CardDescription>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  )
}

export function EnrollmentForm({
  academicYears,
  classes,
  students,
}: {
  academicYears: AcademicYear[]
  classes: ClassSection[]
  students: Student[]
}) {
  const [state, formAction] = useActionState(
    enrollStudentInClassAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>تسجيل طالب في شعبة</CardTitle>
        <CardDescription>
          الصف الدراسي يستنتج من الشعبة على الخادم ولا يرسل من النموذج.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.academic_year_id?.length)}>
              <FieldLabel htmlFor="enrollment-academic-year">السنة الدراسية</FieldLabel>
              <NativeSelect id="enrollment-academic-year" name="academic_year_id" className="w-full" required>
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
              <FieldLabel htmlFor="enrollment-class">الشعبة</FieldLabel>
              <NativeSelect id="enrollment-class" name="class_id" className="w-full" required>
                <NativeSelectOption value="">اختر الشعبة</NativeSelectOption>
                {classes.map((classSection) => (
                  <NativeSelectOption key={classSection.id} value={classSection.id}>
                    {classSection.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.class_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.student_id?.length)}>
              <FieldLabel htmlFor="enrollment-student">الطالب</FieldLabel>
              <NativeSelect id="enrollment-student" name="student_id" className="w-full" required>
                <NativeSelectOption value="">اختر الطالب</NativeSelectOption>
                {students.map((student) => (
                  <NativeSelectOption key={student.id} value={student.id}>
                    {student.full_name} - {student.student_number}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.student_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.enrolled_on?.length)}>
              <FieldLabel htmlFor="enrollment-date">تاريخ التسجيل</FieldLabel>
              <Input
                id="enrollment-date"
                name="enrolled_on"
                type="date"
                dir="ltr"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
              <FieldError>{fieldErrors.enrolled_on?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormError state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="تسجيل الطالب" pendingLabel="جاري التسجيل..." />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
