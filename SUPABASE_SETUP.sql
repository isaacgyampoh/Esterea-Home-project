-- Run this in your Supabase SQL editor
-- Go to: https://supabase.com/dashboard/project/tgdtjfquwbtvfsdnvvgm/sql/new

-- CUSTOMERS table
create table if not exists customers (
  id uuid default gen_random_uuid() primary key,
  phone text unique not null,
  name text,
  total_spent numeric default 0,
  purchase_count int default 0,
  last_purchase timestamptz,
  created_at timestamptz default now()
);
alter table customers enable row level security;
create policy "anon all customers" on customers for all using (true);

-- REFUNDS table
create table if not exists refunds (
  id uuid default gen_random_uuid() primary key,
  order_ref text not null,
  amount numeric not null,
  reason text,
  payment_method text default 'Cash',
  staff_name text,
  status text default 'Refunded',
  created_at timestamptz default now()
);
alter table refunds enable row level security;
create policy "anon all refunds" on refunds for all using (true);

-- STOCK ADJUSTMENTS table
create table if not exists stock_adjustments (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete set null,
  type text not null, -- 'restock', 'manual', 'sale'
  qty_before int not null default 0,
  qty_change int not null,
  qty_after int not null,
  cost_per_unit numeric,
  supplier text,
  notes text,
  created_at timestamptz default now()
);
alter table stock_adjustments enable row level security;
create policy "anon all stock_adjustments" on stock_adjustments for all using (true);

-- STAFF table
create table if not exists staff (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text,
  phone text,
  pin text,
  active boolean default true,
  created_at timestamptz default now()
);
alter table staff enable row level security;
create policy "anon all staff" on staff for all using (true);

-- Add discount column to sales if missing
alter table sales add column if not exists discount numeric default 0;
alter table sales add column if not exists notes text;

-- Add notes to expenses if missing
alter table expenses add column if not exists notes text;

-- decrement_stock function (if not exists)
create or replace function decrement_stock(product_id uuid, qty int)
returns void language plpgsql as $$
begin
  update products set quantity = greatest(0, quantity - qty) where id = product_id;
end;
$$;

-- generate_wa_order_no function (if not exists)
create or replace function generate_wa_order_no()
returns text language plpgsql as $$
declare
  result text;
begin
  result := 'EST-' || to_char(now(), 'YYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 4);
  return upper(result);
end;
$$;
