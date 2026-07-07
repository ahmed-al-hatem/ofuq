# Codex Execution Prompt — 09 Finance Basics Foundation

## Phase

`09 - Finance Basics Foundation`

## Goal

Build the basic finance foundation for Ofuq without implementing payment gateways, expenses, budgets, accounting ledgers, advanced reports, or PDF generation.

This phase adds the first finance vertical slice:

- fee structures
- fee items
- discount types
- student discounts
- invoices
- invoice items
- payments
- basic receipt/payment detail foundation

Keep this phase focused and server-validated.

---

## Read Before Editing

Before editing, inspect:

```txt
AGENTS.md
docs/architecture.md
docs/codex-workflow.md
docs/database.md
docs/project-phases.md
docs/project-status.md
docs/requirements-roadmap.md
docs/security-model.md
docs/supabase-local.md
supabase/config.toml
supabase/seed.sql
supabase/seeds/auth_smoke_token_defaults.sql
constants/routes.ts
config/navigation.ts
types/database.ts
types/students.ts
types/academic.ts
lib/auth/session.ts
lib/students/students.ts
lib/academic/context.ts
lib/academic/academic-structure.ts
app/(dashboard)/dashboard
```

Use the existing project structure. Do not introduce a parallel architecture.

---

## Current Project Context

The project already has:

1. Core auth, tenant, school, fixed roles, and memberships.
2. Students/admissions foundation.
3. Academic structure with years, terms, grade levels, classes, subjects, grade-level subjects, and class enrollments.
4. Attendance manual + QR foundation.
5. Grades/report cards foundation.
6. Manual timetable with conflict prevention.
7. Local smoke seed data for admin, teacher, tenant, school, academic year, class, subject, active student, and enrollment.

Phase 09 must build finance basics on top of students, academic years, classes, and enrollments.

---

## Local Seed Safety Rule

Prefer not to modify `supabase/seed.sql` in this phase.

If seed changes are necessary, keep them deterministic and local-only, and preserve the existing local auth smoke seed flow:

```toml
[db.seed]
enabled = true
sql_paths = ["./seed.sql", "./seeds/auth_smoke_token_defaults.sql"]
```

Rules:

1. Do not remove the post-seed defaults file from the seed list.
2. Do not move it before `./seed.sql`.
3. Do not delete or weaken the existing post-seed defaults file under `supabase/seeds/`.
4. Do not add production secrets or real user data to seed files.
5. After seed-related changes, run `supabase db reset` and verify local smoke login still works.
6. Update `docs/supabase-local.md` only if seed behavior changes.

---

## In Scope

Implement this finance vertical slice only:

```txt
fee_structures
fee_items
discount_types
student_discounts
invoices
invoice_items
payments
basic receipt/payment detail view
server-side finance calculations
server-side tenant/school/student/enrollment validation
finance routes/navigation
Arabic RTL dashboard pages
documentation updates
verification
```

---

## Out of Scope

Do not implement:

```txt
payment gateway integration
Stripe/PayPal/bank integration
online payment processing
bank reconciliation
expenses
budget categories
advanced financial reports
financial report builder
PDF invoice generation
PDF receipt generation
tax/VAT engine
accounting ledger
refund workflow beyond explicit deferral
parent payment portal
student/parent finance portal
notifications
external integrations
full RBAC
full RLS
```

---

## Database Migration

Create exactly one new migration:

```txt
supabase/migrations/<timestamp>_finance_basics_foundation.sql
```

Do not modify old migrations.

### Recommended Enums

Use lowercase values.

```txt
fee_structure_status: active, inactive, archived
fee_item_type: tuition, registration, transport, books, uniform, activity, exam, other
fee_item_status: active, inactive, archived
discount_value_type: percentage, fixed_amount
discount_status: active, inactive, archived
student_discount_status: active, inactive, expired, cancelled
invoice_status: draft, issued, partially_paid, paid, cancelled, void
payment_method: cash, bank_transfer, card, cheque, online, other
payment_status: pending, completed, cancelled, failed, refunded
```

Keep enum naming consistent with the current project style.

---

## Tables to Add

### 1. `fee_structures`

Purpose: represents a fee plan for a school, academic year, optional grade level, or optional class.

Fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
academic_year_id uuid not null references public.academic_years(id)
grade_level_id uuid null references public.grade_levels(id)
class_id uuid null references public.classes(id)
name text not null
description text null
currency_code text not null default 'USD'
status public.fee_structure_status not null default 'active'
created_by_user_id uuid null references public.user_profiles(id)
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- `tenant_id`, `school_id`, and `academic_year_id` are mandatory.
- If `class_id` is provided, validate that the class belongs to the same academic year and school.
- If `grade_level_id` is provided, validate same tenant/school.
- If both `grade_level_id` and `class_id` are present, validate they match.
- Keep currency simple. Do not implement exchange rates.

---

### 2. `fee_items`

Purpose: individual fee lines inside a fee structure.

Fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
fee_structure_id uuid not null references public.fee_structures(id)
name text not null
description text null
item_type public.fee_item_type not null default 'other'
amount numeric(12,2) not null
due_date date null
sort_order integer not null default 0
status public.fee_item_status not null default 'active'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- `amount >= 0`.
- Validate the fee structure belongs to the current tenant/school.
- Do not trust amount calculations from the browser.

---

### 3. `discount_types`

Purpose: reusable discount definitions.

Fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
name text not null
description text null
value_type public.discount_value_type not null
value numeric(12,2) not null
status public.discount_status not null default 'active'
created_by_user_id uuid null references public.user_profiles(id)
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- `percentage` values must be between 0 and 100.
- `fixed_amount` values must be greater than or equal to 0.
- Validate tenant/school server-side.

---

### 4. `student_discounts`

Purpose: assigns a discount to one student for an academic year and optional term.

Fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
student_id uuid not null references public.students(id)
discount_type_id uuid not null references public.discount_types(id)
academic_year_id uuid not null references public.academic_years(id)
term_id uuid null references public.terms(id)
starts_on date null
ends_on date null
status public.student_discount_status not null default 'active'
notes text null
created_by_user_id uuid null references public.user_profiles(id)
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- Student must belong to the same tenant/school and be active.
- Discount type must belong to the same tenant/school and be active.
- Academic year and term must belong to the same tenant/school.
- If both dates exist, `starts_on <= ends_on`.

---

### 5. `invoices`

Purpose: finance invoice for one student.

Fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
invoice_number text not null
student_id uuid not null references public.students(id)
academic_year_id uuid not null references public.academic_years(id)
term_id uuid null references public.terms(id)
class_enrollment_id uuid null references public.class_enrollments(id)
issue_date date not null default current_date
due_date date null
subtotal_amount numeric(12,2) not null default 0
discount_amount numeric(12,2) not null default 0
total_amount numeric(12,2) not null default 0
paid_amount numeric(12,2) not null default 0
balance_amount numeric(12,2) not null default 0
status public.invoice_status not null default 'draft'
notes text null
created_by_user_id uuid null references public.user_profiles(id)
issued_by_user_id uuid null references public.user_profiles(id)
issued_at timestamptz null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- `invoice_number` must be unique per tenant/school.
- Do not trust totals from the client.
- Calculate subtotal, discounts, total, paid, and balance server-side.
- Validate student belongs to tenant/school and is active.
- Resolve active class enrollment for the student/year when possible.
- Do not allow negative totals or balances.

---

### 6. `invoice_items`

Purpose: item lines belonging to an invoice.

Fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
invoice_id uuid not null references public.invoices(id)
fee_item_id uuid null references public.fee_items(id)
description text not null
quantity numeric(10,2) not null default 1
unit_amount numeric(12,2) not null default 0
discount_amount numeric(12,2) not null default 0
total_amount numeric(12,2) not null default 0
sort_order integer not null default 0
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- `quantity > 0`.
- `unit_amount >= 0`.
- `discount_amount >= 0`.
- `total_amount` should be calculated server-side as much as practical.
- Validate invoice and fee item tenant/school consistency.

---

### 7. `payments`

Purpose: manual payment record and receipt foundation.

Fields:

```txt
id uuid primary key
tenant_id uuid not null references public.tenants(id)
school_id uuid not null references public.schools(id)
invoice_id uuid not null references public.invoices(id)
student_id uuid not null references public.students(id)
amount numeric(12,2) not null
payment_method public.payment_method not null default 'cash'
payment_status public.payment_status not null default 'completed'
paid_at timestamptz not null default now()
reference_number text null
receipt_number text not null
received_by_user_id uuid null references public.user_profiles(id)
notes text null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Rules:

- `amount > 0`.
- `receipt_number` must be unique per tenant/school.
- Validate invoice and student belong to same tenant/school.
- For manual payments, default to `completed` unless UI provides another status intentionally.
- Do not integrate any real payment provider.
- Do not store card details or sensitive payment data.

---

## Finance Calculation Rules

Create a finance calculations helper, for example:

```txt
lib/finance/calculations.ts
```

Required calculations:

```txt
calculateInvoiceSubtotal
calculateInvoiceDiscounts
calculateInvoiceTotal
calculateInvoicePaidAmount
calculateInvoiceBalance
calculateInvoiceStatusAfterPayment
```

Core formulas:

```txt
subtotal_amount = sum(invoice_items.total_amount)
discount_amount = server-calculated discount total
total_amount = max(subtotal_amount - discount_amount, 0)
paid_amount = sum(completed payments)
balance_amount = max(total_amount - paid_amount, 0)
```

Invoice status rules:

```txt
if cancelled or void: keep that terminal status
if paid_amount <= 0: issued or draft based on current state
if paid_amount < total_amount: partially_paid
if paid_amount >= total_amount: paid
```

Payment rule:

- Do not allow overpayment in this phase.
- If payment amount exceeds current balance, reject it with an Arabic-friendly error.

---

## Authorization

Use fixed roles only.

Allowed to manage finance:

```txt
system_admin
school_admin
accountant
```

These roles can:

```txt
create fee structures
create fee items
create discount types
assign student discounts
generate invoices
issue invoices
record payments
view finance dashboard
```

Deferred or read-only later:

```txt
parent
student
```

Not allowed to manage finance:

```txt
teacher
librarian
```

Do not create RBAC tables.

---

## Server Context

Create:

```txt
lib/finance/context.ts
```

Implement:

```txt
requireFinanceContext(allowedRoles)
```

It must derive:

```txt
user_id
role
tenant_id
school_id
membership
```

from authenticated active membership.

Never trust `tenant_id`, `school_id`, `role`, totals, invoice status, or payment status from client input.

---

## Services

Create server-side services:

```txt
lib/finance/context.ts
lib/finance/fee-structures.ts
lib/finance/discounts.ts
lib/finance/invoices.ts
lib/finance/payments.ts
lib/finance/calculations.ts
```

Responsibilities:

### `fee-structures.ts`

- list fee structures
- create fee structure
- create fee item
- validate academic year/class/grade level scope

### `discounts.ts`

- list discount types
- create discount type
- assign discount to student
- validate active student and active discount

### `invoices.ts`

- list invoices
- load invoice detail
- generate invoice from fee structure
- issue invoice
- cancel invoice if simple
- recalculate invoice totals server-side

### `payments.ts`

- list payments
- load payment/receipt detail
- record manual payment
- update invoice paid/balance/status after payment

### `calculations.ts`

- pure calculation helpers where possible
- no direct client trust

---

## Server Actions

Create:

```txt
lib/actions/finance.ts
```

Actions:

```txt
createFeeStructureAction
createFeeItemAction
createDiscountTypeAction
assignStudentDiscountAction
generateInvoiceAction
issueInvoiceAction
recordPaymentAction
cancelInvoiceAction
```

Optional only if simple:

```txt
voidPaymentAction
```

Use Zod validation and Arabic user-facing messages.

All actions must:

- call `requireFinanceContext`
- validate allowed role
- derive tenant/school from membership
- validate all relationships server-side
- calculate all financial totals server-side
- prevent overpayment
- write audit logs for important events
- return the existing action result pattern if available

Audit events:

```txt
finance.fee_structure.created
finance.fee_item.created
finance.discount_type.created
finance.student_discount.assigned
finance.invoice.generated
finance.invoice.issued
finance.invoice.cancelled
finance.payment.recorded
```

Do not store secrets, card data, or sensitive payment data in audit metadata.

---

## Pages and UI

Add Arabic RTL pages under:

```txt
app/(dashboard)/dashboard/finance
```

Required pages:

```txt
/dashboard/finance
/dashboard/finance/fees
/dashboard/finance/discounts
/dashboard/finance/invoices
/dashboard/finance/invoices/new
/dashboard/finance/invoices/[invoiceId]
/dashboard/finance/payments
/dashboard/finance/payments/[paymentId]
```

### `/dashboard/finance`

Overview cards:

- issued invoices total
- paid total
- outstanding balance
- recent payments
- links to fees, discounts, invoices, and payments

### `/dashboard/finance/fees`

- list fee structures
- create fee structure form
- list fee items by structure if simple
- create fee item form

### `/dashboard/finance/discounts`

- list discount types
- create discount type form
- list student discounts
- assign discount to student form

### `/dashboard/finance/invoices`

- invoice list
- status badges
- student name
- invoice number
- total
- paid
- balance

### `/dashboard/finance/invoices/new`

Form fields:

```txt
student_id
academic_year_id
term_id optional
fee_structure_id
due_date optional
notes optional
```

Do not send or trust totals from this form.

### `/dashboard/finance/invoices/[invoiceId]`

- invoice details
- invoice items
- payment list
- record payment form
- issue/cancel actions if allowed

### `/dashboard/finance/payments`

- payment list
- receipt number
- invoice number
- student
- amount
- method
- paid date

### `/dashboard/finance/payments/[paymentId]`

Basic receipt view:

- receipt number
- student
- invoice number
- amount
- payment method
- paid date
- received by
- reference number

No PDF in this phase.

---

## Routes and Navigation

Update `constants/routes.ts` with finance routes.

Suggested route helpers:

```ts
finance: "/dashboard/finance",
financeFees: "/dashboard/finance/fees",
financeDiscounts: "/dashboard/finance/discounts",
financeInvoices: "/dashboard/finance/invoices",
newFinanceInvoice: "/dashboard/finance/invoices/new",
financeInvoiceDetails: (invoiceId: string) => `/dashboard/finance/invoices/${invoiceId}`,
financePayments: "/dashboard/finance/payments",
financePaymentDetails: (paymentId: string) => `/dashboard/finance/payments/${paymentId}`,
```

Update `config/navigation.ts`:

- Activate the finance item.
- Use Arabic label.
- Remove placeholder state only for finance.
- Do not activate communication, reports, library, health, integrations, or later modules.

---

## Local Smoke Seed Guidance

Prefer not to modify seed files in this phase.

If browser smoke testing needs finance demo data, prefer creating it through the UI/actions rather than seeding workflow outputs.

It is acceptable for finance tables to start empty after `supabase db reset`.

If seed changes are unavoidable:

- keep deterministic IDs
- keep data local-only
- preserve existing seed order
- verify local smoke login
- document the change

---

## Verification Requirements

Run after implementation:

```bash
git status
supabase status
supabase db reset
supabase gen types typescript --local > types/database.ts
npm run lint
npm run build
git diff --check
```

If `supabase db reset` fails, stop and report clearly.

If type generation produces invalid or empty schema, do not keep the generated diff.

Run SQL spot checks if possible:

```sql
select count(*) from public.fee_structures;
select count(*) from public.fee_items;
select count(*) from public.discount_types;
select count(*) from public.student_discounts;
select count(*) from public.invoices;
select count(*) from public.invoice_items;
select count(*) from public.payments;
```

Optional consistency checks:

```sql
select id, invoice_number
from public.invoices
where total_amount < 0
   or paid_amount < 0
   or balance_amount < 0;

select id, receipt_number
from public.payments
where amount <= 0;
```

---

## Manual Smoke Test Guidance

If browser access is available, test:

1. Login as local admin or accountant.
2. Open `/dashboard/finance`.
3. Create a fee structure.
4. Add a fee item.
5. Create a discount type.
6. Assign discount to the seeded active student.
7. Generate an invoice from the fee structure.
8. Verify invoice totals are calculated server-side.
9. Issue the invoice.
10. Record a partial payment.
11. Verify invoice becomes `partially_paid`.
12. Record remaining payment.
13. Verify invoice becomes `paid`.
14. Open the payment receipt/detail page.
15. Try overpayment and confirm it is blocked.

If browser/authenticated smoke testing is blocked, document it clearly.

Do not mark browser workflows as passed unless actually tested.

---

## Documentation Updates

Update these files:

```txt
docs/database.md
docs/project-phases.md
docs/requirements-roadmap.md
docs/project-status.md
docs/security-model.md
```

Update `docs/supabase-local.md` only if seed behavior changes.

Document:

- finance tables
- calculation rules
- role access rules
- deferred items
- verification results
- Go/No-Go for Phase 10 Communication and Ready-Made Reports

Do not overwrite unrelated documentation.

---

## Strict Do Not Do List

Do not:

- implement payment gateways
- implement online payment processing
- integrate Stripe, PayPal, banks, or external providers
- store card details
- implement expenses
- implement budgets
- implement accounting ledger
- implement tax/VAT engine
- implement advanced financial reports
- implement PDF invoices or receipts
- implement parent payment portal
- implement notifications
- implement communication module
- implement reports module
- implement full RBAC
- implement full RLS
- modify old migrations
- trust tenant_id or school_id from forms
- trust role from client input
- trust invoice totals from the browser
- trust payment status from the browser without server validation
- allow negative invoice totals
- allow negative or zero completed payment amounts
- allow overpayment in this phase
- add broad dependencies
- break existing local smoke seed behavior

---

## Expected Final Response

After implementation, respond with:

1. Summary of completed Phase 09 work.
2. Files created/modified.
3. Database objects added.
4. Finance calculation behavior.
5. Security and tenant validation summary.
6. Seed handling summary.
7. Verification command results.
8. Manual smoke status.
9. Skipped/deferred items.
10. TODOs.
11. Suggested next prompt:

```txt
10 - Communication and Ready-Made Reports Foundation
```

---

## Success Criteria

Phase 09 is successful when:

- Finance schema exists and replays from scratch.
- Fee structures and fee items can be created.
- Discount types and student discounts can be created.
- Invoices can be generated from fee structures.
- Invoice totals are calculated server-side.
- Payments can be recorded manually.
- Invoice paid/balance/status updates after payments.
- Overpayment is blocked.
- Basic receipt/payment detail view exists.
- All writes derive tenant/school/user/role from active membership.
- Finance routes compile.
- Arabic RTL UI exists for finance management.
- Supabase reset and type generation pass.
- `npm run lint` passes.
- `npm run build` passes.
