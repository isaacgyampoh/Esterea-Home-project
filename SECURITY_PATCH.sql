-- ════════════════════════════════════════════════════════════════
-- ESTEREA — SECURITY PATCH
-- Stops the public anon key (which ships inside the browser bundle)
-- from reading the admin password and staff PINs.
--
-- RUN THIS *AFTER* deploying the matching app code. The code tries the
-- RPCs below first and only falls back to the old path when they do not
-- exist yet, so deploying first is safe and running this second is safe.
--
-- Run in: https://supabase.com/dashboard/project/tgdtjfquwbtvfsdnvvgm/sql/new
-- ════════════════════════════════════════════════════════════════

-- ─── 1. Validate a login server-side, never returning the secret ───
create or replace function verify_login(cred text)
returns table (role text, name text, id uuid)
language plpgsql security definer set search_path = public as $$
declare pw text;
begin
  select value into pw from settings where key = 'admin_password';
  if pw is not null and cred = pw then
    return query select 'Admin'::text, 'Admin'::text, null::uuid;
    return;
  end if;
  return query
    select s.role, s.name, s.id from staff s
    where s.pin = cred and coalesce(s.active, true) = true
    limit 1;
end $$;

-- ─── 2. Change the admin password without ever reading it ───
create or replace function set_admin_password(new_pw text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into settings (key, value) values ('admin_password', new_pw)
  on conflict (key) do update set value = excluded.value;
end $$;

-- ─── 3. Check PIN uniqueness without exposing any PIN ───
create or replace function pin_taken(p text, excl uuid default null)
returns boolean
language sql security definer set search_path = public as $$
  select exists (
    select 1 from staff
    where pin = p and (excl is null or id <> excl)
  );
$$;

-- ─── 4. Make sure a password row exists before locking reads ───
-- Without this, verify_login has nothing to match and admin login fails.
insert into settings (key, value)
select 'admin_password', 'esterea2026'
where not exists (select 1 from settings where key = 'admin_password');

-- ─── 5. Revoke the public key's access to the credentials ───
revoke all on table settings from anon;
revoke select on table staff from anon;

-- The UI still needs to show WHICH staff can log in, without revealing any PIN.
alter table staff add column if not exists has_pin boolean
  generated always as (pin is not null and pin <> '') stored;

-- staff stays listable by the admin UI — just never the pin column itself
grant select (id, name, role, phone, active, created_at, has_pin) on table staff to anon;

grant execute on function verify_login(text)        to anon;
grant execute on function set_admin_password(text)  to anon;
grant execute on function pin_taken(text, uuid)     to anon;

-- ─── Verify ───
-- Expect: settings unreadable, staff.pin unreadable, staff.name readable.
--   set role anon;
--   select * from settings;              -- should ERROR: permission denied
--   select pin from staff;               -- should ERROR: permission denied
--   select id, name, role from staff;    -- should work
--   select * from verify_login('esterea2026');  -- should return Admin
--   reset role;
