-- Lessons and students schema with RLS
-- Run this in the Supabase SQL editor.

create table if not exists public.students (
  id bigserial primary key,
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  hourly_rate numeric not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id bigserial primary key,
  user_id uuid not null references auth.users on delete cascade,
  student_name text not null,
  hourly_rate numeric not null,
  duration numeric not null,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_students_user_id on public.students(user_id);
create index if not exists idx_lessons_user_id on public.lessons(user_id);
create index if not exists idx_lessons_date on public.lessons(date);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
before update on public.students
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_lessons_updated_at on public.lessons;
create trigger trg_lessons_updated_at
before update on public.lessons
for each row execute procedure public.set_updated_at();

alter table public.students enable row level security;
alter table public.lessons enable row level security;

-- Policies: user can only access own rows
drop policy if exists students_select on public.students;
create policy students_select on public.students
  for select using (auth.uid() = user_id);

drop policy if exists students_insert on public.students;
create policy students_insert on public.students
  for insert with check (auth.uid() = user_id);

drop policy if exists students_update on public.students;
create policy students_update on public.students
  for update using (auth.uid() = user_id);

drop policy if exists students_delete on public.students;
create policy students_delete on public.students
  for delete using (auth.uid() = user_id);

drop policy if exists lessons_select on public.lessons;
create policy lessons_select on public.lessons
  for select using (auth.uid() = user_id);

drop policy if exists lessons_insert on public.lessons;
create policy lessons_insert on public.lessons
  for insert with check (auth.uid() = user_id);

drop policy if exists lessons_update on public.lessons;
create policy lessons_update on public.lessons
  for update using (auth.uid() = user_id);

drop policy if exists lessons_delete on public.lessons;
create policy lessons_delete on public.lessons
  for delete using (auth.uid() = user_id);
