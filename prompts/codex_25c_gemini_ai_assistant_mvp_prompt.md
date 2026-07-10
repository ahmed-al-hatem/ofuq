# Phase 25C - Gemini AI Assistant MVP

## Objective

Implement the first real MVP of **مساعد أُفُق** using Gemini API, while keeping the assistant strictly server-side, read-only, role-scoped, tenant-scoped, and safe.

This phase converts the assistant routes created in Phase 25A from UI scaffold pages into a functional AI assistant:

- `/dashboard/assistant`
- `/portal/assistant`

The assistant must answer in Arabic, use only server-built scoped summaries, save conversation history in the existing AI tables, and never execute write operations.

---

## Non-negotiable security warning

A Gemini API key may have been shared outside the repository context. Treat any previously shared key as compromised.

Do **not** commit any API key.
Do **not** write any API key in code, docs, prompts, comments, tests, seeds, or migrations.
Do **not** create `NEXT_PUBLIC_GEMINI_API_KEY`.
Do **not** expose Gemini calls from Client Components.

Use only environment variables, locally or in deployment configuration:

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.1-flash-lite
GEMINI_FALLBACK_MODEL=gemini-2.5-flash-lite
GEMINI_MAX_OUTPUT_TOKENS=700
GEMINI_TEMPERATURE=0.2
```

If `GEMINI_API_KEY` is missing, the UI must show a friendly Arabic setup error and must not crash.

---

## Required package

Add the official Gemini JavaScript SDK only if it is not already installed:

```bash
npm install @google/genai
```

Use it only in server-side files.

No client-side Gemini calls.
No browser exposure of API key.

---

## Scope

### In scope

- Server-side Gemini integration.
- Server Action for asking Assistant.
- Read-only, role-scoped context builder.
- Persist AI conversations and messages.
- Load assistant conversation history from database.
- Update `/dashboard/assistant` and `/portal/assistant` to use real data.
- Arabic professional UI using existing chat components.
- Suggested prompts by role.
- Safe error states.
- Unit tests for policies/context where practical.
- Documentation updates.

### Out of scope

- No data mutation through Gemini.
- No SQL generation or execution.
- No function calling/tools.
- No Google Search grounding.
- No streaming in MVP unless already trivial and safe.
- No file upload.
- No multimodal input.
- No RLS changes.
- No auth redirect changes.
- No internal chat changes unless needed for shared UI compatibility.
- No attachments.

---

## Existing context

Phase 25A created assistant UI and schema foundation.
Phase 25B implemented internal realtime chat MVP.

Use existing tables if sufficient:

- `ai_conversations`
- `ai_messages`

Add a small migration only if the current schema is insufficient for Phase 25C requirements. If a migration is needed, name it like:

```text
supabase/migrations/20260710140000_gemini_ai_assistant_mvp.sql
```

Do not modify previous migrations.

---

## Architecture

Implement this flow:

```text
Client Assistant UI
→ Server Action
→ getAuthenticatedUser() or requirePortalContext()
→ assistant access policy
→ role-based context builder
→ read-only scoped data summary
→ Gemini API server-side
→ save user message and assistant response
→ return response and refresh UI
```

Gemini must never query the database directly.
Gemini must receive only a prepared Arabic/structured summary.

---

## Suggested files

Create or update as needed:

```text
lib/assistant/gemini-client.ts
lib/assistant/policies.ts
lib/assistant/context.ts
lib/assistant/prompts.ts
lib/assistant/queries.ts
lib/assistant/actions.ts
components/chat/assistant-thread.tsx
components/chat/assistant-composer.tsx
app/(dashboard)/dashboard/assistant/page.tsx
app/(portal)/portal/assistant/page.tsx
types/chat.ts
```

Optional tests:

```text
tests/unit/assistant-access.test.ts
tests/unit/assistant-context.test.ts
```

Do not remove Phase 25B chat behavior.

---

## Assistant name and language

Assistant name:

```text
مساعد أُفُق
```

Tone:

```text
Arabic simplified, professional, concise, school-management focused.
```

The assistant should not claim capabilities it does not have.
If information is unavailable in the scoped context, it must say so clearly.

---

## System prompt requirements

Create a strict system prompt similar to:

```text
أنت مساعد أُفُق، مساعد مدرسي داخل نظام Ofuq.
أجب بالعربية المبسطة وبأسلوب مهني مختصر.
استخدم فقط السياق المرسل لك.
لا تخترع أرقامًا أو أسماء أو نتائج.
إذا لم تكن المعلومة موجودة في السياق، قل إن البيانات غير متاحة حاليًا.
لا تنفذ أوامر.
لا تنشئ أو تعدل أو تحذف أي بيانات.
لا تقدم SQL ولا تطلب تشغيل SQL.
لا تكشف tenant_id أو school_id أو user_id أو أي معرفات داخلية.
لا تتجاوز صلاحيات الدور الحالي.
إذا طلب المستخدم أمرًا تنفيذيًا، وضّح أنك مساعد قراءة فقط في هذه المرحلة.
```

---

## Role-scoped context rules

### school_admin

Allowed read-only summaries:

- School overview.
- Student counts.
- Attendance summaries.
- Finance summaries.
- Library summaries.
- Communication summaries.
- Complaints/surveys summaries if available.

Examples:

- كم عدد الطلاب؟
- ما ملخص الحضور هذا الأسبوع؟
- ما الفواتير غير المدفوعة؟

### teacher

Allowed:

- His/her assigned classes, subjects, timetable if available.
- Attendance/grades related to assigned classes/subjects only.

Forbidden:

- Financial summaries.
- Students outside teacher scope.
- Parent/student private conversations.

### parent

Allowed:

- Linked children only.
- Attendance, grades, invoices/fees, announcements related to linked children.

Forbidden:

- Other students.
- Whole-school private analytics.
- Staff-only data.

### student

Allowed:

- Own data only.
- Attendance, grades, timetable, announcements, library loans if available.

Forbidden:

- Other students.
- Whole-school finance/admin data.

### accountant

Allowed:

- Finance summaries within active school.
- Invoices, payments, discounts, expenses summaries.

Forbidden:

- Health/discipline details unless already financial and explicitly scoped.

### librarian

Allowed:

- Library summaries.
- Book catalog/copies/loans summaries.

Forbidden:

- Finance and sensitive student details unrelated to library.

### system_admin

Keep conservative. Do not allow cross-school leakage.
If no active school context is available, show restricted/read-only safe state.

---

## Context builder requirements

Build small summaries only. Do not send large raw rows to Gemini.

Context should include only:

- User role label.
- School display name if available.
- Allowed scope description.
- Small counts and recent summaries.
- For parent/student, only linked/own student data.
- Last 6 AI messages maximum.

Suggested maxes:

```text
recentMessages: 6
recentGrades: 5
recentAttendanceDays: 7
recentInvoices: 5
recentLibraryLoans: 5
```

Never include:

```text
tenant_id
school_id
user_id
internal UUIDs
raw SQL
API key
large full tables
```

---

## Gemini client

Implement a server-only wrapper, for example:

```text
lib/assistant/gemini-client.ts
```

Responsibilities:

- Read `GEMINI_API_KEY` from server environment.
- Read `GEMINI_MODEL`, fallback model, max tokens, temperature.
- Return a typed result.
- Handle missing key gracefully.
- Handle Gemini errors without leaking internals.

Use the lowest-cost configured model by default.

Default config:

```text
model: process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite"
fallback: process.env.GEMINI_FALLBACK_MODEL ?? "gemini-2.5-flash-lite"
maxOutputTokens: 700
temperature: 0.2
```

Do not use streaming for MVP unless it is already trivial and does not increase complexity.

---

## Server Action

Create a Server Action such as:

```text
askOfuqAssistant()
```

Allowed client inputs:

```text
conversation_id optional
message required
```

Forbidden client inputs:

```text
tenant_id
school_id
user_id
role
student_id
model
api_key
```

Validation:

```text
message trim min 1 max 1000 or 1500 characters
conversation_id uuid optional
```

Action behavior:

1. Resolve authenticated user/context server-side.
2. Validate user can access assistant route/context.
3. Ensure or create an AI conversation for the current user/scope.
4. Save user message.
5. Build safe role-scoped context.
6. Call Gemini.
7. Save assistant response.
8. Return success state with conversation id and assistant message.

If Gemini fails after saving user message, save or return a safe failure state without exposing raw error.

---

## Persistence

Use existing `ai_conversations` and `ai_messages`.

Expected behavior:

- One default active assistant conversation per user/school may be enough for MVP.
- Save user message and assistant response.
- Load history from database.
- Do not store API key or raw secret data in metadata.
- Store sanitized metadata only if needed, such as model name and safe token usage if available.

---

## UI requirements

Use and adapt existing Phase 25A components:

- `AssistantThread`
- `AssistantPromptPanel`
- `message`
- `message-scroller`
- `ChatLayout`
- existing shadcn/Base UI patterns

UI must include:

- Arabic RTL interface.
- Existing Ofuq colors and design system.
- Badge: `Gemini MVP` when configured.
- Friendly setup badge/error when `GEMINI_API_KEY` is missing.
- Pending state while waiting.
- Disabled submit when empty or unauthorized.
- Suggested prompts by role.
- Clear read-only note.

Dashboard assistant examples:

- school_admin: `كم عدد الطلاب؟`
- school_admin: `ما ملخص الحضور هذا الأسبوع؟`
- accountant: `ما الفواتير غير المدفوعة؟`
- librarian: `ما ملخص الإعارات؟`
- teacher: `ما ملخص حضور صفوفي؟`

Portal assistant examples:

- parent: `ما آخر درجات ابني؟`
- parent: `هل توجد فواتير غير مدفوعة؟`
- student: `ما آخر درجاتي؟`
- student: `ما جدولي اليوم؟`

---

## Error handling

Handle these cases:

- Missing `GEMINI_API_KEY`.
- Gemini timeout/rate limit.
- Empty Gemini response.
- Unauthorized role/context.
- No scoped data available.
- Database insert/read failure.

User-facing Arabic error examples:

```text
تعذر الحصول على رد من مساعد أُفُق الآن. يرجى المحاولة لاحقًا.
```

```text
مساعد أُفُق غير مفعّل بعد. يرجى ضبط GEMINI_API_KEY في بيئة التشغيل.
```

Never expose:

- Stack traces.
- Raw provider response.
- API key.
- Internal UUIDs.

---

## Tests

Add or update unit tests where practical:

- assistant role policy tests.
- context builder scoping tests.
- parent sees linked children only.
- student sees self only.
- teacher cannot access finance context.
- missing API key handling can be tested without calling Gemini.

Do not write tests that require a real Gemini API call.
Mock Gemini client logic if needed.

---

## Required verification

Run:

```bash
npm run build
git diff --check
npm run test
```

Run targeted lint on touched files, for example:

```bash
npx eslint lib/assistant components/chat 'app/(dashboard)/dashboard/assistant/page.tsx' 'app/(portal)/portal/assistant/page.tsx' tests/unit/assistant-access.test.ts tests/unit/assistant-context.test.ts types/chat.ts
```

Run Supabase checks:

```bash
supabase status
```

If a migration is added:

```bash
supabase db reset
```

If global lint fails due pre-existing unrelated `.codex`, carousel, or hook issues, document that and provide targeted lint result.

---

## Manual smoke

### Without Gemini key

- Open `/dashboard/assistant`.
- Ask a question.
- Confirm a friendly setup message appears.
- Confirm no crash.

### With a newly rotated local Gemini key

- `school.admin@ofuq.local` asks: `كم عدد الطلاب؟`
- `parent.hassan@ofuq.local` asks: `ما آخر درجات ابني؟`
- `student.youssef@ofuq.local` asks: `ما آخر درجاتي؟`
- `teacher.arabic@ofuq.local` asks about finance and receives a scoped refusal.

Confirm:

- Responses are Arabic.
- No cross-role data leakage.
- Messages are saved in `ai_messages`.
- Conversation history reloads after refresh.

---

## Documentation updates

Update relevant docs:

```text
docs/project-status.md
docs/project-phases.md
docs/verification-report.md
docs/testing.md
docs/security-model.md
docs/database.md
docs/demo-readiness.md
```

Document:

- Gemini is server-side only.
- API key must be in environment only.
- Assistant is read-only.
- Context is role-scoped.
- No SQL/tools/function-calling in MVP.

---

## Acceptance criteria

Phase 25C is accepted when:

- `/dashboard/assistant` works with real assistant history.
- `/portal/assistant` works with real assistant history.
- Gemini call happens server-side only.
- No API key is committed.
- Missing key state is safe and user-friendly.
- Conversations persist in `ai_conversations` and `ai_messages`.
- Responses are Arabic simplified.
- Context is scoped by tenant/school/role.
- parent sees only linked children context.
- student sees only own context.
- teacher cannot access finance context.
- school_admin can ask school-level summaries.
- assistant refuses execution/write requests.
- no raw SQL generation/execution.
- build/test/targeted lint pass.

---

## Commit message

Use:

```text
feat: add gemini ai assistant mvp
```
