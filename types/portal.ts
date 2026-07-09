import type { UserRole } from "@/constants/roles"
import type { UserMembership, UserProfile } from "@/types/auth"
import type { Tables } from "@/types/database"

export type PortalRole = Extract<UserRole, "parent" | "student">

export type PortalStudentLink = Pick<
  Tables<"students">,
  "id" | "full_name" | "student_number" | "status"
>

export type PortalStudentGuardianSummary = Pick<
  Tables<"student_guardians">,
  "id" | "guardian_name" | "guardian_phone" | "guardian_email" | "relation" | "is_primary"
>

export type PortalStudentEnrollmentSummary = {
  class_id: string
  class_name: string
  class_section: string
  grade_level_id: string
  grade_level_name: string
  academic_year_id: string
  academic_year_name: string
}

export type PortalStudentRecord = PortalStudentLink & {
  birth_date: string | null
  gender: Tables<"students">["gender"]
  nationality: string | null
  enrolled_at: string
  active_enrollment: PortalStudentEnrollmentSummary | null
  guardians: PortalStudentGuardianSummary[]
}

export type PortalSessionUser = {
  id: string
  email: string | null
  full_name: string
  display_name: string | null
  role: PortalRole
}

export type PortalContext = {
  user: PortalSessionUser
  profile: UserProfile
  membership: UserMembership
  role: PortalRole
  tenant_id: string
  school_id: string
  linked_student_ids: string[]
  linked_students: PortalStudentLink[]
}

export type PortalOverviewStat = {
  title: string
  value: string | number
  description: string
  href: string
}

export type PortalOverviewSectionItem = {
  id: string
  title: string
  description: string
  meta?: string
  href?: string
}

export type ParentPortalOverviewSummary = {
  role: "parent"
  title: string
  description: string
  stats: PortalOverviewStat[]
  linkedChildren: PortalOverviewSectionItem[]
  attendanceHighlights: PortalOverviewSectionItem[]
  latestGrades: PortalOverviewSectionItem[]
  financeHighlights: PortalOverviewSectionItem[]
  upcomingTimetable: PortalOverviewSectionItem[]
  recentAnnouncements: PortalOverviewSectionItem[]
}

export type StudentPortalOverviewSummary = {
  role: "student"
  title: string
  description: string
  stats: PortalOverviewStat[]
  attendanceHighlights: PortalOverviewSectionItem[]
  latestGrades: PortalOverviewSectionItem[]
  libraryHighlights: PortalOverviewSectionItem[]
  upcomingTimetable: PortalOverviewSectionItem[]
  recentAnnouncements: PortalOverviewSectionItem[]
}

export type PortalOverviewSummary =
  | ParentPortalOverviewSummary
  | StudentPortalOverviewSummary
