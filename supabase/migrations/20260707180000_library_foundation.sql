create extension if not exists "pgcrypto";

do $$
begin
  create type public.book_catalog_status as enum (
    'active',
    'inactive',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.book_copy_status as enum (
    'available',
    'loaned',
    'reserved',
    'lost',
    'damaged',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.book_copy_condition as enum (
    'new',
    'good',
    'fair',
    'poor',
    'damaged'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.book_loan_status as enum (
    'active',
    'returned',
    'overdue',
    'lost',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

create table public.book_catalog (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  isbn text,
  title text not null,
  subtitle text,
  author text,
  publisher text,
  publication_year integer,
  category text,
  language text default 'ar',
  description text,
  cover_image_url text,
  status public.book_catalog_status not null default 'active',
  created_by_user_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint book_catalog_title_not_blank_chk check (btrim(title) <> ''),
  constraint book_catalog_isbn_not_blank_chk check (isbn is null or btrim(isbn) <> ''),
  constraint book_catalog_publication_year_chk check (
    publication_year is null
    or (publication_year >= 1000 and publication_year <= 2100)
  )
);

create index book_catalog_tenant_school_idx
  on public.book_catalog (tenant_id, school_id);
create index book_catalog_status_idx on public.book_catalog (status);
create index book_catalog_title_idx on public.book_catalog (title);
create index book_catalog_author_idx on public.book_catalog (author)
  where author is not null;
create index book_catalog_category_idx on public.book_catalog (category)
  where category is not null;
create unique index book_catalog_tenant_school_isbn_key
  on public.book_catalog (tenant_id, school_id, isbn)
  where isbn is not null;

create table public.book_copies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  catalog_id uuid not null references public.book_catalog(id) on delete restrict,
  barcode text,
  accession_number text,
  shelf_location text,
  condition public.book_copy_condition not null default 'good',
  status public.book_copy_status not null default 'available',
  notes text,
  created_by_user_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint book_copies_barcode_not_blank_chk check (barcode is null or btrim(barcode) <> ''),
  constraint book_copies_accession_number_not_blank_chk
    check (accession_number is null or btrim(accession_number) <> '')
);

create index book_copies_tenant_school_idx
  on public.book_copies (tenant_id, school_id);
create index book_copies_catalog_id_idx on public.book_copies (catalog_id);
create index book_copies_status_idx on public.book_copies (status);
create index book_copies_condition_idx on public.book_copies (condition);
create unique index book_copies_tenant_school_barcode_key
  on public.book_copies (tenant_id, school_id, barcode)
  where barcode is not null;
create unique index book_copies_tenant_school_accession_number_key
  on public.book_copies (tenant_id, school_id, accession_number)
  where accession_number is not null;

create table public.book_loans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  copy_id uuid not null references public.book_copies(id) on delete restrict,
  catalog_id uuid not null references public.book_catalog(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,
  issued_by_user_id uuid not null references public.user_profiles(id) on delete restrict,
  returned_by_user_id uuid references public.user_profiles(id) on delete set null,
  borrowed_at timestamptz not null default now(),
  due_at timestamptz not null,
  returned_at timestamptz,
  status public.book_loan_status not null default 'active',
  notes text,
  return_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint book_loans_due_after_borrowed_chk check (due_at > borrowed_at),
  constraint book_loans_returned_state_chk check (
    (status = 'returned' and returned_at is not null and returned_by_user_id is not null)
    or (status <> 'returned')
  )
);

create index book_loans_tenant_school_idx
  on public.book_loans (tenant_id, school_id);
create index book_loans_copy_id_idx on public.book_loans (copy_id);
create index book_loans_catalog_id_idx on public.book_loans (catalog_id);
create index book_loans_student_id_idx on public.book_loans (student_id);
create index book_loans_status_idx on public.book_loans (status);
create index book_loans_due_at_idx on public.book_loans (due_at);
create unique index book_loans_one_active_per_copy_key
  on public.book_loans (copy_id)
  where status = 'active';

drop trigger if exists set_book_catalog_updated_at on public.book_catalog;
create trigger set_book_catalog_updated_at
before update on public.book_catalog
for each row execute function public.set_updated_at();

drop trigger if exists set_book_copies_updated_at on public.book_copies;
create trigger set_book_copies_updated_at
before update on public.book_copies
for each row execute function public.set_updated_at();

drop trigger if exists set_book_loans_updated_at on public.book_loans;
create trigger set_book_loans_updated_at
before update on public.book_loans
for each row execute function public.set_updated_at();
