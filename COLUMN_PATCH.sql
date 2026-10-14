-- ════════════════════════════════════════════════════════════════
-- ESTEREA — COLUMN PATCH
-- Fixes "Could not find the 'subtotal' column of 'sales'" and any other
-- missing columns on tables that already existed before the rebuild.
-- Safe to run anytime — only adds columns that are missing.
-- Run in: https://supabase.com/dashboard/project/tgdtjfquwbtvfsdnvvgm/sql/new
-- ════════════════════════════════════════════════════════════════

-- SALES — ensure every column the POS writes exists
alter table sales add column if not exists receipt_no     text;
alter table sales add column if not exists date           timestamptz default now();
alter table sales add column if not exists items          jsonb default '[]';
alter table sales add column if not exists subtotal       numeric default 0;
alter table sales add column if not exists discount       numeric default 0;
alter table sales add column if not exists total          numeric default 0;
alter table sales add column if not exists profit         numeric default 0;
alter table sales add column if not exists payment        text default 'Cash';
alter table sales add column if not exists customer_name  text;
alter table sales add column if not exists customer_phone text;
alter table sales add column if not exists staff_id       uuid;
alter table sales add column if not exists staff_name     text;
alter table sales add column if not exists voided         boolean default false;
alter table sales add column if not exists created_at     timestamptz default now();

-- PRODUCTS
alter table products add column if not exists cost_price        numeric default 0;
alter table products add column if not exists wholesale_price   numeric default 0;
alter table products add column if not exists wholesale_min_qty int default 0;
alter table products add column if not exists visible           boolean default true;
alter table products add column if not exists description       text default '';
alter table products add column if not exists image             text default '';

-- PROMOS
alter table promos add column if not exists label text default '';

-- EXPENSES
alter table expenses add column if not exists notes text;
alter table expenses add column if not exists category text;

-- REFUNDS
alter table refunds add column if not exists order_ref  text;
alter table refunds add column if not exists method     text default 'Cash';
alter table refunds add column if not exists reason     text;
alter table refunds add column if not exists staff_id   uuid;
alter table refunds add column if not exists staff_name text;

-- STAFF
alter table staff add column if not exists pin    text;
alter table staff add column if not exists active boolean default true;
alter table staff add column if not exists role   text default 'Staff';

-- STOCK ADJUSTMENTS
alter table stock_adjustments add column if not exists delta  int default 0;
alter table stock_adjustments add column if not exists reason text;

-- WHATSAPP ORDERS — ensure every column the storefront checkout writes exists.
-- whatsapp_orders is created with "create table if not exists", so a table that
-- pre-dated the rebuild keeps its OLD columns and the checkout insert fails with
-- "Could not find the '<col>' column of 'whatsapp_orders'".
alter table whatsapp_orders add column if not exists order_no       text;
alter table whatsapp_orders add column if not exists date           timestamptz default now();
alter table whatsapp_orders add column if not exists customer_name  text;
alter table whatsapp_orders add column if not exists customer_phone text;
alter table whatsapp_orders add column if not exists items          jsonb default '[]';
alter table whatsapp_orders add column if not exists subtotal       numeric default 0;
alter table whatsapp_orders add column if not exists delivery_fee   numeric default 0;
alter table whatsapp_orders add column if not exists total          numeric default 0;
alter table whatsapp_orders add column if not exists address        text;
alter table whatsapp_orders add column if not exists notes          text;
alter table whatsapp_orders add column if not exists status         text default 'Pending';
alter table whatsapp_orders add column if not exists paystack_ref   text;
alter table whatsapp_orders add column if not exists paid_at        timestamptz;
alter table whatsapp_orders add column if not exists created_at     timestamptz default now();
