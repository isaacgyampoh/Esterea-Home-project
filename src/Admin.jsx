import { useState, useEffect, useRef } from 'react'
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

// ── CLOUDINARY UPLOAD ──
const CLOUDINARY_CLOUD = 'dls9fai0i'
const CLOUDINARY_PRESET = 'esterea_unsigned' // unsigned upload preset

async function uploadToCloudinary(file, onProgress) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', CLOUDINARY_PRESET)
  fd.append('folder', 'esterea')

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`)
    xhr.upload.onprogress = e => {
      if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100))
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText)
        resolve(data.secure_url)
      } else {
        const err = JSON.parse(xhr.responseText)
        reject(new Error(err?.error?.message || 'Upload failed'))
      }
    }
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(fd)
  })
}

// ── IMAGE UPLOADER COMPONENT ──
function ImageUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) { setError('Please select an image file'); return }
    if (file.size > 10 * 1024 * 1024) { setError('File too large (max 10MB)'); return }
    setError('')
    setUploading(true)
    setProgress(0)
    try {
      const url = await uploadToCloudinary(file, setProgress)
      onChange(url)
    } catch (e) {
      setError(e.message || 'Upload failed. Check Cloudinary preset.')
    }
    setUploading(false)
    setProgress(0)
  }

  const onDrop = e => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <label className="block text-[11px] text-[#a89d93] mb-1.5">Product Image</label>

      {/* Preview */}
      {value && !uploading && (
        <div className="relative w-full h-40 bg-[#f5f2ee] rounded-xl overflow-hidden mb-2 group">
          <img src={value.replace('/upload/', '/upload/w_400,q_auto/')} alt="preview"
            className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="h-8 px-3 bg-white text-[#1a1a1a] rounded-lg text-[11px] font-semibold hover:bg-[#f0ede8] transition">
              Change
            </button>
            <button type="button" onClick={() => onChange('')}
              className="h-8 px-3 bg-white/10 text-white border border-white/30 rounded-lg text-[11px] font-semibold hover:bg-white/20 transition">
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Upload zone */}
      {!value && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition ${dragging ? 'border-[#1a1a1a] bg-[#f5f2ee]' : 'border-[#d4cec6] bg-[#fafaf8] hover:border-[#1a1a1a] hover:bg-[#f5f2ee]'}`}>
          {uploading ? (
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-[#a89d93] border-t-[#1a1a1a] rounded-full animate-spin mx-auto mb-2" />
              <div className="text-[11px] text-[#a89d93]">Uploading… {progress}%</div>
              <div className="w-32 h-1 bg-[#e8e4df] rounded-full mx-auto mt-1.5 overflow-hidden">
                <div className="h-full bg-[#1a1a1a] rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c8bfb4" strokeWidth="1.5" className="mb-2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div className="text-[12px] font-medium text-[#8a7d72]">Drop image or click to upload</div>
              <div className="text-[10px] text-[#c8bfb4] mt-0.5">JPG, PNG, WebP up to 10MB</div>
            </>
          )}
        </div>
      )}

      {/* Change button when image exists but not uploading */}
      {value && !uploading && (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="text-[11px] text-[#a89d93] hover:text-[#1a1a1a] transition mt-1">
          ↑ Upload different image
        </button>
      )}

      {/* URL fallback input */}
      <div className="mt-2">
        <input
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Or paste image URL..."
          className="w-full h-9 px-3 bg-[#f5f3f0] border border-[#e8e4df] rounded-lg text-[12px] focus:outline-none focus:border-[#1a1a1a] transition"
        />
      </div>

      {error && <p className="text-[11px] text-[#c8382b] mt-1">{error}</p>}

      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files[0]; if (f) handleFile(f); e.target.value = '' }} />
    </div>
  )
}

// ── STOCK ADJUST MODAL ──
function StockModal({ product, onClose, onDone }) {
  const [mode, setMode] = useState('set') // 'set' | 'add' | 'remove'
  const [qty, setQty] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function apply() {
    const n = parseInt(qty)
    if (isNaN(n) || n < 0) return
    setSaving(true)
    let newQty
    if (mode === 'set') newQty = n
    else if (mode === 'add') newQty = (product.quantity || 0) + n
    else newQty = Math.max(0, (product.quantity || 0) - n)

    await supabase.from('products').update({ quantity: newQty }).eq('id', product.id)
    setSaving(false)
    onDone(newQty)
    onClose()
  }

  const preview = () => {
    const n = parseInt(qty) || 0
    if (mode === 'set') return n
    if (mode === 'add') return (product.quantity || 0) + n
    return Math.max(0, (product.quantity || 0) - n)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#e8e4df]">
          <div>
            <h2 className="font-semibold text-[#1a1a1a] text-[14px]">Adjust Stock</h2>
            <p className="text-[11px] text-[#a89d93] mt-0.5 truncate max-w-[220px]">{product.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#a89d93] hover:bg-[#f5f3f0] transition">{Ic.x}</button>
        </div>
        <div className="p-5">
          {/* Current stock */}
          <div className="bg-[#f5f3f0] rounded-xl p-3 mb-4 flex items-center justify-between">
            <span className="text-[12px] text-[#8a7d72]">Current stock</span>
            <span className={`text-[15px] font-bold ${(product.quantity || 0) <= 3 ? 'text-[#c8382b]' : (product.quantity || 0) <= 10 ? 'text-[#c67d00]' : 'text-[#2d7a4f]'}`}>
              {product.quantity || 0} units
            </span>
          </div>

          {/* Mode selector */}
          <div className="grid grid-cols-3 gap-1.5 mb-4 p-1 bg-[#f5f3f0] rounded-xl">
            {[['set','Set to'],['add','Add'],['remove','Remove']].map(([v,l]) => (
              <button key={v} onClick={() => setMode(v)}
                className={`h-8 rounded-lg text-[11.5px] font-semibold transition ${mode===v ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#8a7d72]'}`}>
                {l}
              </button>
            ))}
          </div>

          <div className="mb-3">
            <label className="block text-[11px] text-[#a89d93] mb-1.5">
              {mode === 'set' ? 'New quantity' : mode === 'add' ? 'Units to add' : 'Units to remove'}
            </label>
            <input type="number" min="0" value={qty} onChange={e => setQty(e.target.value)}
              placeholder="0"
              className="w-full h-12 px-4 bg-[#f5f3f0] border border-[#e8e4df] rounded-xl text-[16px] font-semibold focus:outline-none focus:border-[#1a1a1a] transition text-center"
              autoFocus
            />
          </div>

          {/* Preview */}
          {qty !== '' && (
            <div className="bg-[#e8f5ee] rounded-xl p-3 mb-4 flex items-center justify-between">
              <span className="text-[12px] text-[#5a5048]">New stock will be</span>
              <span className="text-[15px] font-bold text-[#2d7a4f]">{preview()} units</span>
            </div>
          )}

          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Reason / note (optional)"
            className="w-full h-9 px-3 mb-4 bg-[#f5f3f0] border border-[#e8e4df] rounded-xl text-[12px] focus:outline-none focus:border-[#1a1a1a] transition" />

          <button onClick={apply} disabled={!qty || saving}
            className="w-full h-11 bg-[#1a1a1a] text-white rounded-xl text-[13px] font-semibold disabled:opacity-30 hover:bg-[#333] transition flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {saving ? 'Saving...' : 'Update Stock'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── PRODUCTS ──
function Products() {
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [stockModal, setStockModal] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all | active | hidden | low
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
    if (!confirm('Delete this product? This cannot be undone.')) return
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  async function toggleVisible(id, v) {
    await supabase.from('products').update({ visible: !v }).eq('id', id)
    setProducts(ps => ps.map(p => p.id === id ? { ...p, visible: !v } : p))
  }

  const blankProduct = { name: '', category: '', price: 0, cost_price: 0, quantity: 0, image: '', description: '', visible: true, wholesale_price: 0, wholesale_min_qty: 0 }

  const stockBadge = qty => {
    if (qty === 0) return { label: 'Out of Stock', cls: 'bg-[#fde8e8] text-[#c8382b]' }
    if (qty <= 3) return { label: 'Critical', cls: 'bg-[#fde8e8] text-[#c8382b]' }
    if (qty <= 10) return { label: 'Low Stock', cls: 'bg-[#fef3e2] text-[#c67d00]' }
    return { label: 'In Stock', cls: 'bg-[#e8f5ee] text-[#2d7a4f]' }
  }

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.category?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus === 'active' && !p.visible) return false
    if (filterStatus === 'hidden' && p.visible) return false
    if (filterStatus === 'low' && (p.quantity || 0) > 10) return false
    return true
  })

  const lowCount = products.filter(p => (p.quantity || 0) <= 10).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]" style={{fontFamily:'var(--font-display)'}}>Inventory</h1>
          <p className="text-[12px] text-[#a89d93]">{products.length} products · {lowCount > 0 && <span className="text-[#c67d00]">{lowCount} low stock</span>}</p>
        </div>
        <button onClick={() => setEditing(blankProduct)}
          className="flex items-center gap-2 h-10 px-4 bg-[#1a1a1a] text-white rounded-xl text-[12.5px] font-semibold hover:bg-[#333] transition press">
          {Ic.plus} Add Product
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full h-10 px-4 pl-9 bg-white border border-[#e8e4df] rounded-xl text-[13px] focus:outline-none focus:border-[#1a1a1a] transition" />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c8bfb4]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
        </div>
        <div className="flex gap-1.5">
          {[['all','All'],['active','Active'],['hidden','Hidden'],['low','Low Stock']].map(([v,l]) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={`h-10 px-3 rounded-xl text-[11.5px] font-medium whitespace-nowrap transition ${filterStatus===v ? 'bg-[#1a1a1a] text-white' : 'bg-white border border-[#e8e4df] text-[#8a7d72] hover:border-[#1a1a1a]'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Adjust Modal */}
      {stockModal && (
        <StockModal
          product={stockModal}
          onClose={() => setStockModal(null)}
          onDone={newQty => setProducts(ps => ps.map(p => p.id === stockModal.id ? { ...p, quantity: newQty } : p))}
        />
      )}

      {/* Edit / Add Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[#e8e4df] sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-[#1a1a1a] text-[15px]">{editing.id ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setEditing(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#a89d93] hover:text-[#1a1a1a] hover:bg-[#f5f3f0] transition">{Ic.x}</button>
            </div>
            <div className="p-5 space-y-4">

              {/* Image upload */}
              <ImageUploader value={editing.image || ''} onChange={v => setEditing({...editing, image:v})} />

              <div className="border-t border-[#f5f3f0] pt-4 space-y-3">
                <Field label="Product Name *" value={editing.name} onChange={v => setEditing({...editing, name:v})} placeholder="e.g. Rattan Side Table" />
                <Field label="Category" value={editing.category} onChange={v => setEditing({...editing, category:v})} placeholder="e.g. Furniture" />
                <div>
                  <label className="block text-[11px] text-[#a89d93] mb-1">Description</label>
                  <textarea value={editing.description||''} onChange={e => setEditing({...editing,description:e.target.value})} placeholder="Short description shown to customers"
                    className="w-full h-16 px-3 py-2 bg-[#f5f3f0] border border-[#e8e4df] rounded-xl text-[13px] focus:outline-none focus:border-[#1a1a1a] transition resize-none" />
                </div>
              </div>

              {/* Pricing section */}
              <div className="border border-[#e8e4df] rounded-xl p-4">
                <div className="text-[11px] font-semibold text-[#a89d93] uppercase tracking-widest mb-3">Pricing</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumField label="Selling Price (GH₵) *" value={editing.price} onChange={v => setEditing({...editing,price:v})} />
                  <NumField label="Cost Price (GH₵)" value={editing.cost_price} onChange={v => setEditing({...editing,cost_price:v})} />
                </div>
                {editing.price > 0 && editing.cost_price > 0 && (
                  <div className="mt-2 text-[11px] text-[#2d7a4f]">
                    Margin: GH₵ {(editing.price - editing.cost_price).toFixed(2)} ({((editing.price - editing.cost_price) / editing.price * 100).toFixed(0)}%)
                  </div>
                )}
              </div>

              {/* Stock section */}
              <div className="border border-[#e8e4df] rounded-xl p-4">
                <div className="text-[11px] font-semibold text-[#a89d93] uppercase tracking-widest mb-3">Stock</div>
                <NumField label="Opening / Current Quantity" value={editing.quantity} onChange={v => setEditing({...editing,quantity:v})} step="1" />
                <p className="text-[10.5px] text-[#c8bfb4] mt-1.5">Use the Adjust Stock button on the product row to change stock after creation.</p>
              </div>

              {/* Wholesale */}
              <div className="border border-[#e8e4df] rounded-xl p-4">
                <div className="text-[11px] font-semibold text-[#a89d93] uppercase tracking-widest mb-3">Wholesale (optional)</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumField label="Wholesale Price" value={editing.wholesale_price} onChange={v => setEditing({...editing,wholesale_price:v})} />
                  <NumField label="Min Quantity" value={editing.wholesale_min_qty} onChange={v => setEditing({...editing,wholesale_min_qty:v})} step="1" />
                </div>
              </div>

              {/* Visibility toggle */}
              <div className="flex items-center justify-between p-3 bg-[#f5f3f0] rounded-xl">
                <div>
                  <div className="text-[13px] font-medium text-[#1a1a1a]">Show in Store</div>
                  <div className="text-[11px] text-[#a89d93]">Customers can see and buy this product</div>
                </div>
                <button type="button" onClick={() => setEditing({...editing,visible:!editing.visible})}
                  className={`w-12 h-6 rounded-full flex items-center transition-colors px-0.5 ${editing.visible ? 'bg-[#2d7a4f]' : 'bg-[#d4cec6]'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${editing.visible ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="flex gap-2 p-5 pt-0 sticky bottom-0 bg-white border-t border-[#f5f3f0]">
              <button onClick={save} disabled={saving || !editing.name?.trim()}
                className="flex-1 h-11 bg-[#1a1a1a] text-white rounded-xl text-[13px] font-semibold hover:bg-[#333] transition disabled:opacity-40 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {saving ? 'Saving...' : (editing.id ? 'Save Changes' : 'Add Product')}
              </button>
              <button onClick={() => setEditing(null)} className="flex-1 h-11 bg-[#f5f3f0] text-[#5a5048] rounded-xl text-[13px] font-semibold hover:bg-[#e8e4df] transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_,i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-[#e8e4df] flex items-center gap-3">
              <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
              <div className="flex-1"><div className="skeleton h-3.5 w-40 rounded mb-2" /><div className="skeleton h-2.5 w-28 rounded" /></div>
              <div className="skeleton h-7 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8e4df] py-16 text-center">
          <div className="text-3xl mb-3 text-[#e8e4df]">◇</div>
          <p className="text-[#a89d93] text-sm">{search ? 'No products match your search.' : 'No products yet. Add your first one.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e8e4df] overflow-hidden">
          {/* Table header — desktop only */}
          <div className="hidden md:grid grid-cols-[48px_1fr_100px_90px_90px_90px_120px] gap-3 px-4 py-2.5 border-b border-[#f5f3f0] bg-[#fafaf8]">
            {['','Product','Category','Price','Cost','Stock',''].map((h,i) => (
              <div key={i} className="text-[10px] font-semibold text-[#a89d93] uppercase tracking-wider">{h}</div>
            ))}
          </div>

          {filtered.map(p => {
            const badge = stockBadge(p.quantity || 0)
            return (
              <div key={p.id} className={`flex md:grid md:grid-cols-[48px_1fr_100px_90px_90px_90px_120px] items-center gap-3 px-4 py-3 border-b border-[#f5f3f0] last:border-0 hover:bg-[#fafaf8] transition ${!p.visible ? 'opacity-50' : ''}`}>
                {/* Image */}
                <div className="w-12 h-12 bg-[#f5f2ee] rounded-xl overflow-hidden shrink-0">
                  {p.image
                    ? <img src={p.image.replace('/upload/', '/upload/w_96,q_auto/')} className="w-full h-full object-cover" alt={p.name} />
                    : <div className="w-full h-full flex items-center justify-center text-[#c8bfb4] text-xs" style={{fontFamily:'var(--font-display)'}}>E</div>
                  }
                </div>

                {/* Name + category (mobile shows all info here) */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[13px] font-medium text-[#1a1a1a] truncate">{p.name}</span>
                    {!p.visible && <span className="text-[9px] bg-[#f5f3f0] text-[#a89d93] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">Hidden</span>}
                  </div>
                  <div className="text-[11px] text-[#a89d93] md:hidden mt-0.5">{p.category} · {money(p.price)} · Qty: {p.quantity || 0}</div>
                  {/* Mobile stock badge */}
                  <span className={`md:hidden inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded mt-1 ${badge.cls}`}>{badge.label}</span>
                </div>

                {/* Category — desktop */}
                <div className="hidden md:block text-[12px] text-[#8a7d72] truncate">{p.category || '—'}</div>

                {/* Price */}
                <div className="hidden md:block text-[13px] font-semibold text-[#1a1a1a]">{money(p.price)}</div>

                {/* Cost */}
                <div className="hidden md:block text-[12px] text-[#a89d93]">{p.cost_price ? money(p.cost_price) : '—'}</div>

                {/* Stock */}
                <div className="hidden md:flex items-center gap-1.5">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>{p.quantity || 0}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 ml-auto md:ml-0">
                  {/* Stock adjust */}
                  <button onClick={() => setStockModal(p)}
                    className="h-7 px-2 rounded-lg bg-[#f5f3f0] text-[#5a5048] hover:bg-[#e8e4df] text-[10px] font-semibold transition hidden md:flex items-center gap-1"
                    title="Adjust stock">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    Stock
                  </button>
                  {/* Visibility */}
                  <button onClick={() => toggleVisible(p.id, p.visible)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${p.visible ? 'bg-[#e8f5ee] text-[#2d7a4f]' : 'bg-[#f5f3f0] text-[#c8bfb4]'}`}
                    title={p.visible ? 'Hide from store' : 'Show in store'}>
                    {Ic.eye}
                  </button>
                  {/* Edit */}
                  <button onClick={() => setEditing(p)} className="w-7 h-7 rounded-lg bg-[#f5f3f0] text-[#5a5048] hover:bg-[#e8e4df] flex items-center justify-center transition">{Ic.edit}</button>
                  {/* Delete */}
                  <button onClick={() => del(p.id)} className="w-7 h-7 rounded-lg bg-[#fde8e8] text-[#c8382b] hover:bg-red-200 flex items-center justify-center transition">{Ic.trash}</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Stock summary bar */}
      {!loading && products.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            ['Total Products', products.length, '#5a5048'],
            ['Low / Out of Stock', products.filter(p => (p.quantity||0) <= 10).length, '#c67d00'],
            ['Hidden', products.filter(p => !p.visible).length, '#a89d93'],
          ].map(([l,v,c]) => (
            <div key={l} className="bg-white rounded-xl p-3 border border-[#e8e4df] text-center">
              <div className="text-[10px] text-[#a89d93] mb-1">{l}</div>
              <div className="text-[18px] font-semibold" style={{color:c}}>{v}</div>
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
