import "server-only"

import { USER_ROLES } from "@/constants/roles"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  FeedbackContext,
  FeedbackUserOption,
} from "@/lib/feedback/context"
import type { TablesInsert } from "@/types/database"
import type {
  Complaint,
  ComplaintPriority,
  ComplaintStatus,
  ComplaintUpdate,
  ComplaintUpdateType,
  ComplaintCategory,
} from "@/types/feedback"

export type CreateComplaintInput = {
  student_id: string | null
  category: ComplaintCategory
  priority: ComplaintPriority
  title: string
  description: string
}

export type AddComplaintUpdateInput = {
  complaint_id: string
  body: string
  update_type: Extract<ComplaintUpdateType, "comment" | "internal_note">
}

export type AssignComplaintInput = {
  complaint_id: string
  assigned_to_user_id: string | null
}

export type ChangeComplaintStatusInput = {
  complaint_id: string
  status: Extract<ComplaintStatus, "in_review" | "rejected" | "cancelled">
  note: string | null
}

export type ResolveComplaintInput = {
  complaint_id: string
  resolution_summary: string
}

type ComplaintProfile = {
  full_name: string
  display_name: string | null
} | null

export type ComplaintListItem = Complaint & {
  students: { full_name: string; student_number: string } | null
  submitted_by: ComplaintProfile
  assigned_to: ComplaintProfile
}

export type ComplaintTimelineItem = ComplaintUpdate & {
  author: ComplaintProfile
}

export type ComplaintDetails = Complaint & {
  student: { full_name: string; student_number: string } | null
  submitted_by: ComplaintProfile
  assigned_to: ComplaintProfile
  resolved_by: ComplaintProfile
  updates: ComplaintTimelineItem[]
}

function trimToNull(value: string | null | undefined) {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

function isFeedbackManagementRole(role: FeedbackContext["role"]) {
  return (
    role === USER_ROLES.SYSTEM_ADMIN || role === USER_ROLES.SCHOOL_ADMIN
  )
}

function canViewComplaint(context: FeedbackContext, complaint: Complaint) {
  if (isFeedbackManagementRole(context.role)) {
    return true
  }

  return (
    complaint.submitted_by_user_id === context.user_id ||
    complaint.assigned_to_user_id === context.user_id
  )
}

function assertComplaintStatusTransition(
  currentStatus: ComplaintStatus,
  nextStatus: ChangeComplaintStatusInput["status"] | "resolved"
) {
  const transitions: Record<ComplaintStatus, readonly string[]> = {
    submitted: ["in_review", "rejected", "cancelled", "resolved"],
    in_review: ["rejected", "cancelled", "resolved"],
    resolved: [],
    rejected: [],
    cancelled: [],
  }

  if (!transitions[currentStatus].includes(nextStatus)) {
    throw new Error("COMPLAINT_STATUS_TRANSITION_NOT_ALLOWED")
  }
}

async function assertComplaintStudent(
  context: FeedbackContext,
  studentId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("COMPLAINT_STUDENT_NOT_FOUND")
  }
}

async function assertAssignableUser(
  context: FeedbackContext,
  userId: string
): Promise<FeedbackUserOption> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("user_memberships")
    .select("user_id, role, user_profiles(full_name, display_name)")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !data) {
    throw new Error("ASSIGNED_USER_NOT_FOUND")
  }

  if (data.role === USER_ROLES.PARENT || data.role === USER_ROLES.STUDENT) {
    throw new Error("ASSIGNED_USER_NOT_FOUND")
  }

  const profile = Array.isArray(data.user_profiles)
    ? data.user_profiles[0]
    : data.user_profiles

  if (!profile) {
    throw new Error("ASSIGNED_USER_NOT_FOUND")
  }

  return {
    id: data.user_id,
    role: data.role,
    full_name: profile.full_name,
    display_name: profile.display_name,
  }
}

async function assertComplaint(
  context: FeedbackContext,
  complaintId: string
): Promise<Complaint> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("id", complaintId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("COMPLAINT_NOT_FOUND")
  }

  return data
}

async function createComplaintTimelineEntry(
  context: FeedbackContext,
  input: {
    complaint_id: string
    update_type: ComplaintUpdateType
    body: string
    old_status?: ComplaintStatus | null
    new_status?: ComplaintStatus | null
  }
): Promise<ComplaintUpdate> {
  const supabase = await createSupabaseServerClient()
  const record: TablesInsert<"complaint_updates"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    complaint_id: input.complaint_id,
    author_user_id: context.user_id,
    update_type: input.update_type,
    body: input.body.trim(),
    old_status: input.old_status ?? null,
    new_status: input.new_status ?? null,
  }

  const { data, error } = await supabase
    .from("complaint_updates")
    .insert(record)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "COMPLAINT_UPDATE_FAILED")
  }

  return data
}

export async function listComplaints(
  context: FeedbackContext,
  options?: { limit?: number }
): Promise<ComplaintListItem[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("complaints")
    .select(
      "*, students(full_name, student_number), submitted_by:user_profiles!complaints_submitted_by_user_id_fkey(full_name, display_name), assigned_to:user_profiles!complaints_assigned_to_user_id_fkey(full_name, display_name)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("submitted_at", { ascending: false })

  if (!isFeedbackManagementRole(context.role)) {
    query = query.or(
      `submitted_by_user_id.eq.${context.user_id},assigned_to_user_id.eq.${context.user_id}`
    )
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data as unknown as ComplaintListItem[]
}

export async function getComplaintDetails(
  context: FeedbackContext,
  complaintId: string
): Promise<ComplaintDetails> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("complaints")
    .select(
      "*, student:students(full_name, student_number), submitted_by:user_profiles!complaints_submitted_by_user_id_fkey(full_name, display_name), assigned_to:user_profiles!complaints_assigned_to_user_id_fkey(full_name, display_name), resolved_by:user_profiles!complaints_resolved_by_user_id_fkey(full_name, display_name)"
    )
    .eq("id", complaintId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("COMPLAINT_NOT_FOUND")
  }

  if (!canViewComplaint(context, data)) {
    throw new Error("COMPLAINT_NOT_FOUND")
  }

  const { data: updates, error: updatesError } = await supabase
    .from("complaint_updates")
    .select(
      "*, author:user_profiles!complaint_updates_author_user_id_fkey(full_name, display_name)"
    )
    .eq("complaint_id", complaintId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: true })

  if (updatesError) {
    throw new Error("COMPLAINT_NOT_FOUND")
  }

  const visibleUpdates = isFeedbackManagementRole(context.role)
    ? updates ?? []
    : (updates ?? []).filter((update) => update.update_type !== "internal_note")

  return {
    ...(data as ComplaintDetails),
    updates: visibleUpdates as ComplaintTimelineItem[],
  }
}

export async function createComplaint(
  context: FeedbackContext,
  input: CreateComplaintInput
): Promise<Complaint> {
  if (input.student_id) {
    await assertComplaintStudent(context, input.student_id)
  }

  const supabase = await createSupabaseServerClient()
  const record: TablesInsert<"complaints"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    submitted_by_user_id: context.user_id,
    student_id: input.student_id,
    category: input.category,
    priority: input.priority,
    title: input.title.trim(),
    description: input.description.trim(),
  }

  const { data, error } = await supabase
    .from("complaints")
    .insert(record)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "COMPLAINT_CREATE_FAILED")
  }

  return data
}

export async function addComplaintUpdate(
  context: FeedbackContext,
  input: AddComplaintUpdateInput
): Promise<ComplaintUpdate> {
  const complaint = await assertComplaint(context, input.complaint_id)

  if (!canViewComplaint(context, complaint)) {
    throw new Error("COMPLAINT_NOT_FOUND")
  }

  if (input.update_type === "internal_note" && !isFeedbackManagementRole(context.role)) {
    throw new Error("COMPLAINT_INTERNAL_NOTE_NOT_ALLOWED")
  }

  return createComplaintTimelineEntry(context, {
    complaint_id: complaint.id,
    update_type: input.update_type,
    body: input.body,
  })
}

export async function assignComplaint(
  context: FeedbackContext,
  input: AssignComplaintInput
): Promise<Complaint> {
  if (!isFeedbackManagementRole(context.role)) {
    throw new Error("COMPLAINT_ASSIGN_NOT_ALLOWED")
  }

  const complaint = await assertComplaint(context, input.complaint_id)

  if (["resolved", "rejected", "cancelled"].includes(complaint.status)) {
    throw new Error("COMPLAINT_ALREADY_FINALIZED")
  }

  let assigneeName = "تم إلغاء التعيين"

  if (input.assigned_to_user_id) {
    const assignee = await assertAssignableUser(context, input.assigned_to_user_id)
    assigneeName = `تم تعيين الشكوى إلى ${assignee.display_name ?? assignee.full_name}`
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("complaints")
    .update({
      assigned_to_user_id: input.assigned_to_user_id,
    })
    .eq("id", complaint.id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "COMPLAINT_ASSIGN_FAILED")
  }

  await createComplaintTimelineEntry(context, {
    complaint_id: complaint.id,
    update_type: "assignment",
    body: assigneeName,
  })

  return data
}

export async function changeComplaintStatus(
  context: FeedbackContext,
  input: ChangeComplaintStatusInput
): Promise<Complaint> {
  if (!isFeedbackManagementRole(context.role)) {
    throw new Error("COMPLAINT_STATUS_CHANGE_NOT_ALLOWED")
  }

  const complaint = await assertComplaint(context, input.complaint_id)
  assertComplaintStatusTransition(complaint.status, input.status)

  const note = trimToNull(input.note)

  if (input.status === "rejected" && !note) {
    throw new Error("COMPLAINT_REJECTION_NOTE_REQUIRED")
  }

  const updatePayload: Partial<Complaint> = {
    status: input.status,
    resolved_at: null,
    resolved_by_user_id: null,
    resolution_summary: null,
  }

  if (input.status === "rejected") {
    updatePayload.resolved_at = new Date().toISOString()
    updatePayload.resolved_by_user_id = context.user_id
    updatePayload.resolution_summary = note
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("complaints")
    .update(updatePayload)
    .eq("id", complaint.id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "COMPLAINT_STATUS_CHANGE_FAILED")
  }

  await createComplaintTimelineEntry(context, {
    complaint_id: complaint.id,
    update_type: "status_change",
    body:
      note ??
      (input.status === "in_review"
        ? "تم نقل الشكوى إلى قيد المراجعة"
        : input.status === "cancelled"
          ? "تم إلغاء الشكوى"
          : "تم رفض الشكوى"),
    old_status: complaint.status,
    new_status: input.status,
  })

  return data
}

export async function resolveComplaint(
  context: FeedbackContext,
  input: ResolveComplaintInput
): Promise<Complaint> {
  if (!isFeedbackManagementRole(context.role)) {
    throw new Error("COMPLAINT_RESOLVE_NOT_ALLOWED")
  }

  const complaint = await assertComplaint(context, input.complaint_id)
  assertComplaintStatusTransition(complaint.status, "resolved")

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("complaints")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      resolved_by_user_id: context.user_id,
      resolution_summary: input.resolution_summary.trim(),
    })
    .eq("id", complaint.id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "COMPLAINT_RESOLVE_FAILED")
  }

  await createComplaintTimelineEntry(context, {
    complaint_id: complaint.id,
    update_type: "resolution",
    body: input.resolution_summary,
    old_status: complaint.status,
    new_status: "resolved",
  })

  return data
}

export async function countComplaintsByStatuses(
  context: FeedbackContext,
  statuses: ComplaintStatus[]
): Promise<number> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("complaints")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .in("status", statuses)

  if (!isFeedbackManagementRole(context.role)) {
    query = query.or(
      `submitted_by_user_id.eq.${context.user_id},assigned_to_user_id.eq.${context.user_id}`
    )
  }

  const { count, error } = await query

  return error ? 0 : count ?? 0
}
