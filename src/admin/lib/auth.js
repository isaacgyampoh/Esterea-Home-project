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

/* ─── Admin password (stored in `settings` table, key = 'admin_password') ─── */
const FALLBACK_PASSWORD = 'esterea2026'

export async function getAdminPassword() {
  try {
    const { data } = await supabase.from('settings').select('value').eq('key', 'admin_password').maybeSingle()
    return data?.value || FALLBACK_PASSWORD
  } catch {
    return FALLBACK_PASSWORD
  }
}

export async function setAdminPassword(newPw) {
  // upsert key=admin_password
  const { error } = await supabase.from('settings').upsert({ key: 'admin_password', value: newPw }, { onConflict: 'key' })
  return error
}

/* ─── Login: try admin password first, then staff PIN ───
   Returns a session object or null. */
export async function login(credential) {
  const cred = String(credential).trim()
  if (!cred) return null

  // 1) admin password
  const adminPw = await getAdminPassword()
  if (cred === adminPw) {
    return { role: 'Admin', name: 'Admin', id: null }
  }

  // 2) staff PIN (numeric)
  if (/^\d{3,6}$/.test(cred)) {
    try {
      const { data } = await supabase.from('staff').select('*').eq('pin', cred).eq('active', true).maybeSingle()
      if (data) return { role: data.role || 'Staff', name: data.name, id: data.id }
    } catch { /* staff table may not exist yet */ }
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
