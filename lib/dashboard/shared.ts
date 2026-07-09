import type { AuthenticatedUser, UserMembership } from "@/types/auth"
import type {
  DashboardScope,
  DashboardSummaryListItem,
  StaffDashboardRole,
} from "@/types/dashboard"
import type { TimetableDayOfWeek } from "@/types/timetable"

type MaybeArray<T> = T | T[] | null

const weekdayMap: Record<number, TimetableDayOfWeek> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
}

export function takeSingle<T>(value: MaybeArray<T>): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value
}

export function getRelationCount(
  rows: { count: number | null }[] | null | undefined
): number {
  return rows?.[0]?.count ?? 0
}

export function formatDateLabel(value: string | null | undefined): string {
  if (!value) {
    return "بدون تاريخ"
  }

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
  }).format(new Date(value))
}

export function formatDateTimeLabel(value: string | null | undefined): string {
  if (!value) {
    return "بدون موعد"
  }

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function formatCurrencyLabel(
  value: number,
  currency = "USD",
  locale = "ar"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export function getTodayTimetableDay(date = new Date()): TimetableDayOfWeek {
  return weekdayMap[date.getDay()]
}

export function createDashboardScope(
  user: AuthenticatedUser & { membership: UserMembership }
): DashboardScope | null {
  if (!user.membership.school_id) {
    return null
  }

  return {
    user_id: user.id,
    role: user.membership.role as StaffDashboardRole,
    tenant_id: user.membership.tenant_id,
    school_id: user.membership.school_id,
  }
}

export function createListItem(
  item: DashboardSummaryListItem
): DashboardSummaryListItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    meta: item.meta,
    href: item.href,
  }
}
