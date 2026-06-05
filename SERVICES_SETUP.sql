-- ════════════════════════════════════════════════════════════
-- ESTEREA — Interior Services setup
-- Run in Supabase SQL editor:
-- https://supabase.com/dashboard/project/tgdtjfquwbtvfsdnvvgm/sql/new
-- ════════════════════════════════════════════════════════════

-- 1) Services offered (managed in admin like products)
create table if not exists services (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  price_from  numeric,            -- "from GH₵ X" (optional)
  image       text,
  icon        text,               -- optional icon name
  visible     boolean default true,
  sort        int default 0,
  created_at  timestamptz default now()
);
alter table services enable row level security;
drop policy if exists "services anon all" on services;
create policy "services anon all" on services for all using (true) with check (true);

-- 2) Service booking requests (from the storefront form)
create table if not exists service_bookings (
  id            uuid primary key default gen_random_uuid(),
  service_title text,
  name          text not null,
  phone         text not null,
  message       text,
  status        text default 'New',     -- New / Contacted / Scheduled / Done / Cancelled
  created_at    timestamptz default now()
);
alter table service_bookings enable row level security;
drop policy if exists "bookings anon all" on service_bookings;
create policy "bookings anon all" on service_bookings for all using (true) with check (true);

-- 3) Seed a few starter services (edit these in admin)
insert into services (title, description, price_from, sort) values
  ('Interior Styling Consultation', 'A sit-down with our stylist to plan the look and feel of your space, with a tailored décor list.', 200, 1),
  ('Full Room Makeover', 'End-to-end décor setup for a room — sourcing, arranging, and styling everything for you.', 1500, 2),
  ('Event & Festive Décor', 'Christmas, weddings, parties — we dress your space for the occasion and pack it down after.', 800, 3),
  ('Home Staging', 'Make a property show-ready for sale or rent with curated furnishings and styling.', 1200, 4)
on conflict do nothing;
