-- ════════════════════════════════════════════════════════════════
-- ESTEREA — Product Variants
-- Adds variant support to products (e.g. Color: Beige/Grey, each with
-- its own image & stock, sharing the product price).
-- Run in: https://supabase.com/dashboard/project/tgdtjfquwbtvfsdnvvgm/sql/new
-- ════════════════════════════════════════════════════════════════

alter table products add column if not exists variant_label text default '';
-- variants: jsonb array of { name, image, quantity }
alter table products add column if not exists variants jsonb default '[]';
