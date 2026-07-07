# Security Model

## Authentication

- Supabase Auth is the source of truth for authentication.
- Application profile data lives in `public.user_profiles`.
- `user_profiles.id` matches `auth.users.id`.
- Email/password is the first supported login flow.
- A successful login must resolve both the app profile and an active membership before granting dashboard access.

## Authorization

- The MVP uses fixed roles through `public.user_memberships`.
- Sensitive reads and all mutations should check authentication, membership, role, and tenant context on the server.
- Client Components must not be trusted for tenant or role enforcement.
- Dashboard protection happens server-side in the route layout, not from client-only guards.
- Tenant and school context should come from the current membership, never from submitted form values.

## Service role key rules

- `SUPABASE_SERVICE_ROLE_KEY` stays server-only.
- `lib/supabase/admin.ts` is reserved for narrow administrative operations.
- Browser-safe access must go through the anon key only.

## Tenant isolation

- Tenant context should be resolved from authenticated membership, not from a submitted `tenant_id`.
- School-scoped actions should validate both `tenant_id` and `school_id`.
- Future modules must keep these columns on every tenant-owned table.
- Student and admission mutations should derive their tenant and school scope only from the active membership context.
- Academic structure mutations derive tenant and school scope from the active membership context.
- Student class enrollment verifies the selected student, class, academic year, and class-derived grade level server-side before insert.
- Attendance session and record mutations derive tenant and school scope from the active membership context.
- Attendance recording verifies that the session is open, the student belongs to the same tenant/school, and the student has an active class enrollment for the session class and academic year.
- QR-token attendance resolves the student server-side and does not write the raw QR token to audit metadata.
- Grades and report-card mutations derive tenant and school scope from the active membership context.
- Exam creation validates year, class, term, subject, and class-derived grade level server-side.
- Exam result, grade-entry, and report-card generation validates the student and active class enrollment server-side before writing.
- Publishing exam results and report cards is limited to fixed admin roles in server-side code.
- Timetable room, teacher-subject assignment, and slot mutations derive tenant and school scope from the active membership context.
- Timetable slot creation validates the academic year, term, class, subject, active teacher membership, active teacher-subject assignment, optional active room, and class/teacher/room overlap conflicts server-side.
- Timetable write actions are limited to fixed admin roles; teachers can only read the timetable data scoped to their assignment/user context.
- Finance mutations derive tenant/school scope from authenticated membership and do not trust client-submitted totals or tenant/school fields.
- Finance fee, discount, invoice, and payment writes validate related academic years, terms, students, fee structures, discounts, invoices, and payment balances server-side.
- Finance management is limited to fixed `system_admin`, `school_admin`, and `accountant` roles in server-side code.
- Communication mutations derive tenant/school scope from authenticated active membership and do not trust submitted tenant, school, or role values.
- Internal messages validate recipients through active user memberships in the same tenant and school. Related students are validated against the same tenant and school.
- Announcement and school event writes are limited to `system_admin` and `school_admin`, with grade/class targets validated inside the current school.
- Notification logs are in-app only. No external provider secrets, payloads, email, SMS, WhatsApp, or push integrations are stored or sent.
- Ready-made reports derive tenant and school scope server-side and are limited by fixed role checks per report area.

## Session handling

- Session refresh runs through the root proxy using the Supabase SSR middleware helper.
- Detailed access checks stay in server components and Server Actions to keep middleware lightweight.

## RLS plan

Full production RLS is postponed until the auth and membership flows are stable. When it is added, policies should:

- isolate tenants first
- narrow school-scoped data second
- keep service-role operations explicit and rare

## Audit logs

- Important server-side actions should write to `public.audit_logs`.
- `metadata` should contain operational context only, never secrets or raw credentials.
- Attendance audit metadata should use IDs such as session, class, year, and student IDs, not raw QR token values.
- Grades audit metadata should use operational IDs such as exam, class, subject, student, and report-card IDs, not large grade payloads.
- Timetable audit metadata should use operational IDs such as room, teacher, subject, class, year, term, and slot IDs.
- Finance audit metadata should use operational IDs such as fee structure, fee item, discount, invoice, payment, student, and amount summaries, not card data or external payment secrets.
- Communication audit metadata should use operational IDs, target types, and counts, not long message bodies or external payloads.
- Ready-made reports write minimal `reports.viewed` audit events with the report key only.

## Student document handling

- Student and admission document uploads should stay server-side when privileged access is required.
- Only metadata and storage paths belong in `public.student_documents`.
- The `student-documents` bucket is private and should not expose public URLs by default.
