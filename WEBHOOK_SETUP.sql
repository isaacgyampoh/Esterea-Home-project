-- ════════════════════════════════════════════════════════════════
-- ESTEREA — PAYMENT VERIFICATION
-- Adds the flag the Paystack webhook sets. The storefront still marks an
-- order Paid optimistically from the browser; only the webhook can set
-- payment_verified, so a genuinely confirmed payment is distinguishable
-- from a browser that merely claimed one.
-- Run in: https://supabase.com/dashboard/project/tgdtjfquwbtvfsdnvvgm/sql/new
-- ════════════════════════════════════════════════════════════════

alter table whatsapp_orders
  add column if not exists payment_verified boolean default false;

-- The browser must never be able to claim a payment was verified.
revoke update (payment_verified) on table whatsapp_orders from anon;

-- Find orders the browser called Paid that Paystack never confirmed.
-- Anything here is worth investigating before fulfilling.
--   select order_no, total, status, paid_at
--   from whatsapp_orders
--   where status = 'Paid' and coalesce(payment_verified, false) = false
--   order by date desc;
