export const appRoutes = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  admissions: "/dashboard/admissions",
  newAdmission: "/dashboard/admissions/new",
  admissionDetails: (admissionId: string) => `/dashboard/admissions/${admissionId}`,
  students: "/dashboard/students",
  studentDetails: (studentId: string) => `/dashboard/students/${studentId}`,
} as const
