import "server-only"

import { listPortalEnrollmentScope } from "@/lib/portal/students"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { PortalContext } from "@/types/portal"
import type {
  AnnouncementTargetType,
  SchoolEventStatus,
  SchoolEventTargetType,
} from "@/types/communication"

type MaybeArray<T> = T | T[] | null

export type PortalAnnouncementItem = {
  id: string
  title: string
  body: string
  target_type: AnnouncementTargetType
  published_at: string | null
  expires_at: string | null
  grade_level_name: string | null
  class_name: string | null
  class_section: string | null
  creator_name: string | null
}

export type PortalSchoolEventItem = {
  id: string
  title: string
  description: string | null
  starts_at: string
  ends_at: string
  location: string | null
  status: SchoolEventStatus
  target_type: SchoolEventTargetType
  grade_level_name: string | null
  class_name: string | null
  class_section: string | null
}

function takeSingle<T>(value: MaybeArray<T>): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value
}

function isTargetMatch(input: {
  target_type: AnnouncementTargetType | SchoolEventTargetType
  target_role: string | null
  grade_level_id: string | null
  class_id: string | null
  role: PortalContext["role"]
  gradeLevelIds: string[]
  classIds: string[]
}): boolean {
  if (input.target_type === "school") {
    return true
  }

  if (input.target_type === "role") {
    return input.target_role === input.role
  }

  if (input.target_type === "grade_level") {
    return input.grade_level_id ? input.gradeLevelIds.includes(input.grade_level_id) : false
  }

  if (input.target_type === "class") {
    return input.class_id ? input.classIds.includes(input.class_id) : false
  }

  return false
}

export async function listPortalAnnouncements(
  context: PortalContext
): Promise<{
  announcements: PortalAnnouncementItem[]
  events: PortalSchoolEventItem[]
}> {
  const enrollmentScope = await listPortalEnrollmentScope(context)
  const gradeLevelIds = [...new Set(enrollmentScope.map((item) => item.grade_level_id))]
  const classIds = [...new Set(enrollmentScope.map((item) => item.class_id))]
  const supabase = await createSupabaseServerClient()
  const nowIso = new Date().toISOString()
  const [{ data: announcements }, { data: events }] = await Promise.all([
    supabase
      .from("announcements")
      .select(
        "id, title, body, target_type, target_role, grade_level_id, class_id, published_at, expires_at, grade_levels(name), classes(name, section), creator:user_profiles!announcements_created_by_user_id_fkey(full_name)"
      )
      .eq("tenant_id", context.tenant_id)
      .eq("school_id", context.school_id)
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase
      .from("school_events")
      .select(
        "id, title, description, starts_at, ends_at, location, status, target_type, grade_level_id, class_id, grade_levels(name), classes(name, section)"
      )
      .eq("tenant_id", context.tenant_id)
      .eq("school_id", context.school_id)
      .in("status", ["scheduled", "completed"])
      .order("starts_at", { ascending: false }),
  ])

  return {
    announcements:
      announcements
        ?.filter((announcement) => {
          const isNotExpired =
            !announcement.expires_at || announcement.expires_at > nowIso

          return (
            isNotExpired &&
            isTargetMatch({
              target_type: announcement.target_type,
              target_role: announcement.target_role,
              grade_level_id: announcement.grade_level_id,
              class_id: announcement.class_id,
              role: context.role,
              gradeLevelIds,
              classIds,
            })
          )
        })
        .map((announcement) => {
          const gradeLevel = takeSingle(announcement.grade_levels)
          const classInfo = takeSingle(announcement.classes)
          const creator = takeSingle(announcement.creator)

          return {
            id: announcement.id,
            title: announcement.title,
            body: announcement.body,
            target_type: announcement.target_type,
            published_at: announcement.published_at,
            expires_at: announcement.expires_at,
            grade_level_name: gradeLevel?.name ?? null,
            class_name: classInfo?.name ?? null,
            class_section: classInfo?.section ?? null,
            creator_name: creator?.full_name ?? null,
          }
        }) ?? [],
    events:
      events
        ?.filter((event) =>
          isTargetMatch({
            target_type: event.target_type,
            target_role: null,
            grade_level_id: event.grade_level_id,
            class_id: event.class_id,
            role: context.role,
            gradeLevelIds,
            classIds,
          })
        )
        .map((event) => {
          const gradeLevel = takeSingle(event.grade_levels)
          const classInfo = takeSingle(event.classes)

          return {
            id: event.id,
            title: event.title,
            description: event.description,
            starts_at: event.starts_at,
            ends_at: event.ends_at,
            location: event.location,
            status: event.status,
            target_type: event.target_type,
            grade_level_name: gradeLevel?.name ?? null,
            class_name: classInfo?.name ?? null,
            class_section: classInfo?.section ?? null,
          }
        }) ?? [],
  }
}
