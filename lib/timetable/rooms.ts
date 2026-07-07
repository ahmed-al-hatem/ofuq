import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TimetableModuleContext } from "@/lib/timetable/context"
import type { TablesInsert } from "@/types/database"
import type { Room } from "@/types/timetable"

export type CreateRoomInput = {
  name: string
  code: string | null
  capacity: number | null
  location: string | null
}

function trimToNull(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

export async function listRooms(
  context: TimetableModuleContext
): Promise<Room[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("name", { ascending: true })

  if (error || !data) {
    return []
  }

  return data
}

export async function countRooms(
  context: TimetableModuleContext
): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from("rooms")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)

  if (error) {
    return 0
  }

  return count ?? 0
}

export async function createRoom(
  context: TimetableModuleContext,
  input: CreateRoomInput
): Promise<Room> {
  const supabase = await createSupabaseServerClient()
  const roomRecord: TablesInsert<"rooms"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    name: input.name.trim(),
    code: trimToNull(input.code),
    capacity: input.capacity,
    location: trimToNull(input.location),
  }

  const { data, error } = await supabase
    .from("rooms")
    .insert(roomRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function assertActiveRoom(
  context: TimetableModuleContext,
  roomId: string
): Promise<Room> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")
    .maybeSingle()

  if (error || !data) {
    throw new Error("ROOM_NOT_FOUND")
  }

  return data
}
