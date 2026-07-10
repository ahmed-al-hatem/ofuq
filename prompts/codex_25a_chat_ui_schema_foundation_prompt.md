# Phase 25A - Chat UI & Schema Foundation

## Purpose

Implement the first safe foundation for chat in Ofuq. This phase prepares the database schema, routes, shared UI components, and professional Arabic RTL chat screens for both internal chat and the future Gemini assistant.

This phase is a foundation phase, not the full messaging/AI implementation.

## Context

Ofuq is a full-stack Arabic-first, RTL, multi-tenant school management system built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui/Base UI patterns, Supabase, fixed roles, and server-side authorization.

Current project rules still apply:

- Keep Multi-tenant scoping through tenant_id and school_id.
- Keep fixed roles: system_admin, school_admin, teacher, parent, student, accountant, librarian.
- Do not trust tenant_id, school_id, user_id, role, participant ids, or conversation ids from the client.
- Use Server Components by default.
- Use Server Actions or server-side services only for sensitive reads/writes.
- RLS is still deferred; enforce access server-side.
- Arabic RTL UI is required.
- Use the Ofuq palette and existing shared components.

## Critical secret handling

A Gemini API key was discussed outside the repository. Treat it as exposed and do not write it into any file.

Do not commit API keys, secrets, or raw environment values.

Use these variable names only as placeholders:

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.1-flash-lite
GEMINI_FALLBACK_MODEL=gemini-2.5-flash-lite
```

Add documentation that the user must create or rotate a Gemini API key locally and place it in `.env.local`. Never add the key to prompts, docs, migrations, seeds, or source code.

## Phase decision

Phase 25A is only:

- Chat UI components.
- Chat page scaffolds.
- Database schema foundation for internal chat and AI conversation history.
- Navigation entries if needed.
- Empty states and safe placeholders.
- No real Gemini call.
- No real realtime subscription yet.
- No full internal-chat send/read flow yet.

The next phases will be:

- Phase 25B - Internal Realtime Chat MVP.
- Phase 25C - Gemini AI Assistant MVP.

## In scope

1. Add shadcn chat base components:

```bash
npx shadcn@latest add message
npx shadcn@latest add message-scroller
```

2. Customize the added components to fit Ofuq:

- Arabic RTL.
- Professional dashboard/portal styling.
- Message bubbles aligned for current user vs other participant.
- AI assistant message style prepared but not wired to Gemini.
- Mobile-first layout.
- Accessible labels.
- Clean empty states.
- Use existing Card/Button/Input/Badge/Separator where appropriate.

3. Add schema foundation through a new Supabase migration:

Internal chat tables:

- chat_conversations
- chat_participants
- chat_messages
- chat_message_reads

AI assistant tables:

- ai_conversations
- ai_messages

4. Add minimal TypeScript types/helpers for chat UI and safe access planning.

5. Add route scaffolds:

- /dashboard/chat
- /portal/chat
- /dashboard/assistant
- /portal/assistant

6. Add role-aware navigation entries if the current navigation system requires it.

7. Add professional Arabic copy explaining:

- Internal chat is being prepared.
- Realtime messaging will be activated in Phase 25B.
- Assistant is being prepared.
- Gemini will be activated in Phase 25C.

8. Update docs:

- docs/project-status.md
- docs/project-phases.md
- docs/verification-report.md
- docs/testing.md
- docs/demo-readiness.md if relevant
- docs/security-model.md if schema/security notes are needed
- docs/database.md if database table inventory is maintained there

## Out of scope

Do not implement the following in Phase 25A:

- No Gemini API call.
- No @google/genai package installation yet unless strictly needed for type-free documentation; prefer not installing in 25A.
- No Supabase Realtime subscription.
- No actual send message Server Action.
- No mark-as-read write flow.
- No attachments.
- No file upload.
- No notification delivery.
- No push notifications.
- No AI context builder.
- No free SQL query from AI.
- No OAuth or auth changes.
- No role redirect changes.
- No RLS implementation.
- No seed changes unless a very small non-auth demo placeholder is absolutely necessary. Prefer no seed changes.

## Schema requirements

Create one migration file with a timestamped name similar to:

```text
supabase/migrations/YYYYMMDDHHMMSS_chat_ui_schema_foundation.sql
```

### chat_conversations

Recommended columns:

- id uuid primary key default gen_random_uuid()
- tenant_id uuid not null references tenants(id) on delete cascade
- school_id uuid not null references schools(id) on delete cascade
- type text not null default 'internal'
- subject text not null
- status text not null default 'open'
- created_by uuid not null references users(id)
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
- last_message_at timestamptz null
- metadata jsonb not null default '{}'::jsonb

Recommended constraints:

- type in ('internal') for now.
- status in ('open', 'closed', 'archived').
- subject length reasonable.

Recommended indexes:

- tenant_id, school_id
- school_id, status, updated_at desc
- created_by
- last_message_at desc

### chat_participants

Recommended columns:

- id uuid primary key default gen_random_uuid()
- tenant_id uuid not null references tenants(id) on delete cascade
- school_id uuid not null references schools(id) on delete cascade
- conversation_id uuid not null references chat_conversations(id) on delete cascade
- user_id uuid not null references users(id) on delete cascade
- role text not null
- joined_at timestamptz not null default now()
- last_read_at timestamptz null
- is_muted boolean not null default false
- metadata jsonb not null default '{}'::jsonb

Recommended constraints:

- unique(conversation_id, user_id)
- role in fixed user roles or participant roles if existing constants require mapping.

Recommended indexes:

- user_id, school_id
- conversation_id
- tenant_id, school_id

### chat_messages

Recommended columns:

- id uuid primary key default gen_random_uuid()
- tenant_id uuid not null references tenants(id) on delete cascade
- school_id uuid not null references schools(id) on delete cascade
- conversation_id uuid not null references chat_conversations(id) on delete cascade
- sender_user_id uuid not null references users(id)
- body text not null
- message_type text not null default 'text'
- created_at timestamptz not null default now()
- edited_at timestamptz null
- deleted_at timestamptz null
- metadata jsonb not null default '{}'::jsonb

Recommended constraints:

- message_type in ('text', 'system')
- body length > 0 and within a reasonable max length, for example <= 4000.

Recommended indexes:

- conversation_id, created_at asc
- sender_user_id
- tenant_id, school_id, created_at desc

### chat_message_reads

Recommended columns:

- id uuid primary key default gen_random_uuid()
- tenant_id uuid not null references tenants(id) on delete cascade
- school_id uuid not null references schools(id) on delete cascade
- message_id uuid not null references chat_messages(id) on delete cascade
- user_id uuid not null references users(id) on delete cascade
- read_at timestamptz not null default now()

Recommended constraints:

- unique(message_id, user_id)

Recommended indexes:

- user_id, read_at desc
- message_id

### ai_conversations

Recommended columns:

- id uuid primary key default gen_random_uuid()
- tenant_id uuid not null references tenants(id) on delete cascade
- school_id uuid not null references schools(id) on delete cascade
- user_id uuid not null references users(id) on delete cascade
- role text not null
- title text not null default 'محادثة جديدة'
- scope text not null default 'role_scoped'
- status text not null default 'active'
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
- metadata jsonb not null default '{}'::jsonb

Recommended constraints:

- scope in ('role_scoped')
- status in ('active', 'archived')

Recommended indexes:

- user_id, updated_at desc
- tenant_id, school_id

### ai_messages

Recommended columns:

- id uuid primary key default gen_random_uuid()
- tenant_id uuid not null references tenants(id) on delete cascade
- school_id uuid not null references schools(id) on delete cascade
- conversation_id uuid not null references ai_conversations(id) on delete cascade
- role text not null
- content text not null
- model text null
- token_estimate integer null
- created_at timestamptz not null default now()
- metadata jsonb not null default '{}'::jsonb

Recommended constraints:

- role in ('user', 'assistant', 'system')
- content length > 0 and <= 8000.

Recommended indexes:

- conversation_id, created_at asc
- tenant_id, school_id, created_at desc

## Migration safety

- Do not enable RLS in this phase unless project docs explicitly indicate it is now allowed. Current project state defers RLS.
- Use server-side access enforcement in future implementation phases.
- Keep tenant_id and school_id on all tables.
- Add comments to clarify that access is enforced in application services until RLS phase.
- Do not touch existing seed order in supabase/config.toml.
- Do not modify auth smoke token seed files.

## UI requirements

### Shared chat UI

Create reusable components under:

```text
components/chat/
```

Suggested components:

- chat-layout.tsx
- chat-sidebar.tsx
- chat-thread.tsx
- chat-message-list.tsx
- chat-message-bubble.tsx
- chat-composer.tsx
- chat-empty-state.tsx
- assistant-thread.tsx
- assistant-prompt-panel.tsx

Use the shadcn `message` and `message-scroller` components as the base where possible. If generated paths differ, adapt imports consistently.

### /dashboard/chat

Should show a staff-oriented internal chat scaffold:

- PageHeader title: المحادثات الداخلية
- Description: متابعة رسائل أولياء الأمور والطلاب ضمن المدرسة الحالية.
- Conversation list area.
- Thread area.
- Empty state if no conversations.
- Composer may be disabled or marked as “سيتم التفعيل في Phase 25B”.
- No actual send action in 25A.

### /portal/chat

Should show a parent/student-oriented chat scaffold:

- PageHeader title: مراسلة المدرسة
- Description: تواصل مباشر مع إدارة المدرسة ضمن حسابك.
- Simpler layout than dashboard.
- Empty state and disabled composer or clear placeholder.
- No actual send action in 25A.

### /dashboard/assistant

Should show staff assistant scaffold:

- PageHeader title: مساعد أُفُق
- Description: مساعد ذكي لقراءة ملخصات المدرسة حسب الصلاحيات.
- Suggested prompt cards, for example:
  - كم عدد الطلاب؟
  - ما ملخص الحضور هذا الأسبوع؟
  - ما الفواتير غير المسددة؟
- Composer disabled or UI-only placeholder.
- Clear copy: سيتم ربط Gemini في Phase 25C.

### /portal/assistant

Should show parent/student assistant scaffold:

- PageHeader title: مساعد أُفُق
- Description: اسأل عن الحضور والدرجات والمالية ضمن بياناتك المسموح بها.
- Suggested prompt cards:
  - ما آخر درجاتي؟
  - ما حضور هذا الأسبوع؟
  - هل توجد فواتير غير مدفوعة؟
- No real Gemini call in 25A.

## Navigation

Add links only if the existing navigation architecture requires it.

Recommended labels:

Dashboard:

- المحادثات
- مساعد أُفُق

Portal:

- المراسلة
- مساعد أُفُق

Keep role filtering consistent with existing navigation patterns.

Do not expose dashboard links to portal users.
Do not expose portal links to staff users except through existing allowed portal routes.

## Gemini planning notes for docs only

Document that Phase 25C will use server-side Gemini calls only.

The expected future package is:

```bash
npm install @google/genai
```

Expected future environment variables:

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.1-flash-lite
GEMINI_FALLBACK_MODEL=gemini-2.5-flash-lite
```

Do not install or wire Gemini in Phase 25A unless explicitly required. Prefer documentation only.

## Security rules for future AI phase

Add or document these rules clearly:

- Gemini must never receive raw unrestricted database access.
- Gemini must never receive SQL execution ability.
- Gemini must receive a scoped summary created by server-side role-based context builders.
- Parent sees only linked children.
- Student sees only self data.
- Teacher sees only assigned classes/subjects where implemented.
- Accountant sees finance context only.
- Librarian sees library context only.
- School admin sees school-level summary only for the active school.

## Documentation updates

Update docs with concise notes, not long essays.

Required:

- docs/project-status.md
- docs/project-phases.md
- docs/verification-report.md
- docs/testing.md

Conditional:

- docs/database.md if it tracks tables.
- docs/security-model.md if it tracks access rules.
- docs/demo-readiness.md if demo route map should mention chat/assistant as upcoming/foundation.

Document:

- Phase 25A added chat UI/schema foundation.
- Internal realtime messaging is Phase 25B.
- Gemini assistant is Phase 25C.
- No API keys were committed.
- No Gemini API calls were added.
- No realtime subscriptions were added.
- No message sending logic was added.

## Testing budget

Because this phase includes a database migration, use a higher verification budget than visual-only phases.

Required:

```bash
npm run build
git diff --check
```

Required if TS/TSX touched:

```bash
npm run lint
```

If global lint fails due known pre-existing files, run targeted ESLint on touched files and document the blocker.

Recommended for schema changes if Supabase local is available:

```bash
supabase db reset
```

If db reset is too expensive or Docker is unavailable, document the reason and at minimum inspect the migration for syntax and relationship consistency.

Run tests only if existing unit tests are affected:

```bash
npm run test
```

Manual smoke:

- /dashboard/chat opens for an allowed staff user.
- /portal/chat opens for parent/student.
- /dashboard/assistant opens for an allowed staff user.
- /portal/assistant opens for parent/student.
- No send action is active in 25A.
- No Gemini request is made.
- Portal pages do not show dashboard links.

Do not run full Playwright/E2E unless routing breaks.

## Skills requirement

The final report must include:

```text
Skills used:
- shadcn: used for message/message-scroller and chat UI primitives.
- ui-ux-pro-max: used for professional Arabic RTL chat/assistant layout and role-specific UX.
- migrate-radix-to-base: not needed because no Radix imports were found.
```

If Radix imports are touched, use `migrate-radix-to-base` and document it.

## Acceptance criteria

- `npx shadcn@latest add message` was run or the component was added according to current shadcn CLI behavior.
- `npx shadcn@latest add message-scroller` was run or the component was added according to current shadcn CLI behavior.
- New chat schema migration exists.
- All chat and AI tables include tenant_id and school_id.
- No API keys committed.
- /dashboard/chat exists.
- /portal/chat exists.
- /dashboard/assistant exists.
- /portal/assistant exists.
- Pages are Arabic RTL and professionally styled.
- UI clearly says that realtime/Gemini are upcoming phases.
- No real Gemini call exists.
- No actual internal message send action exists.
- No schema seed order was changed.
- Documentation updated.
- Build passed.
- diff-check passed.
- lint or targeted lint documented.
- Supabase migration verification documented.

## Commit message

Use:

```text
feat: add chat ui schema foundation
```

## Final report format

Return a concise implementation report with:

- Changed files.
- Migration name.
- shadcn components added.
- Routes added.
- Schema summary.
- Security/scoping confirmation.
- Verification results.
- Skills used.
- Commit hash if committed.
- Go/No-Go for Phase 25B.
