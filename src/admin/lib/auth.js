import { supabase } from './supabase'

/* ─── Roles & page permissions ───
   Admin/Owner/Manager see everything.
   Staff & Cashier only get the work pages. */
export const STAFF_PAGES = ['pos', 'receipts', 'invoices', 'refunds']
export const FULL_ACCESS_ROLES = ['Admin', 'Owner', 'Manager']

export function canAccess(session, pageId) {
  if (!session) return false
  if (FULL_ACCESS_ROLES.includes(session.role)) return true
  return STAFF_PAGES.includes(pageId)
}
export function landingPage(session) {
  return FULL_ACCESS_ROLES.includes(session?.role) ? 'dashboard' : 'pos'
}

/* ─── Admin password ───
   The password lives in `settings`, but the anon key that ships in the
   browser bundle must not be able to read it. SECURITY_PATCH.sql revokes
   that read and exposes RPCs instead. Until that SQL has been run the RPCs
   do not exist, so we fall back to the old direct-table path — but ONLY
   when the function is genuinely missing. Any other error fails closed,
   because treating "cannot read" as "use the default password" would turn
   the default into a working backdoor. */
const FALLBACK_PASSWORD = 'esterea2026'

// PostgREST reports an absent function as PGRST202 / 404.
const isMissingFn = e => e?.code === 'PGRST202' || /not find the function|does not exist/i.test(e?.message || '')

export async function setAdminPassword(newPw) {
  const { error } = await supabase.rpc('set_admin_password', { new_pw: newPw })
  if (!error) return null
  if (!isMissingFn(error)) return error
  // pre-migration fallback
  const { error: e2 } = await supabase.from('settings').upsert({ key: 'admin_password', value: newPw }, { onConflict: 'key' })
  return e2
}

/* Only used by the pre-migration fallback path below. */
async function legacyAdminPassword() {
  const { data, error } = await supabase.from('settings').select('value').eq('key', 'admin_password').maybeSingle()
  if (error) return null          // fail closed — never fall back to the default
  return data?.value || FALLBACK_PASSWORD
}

export async function isPinTaken(pin, excludeId = null) {
  const { data, error } = await supabase.rpc('pin_taken', { p: pin, excl: excludeId })
  if (!error) return { taken: !!data, error: null }
  if (isMissingFn(error)) return { taken: null, error: null }   // caller falls back
  return { taken: null, error }
}

/* ─── Login: try admin password first, then staff PIN ───
   Returns a session object or null. */
export async function login(credential) {
  const cred = String(credential).trim()
  if (!cred) return null

  // Preferred: the database checks the credential and returns only a role.
  const { data, error } = await supabase.rpc('verify_login', { cred })
  if (!error) {
    const row = Array.isArray(data) ? data[0] : data
    return row?.role ? { role: row.role, name: row.name || row.role, id: row.id || null } : null
  }
  if (!isMissingFn(error)) {
    console.error('[auth] verify_login failed', error)
    return null                   // fail closed
  }

  // ── pre-migration fallback (SECURITY_PATCH.sql not run yet) ──
  const adminPw = await legacyAdminPassword()
  if (adminPw && cred === adminPw) return { role: 'Admin', name: 'Admin', id: null }

  if (/^\d{3,6}$/.test(cred)) {
    const { data: st } = await supabase.from('staff').select('id,name,role').eq('pin', cred).eq('active', true).maybeSingle()
    if (st) return { role: st.role || 'Staff', name: st.name, id: st.id }
  }
  return null
}

/* ─── Session persistence (sessionStorage) ─── */
const KEY = 'esterea_session'
export function saveSession(s) { sessionStorage.setItem(KEY, JSON.stringify(s)) }
export function loadSession() {
  try { return JSON.parse(sessionStorage.getItem(KEY) || 'null') } catch { return null }
}
export function clearSession() { sessionStorage.removeItem(KEY) }
