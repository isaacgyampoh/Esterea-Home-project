import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tgdtjfquwbtvfsdnvvgm.supabase.co'
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZHRqZnF1d2J0dmZzZG52dmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTM4MjUsImV4cCI6MjA5NjAyOTgyNX0.uXUkodx29_LQNU8pkpbxNnYGFgBYmoFTJHtxVWWAt8E'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
const money = n => `GH₵ ${Number(n).toFixed(2)}`

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    if (sessionStorage.getItem('esterea_admin') === 'yes') setAuthed(true)
  }, [])

  function login() {
    const pw = import.meta.env.VITE_ADMIN_PASSWORD || 'esterea2026'
    if (pass === pw) { setAuthed(true); sessionStorage.setItem('esterea_admin', 'yes') }
  }

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <div className="w-full max-w-xs">
        <h1 className="text-lg font-bold text-center mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Esterea Home</h1>
        <p className="text-xs text-stone-400 text-center mb-5">Admin Panel</p>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="Password"
          className="w-full h-11 px-4 border border-stone-200 rounded-lg text-sm mb-3 focus:outline-none focus:border-stone-400" />
        <button onClick={login} className="w-full h-11 bg-stone-900 text-white rounded-lg text-sm font-semibold">Login</button>
      </div>
    </div>
  )

  const TABS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
    { id: 'pos', label: 'POS' },
    { id: 'sales', label: 'Sales' },
    { id: 'expenses', label: 'Expenses' },
  ]

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-200 px-4">
        <div className="max-w-6xl mx-auto h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-stone-900">Esterea Home</span>
            <span className="text-[10px] text-stone-400">Admin</span>
          </div>
          <a href="/" className="text-xs text-stone-400 hover:text-stone-700 transition">View Store →</a>
        </div>
      </div>
      <div className="bg-white border-b border-stone-200 px-4 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex gap-1 -mb-px">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-xs font-medium border-b-2 transition whitespace-nowrap ${tab === t.id ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-4">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'products' && <Products />}
        {tab === 'orders' && <Orders />}
        {tab === 'pos' && <POS />}
        {tab === 'sales' && <Sales />}
        {tab === 'expenses' && <Expenses />}
      </div>
    </div>
  )
}

// ═══ DASHBOARD ═══
function Dashboard() {
  const [stats, setStats] = useState(null)
  useEffect(() => { load() }, [])
  async function load() {
    const today = new Date().toISOString().slice(0, 10)
    const [{ count: prodCount }, { count: orderCount }, { data: sales }, { data: expenses }, { data: orders }] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('whatsapp_orders').select('*', { count: 'exact', head: true }),
      supabase.from('sales').select('total,profit,date').eq('voided', false),
      supabase.from('expenses').select('amount,date'),
      supabase.from('whatsapp_orders').select('total,status,date'),
    ])
    const s = sales || [], e = expenses || [], o = orders || []
    const todaySales = s.filter(x => x.date?.startsWith(today))
    const todayOrders = o.filter(x => x.date?.startsWith(today))
    setStats({
      products: prodCount || 0,
      orders: orderCount || 0,
      revenue: s.reduce((a, x) => a + Number(x.total || 0), 0),
      profit: s.reduce((a, x) => a + Number(x.profit || 0), 0),
      expenses: e.reduce((a, x) => a + Number(x.amount || 0), 0),
      todayRevenue: todaySales.reduce((a, x) => a + Number(x.total || 0), 0),
      todaySales: todaySales.length,
      pendingOrders: o.filter(x => x.status === 'Pending').length,
      paidOrders: o.filter(x => x.status === 'Paid').length,
      onlineRevenue: o.filter(x => x.status === 'Paid' || x.status === 'Completed').reduce((a, x) => a + Number(x.total || 0), 0),
      lowStock: 0,
    })
    const { count: low } = await supabase.from('products').select('*', { count: 'exact', head: true }).lte('quantity', 5).eq('visible', true)
    setStats(prev => prev ? { ...prev, lowStock: low || 0 } : prev)
  }
  if (!stats) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" /></div>

  const cards = [
    { label: 'Products', value: stats.products, color: 'bg-blue-50 text-blue-700' },
    { label: 'Low Stock', value: stats.lowStock, color: stats.lowStock > 0 ? 'bg-red-50 text-red-700' : 'bg-stone-50 text-stone-500' },
    { label: 'Today Sales', value: stats.todaySales, color: 'bg-green-50 text-green-700' },
    { label: 'Today Revenue', value: money(stats.todayRevenue), color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Total Revenue', value: money(stats.revenue), color: 'bg-purple-50 text-purple-700' },
    { label: 'Total Profit', value: money(stats.profit), color: 'bg-amber-50 text-amber-700' },
    { label: 'Expenses', value: money(stats.expenses), color: 'bg-red-50 text-red-700' },
    { label: 'Net Profit', value: money(stats.profit - stats.expenses), color: 'bg-teal-50 text-teal-700' },
    { label: 'Online Orders', value: stats.orders, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Pending', value: stats.pendingOrders, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Paid', value: stats.paidOrders, color: 'bg-green-50 text-green-700' },
    { label: 'Online Revenue', value: money(stats.onlineRevenue), color: 'bg-cyan-50 text-cyan-700' },
  ]
  return (
    <div>
      <h1 className="text-lg font-bold text-stone-900 mb-4">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className={`${c.color} rounded-xl p-4`}>
            <div className="text-[10px] font-semibold uppercase tracking-wider opacity-60">{c.label}</div>
            <div className="text-xl font-bold mt-1">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══ PRODUCTS ═══
function Products() {
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  useEffect(() => { load() }, [])
  async function load() {
    const { data } = await supabase.from('products').select('*').order('name')
    setProducts(data || [])
  }
  async function save() {
    if (!editing) return
    const { id, created_at, ...data } = editing
    if (id) await supabase.from('products').update(data).eq('id', id)
    else await supabase.from('products').insert(data)
    setEditing(null); load()
  }
  async function del(id) { if (confirm('Delete this product?')) { await supabase.from('products').delete().eq('id', id); load() } }
  async function toggleVisible(id, v) { await supabase.from('products').update({ visible: !v }).eq('id', id); load() }

  const filtered = search ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) : products

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-stone-900">Products ({products.length})</h1>
        <button onClick={() => setEditing({ name: '', category: '', price: 0, cost_price: 0, quantity: 0, image: '', description: '', visible: true, wholesale_price: 0, wholesale_min_qty: 0 })}
          className="h-9 px-4 bg-stone-900 text-white rounded-lg text-xs font-semibold">+ Add Product</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full h-10 px-4 mb-4 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400" />

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-stone-900 mb-4">{editing.id ? 'Edit' : 'New'} Product</h2>
            <div className="space-y-3">
              <input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Product name" className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm" />
              <input value={editing.category || ''} onChange={e => setEditing({ ...editing, category: e.target.value })} placeholder="Category" className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm" />
              <input value={editing.image || ''} onChange={e => setEditing({ ...editing, image: e.target.value })} placeholder="Image URL (Cloudinary)" className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm" />
              <textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Description" className="w-full h-16 px-3 py-2 border border-stone-200 rounded-lg text-sm resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] text-stone-400 mb-1 block">Selling Price</label><input type="number" step="0.01" value={editing.price || ''} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm" /></div>
                <div><label className="text-[10px] text-stone-400 mb-1 block">Cost Price</label><input type="number" step="0.01" value={editing.cost_price || ''} onChange={e => setEditing({ ...editing, cost_price: Number(e.target.value) })} className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm" /></div>
              </div>
              <div><label className="text-[10px] text-stone-400 mb-1 block">Stock Quantity</label><input type="number" value={editing.quantity || 0} onChange={e => setEditing({ ...editing, quantity: Number(e.target.value) })} className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] text-stone-400 mb-1 block">Wholesale Price</label><input type="number" step="0.01" value={editing.wholesale_price || ''} onChange={e => setEditing({ ...editing, wholesale_price: Number(e.target.value) })} className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm" /></div>
                <div><label className="text-[10px] text-stone-400 mb-1 block">Wholesale Min Qty</label><input type="number" value={editing.wholesale_min_qty || 0} onChange={e => setEditing({ ...editing, wholesale_min_qty: Number(e.target.value) })} className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm" /></div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={save} className="flex-1 h-10 bg-stone-900 text-white rounded-lg text-sm font-semibold">Save</button>
              <button onClick={() => setEditing(null)} className="flex-1 h-10 bg-stone-100 text-stone-600 rounded-lg text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Product list */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {filtered.map(p => (
          <div key={p.id} className={`flex items-center gap-3 p-3 border-b border-stone-100 last:border-0 ${!p.visible ? 'opacity-40' : ''}`}>
            <div className="w-10 h-10 bg-stone-100 rounded-lg overflow-hidden shrink-0">
              {p.image && <img src={p.image.replace('/upload/', '/upload/w_80,q_auto/')} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-stone-900 truncate">{p.name}</div>
              <div className="text-[11px] text-stone-400">{p.category} · Stock: {p.quantity} · {money(p.price)}</div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => toggleVisible(p.id, p.visible)} className={`text-[10px] px-2 py-1 rounded font-semibold ${p.visible ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>{p.visible ? 'ON' : 'OFF'}</button>
              <button onClick={() => setEditing(p)} className="text-[10px] px-2 py-1 bg-stone-100 text-stone-600 rounded font-semibold">Edit</button>
              <button onClick={() => del(p.id)} className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded font-semibold">Del</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-stone-400 text-center py-8">No products. Add one above.</p>}
      </div>
    </div>
  )
}

// ═══ ORDERS ═══
function Orders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  useEffect(() => { load() }, [])
  async function load() {
    const { data } = await supabase.from('whatsapp_orders').select('*').order('date', { ascending: false }).limit(100)
    setOrders(data || [])
  }
  async function updateStatus(id, status) { await supabase.from('whatsapp_orders').update({ status }).eq('id', id); load() }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const badge = s => {
    if (s === 'Paid' || s === 'Completed') return 'bg-green-100 text-green-700'
    if (s === 'Pending') return 'bg-yellow-100 text-yellow-700'
    if (s === 'Cancelled') return 'bg-red-100 text-red-700'
    return 'bg-stone-100 text-stone-500'
  }

  return (
    <div>
      <h1 className="text-lg font-bold text-stone-900 mb-4">Orders</h1>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['all', 'Pending', 'Paid', 'Completed', 'Cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`h-8 px-4 rounded-lg text-xs font-semibold whitespace-nowrap ${filter === f ? 'bg-stone-900 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}>
            {f === 'all' ? `All (${orders.length})` : `${f} (${orders.filter(o => o.status === f).length})`}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map(o => (
          <div key={o.id} className="bg-white rounded-lg border border-stone-200 p-4">
            <div className="flex justify-between items-start mb-1">
              <div>
                <div className="text-[11px] text-stone-300 font-mono">{o.order_no}</div>
                <div className="text-sm font-semibold text-stone-900">{o.customer_name || 'Unknown'}</div>
                <div className="text-xs text-stone-400">{o.customer_phone}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-stone-900">{money(o.total)}</div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${badge(o.status)}`}>{o.status}</span>
              </div>
            </div>
            <div className="text-[11px] text-stone-400 mt-1">{o.address} · {new Date(o.date).toLocaleString()}</div>
            {o.items && <div className="text-[10px] text-stone-300 mt-1">{(typeof o.items === 'string' ? JSON.parse(o.items) : o.items).map(i => `${i.qty}× ${i.name}`).join(', ')}</div>}
            <div className="flex gap-1.5 mt-3">
              {o.status === 'Pending' && <button onClick={() => updateStatus(o.id, 'Paid')} className="text-[10px] px-3 py-1 bg-green-600 text-white rounded font-semibold">Mark Paid</button>}
              {o.status === 'Paid' && <button onClick={() => updateStatus(o.id, 'Completed')} className="text-[10px] px-3 py-1 bg-blue-600 text-white rounded font-semibold">Mark Completed</button>}
              {o.status !== 'Cancelled' && o.status !== 'Completed' && <button onClick={() => updateStatus(o.id, 'Cancelled')} className="text-[10px] px-3 py-1 bg-red-50 text-red-600 rounded font-semibold">Cancel</button>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-stone-400 text-center py-8">No orders.</p>}
      </div>
    </div>
  )
}

// ═══ POS ═══
function POS() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [payment, setPayment] = useState('Cash')
  const [custName, setCustName] = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => { supabase.from('products').select('*').eq('visible', true).gt('quantity', 0).order('name').then(({ data }) => setProducts(data || [])) }, [])

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
    if (cart.length === 0) return
    const receipt = 'POS-' + Date.now().toString(36).toUpperCase()
    const items = cart.map(c => ({ name: c.name, qty: c.qty, price: c.price }))
    await supabase.from('sales').insert({
      date: new Date().toISOString(), items, total, profit, payment,
      customer_name: custName, customer_phone: custPhone, receipt_no: receipt,
    })
    // Deduct stock
    for (const c of cart) {
      await supabase.rpc('decrement_stock', { product_id: c.id, qty: c.qty }).catch(() => {
        supabase.from('products').update({ quantity: 0 }).eq('id', c.id)
      })
    }
    setCart([]); setCustName(''); setCustPhone(''); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h1 className="text-lg font-bold text-stone-900 mb-4">Point of Sale</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Products */}
        <div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full h-10 px-4 mb-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400" />
          <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
            {filtered.map(p => (
              <button key={p.id} onClick={() => addToCart(p)} className="bg-white border border-stone-200 rounded-lg p-3 text-left hover:border-stone-400 transition press">
                <div className="text-xs font-medium text-stone-800 truncate">{p.name}</div>
                <div className="text-sm font-bold text-stone-900 mt-0.5">{money(p.price)}</div>
                <div className="text-[10px] text-stone-400">Stock: {p.quantity}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <h3 className="font-semibold text-stone-900 text-sm mb-3">Cart</h3>
          {saved && <div className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-2 rounded-lg mb-3">Sale recorded!</div>}
          {cart.length === 0 ? <p className="text-xs text-stone-300 py-4 text-center">Tap products to add</p> : (
            <div className="space-y-2 mb-4">
              {cart.map(c => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <div className="flex-1 min-w-0"><span className="text-stone-800 truncate block">{c.name}</span></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCart(cart.map(x => x.id === c.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))} className="w-6 h-6 rounded bg-stone-100 text-stone-500 text-xs flex items-center justify-center">-</button>
                    <span className="text-xs font-bold w-4 text-center">{c.qty}</span>
                    <button onClick={() => setCart(cart.map(x => x.id === c.id ? { ...x, qty: x.qty + 1 } : x))} className="w-6 h-6 rounded bg-stone-100 text-stone-500 text-xs flex items-center justify-center">+</button>
                    <span className="text-xs font-bold w-16 text-right">{money(c.price * c.qty)}</span>
                    <button onClick={() => setCart(cart.filter(x => x.id !== c.id))} className="text-red-400 text-xs">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="border-t border-stone-200 pt-3 mb-4">
            <div className="flex justify-between text-base font-bold text-stone-900"><span>Total</span><span>{money(total)}</span></div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {['Cash', 'Momo', 'Paystack'].map(p => (
              <button key={p} onClick={() => setPayment(p)} className={`h-9 rounded-lg text-xs font-semibold transition ${payment === p ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>{p}</button>
            ))}
          </div>
          <input value={custName} onChange={e => setCustName(e.target.value)} placeholder="Customer name (optional)" className="w-full h-9 px-3 mb-2 border border-stone-200 rounded-lg text-xs" />
          <input value={custPhone} onChange={e => setCustPhone(e.target.value)} placeholder="Phone (optional)" className="w-full h-9 px-3 mb-3 border border-stone-200 rounded-lg text-xs" />
          <button onClick={completeSale} disabled={cart.length === 0} className="w-full h-11 bg-stone-900 text-white rounded-lg text-sm font-semibold disabled:opacity-30 press">Complete Sale · {money(total)}</button>
        </div>
      </div>
    </div>
  )
}

// ═══ SALES ═══
function Sales() {
  const [sales, setSales] = useState([])
  useEffect(() => { supabase.from('sales').select('*').eq('voided', false).order('date', { ascending: false }).limit(100).then(({ data }) => setSales(data || [])) }, [])
  const total = sales.reduce((a, s) => a + Number(s.total || 0), 0)
  const profit = sales.reduce((a, s) => a + Number(s.profit || 0), 0)

  return (
    <div>
      <h1 className="text-lg font-bold text-stone-900 mb-1">Sales</h1>
      <p className="text-xs text-stone-400 mb-4">Revenue: {money(total)} · Profit: {money(profit)}</p>
      <div className="space-y-2">
        {sales.map(s => (
          <div key={s.id} className="bg-white rounded-lg border border-stone-200 p-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[11px] text-stone-300 font-mono">{s.receipt_no}</div>
                <div className="text-sm font-semibold text-stone-900">{money(s.total)}</div>
                <div className="text-[10px] text-stone-400">{s.payment} · Profit: {money(s.profit)}</div>
              </div>
              <div className="text-[10px] text-stone-400">{new Date(s.date).toLocaleString()}</div>
            </div>
            {s.items && <div className="text-[10px] text-stone-300 mt-1">{(typeof s.items === 'string' ? JSON.parse(s.items) : s.items).map(i => `${i.qty}× ${i.name}`).join(', ')}</div>}
          </div>
        ))}
        {sales.length === 0 && <p className="text-sm text-stone-400 text-center py-8">No sales yet.</p>}
      </div>
    </div>
  )
}

// ═══ EXPENSES ═══
function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [editing, setEditing] = useState(null)
  useEffect(() => { load() }, [])
  async function load() { const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false }).limit(100); setExpenses(data || []) }
  async function save() {
    if (!editing) return
    const { id, ...data } = editing
    if (id) await supabase.from('expenses').update(data).eq('id', id)
    else await supabase.from('expenses').insert({ ...data, date: new Date().toISOString() })
    setEditing(null); load()
  }
  async function del(id) { if (confirm('Delete?')) { await supabase.from('expenses').delete().eq('id', id); load() } }
  const total = expenses.reduce((a, e) => a + Number(e.amount || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h1 className="text-lg font-bold text-stone-900">Expenses</h1><p className="text-xs text-stone-400">Total: {money(total)}</p></div>
        <button onClick={() => setEditing({ description: '', amount: 0, category: '' })} className="h-9 px-4 bg-stone-900 text-white rounded-lg text-xs font-semibold">+ Add</button>
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm">
            <h2 className="font-bold text-stone-900 mb-4">{editing.id ? 'Edit' : 'New'} Expense</h2>
            <div className="space-y-3">
              <input value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Description" className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm" />
              <input type="number" step="0.01" value={editing.amount || ''} onChange={e => setEditing({ ...editing, amount: Number(e.target.value) })} placeholder="Amount" className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm" />
              <input value={editing.category || ''} onChange={e => setEditing({ ...editing, category: e.target.value })} placeholder="Category" className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm" />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={save} className="flex-1 h-10 bg-stone-900 text-white rounded-lg text-sm font-semibold">Save</button>
              <button onClick={() => setEditing(null)} className="flex-1 h-10 bg-stone-100 text-stone-600 rounded-lg text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {expenses.map(e => (
          <div key={e.id} className="bg-white rounded-lg border border-stone-200 p-3 flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-stone-900">{e.description}</div>
              <div className="text-[10px] text-stone-400">{e.category} · {new Date(e.date).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-red-600">{money(e.amount)}</span>
              <button onClick={() => setEditing(e)} className="text-[10px] px-2 py-1 bg-stone-100 text-stone-600 rounded">Edit</button>
              <button onClick={() => del(e.id)} className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded">Del</button>
            </div>
          </div>
        ))}
        {expenses.length === 0 && <p className="text-sm text-stone-400 text-center py-8">No expenses.</p>}
      </div>
    </div>
  )
}
