# Phase 25B - Internal Realtime Chat MVP

## Objective

Implement the first real internal chat MVP for Ofuq using the schema and UI foundation created in Phase 25A.

This phase turns `/dashboard/chat` and `/portal/chat` from scaffold/demo chat surfaces into a working internal chat flow backed by Supabase data and Supabase Realtime.

The MVP focuses on:

- Parent / student messaging the school administration.
- School admin reading and replying from the dashboard.
- Real database persistence.
- Basic read/unread state.
- Realtime message updates.
- Strict server-side tenant, school, user, and role scoping.

## Current Project Context

Ofuq is a full-stack Next.js App Router + Supabase school management system.

Important constraints:

- Arabic RTL UI.
- Multi-tenant is mandatory.
- Fixed roles are used instead of full RBAC.
- Server Components by default.
- Sensitive reads and all mutations must use server-side logic.
- Do not trust client-provided `tenant_id`, `school_id`, `user_id`, or `role`.
- RLS is deferred; server-side enforcement is required.
- Phase 25A already added chat/assistant UI foundation and schema foundation.
- Gemini AI assistant is not part of this phase.

## Related Phase 25A Work

Phase 25A added or prepared:

- `supabase/migrations/20260710120000_chat_ui_schema_foundation.sql`
- `chat_conversations`
- `chat_participants`
- `chat_messages`
- `chat_message_reads`
- `ai_conversations`
- `ai_messages`
- `types/chat.ts`
- `lib/chat/presenters.ts`
- `components/chat/*`
- `/dashboard/chat`
- `/dashboard/assistant`
- `/portal/chat`
- `/portal/assistant`

In Phase 25B, work only on internal chat. Assistant routes may remain as they are unless a route constant or navigation type needs a harmless adjustment.

## Hard Scope Rules

### In Scope

Implement:

- Real internal chat data loading.
- Parent/student school-office conversation creation or retrieval.
- Sending internal chat messages.
- Reading messages from the database.
- Basic unread counts.
- Mark conversation as read when opened.
- Supabase Realtime subscription for new messages in the active conversation.
- Dashboard chat page backed by database.
- Portal chat page backed by database.
- Server-side access helpers.
- Minimal tests for access/permission helpers if practical.
- Documentation updates.

### Out of Scope

Do not implement:

- Gemini API calls.
- `@google/genai` dependency.
- AI assistant behavior.
- API keys or `.env` key examples containing real secrets.
- Attachments.
- Group chat UX beyond the school-office model.
- Message deletion.
- Message editing.
- Browser push notifications.
- Email notifications.
- Advanced message search.
- RLS policies.
- Public `/chat` route.
- Floating chat widget.
- New authentication or redirect logic.

## Security Rules

All chat access must be enforced server-side.

Never accept these from the client as trusted values:

- `tenant_id`
- `school_id`
- `sender_user_id`
- `sender_role`
- `participant_user_ids`
- `role`
- `membership_id`

Allowed client inputs should be limited to:

- `conversationId` when needed.
- `body` for message text.

Every server action/query must derive the current context from:

- `getAuthenticatedUser()` for dashboard users.
- `requirePortalContext()` or an equivalent portal-safe helper for portal users.

All database queries must be scoped by:

- `tenant_id`
- `school_id`
- authenticated user / allowed participant rules.

Realtime is only a UX enhancement. It must not be treated as the source of authorization.

## Preferred Conversation Model

Use a school-office conversation model for MVP.

For portal users:

- A parent or student talks to "إدارة المدرسة".
- The actual responding side is represented by school admins of the same school.
- Parent/student should not choose a specific admin user in MVP.

For dashboard users:

- `school_admin` can see and reply to school-office conversations in the same school.
- Other staff roles should not see parent/student school-office conversations in this phase unless the existing schema/prompt implementation made an explicit safe participant model.

Recommended conversation type:

- `school_office`

If the existing migration uses a different enum/name, reuse it and document the mapping.

## Role Rules

### `school_admin`

Allowed:

- View school-office conversations for current school.
- Read messages.
- Send replies.
- Mark conversations as read.
- See unread counts.

### `parent`

Allowed:

- View only their own school-office conversation(s).
- Send messages to school administration.
- Read replies.
- Mark own conversation as read.

### `student`

Allowed:

- View only their own school-office conversation(s).
- Send messages to school administration.
- Read replies.
- Mark own conversation as read.

### `teacher`

For this MVP:

- Do not expose parent/student school-office conversations to teachers.
- If `/dashboard/chat` is visible to teachers, show a safe empty/coming-soon state or an internal-admin-only notice.

### `accountant` and `librarian`

For this MVP:

- Do not expose parent/student school-office conversations.
- Show a safe empty/coming-soon state if they can reach `/dashboard/chat`.

### `system_admin`

For this MVP:

- Do not bypass tenant/school scoping.
- Prefer a safe empty/scoped notice unless the user has a concrete active school context.

## Database Work

Start by inspecting the existing Phase 25A migration:

- `supabase/migrations/20260710120000_chat_ui_schema_foundation.sql`

Use the existing tables if sufficient:

- `chat_conversations`
- `chat_participants`
- `chat_messages`
- `chat_message_reads`

Avoid a new migration unless necessary.

If a new migration is required, create:

```text
supabase/migrations/20260710130000_internal_realtime_chat_mvp.sql
```

Only add minimal missing indexes, constraints, or columns required for MVP.

Do not modify old migrations unless the project convention already allows it and the DB has not been deployed. Prefer additive migrations.

## Realtime Requirements

Enable Realtime usage for the active conversation UI.

Implementation options:

- Use the existing Supabase browser client if available.
- Subscribe to `chat_messages` changes for the current `conversation_id`.
- When a new message is inserted, append/refetch safely.

Required behavior:

- Parent sends message; admin page receives update if open.
- Admin replies; portal page receives update if open.
- Realtime subscription must clean up on unmount.
- If Realtime fails, the page should still work after reload.

Do not expose sensitive filtering logic only in the client. The initial and authoritative data load must remain server-side.

## Server Code Structure

Create or update the following as appropriate:

```text
lib/chat/access.ts
lib/chat/queries.ts
lib/chat/actions.ts
lib/chat/presenters.ts
```

Optional if useful:

```text
lib/chat/realtime.ts
lib/chat/validation.ts
components/chat/realtime-chat-thread.tsx
```

### `lib/chat/access.ts`

Responsibilities:

- Resolve current chat actor.
- Determine role capabilities.
- Verify access to conversation.
- Verify send permission.
- Centralize tenant/school scoping.

Suggested exports:

```ts
getDashboardChatContext()
getPortalChatContext()
canViewConversation(context, conversation)
canSendMessage(context, conversation)
assertConversationAccess(context, conversationId)
```

Adapt names to existing conventions.

### `lib/chat/queries.ts`

Responsibilities:

- List dashboard conversations for school admin.
- List portal conversations for parent/student.
- Get active conversation with messages.
- Calculate unread counts.
- Ensure school-office conversation exists for portal user.

Suggested exports:

```ts
getDashboardChatPageData()
getPortalChatPageData()
getConversationMessages()
getConversationUnreadCounts()
ensureSchoolOfficeConversationForPortalUser()
```

### `lib/chat/actions.ts`

Responsibilities:

- Server Actions for sending messages.
- Server Actions for mark-as-read.
- Validate body and conversation id.
- Revalidate the relevant routes after mutation.

Suggested actions:

```ts
sendInternalChatMessage(previousState, formData)
markInternalConversationAsRead(conversationId)
```

Use Zod validation if the project already uses Zod in server actions.

Message body rules:

- trim input.
- minimum 1 character.
- maximum 2000 or 3000 characters.
- reject empty messages.

## UI Requirements

Use existing Phase 25A chat components and shadcn/base components.

The repo already has `message` and `message-scroller` according to Phase 25A. Reuse them; do not reinstall unless missing.

If missing, install:

```bash
npx shadcn@latest add message
npx shadcn@latest add message-scroller
```

Then customize to Ofuq style:

- RTL Arabic-first.
- Clean school SaaS look.
- Use Ofuq brand tokens.
- Mobile responsive layout.
- Different visual treatment for own messages and received messages.
- Clear empty states.
- Clear disabled/pending send state.
- Timestamp display.
- Unread badge in sidebar.

### Dashboard Chat UI

`/dashboard/chat` should include:

- Page title: `المحادثات الداخلية`
- Conversation sidebar.
- School-office conversation list.
- Unread badge per conversation.
- Active conversation thread.
- Message composer for allowed roles.
- Safe empty state for roles that cannot use school-office chat in MVP.

### Portal Chat UI

`/portal/chat` should include:

- Page title: `مراسلة المدرسة`
- Simpler layout than dashboard.
- Conversation with `إدارة المدرسة`.
- Message thread.
- Message composer.
- Small note that replies are handled by school administration.

## Navigation

Keep existing Phase 25A route entries.

Validate:

- `constants/routes.ts`
- `config/navigation.ts`
- `config/portal-navigation.ts`
- `lib/navigation/role-navigation.ts`

Do not add floating button.

If navigation badge is simple and safe, add unread badge support. If it requires broad refactoring, defer it and keep unread indicators inside the chat page.

## Seed / Demo Data

Prefer no new seed data in this phase unless needed for verification.

The MVP should be able to create a conversation on first message.

If adding seed data is necessary, follow these rules:

- Keep seed order intact.
- Do not move `auth_smoke_token_defaults.sql`; it must remain last in `supabase/config.toml`.
- Do not reintroduce old monolithic demo seed files.
- Do not create a relation and use it in the same seed file if that has caused issues previously.
- Keep demo data minimal.

## Testing Requirements

Run at minimum:

```bash
npm run build
git diff --check
```

Because this phase includes DB and access logic, also run when practical:

```bash
npm run test
```

Run targeted ESLint on touched files, for example:

```bash
npx eslint lib/chat components/chat app/\(dashboard\)/dashboard/chat app/\(portal\)/portal/chat types/chat.ts
```

If global lint fails due existing unrelated `.codex` or old UI/hook issues, document that and include targeted lint results.

Supabase checks:

```bash
supabase status
```

If a migration or seed changed:

```bash
supabase db reset
```

If Docker/Supabase local is unavailable, document the exact reason.

## Manual Smoke Checklist

Required smoke scenarios:

1. Login as `parent.hassan@ofuq.local`.
2. Open `/portal/chat`.
3. Send a message to school administration.
4. Login as `school.admin@ofuq.local`.
5. Open `/dashboard/chat`.
6. See the parent conversation.
7. Reply as school admin.
8. Login/open as parent again.
9. See the admin reply.
10. Confirm parent cannot see conversations that do not belong to them.

Additional recommended smoke:

- Login as `student.youssef@ofuq.local`.
- Send a message from `/portal/chat`.
- Confirm school admin can see and reply.
- Confirm teacher/accountant/librarian do not see parent/student school-office conversations.
- Confirm unread badge changes after opening conversation.
- Confirm Realtime update works with two browser sessions.

## Documentation Updates

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

Document clearly:

- Phase 25B implemented internal realtime chat MVP.
- Gemini remains Phase 25C.
- No API keys were committed.
- No attachments.
- No RLS.
- Realtime is a UX enhancement, not an authorization layer.
- Server-side scoping is the active security model.

## Acceptance Criteria

Phase 25B is complete only when:

- `/portal/chat` loads real chat data for parent/student.
- Portal user can send a message to school administration.
- `/dashboard/chat` loads real school-office conversations for school admin.
- School admin can reply.
- Messages persist in `chat_messages`.
- Conversations persist in `chat_conversations`.
- Participants are represented in `chat_participants`.
- Read/unread state is represented through `chat_message_reads` or existing schema equivalent.
- Unread badge works at least inside the chat page.
- Realtime updates the active thread.
- Access is scoped by tenant and school server-side.
- Parent/student cannot access another user conversation.
- Staff roles that are out-of-scope do not see parent/student conversations.
- No Gemini implementation exists.
- No real API key exists in repo.
- Build passes.
- Diff check passes.
- Supabase reset passes if migration/seed changed.
- Docs are updated.

## Suggested Commit Message

```text
feat: add internal realtime chat mvp
```

## Final Report Format

When finished, report:

```markdown
## Implementation
- Changed files:
- Schema changes:
- Actions/helpers added:
- Routes updated:
- Realtime behavior:
- Security/scoping confirmation:

## Verification
- npm run build:
- git diff --check:
- npm run test:
- targeted lint:
- supabase status:
- supabase db reset, if applicable:
- manual smoke:

## Out of Scope Confirmation
- No Gemini:
- No API keys:
- No attachments:
- No RLS:
- No auth redirect changes:

## Commit
- <commit hash>

## Go/No-Go
- Go or No-Go for Phase 25C
```
