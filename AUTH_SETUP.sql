-- ════════════════════════════════════════════════════════════
-- ESTEREA — Auth & Roles setup
-- Run this in Supabase SQL editor:
-- https://supabase.com/dashboard/project/tgdtjfquwbtvfsdnvvgm/sql/new
-- ════════════════════════════════════════════════════════════

-- 1) Settings table (stores the admin password, and future app settings)
create table if not exists settings (
  key   text primary key,
  value text
);
alter table settings enable row level security;
drop policy if exists "settings anon all" on settings;
create policy "settings anon all" on settings for all using (true) with check (true);

-- seed the default admin password (only if not already set)
insert into settings (key, value)
values ('admin_password', 'esterea2026')
on conflict (key) do nothing;

-- 2) Staff: add pin + active + role (if missing)
alter table staff add column if not exists pin    text;
alter table staff add column if not exists active boolean default true;
alter table staff add column if not exists role   text default 'Staff';

-- 3) Sales: record which staff made the sale
alter table sales add column if not exists staff_id   uuid;
alter table sales add column if not exists staff_name text;

-- 4) Refunds: record which staff issued it
alter table refunds add column if not exists staff_id   uuid;
alter table refunds add column if not exists staff_name text;
