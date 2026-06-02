-- ESTEREA HOME — Full Database Schema
-- Run in Supabase SQL Editor

-- Products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(10,2) DEFAULT 0,
  quantity INT DEFAULT 0,
  image TEXT DEFAULT '',
  description TEXT DEFAULT '',
  visible BOOLEAN DEFAULT true,
  wholesale_price DECIMAL(10,2) DEFAULT 0,
  wholesale_min_qty INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Promos
CREATE TABLE promos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- WhatsApp / Web Orders
CREATE TABLE whatsapp_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_no TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT now(),
  customer_name TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  items JSONB DEFAULT '[]',
  subtotal DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  address TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'Pending',
  ussd_code INT,
  paystack_ref TEXT DEFAULT '',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  -- Delivery tracking
  dispatch_method TEXT DEFAULT '',
  dispatch_rider TEXT DEFAULT '',
  dispatch_contact TEXT DEFAULT '',
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  delivery_notes TEXT DEFAULT '',
  qr_code TEXT DEFAULT ''
);

-- POS Sales
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TIMESTAMPTZ DEFAULT now(),
  items JSONB DEFAULT '[]',
  total DECIMAL(10,2) DEFAULT 0,
  profit DECIMAL(10,2) DEFAULT 0,
  payment TEXT DEFAULT 'Cash',
  customer_name TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  receipt_no TEXT DEFAULT '',
  voided BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Expenses
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TIMESTAMPTZ DEFAULT now(),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  category TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- USSD Sessions
CREATE TABLE ussd_sessions (
  session_id TEXT PRIMARY KEY,
  order_code TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  step TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Generate order number function
CREATE OR REPLACE FUNCTION generate_wa_order_no()
RETURNS TEXT AS $$
DECLARE
  new_no TEXT;
  prefix TEXT := 'WEB-';
BEGIN
  new_no := prefix || upper(to_hex(extract(epoch from now())::bigint));
  RETURN new_no;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ussd_sessions ENABLE ROW LEVEL SECURITY;

-- Public read for products and promos
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read promos" ON promos FOR SELECT USING (true);
CREATE POLICY "Public read orders" ON whatsapp_orders FOR SELECT USING (true);

-- Full access for service role
CREATE POLICY "Full access products" ON products FOR ALL USING (true);
CREATE POLICY "Full access promos" ON promos FOR ALL USING (true);
CREATE POLICY "Full access orders" ON whatsapp_orders FOR ALL USING (true);
CREATE POLICY "Full access sales" ON sales FOR ALL USING (true);
CREATE POLICY "Full access expenses" ON expenses FOR ALL USING (true);
CREATE POLICY "Full access sessions" ON ussd_sessions FOR ALL USING (true);

-- Indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_visible ON products(visible);
CREATE INDEX idx_orders_status ON whatsapp_orders(status);
CREATE INDEX idx_orders_date ON whatsapp_orders(date DESC);
CREATE INDEX idx_orders_phone ON whatsapp_orders(customer_phone);
CREATE INDEX idx_sales_date ON sales(date DESC);
CREATE INDEX idx_expenses_date ON expenses(date DESC);

-- Stock decrement function for POS
CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, qty INT)
RETURNS VOID AS $$
BEGIN
  UPDATE products SET quantity = GREATEST(0, quantity - qty) WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;
