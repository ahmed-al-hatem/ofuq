create extension if not exists "pgcrypto";

do $$
begin
  create type public.complaint_category as enum (
    'academic',
    'behavior',
    'finance',
    'transport',
    'facility',
    'communication',
    'staff',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.complaint_priority as enum (
    'low',
    'medium',
    'high',
    'urgent'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.complaint_status as enum (
    'submitted',
    'in_review',
    'resolved',
    'rejected',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.complaint_update_type as enum (
    'comment',
    'status_change',
    'assignment',
    'resolution',
    'internal_note'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.survey_target_type as enum (
    'school',
    'role',
    'grade_level',
    'class'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.survey_status as enum (
    'draft',
    'published',
    'closed',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.survey_question_type as enum (
    'short_text',
    'long_text',
    'single_choice',
    'multiple_choice',
    'rating',
    'yes_no'
  );
exception
  when duplicate_object then null;
end $$;

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  submitted_by_user_id uuid not null references public.user_profiles(id) on delete restrict,
  student_id uuid references public.students(id) on delete set null,
  assigned_to_user_id uuid references public.user_profiles(id) on delete set null,
  category public.complaint_category not null default 'other',
  priority public.complaint_priority not null default 'medium',
  title text not null,
  description text not null,
  status public.complaint_status not null default 'submitted',
  submitted_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by_user_id uuid references public.user_profiles(id) on delete set null,
  resolution_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint complaints_title_not_blank_chk
    check (btrim(title) <> ''),
  constraint complaints_description_not_blank_chk
    check (btrim(description) <> ''),
  constraint complaints_resolution_summary_not_blank_chk
    check (resolution_summary is null or btrim(resolution_summary) <> ''),
  constraint complaints_resolved_state_chk
    check (
      status not in ('resolved', 'rejected')
      or (
        resolved_at is not null
        and resolved_by_user_id is not null
        and resolution_summary is not null
      )
    ),
  constraint complaints_resolution_fields_state_chk
    check (
      (resolved_at is null and resolved_by_user_id is null and resolution_summary is null)
      or status in ('resolved', 'rejected')
    )
);

create index complaints_tenant_school_idx
  on public.complaints (tenant_id, school_id);
create index complaints_submitted_by_user_id_idx
  on public.complaints (submitted_by_user_id);
create index complaints_student_id_idx
  on public.complaints (student_id)
  where student_id is not null;
create index complaints_assigned_to_user_id_idx
  on public.complaints (assigned_to_user_id)
  where assigned_to_user_id is not null;
create index complaints_category_idx
  on public.complaints (category);
create index complaints_priority_idx
  on public.complaints (priority);
create index complaints_status_idx
  on public.complaints (status);
create index complaints_submitted_at_idx
  on public.complaints (submitted_at desc);

create table public.complaint_updates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  author_user_id uuid not null references public.user_profiles(id) on delete restrict,
  update_type public.complaint_update_type not null default 'comment',
  body text not null,
  old_status public.complaint_status,
  new_status public.complaint_status,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint complaint_updates_body_not_blank_chk
    check (btrim(body) <> ''),
  constraint complaint_updates_status_change_chk
    check (
      (
        update_type in ('status_change', 'resolution')
        and old_status is not null
        and new_status is not null
        and old_status <> new_status
      )
      or (
        update_type not in ('status_change', 'resolution')
        and old_status is null
        and new_status is null
      )
    )
);

create index complaint_updates_tenant_school_idx
  on public.complaint_updates (tenant_id, school_id);
create index complaint_updates_complaint_id_idx
  on public.complaint_updates (complaint_id);
create index complaint_updates_author_user_id_idx
  on public.complaint_updates (author_user_id);
create index complaint_updates_update_type_idx
  on public.complaint_updates (update_type);
create index complaint_updates_created_at_idx
  on public.complaint_updates (created_at desc);

create table public.surveys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  title text not null,
  description text,
  target_type public.survey_target_type not null default 'school',
  target_role public.user_role,
  grade_level_id uuid references public.grade_levels(id) on delete set null,
  class_id uuid references public.classes(id) on delete set null,
  status public.survey_status not null default 'draft',
  opens_at timestamptz,
  closes_at timestamptz,
  created_by_user_id uuid not null references public.user_profiles(id) on delete restrict,
  published_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint surveys_title_not_blank_chk
    check (btrim(title) <> ''),
  constraint surveys_description_not_blank_chk
    check (description is null or btrim(description) <> ''),
  constraint surveys_target_chk
    check (
      (target_type = 'school' and target_role is null and grade_level_id is null and class_id is null)
      or (target_type = 'role' and target_role is not null and grade_level_id is null and class_id is null)
      or (target_type = 'grade_level' and target_role is null and grade_level_id is not null and class_id is null)
      or (target_type = 'class' and target_role is null and grade_level_id is null and class_id is not null)
    ),
  constraint surveys_time_order_chk
    check (
      closes_at is null
      or opens_at is null
      or closes_at > opens_at
    ),
  constraint surveys_published_time_order_chk
    check (
      closes_at is null
      or published_at is null
      or closes_at > published_at
    ),
  constraint surveys_status_state_chk
    check (
      (status = 'draft' and published_at is null and closed_at is null)
      or (status = 'published' and published_at is not null and closed_at is null)
      or (status = 'closed' and published_at is not null and closed_at is not null)
      or (status = 'archived')
    )
);

create index surveys_tenant_school_idx
  on public.surveys (tenant_id, school_id);
create index surveys_target_type_idx
  on public.surveys (target_type);
create index surveys_target_role_idx
  on public.surveys (target_role)
  where target_role is not null;
create index surveys_grade_level_id_idx
  on public.surveys (grade_level_id)
  where grade_level_id is not null;
create index surveys_class_id_idx
  on public.surveys (class_id)
  where class_id is not null;
create index surveys_status_idx
  on public.surveys (status);
create index surveys_published_at_idx
  on public.surveys (published_at desc)
  where published_at is not null;
create index surveys_closes_at_idx
  on public.surveys (closes_at)
  where closes_at is not null;

create table public.survey_questions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  survey_id uuid not null references public.surveys(id) on delete cascade,
  question_text text not null,
  question_type public.survey_question_type not null default 'short_text',
  options jsonb,
  is_required boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint survey_questions_question_text_not_blank_chk
    check (btrim(question_text) <> ''),
  constraint survey_questions_sort_order_chk
    check (sort_order >= 0),
  constraint survey_questions_options_json_chk
    check (options is null or jsonb_typeof(options) in ('array', 'object')),
  constraint survey_questions_options_required_chk
    check (
      (
        question_type in ('short_text', 'long_text', 'yes_no')
        and options is null
      )
      or (
        question_type in ('single_choice', 'multiple_choice')
        and options is not null
        and jsonb_typeof(options) = 'array'
        and jsonb_array_length(options) > 0
      )
      or (
        question_type = 'rating'
        and options is not null
        and jsonb_typeof(options) = 'object'
      )
    )
);

create index survey_questions_tenant_school_idx
  on public.survey_questions (tenant_id, school_id);
create index survey_questions_survey_id_idx
  on public.survey_questions (survey_id);
create index survey_questions_sort_order_idx
  on public.survey_questions (survey_id, sort_order);

create table public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  survey_id uuid not null references public.surveys(id) on delete cascade,
  respondent_user_id uuid not null references public.user_profiles(id) on delete restrict,
  student_id uuid references public.students(id) on delete set null,
  answers jsonb not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint survey_responses_answers_object_chk
    check (jsonb_typeof(answers) = 'object'),
  constraint survey_responses_survey_respondent_key
    unique (survey_id, respondent_user_id)
);

create index survey_responses_tenant_school_idx
  on public.survey_responses (tenant_id, school_id);
create index survey_responses_survey_id_idx
  on public.survey_responses (survey_id);
create index survey_responses_respondent_user_id_idx
  on public.survey_responses (respondent_user_id);
create index survey_responses_submitted_at_idx
  on public.survey_responses (submitted_at desc);

drop trigger if exists set_complaints_updated_at on public.complaints;
create trigger set_complaints_updated_at
before update on public.complaints
for each row execute function public.set_updated_at();

drop trigger if exists set_complaint_updates_updated_at on public.complaint_updates;
create trigger set_complaint_updates_updated_at
before update on public.complaint_updates
for each row execute function public.set_updated_at();

drop trigger if exists set_surveys_updated_at on public.surveys;
create trigger set_surveys_updated_at
before update on public.surveys
for each row execute function public.set_updated_at();

drop trigger if exists set_survey_questions_updated_at on public.survey_questions;
create trigger set_survey_questions_updated_at
before update on public.survey_questions
for each row execute function public.set_updated_at();

drop trigger if exists set_survey_responses_updated_at on public.survey_responses;
create trigger set_survey_responses_updated_at
before update on public.survey_responses
for each row execute function public.set_updated_at();
