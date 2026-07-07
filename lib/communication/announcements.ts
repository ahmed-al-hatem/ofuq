import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { CommunicationModuleContext } from "@/lib/communication/context"
import { createNotificationLog } from "@/lib/communication/notifications"
import type { TablesInsert } from "@/types/database"
import type {
  Announcement,
  AnnouncementTargetType,
} from "@/types/communication"
import type { UserRole } from "@/constants/roles"

export type CreateAnnouncementInput = {
  title: string
  body: string
  target_type: AnnouncementTargetType
  target_role: UserRole | null
  grade_level_id: string | null
  class_id: string | null
  expires_at: string | null
}

export type AnnouncementListItem = Announcement & {
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

async function assertAnnouncement(
  context: CommunicationModuleContext,
  announcementId: string
): Promise<Announcement> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", announcementId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("ANNOUNCEMENT_NOT_FOUND")
  }

  return data
}

async function validateTarget(
  context: CommunicationModuleContext,
  input: CreateAnnouncementInput
): Promise<void> {
  if (input.target_type === "role" && !input.target_role) {
    throw new Error("ANNOUNCEMENT_TARGET_REQUIRED")
  }

  if (input.target_type === "grade_level") {
    if (!input.grade_level_id) {
      throw new Error("ANNOUNCEMENT_TARGET_REQUIRED")
    }

    await assertGradeLevel(context, input.grade_level_id)
  }

  if (input.target_type === "class") {
    if (!input.class_id) {
      throw new Error("ANNOUNCEMENT_TARGET_REQUIRED")
    }

    await assertClass(context, input.class_id)
  }
}

export async function createAnnouncement(
  context: CommunicationModuleContext,
  input: CreateAnnouncementInput
): Promise<Announcement> {
  const supabase = await createSupabaseServerClient()
  await validateTarget(context, input)

  if (input.expires_at && new Date(input.expires_at) <= new Date()) {
    throw new Error("ANNOUNCEMENT_EXPIRES_TOO_EARLY")
  }

  const record: TablesInsert<"announcements"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    title: input.title.trim(),
    body: input.body.trim(),
    target_type: input.target_type,
    target_role: input.target_type === "role" ? input.target_role : null,
    grade_level_id:
      input.target_type === "grade_level" ? input.grade_level_id : null,
    class_id: input.target_type === "class" ? input.class_id : null,
    expires_at: input.expires_at,
    created_by_user_id: context.user_id,
  }

  const { data, error } = await supabase
    .from("announcements")
    .insert(record)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function publishAnnouncement(
  context: CommunicationModuleContext,
  announcementId: string
): Promise<Announcement> {
  const supabase = await createSupabaseServerClient()
  const announcement = await assertAnnouncement(context, announcementId)

  if (announcement.status === "archived") {
    throw new Error("ANNOUNCEMENT_ARCHIVED")
  }

  if (
    announcement.expires_at &&
    new Date(announcement.expires_at) <= new Date()
  ) {
    throw new Error("ANNOUNCEMENT_EXPIRES_TOO_EARLY")
  }

  const { data, error } = await supabase
    .from("announcements")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", announcementId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error("ANNOUNCEMENT_NOT_FOUND")
  }

  await createNotificationLog(context, {
    recipient_user_id: null,
    notification_type: "communication.announcement.published",
    title: data.title,
    body: "تم نشر إعلان مدرسي جديد.",
    related_entity_type: "announcement",
    related_entity_id: data.id,
  })

  return data
}

export async function archiveAnnouncement(
  context: CommunicationModuleContext,
  announcementId: string
): Promise<Announcement> {
  const supabase = await createSupabaseServerClient()
  await assertAnnouncement(context, announcementId)

  const { data, error } = await supabase
    .from("announcements")
    .update({ status: "archived" })
    .eq("id", announcementId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error("ANNOUNCEMENT_NOT_FOUND")
  }

  return data
}

export async function listAnnouncements(
  context: CommunicationModuleContext,
  limit = 50
): Promise<AnnouncementListItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("announcements")
    .select(
      "*, grade_levels(name), classes(name, section), creator:user_profiles!announcements_created_by_user_id_fkey(full_name)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data as unknown as AnnouncementListItem[]
}
