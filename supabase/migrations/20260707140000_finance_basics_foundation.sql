create extension if not exists "pgcrypto";

do $$
begin
  create type public.fee_structure_status as enum (
    'active',
    'inactive',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.fee_item_type as enum (
    'tuition',
    'registration',
    'transport',
    'books',
    'uniform',
    'activity',
    'exam',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.fee_item_status as enum (
    'active',
    'inactive',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.discount_value_type as enum (
    'percentage',
    'fixed_amount'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.discount_status as enum (
    'active',
    'inactive',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.student_discount_status as enum (
    'active',
    'inactive',
    'expired',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.invoice_status as enum (
    'draft',
    'issued',
    'partially_paid',
    'paid',
    'cancelled',
    'void'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_method as enum (
    'cash',
    'bank_transfer',
    'card',
    'cheque',
    'online',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum (
    'pending',
    'completed',
    'cancelled',
    'failed',
    'refunded'
  );
exception
  when duplicate_object then null;
end $$;

create table public.fee_structures (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  grade_level_id uuid references public.grade_levels(id) on delete set null,
  class_id uuid references public.classes(id) on delete set null,
  name text not null,
  description text,
  currency_code text not null default 'USD',
  status public.fee_structure_status not null default 'active',
  created_by_user_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fee_structures_name_not_blank_chk check (btrim(name) <> ''),
  constraint fee_structures_currency_code_chk check (currency_code ~ '^[A-Z]{3}$'),
  constraint fee_structures_tenant_school_year_name_key
    unique (tenant_id, school_id, academic_year_id, name)
);

create index fee_structures_tenant_school_idx
  on public.fee_structures (tenant_id, school_id);
create index fee_structures_academic_year_id_idx
  on public.fee_structures (academic_year_id);
create index fee_structures_grade_level_id_idx
  on public.fee_structures (grade_level_id)
  where grade_level_id is not null;
create index fee_structures_class_id_idx
  on public.fee_structures (class_id)
  where class_id is not null;
create index fee_structures_status_idx on public.fee_structures (status);

create table public.fee_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  fee_structure_id uuid not null references public.fee_structures(id) on delete cascade,
  name text not null,
  description text,
  item_type public.fee_item_type not null default 'other',
  amount numeric(12,2) not null,
  due_date date,
  sort_order integer not null default 0,
  status public.fee_item_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fee_items_name_not_blank_chk check (btrim(name) <> ''),
  constraint fee_items_amount_non_negative_chk check (amount >= 0)
);

create index fee_items_tenant_school_idx on public.fee_items (tenant_id, school_id);
create index fee_items_fee_structure_id_idx on public.fee_items (fee_structure_id);
create index fee_items_item_type_idx on public.fee_items (item_type);
create index fee_items_status_idx on public.fee_items (status);
create index fee_items_sort_order_idx on public.fee_items (sort_order);

create table public.discount_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  description text,
  value_type public.discount_value_type not null,
  value numeric(12,2) not null,
  status public.discount_status not null default 'active',
  created_by_user_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint discount_types_name_not_blank_chk check (btrim(name) <> ''),
  constraint discount_types_value_chk check (
    (value_type = 'percentage' and value >= 0 and value <= 100)
    or (value_type = 'fixed_amount' and value >= 0)
  ),
  constraint discount_types_tenant_school_name_key unique (tenant_id, school_id, name)
);

create index discount_types_tenant_school_idx
  on public.discount_types (tenant_id, school_id);
create index discount_types_status_idx on public.discount_types (status);
create index discount_types_value_type_idx on public.discount_types (value_type);

create table public.student_discounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  discount_type_id uuid not null references public.discount_types(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  term_id uuid references public.terms(id) on delete set null,
  starts_on date,
  ends_on date,
  status public.student_discount_status not null default 'active',
  notes text,
  created_by_user_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_discounts_date_order_chk
    check (starts_on is null or ends_on is null or starts_on <= ends_on)
);

create index student_discounts_tenant_school_idx
  on public.student_discounts (tenant_id, school_id);
create index student_discounts_student_id_idx on public.student_discounts (student_id);
create index student_discounts_discount_type_id_idx
  on public.student_discounts (discount_type_id);
create index student_discounts_academic_year_id_idx
  on public.student_discounts (academic_year_id);
create index student_discounts_term_id_idx on public.student_discounts (term_id)
  where term_id is not null;
create index student_discounts_status_idx on public.student_discounts (status);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  invoice_number text not null,
  student_id uuid not null references public.students(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  term_id uuid references public.terms(id) on delete set null,
  class_enrollment_id uuid references public.class_enrollments(id) on delete set null,
  issue_date date not null default current_date,
  due_date date,
  subtotal_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  balance_amount numeric(12,2) not null default 0,
  status public.invoice_status not null default 'draft',
  notes text,
  created_by_user_id uuid references public.user_profiles(id) on delete set null,
  issued_by_user_id uuid references public.user_profiles(id) on delete set null,
  issued_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_invoice_number_not_blank_chk check (btrim(invoice_number) <> ''),
  constraint invoices_amounts_non_negative_chk check (
    subtotal_amount >= 0
    and discount_amount >= 0
    and total_amount >= 0
    and paid_amount >= 0
    and balance_amount >= 0
  ),
  constraint invoices_tenant_school_invoice_number_key
    unique (tenant_id, school_id, invoice_number)
);

create index invoices_tenant_school_idx on public.invoices (tenant_id, school_id);
create index invoices_student_id_idx on public.invoices (student_id);
create index invoices_academic_year_id_idx on public.invoices (academic_year_id);
create index invoices_term_id_idx on public.invoices (term_id)
  where term_id is not null;
create index invoices_class_enrollment_id_idx on public.invoices (class_enrollment_id)
  where class_enrollment_id is not null;
create index invoices_status_idx on public.invoices (status);
create index invoices_issue_date_idx on public.invoices (issue_date desc);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  fee_item_id uuid references public.fee_items(id) on delete set null,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoice_items_description_not_blank_chk check (btrim(description) <> ''),
  constraint invoice_items_quantity_positive_chk check (quantity > 0),
  constraint invoice_items_amounts_non_negative_chk check (
    unit_amount >= 0
    and discount_amount >= 0
    and total_amount >= 0
  )
);

create index invoice_items_tenant_school_idx
  on public.invoice_items (tenant_id, school_id);
create index invoice_items_invoice_id_idx on public.invoice_items (invoice_id);
create index invoice_items_fee_item_id_idx on public.invoice_items (fee_item_id)
  where fee_item_id is not null;
create index invoice_items_sort_order_idx on public.invoice_items (sort_order);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  amount numeric(12,2) not null,
  payment_method public.payment_method not null default 'cash',
  payment_status public.payment_status not null default 'completed',
  paid_at timestamptz not null default now(),
  reference_number text,
  receipt_number text not null,
  received_by_user_id uuid references public.user_profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amount_positive_chk check (amount > 0),
  constraint payments_receipt_number_not_blank_chk check (btrim(receipt_number) <> ''),
  constraint payments_tenant_school_receipt_number_key
    unique (tenant_id, school_id, receipt_number)
);

create index payments_tenant_school_idx on public.payments (tenant_id, school_id);
create index payments_invoice_id_idx on public.payments (invoice_id);
create index payments_student_id_idx on public.payments (student_id);
create index payments_payment_status_idx on public.payments (payment_status);
create index payments_paid_at_idx on public.payments (paid_at desc);

drop trigger if exists set_fee_structures_updated_at on public.fee_structures;
create trigger set_fee_structures_updated_at
before update on public.fee_structures
for each row execute function public.set_updated_at();

drop trigger if exists set_fee_items_updated_at on public.fee_items;
create trigger set_fee_items_updated_at
before update on public.fee_items
for each row execute function public.set_updated_at();

drop trigger if exists set_discount_types_updated_at on public.discount_types;
create trigger set_discount_types_updated_at
before update on public.discount_types
for each row execute function public.set_updated_at();

drop trigger if exists set_student_discounts_updated_at on public.student_discounts;
create trigger set_student_discounts_updated_at
before update on public.student_discounts
for each row execute function public.set_updated_at();

drop trigger if exists set_invoices_updated_at on public.invoices;
create trigger set_invoices_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

drop trigger if exists set_invoice_items_updated_at on public.invoice_items;
create trigger set_invoice_items_updated_at
before update on public.invoice_items
for each row execute function public.set_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();
