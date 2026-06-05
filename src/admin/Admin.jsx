import { useState, useEffect } from 'react'
import './admin.css'
import { NAV } from './nav'
import Icon from './ui/Icon'
import { useToastHost } from './lib/hooks'
import { login, loadSession, saveSession, clearSession, canAccess, landingPage, FULL_ACCESS_ROLES } from './lib/auth'

import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Invoices from './pages/Invoices'
import Receipts from './pages/Receipts'
import Refunds from './pages/Refunds'
import Products from './pages/Products'
import Promos from './pages/Promos'
import Restock from './pages/Restock'
import StockAdjust from './pages/StockAdjust'
import Customers from './pages/Customers'
import Expenses from './pages/Expenses'
import Reports from './pages/Reports'
import Staff from './pages/Staff'

const PAGES = {
  dashboard: Dashboard, pos: POS, invoices: Invoices, receipts: Receipts, refunds: Refunds,
  products: Products, promos: Promos, restock: Restock, stock: StockAdjust,
  customers: Customers, expenses: Expenses, reports: Reports, staff: Staff,
}

/* ─── Toasts ─── */
function Toasts() {
  const items = useToastHost()
  return (
    <div className="toasts">
      {items.map(t => <div key={t.id} className={`toast${t.kind !== 'default' ? ' toast--' + t.kind : ''}`}>{t.message}</div>)}
    </div>
  )
}

/* ─── Auth gate (admin password OR staff PIN) ─── */
function Auth({ onOk }) {
  const [cred, setCred] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async e => {
    e.preventDefault()
    setBusy(true); setErr('')
    const session = await login(cred)
    setBusy(false)
    if (session) onOk(session)
    else setErr('Incorrect password or PIN')
  }
  return (
    <div className="admin" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--page)' }}>
      <form onSubmit={submit} style={{ width: 340, background: '#fff', border: '1px solid var(--line)', borderRadius: 18, padding: '36px 30px', boxShadow: '0 10px 40px rgba(15,23,41,.08)' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--dark)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 24, margin: '0 auto 18px' }}>E</div>
        <h1 style={{ textAlign: 'center', fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Esterea Admin</h1>
        <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 22 }}>Enter admin password or your staff PIN</p>
        <input className="input" type="password" autoFocus value={cred} onChange={e => { setCred(e.target.value); setErr('') }} placeholder="Password or PIN" style={{ marginBottom: 12 }} />
        {err && <p style={{ fontSize: 12, color: 'var(--bad)', marginBottom: 12 }}>{err}</p>}
        <button className="btn btn--dark" style={{ width: '100%' }} type="submit" disabled={busy}>{busy ? 'Checking…' : 'Sign In'}</button>
      </form>
    </div>
  )
}

export default function Admin() {
  const [session, setSession] = useState(() => loadSession())
  const [tab, setTab] = useState(() => landingPage(loadSession()))
  const [drawer, setDrawer] = useState(false)

  const onOk = s => { saveSession(s); setSession(s); setTab(landingPage(s)) }
  const logout = () => { clearSession(); setSession(null) }
  const nav = id => { setTab(id); setDrawer(false) }

  if (!session) return <Auth onOk={onOk} />

  const isFull = FULL_ACCESS_ROLES.includes(session.role)
  // nav filtered by what this session can access
  const navSections = NAV
    .map(sec => ({ ...sec, items: sec.items.filter(it => canAccess(session, it.id)) }))
    .filter(sec => sec.items.length)
  const navFlat = navSections.flatMap(s => s.items)

  // guard: if current tab isn't allowed, bounce to landing
  const allowedTab = canAccess(session, tab) ? tab : landingPage(session)
  const Page = PAGES[allowedTab] || POS

  return (
    <div className="admin">
      <Toasts />
      <div className="shell">
        {/* Rail */}
        <nav className="rail">
          <div className="rail__logo" onClick={() => setDrawer(true)}>E</div>
          <div className="rail__icons">
            {navFlat.map(it => (
              <button key={it.id} className={`rail__btn${allowedTab === it.id ? ' rail__btn--on' : ''}`} onClick={() => nav(it.id)} title={it.label}>
                <Icon name={it.icon} size={20} />
                {it.badge && <span className="rail__dot" />}
              </button>
            ))}
          </div>
          <div className="rail__foot">
            <button className="rail__btn" onClick={() => setDrawer(true)} title="Menu"><Icon name="menu" size={20} /></button>
            <div className="rail__avatar" title={session.name}>{(session.name || 'A')[0].toUpperCase()}</div>
            <button className="rail__btn" onClick={logout} title="Sign out"><Icon name="out" size={20} /></button>
          </div>
        </nav>

        {/* Drawer */}
        {drawer && (
          <>
            <div className="scrim" onClick={() => setDrawer(false)} />
            <aside className="drawer">
              <div className="drawer__head">
                <div className="drawer__logo">E</div>
                <div>
                  <div className="drawer__brand">Esterea Home</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>{session.name} · {session.role}</div>
                </div>
              </div>
              <div className="drawer__nav">
                {navSections.map(sec => (
                  <div key={sec.section}>
                    <div className="drawer__sec">{sec.section}</div>
                    {sec.items.map(it => (
                      <button key={it.id} className={`drawer__item${allowedTab === it.id ? ' drawer__item--on' : ''}`} onClick={() => nav(it.id)}>
                        <Icon name={it.icon} size={18} />{it.label}
                        {it.badge && <span className="drawer__badge">!</span>}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              <div className="drawer__foot">
                <a className="drawer__footbtn" href="/" target="_blank" rel="noreferrer"><Icon name="store" size={17} /> View Store</a>
                <button className="drawer__footbtn" onClick={logout}><Icon name="out" size={17} /> Sign out</button>
              </div>
            </aside>
          </>
        )}

        {/* Content */}
        <main className="main">
          <div className="content" key={allowedTab}>
            <Page onNav={nav} session={session} />
          </div>
        </main>
      </div>
    </div>
  )
}
