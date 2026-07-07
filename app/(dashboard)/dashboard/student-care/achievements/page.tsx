import Link from "next/link"
import { Award, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import { listAchievements } from "@/lib/student-care/achievements"
import { requireStudentCareContext } from "@/lib/student-care/context"
import {
  ACHIEVEMENT_CATEGORY_LABELS_AR,
  ACHIEVEMENT_LEVEL_LABELS_AR,
  ACHIEVEMENT_STATUS_LABELS_AR,
  ACHIEVEMENT_STATUS_TONES,
} from "@/types/student-care"
import { AchievementStatusForm } from "../_components/student-care-forms"

const studentCareReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

function canPublishAchievements(role: string) {
  return (
    role === USER_ROLES.SYSTEM_ADMIN || role === USER_ROLES.SCHOOL_ADMIN
  )
}

export default async function StudentCareAchievementsPage() {
  const contextResult = await requireStudentCareContext(studentCareReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الإنجازات" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الإنجازات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const canPublish = canPublishAchievements(contextResult.data.role)
  const achievements = await listAchievements(contextResult.data, {
    actorOnly: !canPublish,
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الإنجازات"
        description="توثيق إنجازات الطلاب ضمن المدرسة الحالية مع نشر إداري بسيط."
        actions={
          <Link
            href={appRoutes.newStudentCareAchievement}
            className={buttonVariants({ size: "lg" })}
          >
            إنجاز جديد
          </Link>
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>الإنجازات المسجلة</CardTitle>
          <CardDescription>
            يرى المعلم إنجازاته التي أنشأها، بينما ترى الإدارة كامل السجل.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {achievements.length === 0 ? (
            <EmptyState
              icon={Award}
              title="لا توجد إنجازات بعد"
              description="ابدأ بإضافة إنجاز لطالب نشط داخل المدرسة الحالية."
            />
          ) : (
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 text-start font-medium">الطالب</th>
                  <th className="py-3 text-start font-medium">التاريخ</th>
                  <th className="py-3 text-start font-medium">العنوان</th>
                  <th className="py-3 text-start font-medium">الفئة</th>
                  <th className="py-3 text-start font-medium">المستوى</th>
                  <th className="py-3 text-start font-medium">الحالة</th>
                  <th className="py-3 text-start font-medium">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {achievements.map((achievement) => (
                  <tr
                    key={achievement.id}
                    className="border-b border-border/60 align-top"
                  >
                    <td className="py-3">
                      {achievement.students?.full_name ?? "طالب غير معروف"}
                      <p className="text-xs text-muted-foreground" dir="ltr">
                        {achievement.students?.student_number ?? "-"}
                      </p>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {achievement.achievement_date}
                    </td>
                    <td className="py-3">
                      <p className="font-medium">{achievement.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {achievement.description ?? "بدون وصف"}
                      </p>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {ACHIEVEMENT_CATEGORY_LABELS_AR[achievement.category]}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {ACHIEVEMENT_LEVEL_LABELS_AR[achievement.level]}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={ACHIEVEMENT_STATUS_TONES[achievement.status]}>
                        {ACHIEVEMENT_STATUS_LABELS_AR[achievement.status]}
                      </StatusBadge>
                    </td>
                    <td className="py-3">
                      {canPublish ? (
                        <div className="flex flex-col gap-2">
                          {achievement.status === "draft" ? (
                            <AchievementStatusForm
                              achievementId={achievement.id}
                              action="publish"
                            />
                          ) : null}
                          {achievement.status !== "archived" ? (
                            <AchievementStatusForm
                              achievementId={achievement.id}
                              action="archive"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              مؤرشف
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          للقراءة أو الإنشاء فقط
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
