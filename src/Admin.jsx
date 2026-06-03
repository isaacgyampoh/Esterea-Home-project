import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tgdtjfquwbtvfsdnvvgm.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZHRqZnF1d2J0dmZzZG52dmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTM4MjUsImV4cCI6MjA5NjAyOTgyNX0.uXUkodx29_LQNU8pkpbxNnYGFgBYmoFTJHtxVWWAt8E'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
const money = n => `GH₵ ${Number(n || 0).toFixed(2)}`
const thumb = (url, w = 80) => url ? url.replace('/upload/', `/upload/w_${w},q_auto/`) : ''

// ── Icons ──
const Ic = {
  dashboard: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  products: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>,
  orders: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  pos: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  sales: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  expenses: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  logout: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  edit: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  eye: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  x: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  store: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
  check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: Ic.dashboard },
  { id: 'products', label: 'Products', icon: Ic.products },
  { id: 'orders', label: 'Orders', icon: Ic.orders },
  { id: 'pos', label: 'POS', icon: Ic.pos },
  { id: 'sales', label: 'Sales', icon: Ic.sales },
  { id: 'expenses', label: 'Expenses', icon: Ic.expenses },
]

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [err, setErr] = useState(false)
  const [tab, setTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('esterea_admin') === 'yes') setAuthed(true)
  }, [])

  function login() {
    const pw = 'esterea2026'
    if (pass === pw) {
      setAuthed(true)
      sessionStorage.setItem('esterea_admin', 'yes')
      setErr(false)
    } else {
      setErr(true)
      setTimeout(() => setErr(false), 2000)
    }
  }

  function logout() {
    sessionStorage.removeItem('esterea_admin')
    window.location.hash = '/'
    window.location.reload()
  }

  if (!authed) return (
    <div className="min-h-screen bg-[#0f0f0e] flex items-center justify-center p-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#2a2520] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl" style={{fontFamily:'var(--font-display)'}}>E</span>
          </div>
          <h1 className="text-xl font-semibold text-white mb-1" style={{fontFamily:'var(--font-display)'}}>Esterea Home</h1>
          <p className="text-[12px] text-[#5a5048]">Admin Panel</p>
        </div>
        <input
          type="password" value={pass}
          onChange={e => { setPass(e.target.value); setErr(false) }}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Enter password"
          className={`w-full h-12 px-4 bg-[#1a1a18] border rounded-xl text-sm text-white mb-3 focus:outline-none transition ${err ? 'border-red-500 shake' : 'border-[#2a2520] focus:border-[#5a5048]'}`}
          autoFocus
        />
        {err && <p className="text-[11px] text-red-400 mb-2 text-center">Incorrect password</p>}
        <button onClick={login} className="w-full h-12 bg-white text-[#1a1a1a] rounded-xl text-[13px] font-semibold hover:bg-[#f0ede8] transition">
          Login
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f5f3f0] flex" style={{fontFamily:'var(--font-body)'}}>
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-[220px] bg-[#1a1a1a] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-14 flex items-center px-5 border-b border-[#2a2520]">
          <span className="text-white font-semibold text-[15px]" style={{fontFamily:'var(--font-display)'}}>Esterea Home</span>
          <span className="ml-2 text-[10px] text-[#5a5048] bg-[#2a2520] px-1.5 py-0.5 rounded">Admin</span>
        </div>
        <nav className="flex-1 py-3 px-2">
          {TABS.map(t => (
            <button key={t.id}
              onClick={() => { setTab(t.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-[12.5px] font-medium transition-colors admin-sidebar-item ${tab===t.id ? 'bg-white/10 text-white' : 'text-[#5a5048] hover:text-[#a89d93] hover:bg-white/5'}`}>
              <span className={tab===t.id ? 'text-white' : 'text-[#5a5048]'}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-[#2a2520] space-y-1">
          <a href="/" target="_blank" rel="noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] text-[#5a5048] hover:text-[#a89d93] hover:bg-white/5 transition">
            {Ic.store} View Store
          </a>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] text-[#5a5048] hover:text-red-400 hover:bg-white/5 transition">
            {Ic.logout} Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <div className="h-14 bg-white border-b border-[#e8e4df] flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-[#f5f3f0] text-[#5a5048]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="text-[13px] font-semibold text-[#1a1a1a]">{TABS.find(t=>t.id===tab)?.label}</div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {tab === 'dashboard' && <Dashboard />}
          {tab === 'products' && <Products />}
          {tab === 'orders' && <Orders />}
          {tab === 'pos' && <POS />}
          {tab === 'sales' && <Sales />}
          {tab === 'expenses' && <Expenses />}
        </div>
      </div>
    </div>
  )
}

// ── DASHBOARD ──
function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const [{ count: prodCount }, { data: sales }, { data: expenses }, { data: orders }] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('sales').select('total,profit,date').eq('voided', false),
        supabase.from('expenses').select('amount,date'),
        supabase.from('whatsapp_orders').select('total,status,date,created_at'),
      ])
      const s = sales || [], e = expenses || [], o = orders || []
      const todaySales = s.filter(x => x.date?.startsWith(today))
      const totalRevenue = s.reduce((a, x) => a + Number(x.total || 0), 0)
      const totalProfit = s.reduce((a, x) => a + Number(x.profit || 0), 0)
      const totalExpenses = e.reduce((a, x) => a + Number(x.amount || 0), 0)
      setStats({
        products: prodCount || 0,
        todayRevenue: todaySales.reduce((a, x) => a + Number(x.total || 0), 0),
        todaySales: todaySales.length,
        revenue: totalRevenue,
        profit: totalProfit,
        expenses: totalExpenses,
        net: totalProfit - totalExpenses,
        orders: o.length,
        pending: o.filter(x => x.status === 'Pending').length,
        paid: o.filter(x => ['Paid','Completed'].includes(x.status)).length,
        onlineRev: o.filter(x => ['Paid','Completed'].includes(x.status)).reduce((a, x) => a + Number(x.total || 0), 0),
      })
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  if (loading) return <DashSkeleton />

  const cards = [
    { label: "Today's Revenue", value: money(stats.todayRevenue), note: `${stats.todaySales} sales`, accent: '#2d7a4f', bg: '#e8f5ee' },
    { label: 'Total Revenue', value: money(stats.revenue), note: 'All time POS', accent: '#1a5fa8', bg: '#e8eef8' },
    { label: 'Total Profit', value: money(stats.profit), note: 'Before expenses', accent: '#7a4d2d', bg: '#f5ede8' },
    { label: 'Net Profit', value: money(stats.net), note: 'After expenses', accent: stats.net >= 0 ? '#2d7a4f' : '#c8382b', bg: stats.net >= 0 ? '#e8f5ee' : '#fde8e8' },
    { label: 'Expenses', value: money(stats.expenses), note: 'Total recorded', accent: '#c8382b', bg: '#fde8e8' },
    { label: 'Products', value: stats.products, note: 'In catalogue', accent: '#5a5048', bg: '#f5f2ee' },
    { label: 'Online Orders', value: stats.orders, note: `${stats.pending} pending`, accent: '#7a2d6a', bg: '#f5e8f5' },
    { label: 'Orders Paid', value: stats.paid, note: money(stats.onlineRev) + ' revenue', accent: '#2d7a4f', bg: '#e8f5ee' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#1a1a1a] mb-1" style={{fontFamily:'var(--font-display)'}}>Dashboard</h1>
        <p className="text-[12px] text-[#a89d93]">{new Date().toLocaleDateString('en-GH', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <div key={c.label} className="bg-white rounded-2xl p-4 border border-[#e8e4df]">
            <div className="text-[10px] text-[#a89d93] uppercase tracking-widest mb-2">{c.label}</div>
            <div className="text-xl font-semibold" style={{ color: c.accent }}>{c.value}</div>
            <div className="text-[11px] text-[#c8bfb4] mt-1">{c.note}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DashSkeleton() {
  return (
    <div>
      <div className="skeleton h-6 w-32 rounded mb-1" />
      <div className="skeleton h-3 w-48 rounded mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(8)].map((_,i) => <div key={i} className="bg-white rounded-2xl p-4 border border-[#e8e4df]"><div className="skeleton h-2.5 w-20 rounded mb-3" /><div className="skeleton h-6 w-24 rounded mb-1" /><div className="skeleton h-2 w-16 rounded" /></div>)}
      </div>
    </div>
  )
}

// ── PRODUCTS ──
function Products() {
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('name')
    if (error) console.error('Products load error:', error)
    setProducts(data || [])
    setLoading(false)
  }

  async function save() {
    if (!editing?.name?.trim()) return
    setSaving(true)
    const { id, created_at, ...data } = editing
    const { error } = id
      ? await supabase.from('products').update(data).eq('id', id)
      : await supabase.from('products').insert(data)
    if (error) console.error('Save error:', error)
    setSaving(false)
    setEditing(null)
    load()
  }

  async function del(id) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  async function toggleVisible(id, v) {
    await supabase.from('products').update({ visible: !v }).eq('id', id)
    setProducts(ps => ps.map(p => p.id === id ? { ...p, visible: !v } : p))
  }

  const filtered = search ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) : products

  const blankProduct = { name: '', category: '', price: 0, cost_price: 0, quantity: 0, image: '', description: '', visible: true, wholesale_price: 0, wholesale_min_qty: 0 }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]" style={{fontFamily:'var(--font-display)'}}>Products</h1>
          <p className="text-[12px] text-[#a89d93]">{products.length} items</p>
        </div>
        <button onClick={() => setEditing(blankProduct)}
          className="flex items-center gap-2 h-10 px-4 bg-[#1a1a1a] text-white rounded-xl text-[12.5px] font-semibold hover:bg-[#333] transition">
          {Ic.plus} Add Product
        </button>
      </div>

      <div className="relative mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full h-10 px-4 pl-10 bg-white border border-[#e8e4df] rounded-xl text-[13px] focus:outline-none focus:border-[#1a1a1a] transition" />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c8bfb4]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </span>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[#e8e4df]">
              <h2 className="font-semibold text-[#1a1a1a] text-[15px]">{editing.id ? 'Edit' : 'New'} Product</h2>
              <button onClick={() => setEditing(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#a89d93] hover:text-[#1a1a1a] hover:bg-[#f5f3f0] transition">{Ic.x}</button>
            </div>
            <div className="p-5 space-y-3">
              <Field label="Product Name *" value={editing.name} onChange={v => setEditing({...editing, name:v})} placeholder="e.g. Rattan Side Table" />
              <Field label="Category" value={editing.category} onChange={v => setEditing({...editing, category:v})} placeholder="e.g. Furniture" />
              <Field label="Image URL (Cloudinary)" value={editing.image} onChange={v => setEditing({...editing, image:v})} placeholder="https://res.cloudinary.com/..." />
              {editing.image && (
                <img src={thumb(editing.image, 200)} alt="preview" className="w-24 h-24 object-cover rounded-xl border border-[#e8e4df]" onError={e => e.target.style.display='none'} />
              )}
              <div>
                <label className="block text-[11px] text-[#a89d93] mb-1">Description</label>
                <textarea value={editing.description||''} onChange={e => setEditing({...editing,description:e.target.value})} placeholder="Short product description"
                  className="w-full h-16 px-3 py-2 bg-[#f5f3f0] border border-[#e8e4df] rounded-xl text-[13px] focus:outline-none focus:border-[#1a1a1a] transition resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumField label="Selling Price (GH₵)" value={editing.price} onChange={v => setEditing({...editing,price:v})} />
                <NumField label="Cost Price (GH₵)" value={editing.cost_price} onChange={v => setEditing({...editing,cost_price:v})} />
              </div>
              <NumField label="Stock Quantity" value={editing.quantity} onChange={v => setEditing({...editing,quantity:v})} step="1" />
              <div className="grid grid-cols-2 gap-3">
                <NumField label="Wholesale Price" value={editing.wholesale_price} onChange={v => setEditing({...editing,wholesale_price:v})} />
                <NumField label="Wholesale Min Qty" value={editing.wholesale_min_qty} onChange={v => setEditing({...editing,wholesale_min_qty:v})} step="1" />
              </div>
              <label className="flex items-center gap-2 text-[13px] text-[#5a5048] cursor-pointer">
                <div onClick={() => setEditing({...editing,visible:!editing.visible})}
                  className={`w-10 h-5.5 rounded-full flex items-center transition-colors ${editing.visible ? 'bg-[#2d7a4f]' : 'bg-[#e8e4df]'}`}
                  style={{height:'22px'}}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform mx-0.5 ${editing.visible ? 'translate-x-4.5' : ''}`} style={{transform: editing.visible ? 'translateX(18px)' : 'translateX(0)'}} />
                </div>
                Visible in store
              </label>
            </div>
            <div className="flex gap-2 p-5 pt-0">
              <button onClick={save} disabled={saving}
                className="flex-1 h-11 bg-[#1a1a1a] text-white rounded-xl text-[13px] font-semibold hover:bg-[#333] transition disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save Product'}
              </button>
              <button onClick={() => setEditing(null)} className="flex-1 h-11 bg-[#f5f3f0] text-[#5a5048] rounded-xl text-[13px] font-semibold hover:bg-[#e8e4df] transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_,i) => <div key={i} className="bg-white rounded-2xl p-4 border border-[#e8e4df]"><div className="skeleton h-4 w-48 rounded mb-2" /><div className="skeleton h-3 w-32 rounded" /></div>)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e8e4df] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[#a89d93] text-sm">No products yet.</p>
            </div>
          ) : filtered.map((p, i) => (
            <div key={p.id} className={`flex items-center gap-3 p-3 border-b border-[#f5f3f0] last:border-0 ${!p.visible ? 'opacity-50' : ''}`}>
              <div className="w-11 h-11 bg-[#f5f2ee] rounded-xl overflow-hidden shrink-0">
                {p.image ? <img src={thumb(p.image, 90)} className="w-full h-full object-cover" alt={p.name} /> : <div className="w-full h-full flex items-center justify-center text-[#c8bfb4] text-sm" style={{fontFamily:'var(--font-display)'}}>E</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-[#1a1a1a] truncate">{p.name}</div>
                <div className="text-[11px] text-[#a89d93]">{p.category} · Qty: {p.quantity} · {money(p.price)}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleVisible(p.id, p.visible)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${p.visible ? 'bg-[#e8f5ee] text-[#2d7a4f]' : 'bg-[#f5f3f0] text-[#c8bfb4]'}`}
                  title={p.visible ? 'Hide' : 'Show'}>
                  {Ic.eye}
                </button>
                <button onClick={() => setEditing(p)} className="w-7 h-7 rounded-lg bg-[#f5f3f0] text-[#5a5048] hover:bg-[#e8e4df] flex items-center justify-center transition">{Ic.edit}</button>
                <button onClick={() => del(p.id)} className="w-7 h-7 rounded-lg bg-[#fde8e8] text-[#c8382b] hover:bg-red-200 flex items-center justify-center transition">{Ic.trash}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── ORDERS ──
function Orders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('whatsapp_orders').select('*').order('date', {ascending:false}).limit(200)
    if (error) console.error('Orders error:', error)
    setOrders(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('whatsapp_orders').update({ status }).eq('id', id)
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o))
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const counts = ['Pending', 'Paid', 'Completed', 'Cancelled'].reduce((a, s) => ({ ...a, [s]: orders.filter(o => o.status === s).length }), {})

  const badge = s => {
    if (s === 'Paid' || s === 'Completed') return 'bg-[#e8f5ee] text-[#2d7a4f]'
    if (s === 'Pending') return 'bg-[#fef3e2] text-[#c67d00]'
    if (s === 'Cancelled') return 'bg-[#fde8e8] text-[#c8382b]'
    return 'bg-[#f5f3f0] text-[#8a7d72]'
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-[#1a1a1a] mb-1" style={{fontFamily:'var(--font-display)'}}>Orders</h1>
        <p className="text-[12px] text-[#a89d93]">{orders.length} total · {counts.Pending || 0} pending</p>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
        {[['all', `All (${orders.length})`], ...['Pending','Paid','Completed','Cancelled'].map(s => [s, `${s} (${counts[s]||0})`])].map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`h-9 px-4 rounded-full text-[12px] font-medium whitespace-nowrap transition ${filter===f ? 'bg-[#1a1a1a] text-white' : 'bg-white text-[#8a7d72] border border-[#e8e4df] hover:border-[#1a1a1a]'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_,i) => <div key={i} className="bg-white rounded-2xl p-4 border border-[#e8e4df] h-24 skeleton" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center"><p className="text-[#a89d93] text-sm">No orders.</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(o => {
            const items = o.items ? (typeof o.items === 'string' ? JSON.parse(o.items) : o.items) : []
            return (
              <div key={o.id} className="bg-white rounded-2xl border border-[#e8e4df] p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-[11px] text-[#c8bfb4] font-mono">{o.order_no}</div>
                    <div className="text-[14px] font-semibold text-[#1a1a1a]">{o.customer_name || 'Customer'}</div>
                    <div className="text-[12px] text-[#a89d93]">{o.customer_phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-semibold text-[#1a1a1a]">{money(o.total)}</div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge(o.status)}`}>{o.status}</span>
                  </div>
                </div>
                {items.length > 0 && (
                  <p className="text-[11.5px] text-[#8a7d72] mb-2">{items.map(i => `${i.qty}× ${i.name}`).join(' · ')}</p>
                )}
                <div className="text-[11px] text-[#c8bfb4] mb-3">{o.address && o.address !== 'PICKUP' ? o.address : 'Pickup'} · {new Date(o.date || o.created_at).toLocaleString('en-GH')}</div>
                <div className="flex gap-1.5">
                  {o.status === 'Pending' && <ActionBtn color="green" onClick={() => updateStatus(o.id,'Paid')}>Mark Paid</ActionBtn>}
                  {o.status === 'Paid' && <ActionBtn color="blue" onClick={() => updateStatus(o.id,'Completed')}>Complete</ActionBtn>}
                  {!['Cancelled','Completed'].includes(o.status) && <ActionBtn color="red" onClick={() => updateStatus(o.id,'Cancelled')}>Cancel</ActionBtn>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── POS ──
function POS() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [payment, setPayment] = useState('Cash')
  const [custName, setCustName] = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('products').select('*').eq('visible', true).gt('quantity', 0).order('name')
      .then(({ data }) => setProducts(data || []))
  }, [])

  const filtered = search ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) : products
  const addToCart = p => {
    setCart(c => {
      const ex = c.find(x => x.id === p.id)
      if (ex) return c.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x)
      return [...c, { id: p.id, name: p.name, price: p.price, cost: p.cost_price || 0, qty: 1 }]
    })
  }
  const total = cart.reduce((a, c) => a + c.price * c.qty, 0)
  const profit = cart.reduce((a, c) => a + (c.price - c.cost) * c.qty, 0)

  async function completeSale() {
    if (cart.length === 0 || saving) return
    setSaving(true)
    const receipt = 'POS-' + Date.now().toString(36).toUpperCase()
    const items = cart.map(c => ({ name: c.name, qty: c.qty, price: c.price }))
    const { error } = await supabase.from('sales').insert({
      date: new Date().toISOString(), items, total, profit, payment,
      customer_name: custName, customer_phone: custPhone, receipt_no: receipt,
    })
    if (!error) {
      for (const c of cart) {
        await supabase.rpc('decrement_stock', { product_id: c.id, qty: c.qty }).catch(() => {})
      }
    }
    setSaving(false)
    setCart([])
    setCustName('')
    setCustPhone('')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-[#1a1a1a] mb-1" style={{fontFamily:'var(--font-display)'}}>Point of Sale</h1>
        <p className="text-[12px] text-[#a89d93]">In-store sales</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        {/* Products grid */}
        <div>
          <div className="relative mb-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
              className="w-full h-10 px-4 pl-10 bg-white border border-[#e8e4df] rounded-xl text-[13px] focus:outline-none focus:border-[#1a1a1a] transition" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c8bfb4]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[65vh] overflow-y-auto">
            {filtered.map(p => (
              <button key={p.id} onClick={() => addToCart(p)}
                className="bg-white border border-[#e8e4df] rounded-xl p-3 text-left hover:border-[#1a1a1a] transition press">
                {p.image && <img src={thumb(p.image, 120)} alt={p.name} className="w-full h-20 object-cover rounded-lg mb-2" />}
                <div className="text-[12px] font-medium text-[#1a1a1a] line-clamp-2 mb-1">{p.name}</div>
                <div className="text-[13px] font-semibold text-[#1a1a1a]">{money(p.price)}</div>
                <div className="text-[10px] text-[#c8bfb4] mt-0.5">Stock: {p.quantity}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-4 flex flex-col" style={{height:'fit-content'}}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1a1a1a] text-[14px]">Cart</h3>
            {cart.length > 0 && <button onClick={() => setCart([])} className="text-[11px] text-[#a89d93] hover:text-[#c8382b] transition">Clear</button>}
          </div>

          {saved && <div className="bg-[#e8f5ee] text-[#2d7a4f] text-[12px] font-semibold px-3 py-2 rounded-xl mb-3 flex items-center gap-2">{Ic.check} Sale recorded!</div>}

          {cart.length === 0 ? (
            <p className="text-[12px] text-[#c8bfb4] py-8 text-center">Tap a product to add</p>
          ) : (
            <div className="space-y-2 mb-4 max-h-[35vh] overflow-y-auto">
              {cart.map(c => (
                <div key={c.id} className="flex items-center gap-2 text-[13px]">
                  <div className="flex-1 min-w-0">
                    <div className="text-[#1a1a1a] font-medium truncate text-[12px]">{c.name}</div>
                    <div className="text-[#a89d93] text-[11px]">{money(c.price)} ea.</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCart(cart.filter(x => x.id !== c.id))} className="w-5 h-5 rounded bg-[#fde8e8] text-[#c8382b] flex items-center justify-center text-xs">×</button>
                    <button onClick={() => setCart(cart.map(x => x.id===c.id ? {...x,qty:Math.max(1,x.qty-1)} : x))} className="w-6 h-6 rounded bg-[#f5f3f0] text-[#5a5048] flex items-center justify-center text-xs">-</button>
                    <span className="w-5 text-center text-[12px] font-semibold">{c.qty}</span>
                    <button onClick={() => setCart(cart.map(x => x.id===c.id ? {...x,qty:x.qty+1} : x))} className="w-6 h-6 rounded bg-[#f5f3f0] text-[#5a5048] flex items-center justify-center text-xs">+</button>
                    <span className="w-16 text-right text-[12px] font-semibold text-[#1a1a1a]">{money(c.price * c.qty)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-[#f5f3f0] pt-3 mb-4">
            <div className="flex justify-between text-[15px] font-semibold text-[#1a1a1a] mb-1">
              <span>Total</span><span>{money(total)}</span>
            </div>
            {total > 0 && <div className="text-[11px] text-[#2d7a4f]">Profit: {money(profit)}</div>}
          </div>

          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {['Cash', 'MoMo', 'Paystack'].map(p => (
              <button key={p} onClick={() => setPayment(p)}
                className={`h-9 rounded-xl text-[11.5px] font-semibold transition ${payment===p ? 'bg-[#1a1a1a] text-white' : 'bg-[#f5f3f0] text-[#8a7d72] hover:bg-[#e8e4df]'}`}>
                {p}
              </button>
            ))}
          </div>

          <input value={custName} onChange={e => setCustName(e.target.value)} placeholder="Customer name (optional)"
            className="w-full h-9 px-3 mb-2 border border-[#e8e4df] rounded-xl text-[12px] focus:outline-none focus:border-[#1a1a1a] transition" />
          <input value={custPhone} onChange={e => setCustPhone(e.target.value)} placeholder="Phone (optional)"
            className="w-full h-9 px-3 mb-3 border border-[#e8e4df] rounded-xl text-[12px] focus:outline-none focus:border-[#1a1a1a] transition" />

          <button onClick={completeSale} disabled={cart.length === 0 || saving}
            className="w-full h-12 bg-[#1a1a1a] text-white rounded-xl text-[13px] font-semibold disabled:opacity-30 hover:bg-[#333] transition press flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {saving ? 'Recording...' : `Complete Sale · ${money(total)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── SALES ──
function Sales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    supabase.from('sales').select('*').eq('voided', false).order('date', {ascending:false}).limit(200)
      .then(({ data }) => { setSales(data || []); setLoading(false) })
  }, [])

  const total = sales.reduce((a, s) => a + Number(s.total || 0), 0)
  const profit = sales.reduce((a, s) => a + Number(s.profit || 0), 0)

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-[#1a1a1a] mb-1" style={{fontFamily:'var(--font-display)'}}>Sales History</h1>
        <p className="text-[12px] text-[#a89d93]">{sales.length} sales · {money(total)} revenue · {money(profit)} profit</p>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_,i) => <div key={i} className="bg-white rounded-2xl border border-[#e8e4df] h-20 skeleton" />)}</div>
      ) : sales.length === 0 ? (
        <div className="py-16 text-center"><p className="text-[#a89d93] text-sm">No sales recorded yet.</p></div>
      ) : (
        <div className="space-y-2">
          {sales.map(s => {
            const items = s.items ? (typeof s.items === 'string' ? JSON.parse(s.items) : s.items) : []
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-[#e8e4df] p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] text-[#c8bfb4] font-mono">{s.receipt_no}</div>
                    <div className="text-[14px] font-semibold text-[#1a1a1a]">{money(s.total)}</div>
                    <div className="text-[11.5px] text-[#a89d93]">{s.payment} · Profit: <span className="text-[#2d7a4f]">{money(s.profit)}</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#a89d93]">{new Date(s.date).toLocaleDateString('en-GH')}</div>
                    <div className="text-[11px] text-[#c8bfb4]">{new Date(s.date).toLocaleTimeString('en-GH', {hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                </div>
                {items.length > 0 && <p className="text-[11px] text-[#8a7d72] mt-1.5">{items.map(i => `${i.qty}× ${i.name}`).join(' · ')}</p>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── EXPENSES ──
function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('expenses').select('*').order('date', {ascending:false}).limit(200)
    setExpenses(data || [])
    setLoading(false)
  }

  async function save() {
    if (!editing?.description?.trim() || !editing?.amount) return
    setSaving(true)
    const { id, ...data } = editing
    if (id) await supabase.from('expenses').update(data).eq('id', id)
    else await supabase.from('expenses').insert({ ...data, date: new Date().toISOString() })
    setSaving(false)
    setEditing(null)
    load()
  }

  async function del(id) {
    if (!confirm('Delete this expense?')) return
    await supabase.from('expenses').delete().eq('id', id)
    load()
  }

  const total = expenses.reduce((a, e) => a + Number(e.amount || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]" style={{fontFamily:'var(--font-display)'}}>Expenses</h1>
          <p className="text-[12px] text-[#a89d93]">Total: <span className="text-[#c8382b] font-semibold">{money(total)}</span></p>
        </div>
        <button onClick={() => setEditing({ description:'', amount:'', category:'' })}
          className="flex items-center gap-2 h-10 px-4 bg-[#1a1a1a] text-white rounded-xl text-[12.5px] font-semibold hover:bg-[#333] transition">
          {Ic.plus} Add Expense
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[#e8e4df]">
              <h2 className="font-semibold text-[#1a1a1a]">{editing.id ? 'Edit' : 'New'} Expense</h2>
              <button onClick={() => setEditing(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#a89d93] hover:bg-[#f5f3f0] transition">{Ic.x}</button>
            </div>
            <div className="p-5 space-y-3">
              <Field label="Description *" value={editing.description} onChange={v => setEditing({...editing,description:v})} placeholder="e.g. Rent" />
              <NumField label="Amount (GH₵) *" value={editing.amount} onChange={v => setEditing({...editing,amount:v})} />
              <Field label="Category" value={editing.category} onChange={v => setEditing({...editing,category:v})} placeholder="e.g. Operations" />
            </div>
            <div className="flex gap-2 p-5 pt-0">
              <button onClick={save} disabled={saving}
                className="flex-1 h-11 bg-[#1a1a1a] text-white rounded-xl text-[13px] font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(null)} className="flex-1 h-11 bg-[#f5f3f0] text-[#5a5048] rounded-xl text-[13px] font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_,i) => <div key={i} className="bg-white rounded-2xl border border-[#e8e4df] h-16 skeleton" />)}</div>
      ) : expenses.length === 0 ? (
        <div className="py-16 text-center"><p className="text-[#a89d93] text-sm">No expenses recorded.</p></div>
      ) : (
        <div className="space-y-2">
          {expenses.map(e => (
            <div key={e.id} className="bg-white rounded-2xl border border-[#e8e4df] p-4 flex justify-between items-center">
              <div>
                <div className="text-[13.5px] font-medium text-[#1a1a1a]">{e.description}</div>
                <div className="text-[11px] text-[#a89d93]">{e.category && `${e.category} · `}{new Date(e.date).toLocaleDateString('en-GH')}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-[#c8382b]">{money(e.amount)}</span>
                <button onClick={() => setEditing(e)} className="w-7 h-7 rounded-lg bg-[#f5f3f0] text-[#5a5048] hover:bg-[#e8e4df] flex items-center justify-center transition">{Ic.edit}</button>
                <button onClick={() => del(e.id)} className="w-7 h-7 rounded-lg bg-[#fde8e8] text-[#c8382b] hover:bg-red-200 flex items-center justify-center transition">{Ic.trash}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── FORM HELPERS ──
function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-[11px] text-[#a89d93] mb-1">{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-10 px-3 bg-[#f5f3f0] border border-[#e8e4df] rounded-xl text-[13px] focus:outline-none focus:border-[#1a1a1a] transition" />
    </div>
  )
}

function NumField({ label, value, onChange, step = '0.01' }) {
  return (
    <div>
      <label className="block text-[11px] text-[#a89d93] mb-1">{label}</label>
      <input type="number" step={step} min="0" value={value || ''} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-10 px-3 bg-[#f5f3f0] border border-[#e8e4df] rounded-xl text-[13px] focus:outline-none focus:border-[#1a1a1a] transition" />
    </div>
  )
}

function ActionBtn({ children, onClick, color }) {
  const cls = {
    green: 'bg-[#e8f5ee] text-[#2d7a4f] hover:bg-[#d4eedd]',
    blue: 'bg-[#e8eef8] text-[#1a5fa8] hover:bg-[#d4e4f5]',
    red: 'bg-[#fde8e8] text-[#c8382b] hover:bg-[#fad0d0]',
  }[color] || 'bg-[#f5f3f0] text-[#5a5048]'
  return (
    <button onClick={onClick} className={`text-[11px] px-3 py-1.5 rounded-lg font-semibold transition ${cls}`}>{children}</button>
  )
}
