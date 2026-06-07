-- GoLa Handcrafted admin schema for Supabase (PostgreSQL)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

create extension if not exists "pgcrypto";

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

-- Storage bucket for section images (create in Dashboard > Storage if SQL insert fails)
insert into storage.buckets (id, name, public)
values ('section-images', 'section-images', true)
on conflict (id) do nothing;

-- Optional: disable RLS for service-role-only access from Next.js server routes
alter table public.content_sections enable row level security;
alter table public.inquiries enable row level security;
