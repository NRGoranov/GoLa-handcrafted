-- GoLa Handcrafted — paste all of this into Supabase SQL Editor (safe to re-run)
-- Uses the same Supabase project as NRG Portfolio wishlist.

create extension if not exists "pgcrypto";

-- Homepage sections (admin CMS)
create table if not exists public.content_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  layout text not null check (layout in ('split-left', 'split-right', 'centered', 'full-bleed', 'text-only')),
  sort_order integer not null default 0,
  published boolean not null default false,
  eyebrow_en text not null default '',
  eyebrow_bg text not null default '',
  title_en text not null default '',
  title_bg text not null default '',
  description_en text not null default '',
  description_bg text not null default '',
  body_en text not null default '',
  body_bg text not null default '',
  bullets text[] null,
  image_url text null,
  image_alt_en text not null default '',
  image_alt_bg text not null default '',
  cta_label_en text not null default '',
  cta_label_bg text not null default '',
  cta_href text null,
  highlight_title_en text not null default '',
  highlight_title_bg text not null default '',
  highlight_body_en text not null default '',
  highlight_body_bg text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Inquiry form submissions
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  contact_method text not null,
  inquiry_type text not null,
  inquiry_type_label text not null,
  message text not null,
  location text null,
  preferred_size text null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'closed')),
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

create index if not exists content_sections_sort_idx on public.content_sections (sort_order);
create index if not exists inquiries_created_idx on public.inquiries (created_at desc);

-- Site visit analytics
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

-- Storage bucket for admin image uploads (or create "section-images" in Dashboard → Storage)
insert into storage.buckets (id, name, public)
values ('section-images', 'section-images', true)
on conflict (id) do nothing;

-- Server-only access via SUPABASE_SECRET_KEY in Next.js API routes
alter table public.content_sections disable row level security;
alter table public.inquiries disable row level security;
alter table public.site_visit_stats disable row level security;
alter table public.site_visit_daily disable row level security;

grant usage on schema public to service_role;

grant select, insert, update, delete on table public.content_sections to service_role;
grant select, insert, update, delete on table public.inquiries to service_role;
grant select, insert, update, delete on table public.site_visit_stats to service_role;
grant select, insert, update, delete on table public.site_visit_daily to service_role;

grant execute on function public.increment_site_visit() to service_role;
