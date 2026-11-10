-- Product popup facts (add, edit, hide, remove) editable from the admin panel.
-- Safe to run more than once.
alter table public.products add column if not exists details jsonb null;
