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
  createExamAction,
  createGradeEntryAction,
  generateReportCardAction,
  publishExamResultsAction,
  publishReportCardAction,
  saveExamResultAction,
  type GradesActionState,
} from "@/lib/actions/grades"
import type { AcademicYear, ClassSection, Subject, Term } from "@/types/academic"
import type {
  ExamResultStatus,
  GradeEntryCategory,
  ReportCard,
} from "@/types/grades"
import {
  EXAM_RESULT_STATUS_LABELS_AR,
  GRADE_ENTRY_CATEGORY_LABELS_AR,
} from "@/types/grades"
import type { Student } from "@/types/students"

const initialState: GradesActionState = null

const examResultStatusOptions = [
  "entered",
  "absent",
  "excused",
  "draft",
] as const satisfies readonly ExamResultStatus[]

const gradeEntryCategoryOptions = [
  "quiz",
  "assignment",
  "homework",
  "project",
  "participation",
  "behavior",
  "other",
] as const satisfies readonly GradeEntryCategory[]

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

function FormMessage({ state }: { state: GradesActionState }) {
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

function getFieldErrors(state: GradesActionState) {
  return state?.ok === false ? state.fieldErrors ?? {} : {}
}

export function ExamForm({
  academicYears,
  classes,
  subjects,
  terms,
}: {
  academicYears: AcademicYear[]
  classes: ClassSection[]
  subjects: Subject[]
  terms: Term[]
}) {
  const [state, formAction] = useActionState(createExamAction, initialState)
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إنشاء اختبار</CardTitle>
        <CardDescription>
          الصف الدراسي يستنتج من الشعبة، ولا ترسل المدرسة أو المستأجر من النموذج.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.academic_year_id?.length)}>
              <FieldLabel htmlFor="exam-academic-year">السنة الدراسية</FieldLabel>
              <NativeSelect id="exam-academic-year" name="academic_year_id" className="w-full" required>
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
              <FieldLabel htmlFor="exam-class">الشعبة</FieldLabel>
              <NativeSelect id="exam-class" name="class_id" className="w-full" required>
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
              <FieldLabel htmlFor="exam-subject">المادة</FieldLabel>
              <NativeSelect id="exam-subject" name="subject_id" className="w-full" required>
                <NativeSelectOption value="">اختر المادة</NativeSelectOption>
                {subjects.map((subject) => (
                  <NativeSelectOption key={subject.id} value={subject.id}>
                    {subject.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.subject_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.term_id?.length)}>
              <FieldLabel htmlFor="exam-term">الفصل الدراسي</FieldLabel>
              <NativeSelect id="exam-term" name="term_id" className="w-full">
                <NativeSelectOption value="">بدون فصل محدد</NativeSelectOption>
                {terms.map((term) => (
                  <NativeSelectOption key={term.id} value={term.id}>
                    {term.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.term_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.title?.length)}>
              <FieldLabel htmlFor="exam-title">عنوان الاختبار</FieldLabel>
              <Input id="exam-title" name="title" required />
              <FieldError>{fieldErrors.title?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.exam_date?.length)}>
              <FieldLabel htmlFor="exam-date">تاريخ الاختبار</FieldLabel>
              <Input id="exam-date" name="exam_date" type="date" dir="ltr" />
              <FieldError>{fieldErrors.exam_date?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.max_score?.length)}>
              <FieldLabel htmlFor="exam-max-score">الدرجة العظمى</FieldLabel>
              <Input id="exam-max-score" name="max_score" type="number" min="0.01" step="0.01" dir="ltr" defaultValue="100" required />
              <FieldError>{fieldErrors.max_score?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.weight?.length)}>
              <FieldLabel htmlFor="exam-weight">الوزن</FieldLabel>
              <Input id="exam-weight" name="weight" type="number" min="0.01" max="100" step="0.01" dir="ltr" />
              <FieldError>{fieldErrors.weight?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="exam-notes">ملاحظات</FieldLabel>
              <Textarea id="exam-notes" name="notes" />
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="إنشاء الاختبار" pendingLabel="جاري الإنشاء..." size="lg" />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function ExamResultForm({
  examId,
  studentId,
  defaultScore,
  defaultStatus = "entered",
}: {
  examId: string
  studentId: string
  defaultScore?: number | null
  defaultStatus?: ExamResultStatus
}) {
  const [state, formAction] = useActionState(saveExamResultAction, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input type="hidden" name="exam_id" value={examId} />
      <input type="hidden" name="student_id" value={studentId} />
      <Input
        name="score"
        type="number"
        min="0"
        step="0.01"
        dir="ltr"
        className="sm:max-w-28"
        defaultValue={defaultScore ?? ""}
        placeholder="الدرجة"
      />
      <NativeSelect name="status" className="min-w-32" defaultValue={defaultStatus}>
        {examResultStatusOptions.map((status) => (
          <NativeSelectOption key={status} value={status}>
            {EXAM_RESULT_STATUS_LABELS_AR[status]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <Input name="notes" placeholder="ملاحظة" className="sm:min-w-36" />
      <SubmitButton label="حفظ" pendingLabel="..." size="sm" />
      <FormMessage state={state} />
    </form>
  )
}

export function PublishExamResultsForm({ examId }: { examId: string }) {
  const [state, formAction] = useActionState(
    publishExamResultsAction,
    initialState
  )

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="exam_id" value={examId} />
      <SubmitButton
        label="نشر النتائج"
        pendingLabel="جاري النشر..."
        variant="outline"
      />
      <FormMessage state={state} />
    </form>
  )
}

export function GradeEntryForm({
  academicYears,
  classes,
  subjects,
  students,
  terms,
}: {
  academicYears: AcademicYear[]
  classes: ClassSection[]
  subjects: Subject[]
  students: Student[]
  terms: Term[]
}) {
  const [state, formAction] = useActionState(
    createGradeEntryAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إدخال درجة غير اختبارية</CardTitle>
        <CardDescription>
          الواجبات والمشاريع والمشاركات تحفظ مع تحقق التسجيل النشط للطالب.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.academic_year_id?.length)}>
              <FieldLabel htmlFor="entry-academic-year">السنة الدراسية</FieldLabel>
              <NativeSelect id="entry-academic-year" name="academic_year_id" className="w-full" required>
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
              <FieldLabel htmlFor="entry-term">الفصل الدراسي</FieldLabel>
              <NativeSelect id="entry-term" name="term_id" className="w-full">
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
              <FieldLabel htmlFor="entry-class">الشعبة</FieldLabel>
              <NativeSelect id="entry-class" name="class_id" className="w-full" required>
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
              <FieldLabel htmlFor="entry-student">الطالب</FieldLabel>
              <NativeSelect id="entry-student" name="student_id" className="w-full" required>
                <NativeSelectOption value="">اختر الطالب</NativeSelectOption>
                {students.map((student) => (
                  <NativeSelectOption key={student.id} value={student.id}>
                    {student.full_name} - {student.student_number}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.student_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.subject_id?.length)}>
              <FieldLabel htmlFor="entry-subject">المادة</FieldLabel>
              <NativeSelect id="entry-subject" name="subject_id" className="w-full" required>
                <NativeSelectOption value="">اختر المادة</NativeSelectOption>
                {subjects.map((subject) => (
                  <NativeSelectOption key={subject.id} value={subject.id}>
                    {subject.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.subject_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.category?.length)}>
              <FieldLabel htmlFor="entry-category">التصنيف</FieldLabel>
              <NativeSelect id="entry-category" name="category" className="w-full" defaultValue="other">
                {gradeEntryCategoryOptions.map((category) => (
                  <NativeSelectOption key={category} value={category}>
                    {GRADE_ENTRY_CATEGORY_LABELS_AR[category]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.category?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.title?.length)}>
              <FieldLabel htmlFor="entry-title">العنوان</FieldLabel>
              <Input id="entry-title" name="title" required />
              <FieldError>{fieldErrors.title?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.recorded_on?.length)}>
              <FieldLabel htmlFor="entry-recorded-on">تاريخ التسجيل</FieldLabel>
              <Input id="entry-recorded-on" name="recorded_on" type="date" dir="ltr" defaultValue={new Date().toISOString().slice(0, 10)} required />
              <FieldError>{fieldErrors.recorded_on?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.score?.length)}>
              <FieldLabel htmlFor="entry-score">الدرجة</FieldLabel>
              <Input id="entry-score" name="score" type="number" min="0" step="0.01" dir="ltr" required />
              <FieldError>{fieldErrors.score?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.max_score?.length)}>
              <FieldLabel htmlFor="entry-max-score">الدرجة العظمى</FieldLabel>
              <Input id="entry-max-score" name="max_score" type="number" min="0.01" step="0.01" dir="ltr" defaultValue="100" required />
              <FieldError>{fieldErrors.max_score?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.weight?.length)}>
              <FieldLabel htmlFor="entry-weight">الوزن</FieldLabel>
              <Input id="entry-weight" name="weight" type="number" min="0.01" max="100" step="0.01" dir="ltr" />
              <FieldError>{fieldErrors.weight?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="entry-notes">ملاحظات</FieldLabel>
              <Textarea id="entry-notes" name="notes" />
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="حفظ الدرجة" pendingLabel="جاري الحفظ..." size="lg" />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function ReportCardGenerateForm({
  academicYears,
  classes,
  students,
  terms,
}: {
  academicYears: AcademicYear[]
  classes: ClassSection[]
  students: Student[]
  terms: Term[]
}) {
  const [state, formAction] = useActionState(
    generateReportCardAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>توليد تقرير طالب</CardTitle>
        <CardDescription>
          التقرير لقطة أساسية من الدرجات المدخلة والمنشورة، دون PDF أو ترتيب.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.academic_year_id?.length)}>
              <FieldLabel htmlFor="card-academic-year">السنة الدراسية</FieldLabel>
              <NativeSelect id="card-academic-year" name="academic_year_id" className="w-full" required>
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
              <FieldLabel htmlFor="card-term">الفصل الدراسي</FieldLabel>
              <NativeSelect id="card-term" name="term_id" className="w-full">
                <NativeSelectOption value="">تقرير بدون فصل</NativeSelectOption>
                {terms.map((term) => (
                  <NativeSelectOption key={term.id} value={term.id}>
                    {term.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.term_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.class_id?.length)}>
              <FieldLabel htmlFor="card-class">الشعبة</FieldLabel>
              <NativeSelect id="card-class" name="class_id" className="w-full" required>
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
              <FieldLabel htmlFor="card-student">الطالب</FieldLabel>
              <NativeSelect id="card-student" name="student_id" className="w-full" required>
                <NativeSelectOption value="">اختر الطالب</NativeSelectOption>
                {students.map((student) => (
                  <NativeSelectOption key={student.id} value={student.id}>
                    {student.full_name} - {student.student_number}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.student_id?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="card-teacher-remarks">ملاحظات المعلم</FieldLabel>
              <Textarea id="card-teacher-remarks" name="teacher_remarks" />
            </Field>
            <Field>
              <FieldLabel htmlFor="card-admin-notes">ملاحظات إدارية</FieldLabel>
              <Textarea id="card-admin-notes" name="admin_notes" />
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton label="توليد التقرير" pendingLabel="جاري التوليد..." size="lg" />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function PublishReportCardForm({
  reportCard,
}: {
  reportCard: Pick<ReportCard, "id" | "status">
}) {
  const [state, formAction] = useActionState(
    publishReportCardAction,
    initialState
  )

  if (reportCard.status === "published") {
    return null
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="report_card_id" value={reportCard.id} />
      <SubmitButton
        label="نشر التقرير"
        pendingLabel="جاري النشر..."
        variant="outline"
      />
      <FormMessage state={state} />
    </form>
  )
}
