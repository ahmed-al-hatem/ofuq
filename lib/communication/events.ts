import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { CommunicationModuleContext } from "@/lib/communication/context"
import { createNotificationLog } from "@/lib/communication/notifications"
import type { TablesInsert } from "@/types/database"
import type {
  SchoolEvent,
  SchoolEventTargetType,
} from "@/types/communication"

export type CreateSchoolEventInput = {
  title: string
  description: string | null
  starts_at: string
  ends_at: string
  location: string | null
  target_type: SchoolEventTargetType
  grade_level_id: string | null
  class_id: string | null
}

export type SchoolEventListItem = SchoolEvent & {
  grade_levels: { name: string } | null
  classes: { name: string; section: string } | null
  creator: { full_name: string } | null
}

async function assertGradeLevel(
  context: CommunicationModuleContext,
  gradeLevelId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("grade_levels")
    .select("id")
    .eq("id", gradeLevelId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("GRADE_LEVEL_NOT_FOUND")
  }
}

async function assertClass(
  context: CommunicationModuleContext,
  classId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("CLASS_NOT_FOUND")
  }
}

async function assertSchoolEvent(
  context: CommunicationModuleContext,
  eventId: string
): Promise<SchoolEvent> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("school_events")
    .select("*")
    .eq("id", eventId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("SCHOOL_EVENT_NOT_FOUND")
  }

  return data
}

async function validateTarget(
  context: CommunicationModuleContext,
  input: CreateSchoolEventInput
): Promise<void> {
  if (input.target_type === "grade_level") {
    if (!input.grade_level_id) {
      throw new Error("SCHOOL_EVENT_TARGET_REQUIRED")
    }

    await assertGradeLevel(context, input.grade_level_id)
  }

  if (input.target_type === "class") {
    if (!input.class_id) {
      throw new Error("SCHOOL_EVENT_TARGET_REQUIRED")
    }

    await assertClass(context, input.class_id)
  }
}

export async function createSchoolEvent(
  context: CommunicationModuleContext,
  input: CreateSchoolEventInput
): Promise<SchoolEvent> {
  const supabase = await createSupabaseServerClient()
  await validateTarget(context, input)

  if (new Date(input.starts_at) >= new Date(input.ends_at)) {
    throw new Error("SCHOOL_EVENT_TIME_ORDER")
  }

  const record: TablesInsert<"school_events"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    location: input.location?.trim() || null,
    target_type: input.target_type,
    grade_level_id:
      input.target_type === "grade_level" ? input.grade_level_id : null,
    class_id: input.target_type === "class" ? input.class_id : null,
    created_by_user_id: context.user_id,
  }

  const { data, error } = await supabase
    .from("school_events")
    .insert(record)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await createNotificationLog(context, {
    recipient_user_id: null,
    notification_type: "communication.event.created",
    title: data.title,
    body: "تم إنشاء حدث مدرسي جديد.",
    related_entity_type: "school_event",
    related_entity_id: data.id,
  })

  return data
}

export async function cancelSchoolEvent(
  context: CommunicationModuleContext,
  eventId: string
): Promise<SchoolEvent> {
  const supabase = await createSupabaseServerClient()
  const event = await assertSchoolEvent(context, eventId)

  if (event.status !== "scheduled") {
    throw new Error("SCHOOL_EVENT_NOT_SCHEDULED")
  }

  const { data, error } = await supabase
    .from("school_events")
    .update({ status: "cancelled" })
    .eq("id", eventId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error("SCHOOL_EVENT_NOT_FOUND")
  }

  return data
}

export async function listSchoolEvents(
  context: CommunicationModuleContext,
  limit = 50
): Promise<SchoolEventListItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("school_events")
    .select(
      "*, grade_levels(name), classes(name, section), creator:user_profiles!school_events_created_by_user_id_fkey(full_name)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("starts_at", { ascending: true })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data as unknown as SchoolEventListItem[]
}
