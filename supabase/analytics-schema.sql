-- GoLa site visit counter — paste into Supabase SQL Editor (safe to re-run)

create table if not exists public.site_visit_stats (
  id text primary key default 'global',
  total_visits bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_visit_daily (
  visit_date date primary key,
  visit_count integer not null default 0
);

insert into public.site_visit_stats (id, total_visits)
values ('global', 0)
on conflict (id) do nothing;

create or replace function public.increment_site_visit()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := (timezone('utc', now()))::date;
begin
  insert into public.site_visit_stats (id, total_visits, updated_at)
  values ('global', 1, now())
  on conflict (id) do update
    set total_visits = public.site_visit_stats.total_visits + 1,
        updated_at = now();

  insert into public.site_visit_daily (visit_date, visit_count)
  values (today, 1)
  on conflict (visit_date) do update
    set visit_count = public.site_visit_daily.visit_count + 1;
end;
$$;

alter table public.site_visit_stats disable row level security;
alter table public.site_visit_daily disable row level security;

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.site_visit_stats to service_role;
grant select, insert, update, delete on table public.site_visit_daily to service_role;
grant execute on function public.increment_site_visit() to service_role;
