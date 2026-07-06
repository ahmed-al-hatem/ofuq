# Codex Workflow

## Working style

- Inspect before editing.
- Keep each task to one vertical slice.
- Avoid unrelated refactors.
- Prefer server-side code for mutations and sensitive reads.
- Verify the result with the relevant checks after changes.

## Good prompt shape

- One module or one route group at a time.
- Clear success criteria.
- Mention whether the task is UI, server, database, or docs work.

## Delivery expectations

- Keep changes scoped.
- Preserve working configuration.
- Commit only after a slice is complete and verified when requested.
- Report any blocked dependencies or missing environment values directly.
