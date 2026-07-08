set search_path = public;

alter table public.students
add column if not exists student_user_id uuid references public.user_profiles(id) on delete set null;

create unique index if not exists students_student_user_id_unique_idx
on public.students(student_user_id)
where student_user_id is not null;

create index if not exists students_student_user_id_idx
on public.students(student_user_id)
where student_user_id is not null;

create index if not exists students_tenant_school_student_user_id_idx
on public.students(tenant_id, school_id, student_user_id)
where student_user_id is not null;
