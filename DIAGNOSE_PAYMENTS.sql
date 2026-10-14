-- ════════════════════════════════════════════════════════════════
-- ESTEREA — PAYMENT DIAGNOSTIC (read-only except for §5, which rolls back)
-- Run in: https://supabase.com/dashboard/project/tgdtjfquwbtvfsdnvvgm/sql/new
-- Run each section separately and read the result before moving on.
-- ════════════════════════════════════════════════════════════════

-- ─── §1  Does the table exist at all? ───
select count(*) as whatsapp_orders_exists
from information_schema.tables
where table_schema = 'public' and table_name = 'whatsapp_orders';


-- ─── §2  Which columns the checkout writes are MISSING? ───
-- Any row returned here = the storefront insert fails with
-- "Could not find the '<col>' column of 'whatsapp_orders'".
-- Empty result = schema is fine, the problem is elsewhere.
with required(col) as (
  values ('order_no'),('date'),('customer_name'),('customer_phone'),
         ('items'),('subtotal'),('delivery_fee'),('total'),('address'),
         ('notes'),('status'),('paystack_ref'),('paid_at'),('created_at')
)
select r.col as missing_column
from required r
left join information_schema.columns c
       on c.table_schema = 'public'
      and c.table_name   = 'whatsapp_orders'
      and c.column_name  = r.col
where c.column_name is null;


-- ─── §3  Is RLS blocking the anonymous storefront? ───
-- rls_enabled = true with NO permissive policy below = every customer
-- insert is rejected. This blocks ALL payments, not just some.
select relname, relrowsecurity as rls_enabled, relforcerowsecurity as rls_forced
from pg_class
where oid = 'public.whatsapp_orders'::regclass;

select polname,
       polcmd as command,
       polroles::regrole[] as roles,
       pg_get_expr(polqual,      polrelid) as using_expr,
       pg_get_expr(polwithcheck, polrelid) as with_check_expr
from pg_policy
where polrelid = 'public.whatsapp_orders'::regclass;


-- ─── §4  What has actually landed? ───
-- Pending rows with a paystack_ref  = inserts work, payment/update is failing.
-- Zero rows at all                  = inserts are failing (see §2 and §3).
-- Paid rows                         = the flow works end to end for some orders.
select status, count(*) as orders, max(date) as most_recent
from whatsapp_orders
group by status
order by orders desc;

-- Does the order-number function exist? (missing = harmless, code falls back)
select count(*) as generate_wa_order_no_exists
from pg_proc where proname = 'generate_wa_order_no';


-- ─── §5  Simulate a real customer checkout as the anon role ───
-- This reproduces EXACTLY what the browser does, then undoes it.
-- If this raises an error, that error is why customers cannot pay.
begin;
set local role anon;

insert into whatsapp_orders (
  order_no, date, customer_name, customer_phone, items,
  subtotal, delivery_fee, total, address, notes,
  status, paystack_ref, created_at
) values (
  'EST-DIAG-TEST', now(), 'Diagnostic Test', '233000000000',
  '[{"name":"test","qty":1,"price":1}]'::jsonb,
  1, 0, 1, 'PICKUP', 'diagnostic — rolled back',
  'Pending', 'PAY-DIAG-TEST', now()
) returning id, order_no, status;

-- and the update the success handler performs
update whatsapp_orders
   set status = 'Paid', paystack_ref = 'PAY-DIAG-TEST-2', paid_at = now()
 where order_no = 'EST-DIAG-TEST'
returning id, status, paid_at;

rollback;  -- nothing above is kept
