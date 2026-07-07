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
import { USER_ROLE_LABELS_AR, USER_ROLES, type UserRole } from "@/constants/roles"
import {
  addComplaintUpdateAction,
  addSurveyQuestionAction,
  archiveSurveyAction,
  assignComplaintAction,
  closeSurveyAction,
  createComplaintAction,
  createSurveyAction,
  publishSurveyAction,
  resolveComplaintAction,
  submitSurveyResponseAction,
  updateComplaintStatusAction,
  type FeedbackActionState,
} from "@/lib/actions/feedback"
import type {
  FeedbackStudentOption,
  FeedbackUserOption,
} from "@/lib/feedback/context"
import type { ClassSection, GradeLevel } from "@/types/academic"
import {
  COMPLAINT_CATEGORY_LABELS_AR,
  COMPLAINT_PRIORITY_LABELS_AR,
  SURVEY_QUESTION_TYPE_LABELS_AR,
  SURVEY_TARGET_TYPE_LABELS_AR,
  parseSurveyChoiceOptions,
  parseSurveyRatingOptions,
  type ComplaintCategory,
  type ComplaintPriority,
  type SurveyQuestion,
  type SurveyQuestionType,
  type SurveyStatus,
  type SurveyTargetType,
} from "@/types/feedback"

const initialState: FeedbackActionState = null

const complaintCategoryOptions = [
  "academic",
  "behavior",
  "finance",
  "transport",
  "facility",
  "communication",
  "staff",
  "other",
] as const satisfies readonly ComplaintCategory[]

const complaintPriorityOptions = [
  "low",
  "medium",
  "high",
  "urgent",
] as const satisfies readonly ComplaintPriority[]

const complaintStatusOptions = [
  "in_review",
  "rejected",
  "cancelled",
] as const

const surveyTargetOptions = [
  "school",
  "role",
  "grade_level",
  "class",
] as const satisfies readonly SurveyTargetType[]

const surveyQuestionTypeOptions = [
  "short_text",
  "long_text",
  "single_choice",
  "multiple_choice",
  "rating",
  "yes_no",
] as const satisfies readonly SurveyQuestionType[]

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

function FormMessage({ state }: { state: FeedbackActionState }) {
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

function getFieldErrors(state: FeedbackActionState) {
  return state?.ok === false ? state.fieldErrors ?? {} : {}
}

function studentOptionLabel(student: FeedbackStudentOption) {
  return `${student.full_name} - ${student.student_number}`
}

function userOptionLabel(user: FeedbackUserOption) {
  return `${user.display_name ?? user.full_name} - ${USER_ROLE_LABELS_AR[user.role]}`
}

function questionFieldName(questionId: string) {
  return `question_${questionId}`
}

export function ComplaintForm({
  students,
}: {
  students: FeedbackStudentOption[]
}) {
  const [state, formAction] = useActionState(createComplaintAction, initialState)
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إرسال شكوى جديدة</CardTitle>
        <CardDescription>
          تحفظ الشكوى باسم الحساب الحالي، ويجري التحقق من الطالب على الخادم عند
          اختياره.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.student_id?.length)}>
              <FieldLabel htmlFor="complaint-student">الطالب المرتبط</FieldLabel>
              <NativeSelect
                id="complaint-student"
                name="student_id"
                className="w-full"
                aria-invalid={Boolean(fieldErrors.student_id?.length)}
              >
                <NativeSelectOption value="">بدون طالب مرتبط</NativeSelectOption>
                {students.map((student) => (
                  <NativeSelectOption key={student.id} value={student.id}>
                    {studentOptionLabel(student)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.student_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.category?.length)}>
              <FieldLabel htmlFor="complaint-category">الفئة</FieldLabel>
              <NativeSelect
                id="complaint-category"
                name="category"
                className="w-full"
                defaultValue="other"
              >
                {complaintCategoryOptions.map((category) => (
                  <NativeSelectOption key={category} value={category}>
                    {COMPLAINT_CATEGORY_LABELS_AR[category]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.category?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.priority?.length)}>
              <FieldLabel htmlFor="complaint-priority">الأولوية</FieldLabel>
              <NativeSelect
                id="complaint-priority"
                name="priority"
                className="w-full"
                defaultValue="medium"
              >
                {complaintPriorityOptions.map((priority) => (
                  <NativeSelectOption key={priority} value={priority}>
                    {COMPLAINT_PRIORITY_LABELS_AR[priority]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.priority?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.title?.length)}>
              <FieldLabel htmlFor="complaint-title">العنوان</FieldLabel>
              <Input id="complaint-title" name="title" required />
              <FieldError>{fieldErrors.title?.[0]}</FieldError>
            </Field>
            <Field
              className="md:col-span-2"
              data-invalid={Boolean(fieldErrors.description?.length)}
            >
              <FieldLabel htmlFor="complaint-description">الوصف</FieldLabel>
              <Textarea id="complaint-description" name="description" required />
              <FieldError>{fieldErrors.description?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="إرسال الشكوى"
              pendingLabel="جاري الإرسال..."
              size="lg"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function ComplaintUpdateForm({
  complaintId,
  allowInternalNote = false,
}: {
  complaintId: string
  allowInternalNote?: boolean
}) {
  const [state, formAction] = useActionState(
    addComplaintUpdateAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إضافة تحديث</CardTitle>
        <CardDescription>
          يسجل هذا النموذج تعليقًا زمنيًا جديدًا داخل الشكوى الحالية.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="complaint_id" value={complaintId} />
          {!allowInternalNote ? (
            <input type="hidden" name="update_type" value="comment" />
          ) : null}
          <FieldGroup className="grid gap-4">
            {allowInternalNote ? (
              <Field data-invalid={Boolean(fieldErrors.update_type?.length)}>
                <FieldLabel htmlFor="complaint-update-type">نوع التحديث</FieldLabel>
                <NativeSelect
                  id="complaint-update-type"
                  name="update_type"
                  className="w-full"
                  defaultValue="comment"
                >
                  <NativeSelectOption value="comment">تعليق</NativeSelectOption>
                  <NativeSelectOption value="internal_note">
                    ملاحظة داخلية
                  </NativeSelectOption>
                </NativeSelect>
                <FieldError>{fieldErrors.update_type?.[0]}</FieldError>
              </Field>
            ) : null}
            <Field data-invalid={Boolean(fieldErrors.body?.length)}>
              <FieldLabel htmlFor="complaint-update-body">نص التحديث</FieldLabel>
              <Textarea id="complaint-update-body" name="body" required />
              <FieldError>{fieldErrors.body?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="حفظ التحديث"
              pendingLabel="جاري الحفظ..."
              size="lg"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function AssignComplaintForm({
  complaintId,
  users,
  currentAssignedUserId,
}: {
  complaintId: string
  users: FeedbackUserOption[]
  currentAssignedUserId: string | null
}) {
  const [state, formAction] = useActionState(assignComplaintAction, initialState)
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>تعيين الشكوى</CardTitle>
        <CardDescription>
          يمكن للإدارة اختيار عضو فريق نشط داخل المدرسة الحالية لمعالجة الشكوى.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="complaint_id" value={complaintId} />
          <Field data-invalid={Boolean(fieldErrors.assigned_to_user_id?.length)}>
            <FieldLabel htmlFor="complaint-assignee">المكلّف</FieldLabel>
            <NativeSelect
              id="complaint-assignee"
              name="assigned_to_user_id"
              className="w-full"
              defaultValue={currentAssignedUserId ?? ""}
            >
              <NativeSelectOption value="">بدون تعيين</NativeSelectOption>
              {users.map((user) => (
                <NativeSelectOption key={user.id} value={user.id}>
                  {userOptionLabel(user)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError>{fieldErrors.assigned_to_user_id?.[0]}</FieldError>
          </Field>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="حفظ التعيين"
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

export function ComplaintStatusForm({
  complaintId,
  currentStatus,
}: {
  complaintId: string
  currentStatus: string
}) {
  const [state, formAction] = useActionState(
    updateComplaintStatusAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>تحديث الحالة</CardTitle>
        <CardDescription>
          الحالة الحالية: {currentStatus}. اكتب ملاحظة عند الرفض أو الإلغاء إن لزم.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="complaint_id" value={complaintId} />
          <FieldGroup className="grid gap-4">
            <Field data-invalid={Boolean(fieldErrors.status?.length)}>
              <FieldLabel htmlFor="complaint-status">الحالة الجديدة</FieldLabel>
              <NativeSelect
                id="complaint-status"
                name="status"
                className="w-full"
                defaultValue="in_review"
              >
                {complaintStatusOptions.map((status) => (
                  <NativeSelectOption key={status} value={status}>
                    {status === "in_review"
                      ? "قيد المراجعة"
                      : status === "rejected"
                        ? "رفض الشكوى"
                        : "إلغاء الشكوى"}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.status?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.note?.length)}>
              <FieldLabel htmlFor="complaint-status-note">ملاحظة</FieldLabel>
              <Textarea id="complaint-status-note" name="note" />
              <FieldDescription>
                تصبح الملاحظة إلزامية عند اختيار حالة الرفض.
              </FieldDescription>
              <FieldError>{fieldErrors.note?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="حفظ الحالة"
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

export function ResolveComplaintForm({ complaintId }: { complaintId: string }) {
  const [state, formAction] = useActionState(
    resolveComplaintAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>حل الشكوى</CardTitle>
        <CardDescription>
          سيُحفظ ملخص الحل ويُقفل السجل كشكوى محلولة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="complaint_id" value={complaintId} />
          <Field data-invalid={Boolean(fieldErrors.resolution_summary?.length)}>
            <FieldLabel htmlFor="complaint-resolution">ملخص الحل</FieldLabel>
            <Textarea
              id="complaint-resolution"
              name="resolution_summary"
              required
            />
            <FieldError>{fieldErrors.resolution_summary?.[0]}</FieldError>
          </Field>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="إغلاق كمحلولة"
              pendingLabel="جاري الإغلاق..."
              size="sm"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function SurveyForm({
  gradeLevels,
  classes,
}: {
  gradeLevels: GradeLevel[]
  classes: ClassSection[]
}) {
  const [state, formAction] = useActionState(createSurveyAction, initialState)
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إنشاء استبيان</CardTitle>
        <CardDescription>
          يُنشأ الاستبيان كمسودة أولًا، ثم تُضاف أسئلته وتُنشر من صفحة التفاصيل.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.title?.length)}>
              <FieldLabel htmlFor="survey-title">العنوان</FieldLabel>
              <Input id="survey-title" name="title" required />
              <FieldError>{fieldErrors.title?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.description?.length)}>
              <FieldLabel htmlFor="survey-description">الوصف</FieldLabel>
              <Textarea id="survey-description" name="description" />
              <FieldError>{fieldErrors.description?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.target_type?.length)}>
              <FieldLabel htmlFor="survey-target-type">نوع الجمهور</FieldLabel>
              <NativeSelect
                id="survey-target-type"
                name="target_type"
                className="w-full"
                defaultValue="school"
              >
                {surveyTargetOptions.map((targetType) => (
                  <NativeSelectOption key={targetType} value={targetType}>
                    {SURVEY_TARGET_TYPE_LABELS_AR[targetType]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.target_type?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.target_role?.length)}>
              <FieldLabel htmlFor="survey-target-role">الدور المستهدف</FieldLabel>
              <NativeSelect
                id="survey-target-role"
                name="target_role"
                className="w-full"
              >
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
              <FieldLabel htmlFor="survey-grade-level">الصف الدراسي</FieldLabel>
              <NativeSelect
                id="survey-grade-level"
                name="grade_level_id"
                className="w-full"
              >
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
              <FieldLabel htmlFor="survey-class">الشعبة</FieldLabel>
              <NativeSelect id="survey-class" name="class_id" className="w-full">
                <NativeSelectOption value="">بدون شعبة</NativeSelectOption>
                {classes.map((classSection) => (
                  <NativeSelectOption key={classSection.id} value={classSection.id}>
                    {classSection.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.class_id?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.opens_at?.length)}>
              <FieldLabel htmlFor="survey-opens-at">يفتح في</FieldLabel>
              <Input id="survey-opens-at" name="opens_at" type="datetime-local" dir="ltr" />
              <FieldError>{fieldErrors.opens_at?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.closes_at?.length)}>
              <FieldLabel htmlFor="survey-closes-at">يغلق في</FieldLabel>
              <Input id="survey-closes-at" name="closes_at" type="datetime-local" dir="ltr" />
              <FieldError>{fieldErrors.closes_at?.[0]}</FieldError>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="إنشاء الاستبيان"
              pendingLabel="جاري الإنشاء..."
              size="lg"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function SurveyQuestionForm({
  surveyId,
  nextSortOrder,
}: {
  surveyId: string
  nextSortOrder: number
}) {
  const [state, formAction] = useActionState(
    addSurveyQuestionAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إضافة سؤال</CardTitle>
        <CardDescription>
          اكتب الخيارات سطرًا لكل خيار لأسئلة الاختيار، وحدد نطاق التقييم لأسئلة
          التقييم.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="survey_id" value={surveyId} />
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.question_text?.length)}>
              <FieldLabel htmlFor="survey-question-text">نص السؤال</FieldLabel>
              <Textarea id="survey-question-text" name="question_text" required />
              <FieldError>{fieldErrors.question_text?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.question_type?.length)}>
              <FieldLabel htmlFor="survey-question-type">نوع السؤال</FieldLabel>
              <NativeSelect
                id="survey-question-type"
                name="question_type"
                className="w-full"
                defaultValue="short_text"
              >
                {surveyQuestionTypeOptions.map((questionType) => (
                  <NativeSelectOption key={questionType} value={questionType}>
                    {SURVEY_QUESTION_TYPE_LABELS_AR[questionType]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{fieldErrors.question_type?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.sort_order?.length)}>
              <FieldLabel htmlFor="survey-sort-order">ترتيب السؤال</FieldLabel>
              <Input
                id="survey-sort-order"
                name="sort_order"
                type="number"
                min={0}
                defaultValue={nextSortOrder}
                dir="ltr"
              />
              <FieldError>{fieldErrors.sort_order?.[0]}</FieldError>
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(fieldErrors.options_text?.length)}>
              <FieldLabel htmlFor="survey-options-text">خيارات السؤال</FieldLabel>
              <Textarea id="survey-options-text" name="options_text" />
              <FieldDescription>
                يستخدم هذا الحقل لأسئلة اختيار واحد أو اختيارات متعددة فقط، خيار
                واحد في كل سطر.
              </FieldDescription>
              <FieldError>{fieldErrors.options_text?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.rating_min?.length)}>
              <FieldLabel htmlFor="survey-rating-min">أدنى تقييم</FieldLabel>
              <Input
                id="survey-rating-min"
                name="rating_min"
                type="number"
                min={1}
                max={10}
                defaultValue={1}
                dir="ltr"
              />
              <FieldError>{fieldErrors.rating_min?.[0]}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.rating_max?.length)}>
              <FieldLabel htmlFor="survey-rating-max">أعلى تقييم</FieldLabel>
              <Input
                id="survey-rating-max"
                name="rating_max"
                type="number"
                min={2}
                max={10}
                defaultValue={5}
                dir="ltr"
              />
              <FieldError>{fieldErrors.rating_max?.[0]}</FieldError>
            </Field>
            <Field orientation="horizontal">
              <input
                id="survey-is-required"
                name="is_required"
                type="checkbox"
                defaultChecked
                className="size-4 accent-primary"
              />
              <FieldLabel htmlFor="survey-is-required">السؤال إلزامي</FieldLabel>
            </Field>
          </FieldGroup>
          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="إضافة السؤال"
              pendingLabel="جاري الإضافة..."
              size="sm"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export function SurveyWorkflowActions({
  surveyId,
  status,
}: {
  surveyId: string
  status: SurveyStatus
}) {
  const [publishState, publishAction] = useActionState(
    publishSurveyAction,
    initialState
  )
  const [closeState, closeAction] = useActionState(
    closeSurveyAction,
    initialState
  )
  const [archiveState, archiveAction] = useActionState(
    archiveSurveyAction,
    initialState
  )

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إجراءات الاستبيان</CardTitle>
        <CardDescription>
          الإجراء المتاح يعتمد على حالة الاستبيان الحالية.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <input type="hidden" name="survey_id" value={surveyId} />
        <div className="flex flex-wrap items-center gap-2">
          {status === "draft" ? (
            <form action={publishAction}>
              <input type="hidden" name="survey_id" value={surveyId} />
              <SubmitButton label="نشر" pendingLabel="جاري النشر..." size="sm" />
            </form>
          ) : null}
          {status === "published" ? (
            <form action={closeAction}>
              <input type="hidden" name="survey_id" value={surveyId} />
              <SubmitButton
                label="إغلاق"
                pendingLabel="جاري الإغلاق..."
                variant="outline"
                size="sm"
              />
            </form>
          ) : null}
          {status !== "archived" ? (
            <form action={archiveAction}>
              <input type="hidden" name="survey_id" value={surveyId} />
              <SubmitButton
                label="أرشفة"
                pendingLabel="جاري الأرشفة..."
                variant="outline"
                size="sm"
              />
            </form>
          ) : null}
        </div>
        <FormMessage state={publishState} />
        <FormMessage state={closeState} />
        <FormMessage state={archiveState} />
      </CardContent>
    </Card>
  )
}

export function SurveyResponseForm({
  surveyId,
  questions,
  students,
}: {
  surveyId: string
  questions: SurveyQuestion[]
  students: FeedbackStudentOption[]
}) {
  const [state, formAction] = useActionState(
    submitSurveyResponseAction,
    initialState
  )
  const fieldErrors = getFieldErrors(state)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>إرسال الرد</CardTitle>
        <CardDescription>
          يتحقق الخادم من أهلية الرد، ومنع التكرار، وصحة إجابات كل سؤال.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-6" noValidate>
          <input type="hidden" name="survey_id" value={surveyId} />
          <Field data-invalid={Boolean(fieldErrors.student_id?.length)}>
            <FieldLabel htmlFor="survey-response-student">طالب مرتبط</FieldLabel>
            <NativeSelect
              id="survey-response-student"
              name="student_id"
              className="w-full"
            >
              <NativeSelectOption value="">بدون طالب مرتبط</NativeSelectOption>
              {students.map((student) => (
                <NativeSelectOption key={student.id} value={student.id}>
                  {studentOptionLabel(student)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldDescription>
              يستخدم هذا الحقل عند الحاجة لربط الرد بطالب محدد داخل المدرسة.
            </FieldDescription>
            <FieldError>{fieldErrors.student_id?.[0]}</FieldError>
          </Field>

          {questions.map((question, index) => {
            const fieldName = questionFieldName(question.id)
            const error = fieldErrors[fieldName]?.[0]

            if (
              question.question_type === "short_text" ||
              question.question_type === "long_text"
            ) {
              return (
                <Field
                  key={question.id}
                  data-invalid={Boolean(error)}
                >
                  <FieldLabel htmlFor={fieldName}>
                    {index + 1}. {question.question_text}
                  </FieldLabel>
                  {question.question_type === "short_text" ? (
                    <Input id={fieldName} name={fieldName} aria-invalid={Boolean(error)} />
                  ) : (
                    <Textarea id={fieldName} name={fieldName} aria-invalid={Boolean(error)} />
                  )}
                  <FieldDescription>
                    {question.is_required ? "هذا السؤال إلزامي." : "هذا السؤال اختياري."}
                  </FieldDescription>
                  <FieldError>{error}</FieldError>
                </Field>
              )
            }

            if (question.question_type === "single_choice") {
              const choices = parseSurveyChoiceOptions(question.options)

              return (
                <FieldSet key={question.id} className="rounded-2xl border border-border/60 p-4">
                  <FieldLegend>
                    {index + 1}. {question.question_text}
                  </FieldLegend>
                  <FieldDescription>
                    {question.is_required ? "اختر إجابة واحدة." : "يمكن ترك هذا السؤال فارغًا."}
                  </FieldDescription>
                  <div className="flex flex-col gap-3">
                    {choices.map((choice) => (
                      <label key={choice} className="flex items-center gap-3 text-sm">
                        <input
                          type="radio"
                          name={fieldName}
                          value={choice}
                          className="size-4 accent-primary"
                        />
                        <span>{choice}</span>
                      </label>
                    ))}
                  </div>
                  <FieldError>{error}</FieldError>
                </FieldSet>
              )
            }

            if (question.question_type === "multiple_choice") {
              const choices = parseSurveyChoiceOptions(question.options)

              return (
                <FieldSet key={question.id} className="rounded-2xl border border-border/60 p-4">
                  <FieldLegend>
                    {index + 1}. {question.question_text}
                  </FieldLegend>
                  <FieldDescription>
                    {question.is_required
                      ? "اختر إجابة واحدة على الأقل."
                      : "يمكن اختيار أكثر من إجابة أو ترك السؤال فارغًا."}
                  </FieldDescription>
                  <div className="flex flex-col gap-3">
                    {choices.map((choice) => (
                      <label key={choice} className="flex items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          name={fieldName}
                          value={choice}
                          className="size-4 accent-primary"
                        />
                        <span>{choice}</span>
                      </label>
                    ))}
                  </div>
                  <FieldError>{error}</FieldError>
                </FieldSet>
              )
            }

            if (question.question_type === "rating") {
              const ratingOptions = parseSurveyRatingOptions(question.options)
              const ratingValues = Array.from(
                { length: ratingOptions.max - ratingOptions.min + 1 },
                (_, offset) => ratingOptions.min + offset
              )

              return (
                <Field key={question.id} data-invalid={Boolean(error)}>
                  <FieldLabel htmlFor={fieldName}>
                    {index + 1}. {question.question_text}
                  </FieldLabel>
                  <NativeSelect id={fieldName} name={fieldName} className="w-full">
                    <NativeSelectOption value="">اختر التقييم</NativeSelectOption>
                    {ratingValues.map((value) => (
                      <NativeSelectOption key={value} value={value}>
                        {value}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <FieldDescription>
                    التقييم من {ratingOptions.min} إلى {ratingOptions.max}.
                  </FieldDescription>
                  <FieldError>{error}</FieldError>
                </Field>
              )
            }

            return (
              <FieldSet key={question.id} className="rounded-2xl border border-border/60 p-4">
                <FieldLegend>
                  {index + 1}. {question.question_text}
                </FieldLegend>
                <FieldDescription>
                  {question.is_required ? "اختر نعم أو لا." : "يمكن ترك السؤال فارغًا."}
                </FieldDescription>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="radio"
                      name={fieldName}
                      value="yes"
                      className="size-4 accent-primary"
                    />
                    <span>نعم</span>
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="radio"
                      name={fieldName}
                      value="no"
                      className="size-4 accent-primary"
                    />
                    <span>لا</span>
                  </label>
                </div>
                <FieldError>{error}</FieldError>
              </FieldSet>
            )
          })}

          <FormMessage state={state} />
          <CardFooter className="px-0 pb-0 pt-2">
            <SubmitButton
              label="إرسال الرد"
              pendingLabel="جاري الإرسال..."
              size="lg"
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
