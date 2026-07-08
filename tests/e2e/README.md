# Browser Smoke / E2E

This directory contains the small local Playwright browser smoke foundation for
Phase 17.

## Coverage

- login page render and demo-user authentication
- admin dashboard entry smoke
- parent portal route smoke
- student portal route smoke
- read-only portal guard checks
- dashboard navigation absence inside portal pages
- obvious runtime error text guards

## Local accounts

- `school.admin@ofuq.local`
- `teacher.arabic@ofuq.local`
- `parent.hassan@ofuq.local`
- `student.youssef@ofuq.local`

Password fallback:

- `E2E_PASSWORD`
- default local fallback: `OfuqLocal123!`

## Commands

```bash
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui
```

Chromium may need a one-time local install:

```bash
npx playwright install chromium
```

The suite is intentionally small and local-only. It does not cover CRUD,
payments, complaint submission, survey flows, or hosted CI execution.
