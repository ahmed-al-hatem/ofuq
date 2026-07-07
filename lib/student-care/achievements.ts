import "server-only"

import { USER_ROLES } from "@/constants/roles"
import { assertStudentCareStudent } from "@/lib/student-care/context"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { StudentCareContext } from "@/lib/student-care/context"
import type { TablesInsert } from "@/types/database"
import type { Achievement } from "@/types/student-care"

function canPublishAchievement(context: StudentCareContext) {
  return (
    context.role === USER_ROLES.SYSTEM_ADMIN ||
    context.role === USER_ROLES.SCHOOL_ADMIN
  )
}

export type CreateAchievementInput = {
  student_id: string
  achievement_date: string
  title: string
  description: string | null
  category: Achievement["category"]
  level: Achievement["level"]
}

export type AchievementListItem = Achievement & {
  students: { full_name: string; student_number: string } | null
}

function trimToNull(value: string | null | undefined) {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

async function assertAchievement(
  context: StudentCareContext,
  achievementId: string
): Promise<Achievement> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("id", achievementId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("ACHIEVEMENT_NOT_FOUND")
  }

  return data
}

export async function listAchievements(
  context: StudentCareContext,
  options?: { actorOnly?: boolean; limit?: number }
): Promise<AchievementListItem[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("achievements")
    .select("*, students(full_name, student_number)")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("achievement_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (options?.actorOnly) {
    query = query.eq("created_by_user_id", context.user_id)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data as unknown as AchievementListItem[]
}

export async function createAchievement(
  context: StudentCareContext,
  input: CreateAchievementInput
): Promise<Achievement> {
  await assertStudentCareStudent(context, input.student_id, {
    requireActive: true,
  })

  const supabase = await createSupabaseServerClient()
  const record: TablesInsert<"achievements"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    student_id: input.student_id,
    achievement_date: input.achievement_date,
    title: input.title.trim(),
    description: trimToNull(input.description),
    category: input.category,
    level: input.level,
    awarded_by_user_id: context.user_id,
    status: "draft",
    created_by_user_id: context.user_id,
  }

  const { data, error } = await supabase
    .from("achievements")
    .insert(record)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function publishAchievement(
  context: StudentCareContext,
  achievementId: string
): Promise<Achievement> {
  if (!canPublishAchievement(context)) {
    throw new Error("ACHIEVEMENT_PUBLISH_NOT_ALLOWED")
  }

  const achievement = await assertAchievement(context, achievementId)

  if (achievement.status === "archived") {
    throw new Error("ACHIEVEMENT_ALREADY_ARCHIVED")
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("achievements")
    .update({
      status: "published",
      published_at: achievement.published_at ?? new Date().toISOString(),
    })
    .eq("id", achievement.id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function archiveAchievement(
  context: StudentCareContext,
  achievementId: string
): Promise<Achievement> {
  if (!canPublishAchievement(context)) {
    throw new Error("ACHIEVEMENT_PUBLISH_NOT_ALLOWED")
  }

  const achievement = await assertAchievement(context, achievementId)

  if (achievement.status === "archived") {
    throw new Error("ACHIEVEMENT_ALREADY_ARCHIVED")
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("achievements")
    .update({
      status: "archived",
    })
    .eq("id", achievement.id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function countPublishedAchievements(
  context: StudentCareContext,
  options?: { actorOnly?: boolean }
): Promise<number> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("achievements")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "published")

  if (options?.actorOnly) {
    query = query.eq("created_by_user_id", context.user_id)
  }

  const { count, error } = await query

  return error ? 0 : count ?? 0
}
