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
  archiveAchievementAction,
  closeClinicVisitAction,
  createAchievementAction,
  createClinicVisitAction,
  createDisciplineRecordAction,
  createVaccinationAction,
  publishAchievementAction,
  reviewDisciplineRecordAction,
  upsertHealthRecordAction,
  type StudentCareActionState,
} from "@/lib/actions/student-care"
import type { StudentCareStudentOption } from "@/lib/student-care/context"
import type { Student } from "@/types/students"
import type {
  AchievementCategory,
  AchievementLevel,
  DisciplineIncidentType,
  DisciplineSeverity,
  HealthRecord,
  VaccinationStatus,
} from "@/types/student-care"
import {
  ACHIEVEMENT_CATEGORY_LABELS_AR,
  ACHIEVEMENT_LEVEL_LABELS_AR,
  VACCINATION_STATUS_LABELS_AR,
  DISCIPLINE_INCIDENT_TYPE_LABELS_AR,
  DISCIPLINE_SEVERITY_LABELS_AR,
} from "@/types/student-care"

const initialState: StudentCareActionState = null

const vaccinationStatusOptions = [
  "scheduled",
  "completed",
  "missed",
  "exempted",
  "unknown",
] as const satisfies readonly VaccinationStatus[]

const disciplineIncidentTypeOptions = [
  "behavior",
  "attendance",
  "uniform",
  "bullying",
  "damage",
  "academic_misconduct",
  "other",
] as const satisfies readonly DisciplineIncidentType[]

const disciplineSeverityOptions = [
  "low",
  "medium",
  "high",
  "critical",
] as const satisfies readonly DisciplineSeverity[]

const achievementCategoryOptions = [
  "academic",
  "sports",
  "arts",
  "behavior",
  "attendance",
  "community",
  "competition",
  "other",
] as const satisfies readonly AchievementCategory[]

const achievementLevelOptions = [
  "class",
  "school",
  "district",
  "regional",
  "national",
  "international",
] as const satisfies readonly AchievementLevel[]

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

function FormMessage({ state }: { state: StudentCareActionState }) {
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

function getFieldErrors(state: StudentCareActionState) {
  return state?.ok === false ? state.fieldErrors ?? {} : {}
}

function studentOptionLabel(student: Pick<Student, "full_name" | "student_number">) {
  return `${student.full_name} - ${student.student_number}`
}

export function HealthRecordForm({
  student,
  healthRecord,
}: {
  student: Pick<Student, "id" | "full_name" | "student_number">
  healthRecord: HealthRecord | null
}) {
  const [state, formAction] = useActionState(
    upsertHealthRecordAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>السجل الصحي الأساسي</CardTitle>
        <CardDescription>
          يحفظ هذا النموذج بيانات صحية مدرسية مختصرة دون تشخيصات أو وصفات علاجية.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="student_id" value={student.id} />
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.blood_type?.length)}>
              <FieldLabel htmlFor="health-blood-type">فصيلة الدم</FieldLabel>
              <Input
                id="health-blood-type"
                name="blood_type"
                defaultValue={healthRecord?.blood_type ?? ""}
                aria-invalid={Boolean(fieldErrors.blood_type?.length)}
              />
              <FieldError>{fieldErrors.blood_type?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.doctor_phone?.length)}>
              <FieldLabel htmlFor="health-doctor-phone">هاتف الطبيب</FieldLabel>
              <Input
                id="health-doctor-phone"
                name="doctor_phone"
                defaultValue={healthRecord?.doctor_phone ?? ""}
                dir="ltr"
                aria-invalid={Boolean(fieldErrors.doctor_phone?.length)}
              />
              <FieldError>{fieldErrors.doctor_phone?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.doctor_name?.length)}>
              <FieldLabel htmlFor="health-doctor-name">اسم الطبيب</FieldLabel>
              <Input
                id="health-doctor-name"
                name="doctor_name"
                defaultValue={healthRecord?.doctor_name ?? ""}
                aria-invalid={Boolean(fieldErrors.doctor_name?.length)}
              />
              <FieldError>{fieldErrors.doctor_name?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.allergies?.length)}>
              <FieldLabel htmlFor="health-allergies">الحساسيات</FieldLabel>
              <Textarea
                id="health-allergies"
                name="allergies"
                defaultValue={healthRecord?.allergies ?? ""}
                aria-invalid={Boolean(fieldErrors.allergies?.length)}
              />
              <FieldError>{fieldErrors.allergies?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.chronic_conditions?.length)}>
              <FieldLabel htmlFor="health-chronic">الحالات المزمنة</FieldLabel>
              <Textarea
                id="health-chronic"
                name="chronic_conditions"
                defaultValue={healthRecord?.chronic_conditions ?? ""}
                aria-invalid={Boolean(fieldErrors.chronic_conditions?.length)}
              />
              <FieldError>{fieldErrors.chronic_conditions?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.medications?.length)}>
              <FieldLabel htmlFor="health-medications">الأدوية الحالية</FieldLabel>
              <Textarea
                id="health-medications"
                name="medications"
                defaultValue={healthRecord?.medications ?? ""}
                aria-invalid={Boolean(fieldErrors.medications?.length)}
              />
              <FieldError>{fieldErrors.medications?.[0]}</FieldError>
            </Field>
            <Field
              className="md:col-span-2"
              data-invalid={Boolean(fieldErrors.emergency_notes?.length)}
            >
              <FieldLabel htmlFor="health-emergency-notes">ملاحظات طارئة</FieldLabel>
              <Textarea
                id="health-emergency-notes"
                name="emergency_notes"
                defaultValue={healthRecord?.emergency_notes ?? ""}
                aria-invalid={Boolean(fieldErrors.emergency_notes?.length)}
              />
              <FieldError>{fieldErrors.emergency_notes?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="حفظ السجل الصحي"
              pendingLabel="جاري الحفظ..."
              size="lg"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function VaccinationForm({
  students,
}: {
  students: StudentCareStudentOption[]
}) {
  const [state, formAction] = useActionState(
    createVaccinationAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إضافة تطعيم</CardTitle>
        <CardDescription>
          يتأكد الخادم من الطالب والتواريخ قبل حفظ سجل التطعيم.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.student_id?.length)}>
              <FieldLabel htmlFor="vaccination-student">الطالب</FieldLabel>
              <NativeSelect
                id="vaccination-student"
                name="student_id"
                className="w-full"
                required
                aria-invalid={Boolean(fieldErrors.student_id?.length)}
              >
                <NativeSelectOption value="">اختر الطالب</NativeSelectOption>
                {students.map((student) => (
                  <NativeSelectOption key={student.id} value={student.id}>
                    {studentOptionLabel(student)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.student_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.vaccine_name?.length)}>
              <FieldLabel htmlFor="vaccination-name">اسم التطعيم</FieldLabel>
              <Input
                id="vaccination-name"
                name="vaccine_name"
                required
                aria-invalid={Boolean(fieldErrors.vaccine_name?.length)}
              />
              <FieldError>{fieldErrors.vaccine_name?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.dose_label?.length)}>
              <FieldLabel htmlFor="vaccination-dose">الجرعة</FieldLabel>
              <Input
                id="vaccination-dose"
                name="dose_label"
                aria-invalid={Boolean(fieldErrors.dose_label?.length)}
              />
              <FieldError>{fieldErrors.dose_label?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.status?.length)}>
              <FieldLabel htmlFor="vaccination-status">الحالة</FieldLabel>
              <NativeSelect
                id="vaccination-status"
                name="status"
                className="w-full"
                defaultValue="unknown"
                aria-invalid={Boolean(fieldErrors.status?.length)}
              >
                {vaccinationStatusOptions.map((status) => (
                  <NativeSelectOption key={status} value={status}>
                    {VACCINATION_STATUS_LABELS_AR[status]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.status?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.vaccinated_on?.length)}>
              <FieldLabel htmlFor="vaccination-on">تاريخ التطعيم</FieldLabel>
              <Input
                id="vaccination-on"
                name="vaccinated_on"
                type="date"
                dir="ltr"
                aria-invalid={Boolean(fieldErrors.vaccinated_on?.length)}
              />
              <FieldError>{fieldErrors.vaccinated_on?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.next_due_on?.length)}>
              <FieldLabel htmlFor="vaccination-next-due">الجرعة القادمة</FieldLabel>
              <Input
                id="vaccination-next-due"
                name="next_due_on"
                type="date"
                dir="ltr"
                aria-invalid={Boolean(fieldErrors.next_due_on?.length)}
              />
              <FieldError>{fieldErrors.next_due_on?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.notes?.length)}>
              <FieldLabel htmlFor="vaccination-notes">ملاحظات</FieldLabel>
              <Textarea
                id="vaccination-notes"
                name="notes"
                aria-invalid={Boolean(fieldErrors.notes?.length)}
              />
              <FieldError>{fieldErrors.notes?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="حفظ التطعيم"
              pendingLabel="جاري الحفظ..."
              size="lg"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function ClinicVisitForm({
  students,
}: {
  students: StudentCareStudentOption[]
}) {
  const [state, formAction] = useActionState(
    createClinicVisitAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>تسجيل زيارة عيادة</CardTitle>
        <CardDescription>
          تحفظ الزيارة كحالة تشغيلية مدرسية بسيطة ويمكن إغلاقها لاحقًا.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.student_id?.length)}>
              <FieldLabel htmlFor="clinic-student">الطالب</FieldLabel>
              <NativeSelect
                id="clinic-student"
                name="student_id"
                className="w-full"
                required
                aria-invalid={Boolean(fieldErrors.student_id?.length)}
              >
                <NativeSelectOption value="">اختر الطالب</NativeSelectOption>
                {students.map((student) => (
                  <NativeSelectOption key={student.id} value={student.id}>
                    {studentOptionLabel(student)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.student_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.visited_at?.length)}>
              <FieldLabel htmlFor="clinic-visited-at">وقت الزيارة</FieldLabel>
              <Input
                id="clinic-visited-at"
                name="visited_at"
                type="datetime-local"
                dir="ltr"
                defaultValue={new Date().toISOString().slice(0, 16)}
                aria-invalid={Boolean(fieldErrors.visited_at?.length)}
              />
              <FieldError>{fieldErrors.visited_at?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.reason?.length)}>
              <FieldLabel htmlFor="clinic-reason">سبب الزيارة</FieldLabel>
              <Input
                id="clinic-reason"
                name="reason"
                required
                aria-invalid={Boolean(fieldErrors.reason?.length)}
              />
              <FieldError>{fieldErrors.reason?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.symptoms?.length)}>
              <FieldLabel htmlFor="clinic-symptoms">الأعراض</FieldLabel>
              <Textarea
                id="clinic-symptoms"
                name="symptoms"
                aria-invalid={Boolean(fieldErrors.symptoms?.length)}
              />
              <FieldError>{fieldErrors.symptoms?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.action_taken?.length)}>
              <FieldLabel htmlFor="clinic-action-taken">الإجراء المتخذ</FieldLabel>
              <Textarea
                id="clinic-action-taken"
                name="action_taken"
                aria-invalid={Boolean(fieldErrors.action_taken?.length)}
              />
              <FieldError>{fieldErrors.action_taken?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="clinic-returned">
                عاد إلى الصف بعد الزيارة
              </FieldLabel>
              <input
                id="clinic-returned"
                name="returned_to_class"
                type="checkbox"
                defaultChecked
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="clinic-guardian-contacted">
                تم التواصل مع ولي الأمر
              </FieldLabel>
              <input
                id="clinic-guardian-contacted"
                name="guardian_contacted"
                type="checkbox"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="clinic-referred">
                تحتاج لإحالة خارجية
              </FieldLabel>
              <input
                id="clinic-referred"
                name="referred_to_external_care"
                type="checkbox"
              />
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.notes?.length)}>
              <FieldLabel htmlFor="clinic-notes">ملاحظات</FieldLabel>
              <Textarea
                id="clinic-notes"
                name="notes"
                aria-invalid={Boolean(fieldErrors.notes?.length)}
              />
              <FieldError>{fieldErrors.notes?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="حفظ الزيارة"
              pendingLabel="جاري الحفظ..."
              size="lg"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function DisciplineRecordForm({
  students,
}: {
  students: StudentCareStudentOption[]
}) {
  const [state, formAction] = useActionState(
    createDisciplineRecordAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إنشاء سجل انضباط</CardTitle>
        <CardDescription>
          يمكن للمعلمين إنشاء السجل، بينما تبقى المراجعة النهائية للإدارة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.student_id?.length)}>
              <FieldLabel htmlFor="discipline-student">الطالب</FieldLabel>
              <NativeSelect
                id="discipline-student"
                name="student_id"
                className="w-full"
                required
                aria-invalid={Boolean(fieldErrors.student_id?.length)}
              >
                <NativeSelectOption value="">اختر الطالب</NativeSelectOption>
                {students.map((student) => (
                  <NativeSelectOption key={student.id} value={student.id}>
                    {studentOptionLabel(student)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.student_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.incident_date?.length)}>
              <FieldLabel htmlFor="discipline-date">تاريخ الواقعة</FieldLabel>
              <Input
                id="discipline-date"
                name="incident_date"
                type="date"
                dir="ltr"
                defaultValue={new Date().toISOString().slice(0, 10)}
                aria-invalid={Boolean(fieldErrors.incident_date?.length)}
              />
              <FieldError>{fieldErrors.incident_date?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.incident_type?.length)}>
              <FieldLabel htmlFor="discipline-type">نوع الواقعة</FieldLabel>
              <NativeSelect
                id="discipline-type"
                name="incident_type"
                className="w-full"
                defaultValue="other"
                aria-invalid={Boolean(fieldErrors.incident_type?.length)}
              >
                {disciplineIncidentTypeOptions.map((type) => (
                  <NativeSelectOption key={type} value={type}>
                    {DISCIPLINE_INCIDENT_TYPE_LABELS_AR[type]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.incident_type?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.severity?.length)}>
              <FieldLabel htmlFor="discipline-severity">الحدة</FieldLabel>
              <NativeSelect
                id="discipline-severity"
                name="severity"
                className="w-full"
                defaultValue="low"
                aria-invalid={Boolean(fieldErrors.severity?.length)}
              >
                {disciplineSeverityOptions.map((severity) => (
                  <NativeSelectOption key={severity} value={severity}>
                    {DISCIPLINE_SEVERITY_LABELS_AR[severity]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.severity?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.title?.length)}>
              <FieldLabel htmlFor="discipline-title">عنوان السجل</FieldLabel>
              <Input
                id="discipline-title"
                name="title"
                required
                aria-invalid={Boolean(fieldErrors.title?.length)}
              />
              <FieldError>{fieldErrors.title?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.description?.length)}>
              <FieldLabel htmlFor="discipline-description">الوصف</FieldLabel>
              <Textarea
                id="discipline-description"
                name="description"
                required
                aria-invalid={Boolean(fieldErrors.description?.length)}
              />
              <FieldError>{fieldErrors.description?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.action_taken?.length)}>
              <FieldLabel htmlFor="discipline-action">الإجراء المتخذ</FieldLabel>
              <Textarea
                id="discipline-action"
                name="action_taken"
                aria-invalid={Boolean(fieldErrors.action_taken?.length)}
              />
              <FieldError>{fieldErrors.action_taken?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="حفظ سجل الانضباط"
              pendingLabel="جاري الحفظ..."
              size="lg"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function AchievementForm({
  students,
}: {
  students: StudentCareStudentOption[]
}) {
  const [state, formAction] = useActionState(
    createAchievementAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إضافة إنجاز</CardTitle>
        <CardDescription>
          يسجل الإنجاز كمسودة أولًا، ويمكن نشره لاحقًا من الإدارة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.student_id?.length)}>
              <FieldLabel htmlFor="achievement-student">الطالب</FieldLabel>
              <NativeSelect
                id="achievement-student"
                name="student_id"
                className="w-full"
                required
                aria-invalid={Boolean(fieldErrors.student_id?.length)}
              >
                <NativeSelectOption value="">اختر الطالب</NativeSelectOption>
                {students.map((student) => (
                  <NativeSelectOption key={student.id} value={student.id}>
                    {studentOptionLabel(student)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.student_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.achievement_date?.length)}>
              <FieldLabel htmlFor="achievement-date">تاريخ الإنجاز</FieldLabel>
              <Input
                id="achievement-date"
                name="achievement_date"
                type="date"
                dir="ltr"
                defaultValue={new Date().toISOString().slice(0, 10)}
                aria-invalid={Boolean(fieldErrors.achievement_date?.length)}
              />
              <FieldError>{fieldErrors.achievement_date?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.title?.length)}>
              <FieldLabel htmlFor="achievement-title">عنوان الإنجاز</FieldLabel>
              <Input
                id="achievement-title"
                name="title"
                required
                aria-invalid={Boolean(fieldErrors.title?.length)}
              />
              <FieldError>{fieldErrors.title?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.category?.length)}>
              <FieldLabel htmlFor="achievement-category">الفئة</FieldLabel>
              <NativeSelect
                id="achievement-category"
                name="category"
                className="w-full"
                defaultValue="other"
                aria-invalid={Boolean(fieldErrors.category?.length)}
              >
                {achievementCategoryOptions.map((category) => (
                  <NativeSelectOption key={category} value={category}>
                    {ACHIEVEMENT_CATEGORY_LABELS_AR[category]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.category?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.level?.length)}>
              <FieldLabel htmlFor="achievement-level">المستوى</FieldLabel>
              <NativeSelect
                id="achievement-level"
                name="level"
                className="w-full"
                defaultValue="school"
                aria-invalid={Boolean(fieldErrors.level?.length)}
              >
                {achievementLevelOptions.map((level) => (
                  <NativeSelectOption key={level} value={level}>
                    {ACHIEVEMENT_LEVEL_LABELS_AR[level]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.level?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.description?.length)}>
              <FieldLabel htmlFor="achievement-description">الوصف</FieldLabel>
              <Textarea
                id="achievement-description"
                name="description"
                aria-invalid={Boolean(fieldErrors.description?.length)}
              />
              <FieldError>{fieldErrors.description?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="حفظ الإنجاز"
              pendingLabel="جاري الحفظ..."
              size="lg"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function CloseClinicVisitForm({ visitId }: { visitId: string }) {
  const [state, formAction] = useActionState(
    closeClinicVisitAction,
    initialState
  )

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="visit_id" value={visitId} />
      <SubmitButton
        label="إغلاق الزيارة"
        pendingLabel="جاري الإغلاق..."
        variant="outline"
        size="sm"
      />
      <FormMessage state={state} />
    </form>
  )
}

export function ReviewDisciplineRecordForm({
  recordId,
  status,
  label,
}: {
  recordId: string
  status: "reviewed" | "resolved"
  label: string
}) {
  const [state, formAction] = useActionState(
    reviewDisciplineRecordAction,
    initialState
  )

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="record_id" value={recordId} />
      <input type="hidden" name="status" value={status} />
      <SubmitButton
        label={label}
        pendingLabel="جاري الحفظ..."
        variant="outline"
        size="sm"
      />
      <FormMessage state={state} />
    </form>
  )
}

export function AchievementStatusForm({
  achievementId,
  action,
}: {
  achievementId: string
  action: "publish" | "archive"
}) {
  const serverAction =
    action === "publish" ? publishAchievementAction : archiveAchievementAction
  const [state, formAction] = useActionState(serverAction, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="achievement_id" value={achievementId} />
      <SubmitButton
        label={action === "publish" ? "نشر" : "أرشفة"}
        pendingLabel="جاري الحفظ..."
        variant="outline"
        size="sm"
      />
      <FormMessage state={state} />
    </form>
  )
}
