import type { Enums, Tables } from "@/types/database"

export type RoomStatus = Enums<"room_status">
export type TeacherSubjectAssignmentStatus =
  Enums<"teacher_subject_assignment_status">
export type TimetableDayOfWeek = Enums<"timetable_day_of_week">
export type TimetableSlotStatus = Enums<"timetable_slot_status">

export type Room = Tables<"rooms">
export type TeacherSubjectAssignment = Tables<"teacher_subject_assignments">
export type TimetableSlot = Tables<"timetable_slots">

export const ROOM_STATUS_LABELS_AR: Record<RoomStatus, string> = {
  active: "نشطة",
  inactive: "غير نشطة",
  archived: "مؤرشفة",
}

export const TEACHER_SUBJECT_ASSIGNMENT_STATUS_LABELS_AR: Record<
  TeacherSubjectAssignmentStatus,
  string
> = {
  active: "نشط",
  inactive: "غير نشط",
  archived: "مؤرشف",
}

export const TIMETABLE_DAY_LABELS_AR: Record<TimetableDayOfWeek, string> = {
  sunday: "الأحد",
  monday: "الاثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
  saturday: "السبت",
}

export const TIMETABLE_SLOT_STATUS_LABELS_AR: Record<
  TimetableSlotStatus,
  string
> = {
  active: "نشطة",
  cancelled: "ملغاة",
  archived: "مؤرشفة",
}

export const ROOM_STATUS_TONES = {
  active: "success",
  inactive: "neutral",
  archived: "neutral",
} as const

export const TEACHER_SUBJECT_ASSIGNMENT_STATUS_TONES = {
  active: "success",
  inactive: "neutral",
  archived: "neutral",
} as const

export const TIMETABLE_SLOT_STATUS_TONES = {
  active: "success",
  cancelled: "warning",
  archived: "neutral",
} as const
