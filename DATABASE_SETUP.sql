-- ════════════════════════════════════════════════════════════════
-- ESTEREA HOME — MASTER SETUP  (safe to run anytime, as many times as
-- you like — it only creates what's missing).
-- Run the whole thing in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/tgdtjfquwbtvfsdnvvgm/sql/new
-- ════════════════════════════════════════════════════════════════

-- ─── CORE TABLES ───
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text default '',
  price numeric default 0,
  cost_price numeric default 0,
  quantity int default 0,
  image text default '',
  description text default '',
  visible boolean default true,
  wholesale_price numeric default 0,
  wholesale_min_qty int default 0,
  created_at timestamptz default now()
);

create table if not exists promos (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  name text default '',
  label text default '',
  price numeric not null,
  start_date timestamptz default now(),
  end_date timestamptz not null,
  created_at timestamptz default now()
);
alter table promos add column if not exists label text default '';

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  receipt_no text,
  date timestamptz default now(),
  items jsonb default '[]',
  subtotal numeric default 0,
  discount numeric default 0,
  total numeric default 0,
  profit numeric default 0,
  payment text default 'Cash',
  customer_name text,
  customer_phone text,
  staff_id uuid,
  staff_name text,
  voided boolean default false,
  created_at timestamptz default now()
);
alter table sales add column if not exists receipt_no text;
alter table sales add column if not exists date timestamptz default now();
alter table sales add column if not exists items jsonb default '[]';
alter table sales add column if not exists subtotal numeric default 0;
alter table sales add column if not exists total numeric default 0;
alter table sales add column if not exists profit numeric default 0;
alter table sales add column if not exists payment text default 'Cash';
alter table sales add column if not exists customer_name text;
alter table sales add column if not exists customer_phone text;
alter table sales add column if not exists staff_id uuid;
alter table sales add column if not exists staff_name text;
alter table sales add column if not exists discount numeric default 0;
alter table sales add column if not exists voided boolean default false;

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  category text,
  amount numeric default 0,
  date date default current_date,
  notes text,
  created_at timestamptz default now()
);
alter table expenses add column if not exists notes text;

create table if not exists whatsapp_orders (
  id uuid primary key default gen_random_uuid(),
  order_no text,
  date timestamptz default now(),
  customer_name text,
  customer_phone text,
  items jsonb default '[]',
  subtotal numeric default 0,
  delivery_fee numeric default 0,
  total numeric default 0,
  address text,
  notes text,
  status text default 'Pending',
  paystack_ref text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- ─── BUSINESS TABLES ───
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists refunds (
  id uuid primary key default gen_random_uuid(),
  order_ref text,
  amount numeric default 0,
  method text default 'Cash',
  reason text,
  date date default current_date,
  staff_id uuid,
  staff_name text,
  created_at timestamptz default now()
);
alter table refunds add column if not exists staff_id uuid;
alter table refunds add column if not exists staff_name text;

create table if not exists stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  delta int default 0,
  reason text,
  created_at timestamptz default now()
);

create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text default 'Staff',
  phone text,
  pin text,
  active boolean default true,
  created_at timestamptz default now()
);
alter table staff add column if not exists pin text;
alter table staff add column if not exists active boolean default true;
alter table staff add column if not exists role text default 'Staff';

-- ─── AUTH / SETTINGS ───
create table if not exists settings (key text primary key, value text);
insert into settings (key, value) values ('admin_password', 'esterea2026')
  on conflict (key) do nothing;

-- ─── SERVICES ───
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price_from numeric,
  image text,
  icon text,
  visible boolean default true,
  sort int default 0,
  created_at timestamptz default now()
);

create table if not exists service_bookings (
  id uuid primary key default gen_random_uuid(),
  service_title text,
  name text not null,
  phone text not null,
  message text,
  status text default 'New',
  created_at timestamptz default now()
);

insert into services (title, description, price_from, sort)
select * from (values
  ('Interior Styling Consultation', 'A sit-down with our stylist to plan the look and feel of your space, with a tailored décor list.', 200::numeric, 1),
  ('Full Room Makeover', 'End-to-end décor setup for a room — sourcing, arranging, and styling everything for you.', 1500::numeric, 2),
  ('Event & Festive Décor', 'Christmas, weddings, parties — we dress your space for the occasion and pack it down after.', 800::numeric, 3),
  ('Home Staging', 'Make a property show-ready for sale or rent with curated furnishings and styling.', 1200::numeric, 4)
) as v(title, description, price_from, sort)
where not exists (select 1 from services);

-- ─── ROW LEVEL SECURITY (anon full access — matches the app's anon key) ───
do $$
declare t text;
begin
  foreach t in array array[
    'products','promos','sales','expenses','whatsapp_orders','customers',
    'refunds','stock_adjustments','staff','settings','services','service_bookings'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "%s anon all" on %I', t, t);
    execute format('create policy "%s anon all" on %I for all using (true) with check (true)', t, t);
  end loop;
end $$;

-- ─── HELPER FUNCTIONS ───
create or replace function generate_wa_order_no()
returns text language plpgsql as $$
begin
  return upper('EST-' || to_char(now(),'YYMMDD') || '-' || substr(gen_random_uuid()::text,1,4));
end; $$;
