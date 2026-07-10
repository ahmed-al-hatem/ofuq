# Security Model

## Authentication

- Supabase Auth is the source of truth for authentication.
- Application profile data lives in `public.user_profiles`.
- `user_profiles.id` matches `auth.users.id`.
- Email/password is the first supported login flow.
- A successful login must resolve both the app profile and an active membership before granting application access.
- Role-aware login routing is resolved on the server from the active membership role only: `parent` and `student` land on `/portal`, while all staff roles land on `/dashboard`.

## Authorization

- The MVP uses fixed roles through `public.user_memberships`.
- Sensitive reads and all mutations should check authentication, membership, role, and tenant context on the server.
- Client Components must not be trusted for tenant or role enforcement.
- Dashboard protection happens server-side in the route layout, not from client-only guards.
- The dashboard layout redirects `parent` and `student` memberships to `/portal` before rendering the dashboard shell.
- `/dashboard` content now changes by fixed staff role, but this remains a UX layer only; the role-specific home page does not replace server-side authorization inside module routes and actions.
- Dashboard sidebar filtering is a UX improvement only. It reduces irrelevant navigation by fixed role, but it is not a replacement for server-side authorization checks.
- Tenant and school context should come from the current membership, never from submitted form values.
- Parent/student portal protection also happens server-side and is limited to fixed `parent` and `student` roles.

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
- Settings and integrations reads derive tenant/school scope from authenticated active membership and remain limited to fixed `system_admin` and `school_admin` roles in server-side code.
- Settings forms do not expose trusted tenant, school, role, or actor identity fields. School context is derived on the server before reading or writing `school_settings`, `integration_settings`, or `message_templates`.
- Integration pages are placeholder-only in this phase. They do not perform external API calls, OAuth handshakes, webhook delivery, provider sync, BI embedding, or real API secret storage.
- Internal chat does not trust any client-submitted tenant, school, user, participant, or role values. The only accepted client inputs are the message body and, when needed, a conversation identifier that is revalidated on the server.
- Phase 25B now enforces school-office chat scope server-side through authenticated membership, tenant, school, fixed role, and conversation access helpers before any chat read, send, or mark-as-read write.
- `parent` and `student` may access only their own school-office conversation in the current school. `school_admin` may access school-office conversations within the same school. `teacher`, `accountant`, `librarian`, and `system_admin` do not get parent/student school-office chat access in this phase.
- Supabase Realtime is used only to refresh an already-authorized active conversation thread. It is not treated as an authorization layer or a trusted source of conversation scope.
- Gemini assistant execution is server-side only through dedicated assistant helpers. Client components submit only the conversation ID and user message; tenant, school, role, user, and model selection remain resolved on the server.
- Gemini must never receive unrestricted SQL or raw database execution ability, and the assistant continues to consume only role-scoped summaries built by application services.
- Parent assistant scope must remain limited to linked children, student scope to self data, teacher scope to assigned classes/subjects where implemented, accountant scope to finance context only, librarian scope to library context only, and school-admin scope to the current school only.
- `GEMINI_API_KEY` must exist only in environment configuration. No `NEXT_PUBLIC_GEMINI_API_KEY` or browser-side Gemini call path is permitted.
- Assistant persistence in `ai_conversations` and `ai_messages` stores only sanitized metadata such as model name and token counts. Secrets, raw provider payloads, and internal identifiers are not exposed in UI responses.
- Ready-made reports derive tenant and school scope server-side and are limited by fixed role checks per report area.
- Portal reads derive tenant/school scope from authenticated membership, then resolve linked students server-side only. Parent access uses `student_guardians.guardian_user_id = current user profile id`; student self-access uses `students.student_user_id = current user profile id`.
- Portal student detail pages must validate that the requested student ID belongs to the current linked-student set before returning data.
- Portal finance visibility is intentionally narrower: parent users may view linked-student finance records read-only, while student users do not receive detailed finance data in this phase.
- Library reads derive tenant/school scope from authenticated membership. Library mutations are limited to `system_admin`, `school_admin`, and `librarian`.
- Library catalog, copy, student, and loan relationships are validated server-side before writes. Loan issue verifies copy availability and blocks duplicate active copy loans; return verifies the loan is active before updating loan and copy state.
- Library forms do not expose tenant, school, role, creator, issuer, or return actor fields. Fine billing, public library portals, barcode hardware integration, and e-book lending are not implemented.
- Student-care reads derive tenant/school scope from authenticated membership. Health records, vaccinations, and clinic visits are limited to `system_admin` and `school_admin`.
- Teachers may create discipline records and achievements, but discipline review/resolution and achievement publish/archive remain limited to fixed admin roles in server-side code.
- Student-care forms do not expose tenant, school, role, creator, reviewer, handler, or publisher fields. Diagnosis, prescriptions, medical uploads, parent notifications, PDF certificates, and AI analysis are not implemented.
- Feedback reads derive tenant/school scope from authenticated membership. Complaint submission and survey response are limited to authenticated operational school staff roles in this phase.
- Full complaint management and all survey administration remain limited to `system_admin` and `school_admin` in server-side code.
- Feedback mutations validate complaint ownership, related student ownership, assignee active membership, survey target relationships, publish/close workflow, response eligibility, and duplicate-response prevention on the server.
- Feedback forms do not expose tenant, school, role, submitter, assignee, resolver, author, creator, or respondent identity fields. Anonymous/public complaint forms, public survey links, attachments, external notifications, and AI analysis are not implemented.
- Portal routes remain read-only for finance, attendance, grades, library, profile, complaints, surveys, and other portal modules. Phase 25B adds one narrow portal mutation only: internal school-office chat messaging.

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
- Library audit metadata should use IDs such as catalog, copy, loan, and student IDs, not long descriptions, cover URLs, or external payloads.
- Student-care audit metadata should use IDs and status only. Health notes, medications, chronic-condition text, and symptoms must not be written into audit logs.
- Feedback audit metadata should use IDs and status transitions only. Complaint descriptions, internal-note text, resolution text, survey answers, and other large feedback payloads must not be written into audit logs.
- Settings audit metadata should use IDs, provider keys, template keys, status values, and small counters only. Branding payloads, template bodies, secrets, and other large free-text values should not be copied into audit logs.
- Future chat and assistant audit metadata should use conversation, participant, message, and scope IDs only. Raw prompts, full assistant outputs, secrets, and large free-text payloads should not be duplicated into audit logs.

## Student document handling

- Student and admission document uploads should stay server-side when privileged access is required.
- Only metadata and storage paths belong in `public.student_documents`.
- The `student-documents` bucket is private and should not expose public URLs by default.
