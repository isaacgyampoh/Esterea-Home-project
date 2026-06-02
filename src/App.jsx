import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import Admin from './Admin.jsx'

// ============ CONFIG (update with real values) ============
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://PLACEHOLDER.supabase.co'
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ''
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

const SHOP = {
  name: 'Esterea Home',
  phone: '024 000 0000',
  phone2: '054 000 0000',
  address: 'Accra, Ghana',
  wa: '233240000000',
  mapsUrl: '#',
}

// ============ HELPERS ============
const money = n => `GH₵ ${Number(n).toFixed(2)}`
const thumb = (url, w = 400) => url ? url.replace('/upload/', `/upload/w_${w},q_auto,f_auto/`) : ''
const formatPhone = p => p.replace(/\s+/g, '').replace(/^0/, '233')

// ============ ICONS ============
const I = {
  search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
  grid: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  cart: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  track: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>,
  minus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  phone: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  pin: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
}

// ============ CARD ============
function Card({ p, promo, onOpen, onAdd }) {
  const [ok, setOk] = useState(false)
  const add = e => { e.stopPropagation(); onAdd(); setOk(true); setTimeout(() => setOk(false), 1200) }
  return (
    <div className="cursor-pointer group card-lift" onClick={onOpen}>
      <div className="aspect-[3/4] bg-stone-100 rounded-xl overflow-hidden mb-2.5 relative">
        {p.image ? <img src={thumb(p.image, 500)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" /> : <div className="w-full h-full" />}
        {promo && <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-red-600 text-white text-[8px] font-bold rounded tracking-wider uppercase">Sale</span>}
        <button onClick={add} className={`absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${ok ? 'bg-emerald-600 text-white scale-110' : 'bg-white shadow-md text-stone-600 md:translate-y-2 md:opacity-0 md:group-hover:opacity-100 md:group-hover:translate-y-0'}`}>
          {ok ? I.check : I.plus}
        </button>
      </div>
      <div className="text-[9px] text-stone-400 uppercase tracking-wider">{p.category}</div>
      <div className="text-[13px] font-medium leading-snug mt-0.5 line-clamp-2 text-stone-800">{p.name}</div>
      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[14px] font-bold text-stone-900">{money(promo ? promo.price : p.price)}</span>
          {promo && <span className="text-[11px] text-stone-300 line-through">{money(p.price)}</span>}
        </div>
        <button onClick={add} className={`text-[10px] font-bold px-3 py-1.5 rounded transition press ${ok ? 'bg-emerald-600 text-white' : 'bg-stone-900 text-white hover:bg-stone-700'}`}>{ok ? '✓ Added' : 'Add'}</button>
      </div>
    </div>
  )
}

// ============ MAIN APP ============
export default function App() {
  const [page, setPage] = useState('home')
  const [products, setProducts] = useState([])
  const [promos, setPromos] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [catFilter, setCatFilter] = useState('All')
  const [detail, setDetail] = useState(null)
  const [heroIdx, setHeroIdx] = useState(0)

  // Checkout
  const [fulfillment, setFulfillment] = useState('delivery')
  const [custName, setCustName] = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [custAddress, setCustAddress] = useState('')
  const [custNotes, setCustNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState(null)

  // Track
  const [trackPhone, setTrackPhone] = useState('')
  const [trackOrders, setTrackOrders] = useState([])
  const [tracked, setTracked] = useState(false)

  useEffect(() => { loadData() }, [])
  useEffect(() => { const t = setInterval(() => setHeroIdx(i => (i + 1) % Math.max(heroProducts.length, 1)), 5000); return () => clearInterval(t) }, [products])
  useEffect(() => { const h = window.location.hash.slice(1) || '/'; const map = { '/': 'home', '/shop': 'shop', '/cart': 'cart', '/checkout': 'checkout', '/track': 'track', '/admin': 'admin' }; setPage(map[h] || 'home') }, [])

  // Admin panel
  if (page === 'admin' || window.location.hash === '#/admin') return <Admin />

  async function loadData() {
    const [{ data: p }, { data: pr }] = await Promise.all([
      supabase.from('products').select('*').eq('visible', true).order('name'),
      supabase.from('promos').select('*').gte('end_date', new Date().toISOString()),
    ])
    setProducts(p || [])
    setPromos(pr || [])
    const cats = [...new Set((p || []).map(x => x.category).filter(Boolean))]
    setCategories(['All', ...cats])
    setLoading(false)
  }

  const go = (p, h) => { setPage(p); window.location.hash = h; window.scrollTo(0, 0) }
  const getPromo = pid => promos.find(pr => pr.product_id === pid && new Date(pr.end_date) > new Date())
  const heroProducts = products.filter(p => p.image).slice(0, 5)
  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.category?.toLowerCase().includes(search.toLowerCase())) return false
    if (catFilter !== 'All' && p.category !== catFilter) return false
    return true
  })

  // Cart
  const addToCart = (p) => {
    const promo = getPromo(p.id)
    const price = promo ? promo.price : p.price
    setCart(c => {
      const existing = c.find(x => x.id === p.id)
      if (existing) return c.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x)
      return [...c, { id: p.id, name: p.name, price, img: p.image, qty: 1 }]
    })
    setToast(`${p.name} added to cart`)
    setTimeout(() => setToast(''), 1500)
  }
  const updQty = (id, d) => setCart(c => c.map(x => x.id === id ? { ...x, qty: Math.max(1, x.qty + d) } : x))
  const removeFromCart = id => setCart(c => c.filter(x => x.id !== id))
  const clearCart = () => setCart([])
  const cc = cart.reduce((a, c) => a + c.qty, 0)
  const ct = cart.reduce((a, c) => a + c.price * c.qty, 0)

  // Place order with Paystack
  async function placeOrder() {
    if (!custName.trim() || !custPhone.trim() || (fulfillment === 'delivery' && !custAddress.trim())) return
    setSubmitting(true)

    try {
      const { data: noData } = await supabase.rpc('generate_wa_order_no')
      const orderNo = noData || `WEB-${Date.now().toString(36).toUpperCase()}`
      const items = cart.map(c => ({ name: c.name, qty: c.qty, price: c.price }))
      const ref = `PAY-${orderNo}`

      // Create order in Supabase first
      await supabase.from('whatsapp_orders').insert({
        order_no: orderNo, date: new Date().toISOString(),
        customer_name: custName.trim(), customer_phone: formatPhone(custPhone.trim()),
        items, subtotal: ct, delivery_fee: 0, total: ct,
        address: fulfillment === 'pickup' ? 'PICKUP' : custAddress.trim(),
        notes: custNotes.trim(), status: 'Pending', paystack_ref: ref,
        created_at: new Date().toISOString()
      })

      // Open Paystack
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: formatPhone(custPhone.trim()) + '@estereahome.com',
        amount: Math.round(ct * 100),
        currency: 'GHS',
        ref,
        channels: ['mobile_money'],
        metadata: {
          order_no: orderNo,
          customer_name: custName.trim(),
          customer_phone: formatPhone(custPhone.trim()),
          items,
          address: fulfillment === 'pickup' ? 'PICKUP' : custAddress.trim(),
        },
        callback: async (response) => {
          // Mark as paid
          await supabase.from('whatsapp_orders').update({
            status: 'Paid',
            paystack_ref: response.reference,
            paid_at: new Date().toISOString(),
          }).eq('order_no', orderNo)

          setOrderResult({ orderNo, total: ct, fulfillment })
          setCart([])
          setPage('success')
          window.location.hash = '/success'
          setSubmitting(false)
        },
        onClose: () => {
          setSubmitting(false)
        },
      })
      handler.openIframe()
    } catch (e) {
      console.error(e)
      setSubmitting(false)
    }
  }

  // Track
  async function trackOrder() {
    if (!trackPhone.trim()) return
    const phone = formatPhone(trackPhone.trim())
    const { data } = await supabase.from('whatsapp_orders').select('*').eq('customer_phone', phone).order('date', { ascending: false }).limit(10)
    setTrackOrders(data || [])
    setTracked(true)
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Toast */}
      {toast && <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-stone-900 text-white px-5 py-2 rounded-full text-sm font-medium z-[100] shadow-lg fade-in">{toast}</div>}

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => go('home','/')} className="text-base font-bold tracking-tight text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>Esterea Home</button>
          <div className="hidden md:flex items-center gap-6">
            {[['Home','home','/'],['Shop','shop','/shop'],['Track','track','/track']].map(([l,p,h]) => (
              <button key={p} onClick={() => go(p,h)} className={`text-xs font-medium transition ${page === p ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}>{l}</button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { setShowSearch(!showSearch); if (page !== 'shop') go('shop','/shop') }} className="w-10 h-10 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition">{I.search}</button>
            <button onClick={() => go('cart','/cart')} className="relative w-10 h-10 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition">
              {I.cart}
              {cc > 0 && <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-stone-900 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-1">{cc}</span>}
            </button>
          </div>
        </div>
        {showSearch && <div className="px-4 pb-3 max-w-5xl mx-auto"><input autoFocus className="w-full h-11 px-4 bg-stone-50 rounded-lg text-sm border border-stone-200 focus:outline-none focus:border-stone-400 transition" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} /></div>}
      </nav>

      {/* ═══ HOME ═══ */}
      {page === 'home' && <div>
        {/* Hero */}
        <section className="relative overflow-hidden bg-stone-900" style={{ height: 'min(65vh, 480px)' }}>
          {heroProducts.map((p, i) => (
            <div key={p.id} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === heroIdx ? 1 : 0 }}>
              <img src={thumb(p.image, 1200)} alt="" className="w-full h-full object-cover" style={{ filter: 'brightness(0.5)' }} />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent z-[1]" />
          <div className="relative z-10 h-full flex flex-col justify-end max-w-5xl mx-auto px-4 pb-10">
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 mb-3">Premium Home Decor</p>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-3" style={{ fontFamily: 'var(--font-display)' }}>Make your space<br />feel like home.</h1>
            <p className="text-stone-400 text-sm max-w-md mb-6">Curated home decor, furnishings & accessories. Delivered across Ghana.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => go('shop','/shop')} className="h-11 px-7 bg-white text-stone-900 rounded-full text-xs font-bold hover:bg-stone-100 transition press flex items-center gap-2">Shop Now {I.arrow}</button>
              <a href={`tel:${SHOP.phone.replace(/\s/g,'')}`} className="h-11 px-5 border border-white/20 text-white/70 rounded-full text-xs font-medium hover:bg-white/5 transition flex items-center gap-1.5">{I.phone} Call Us</a>
            </div>
            <div className="flex gap-2 mt-6">
              {heroProducts.map((_, i) => (
                <button key={i} onClick={() => setHeroIdx(i)} className={`rounded-full transition-all duration-500 ${i === heroIdx ? 'w-8 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/25'}`} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h2 className="text-lg font-bold text-stone-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Shop by Category</h2>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map(c => (
              <button key={c} onClick={() => { setCatFilter(c); go('shop','/shop') }} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition press ${c === catFilter ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>{c}</button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className="max-w-5xl mx-auto px-4 pb-8">
          <h2 className="text-lg font-bold text-stone-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Our Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.slice(0, 8).map(p => <Card key={p.id} p={p} promo={getPromo(p.id)} onOpen={() => { setDetail(p); setPage('detail') }} onAdd={() => addToCart(p)} />)}
          </div>
          {products.length > 8 && <div className="text-center mt-6"><button onClick={() => go('shop','/shop')} className="text-sm font-medium text-stone-500 hover:text-stone-900 transition">View all products →</button></div>}
        </div>
      </div>}

      {/* ═══ SHOP ═══ */}
      {page === 'shop' && <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 pb-1">
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition press ${c === catFilter ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => <Card key={p.id} p={p} promo={getPromo(p.id)} onOpen={() => { setDetail(p); setPage('detail') }} onAdd={() => addToCart(p)} />)}
        </div>
        {filtered.length === 0 && <p className="text-center text-stone-300 py-16 text-sm">No products found.</p>}
      </div>}

      {/* ═══ PRODUCT DETAIL ═══ */}
      {page === 'detail' && detail && <div className="max-w-lg mx-auto px-4 py-6">
        <button onClick={() => go('shop','/shop')} className="text-sm text-stone-400 hover:text-stone-700 mb-4 inline-block">← Back</button>
        <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden mb-4">
          {detail.image && <img src={thumb(detail.image, 800)} alt={detail.name} className="w-full h-full object-cover" />}
        </div>
        <div className="text-[10px] text-stone-400 uppercase tracking-wider">{detail.category}</div>
        <h1 className="text-xl font-bold text-stone-900 mt-1" style={{ fontFamily: 'var(--font-display)' }}>{detail.name}</h1>
        {detail.description && <p className="text-sm text-stone-500 mt-2 leading-relaxed">{detail.description}</p>}
        <div className="flex items-baseline gap-2 mt-3">
          {getPromo(detail.id) ? <>
            <span className="text-xl font-bold text-stone-900">{money(getPromo(detail.id).price)}</span>
            <span className="text-sm text-stone-300 line-through">{money(detail.price)}</span>
          </> : <span className="text-xl font-bold text-stone-900">{money(detail.price)}</span>}
        </div>
        <button onClick={() => addToCart(detail)} className="w-full h-12 bg-stone-900 text-white rounded-lg text-sm font-semibold hover:bg-stone-700 transition press mt-5">Add to Cart</button>
      </div>}

      {/* ═══ CART ═══ */}
      {page === 'cart' && <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-lg font-bold text-stone-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>Your Cart</h1>
        <p className="text-xs text-stone-400 mb-5">{cc > 0 ? `${cc} item${cc !== 1 ? 's' : ''}` : ''}</p>
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-300 text-sm mb-4">Your cart is empty</p>
            <button onClick={() => go('shop','/shop')} className="h-10 px-6 bg-stone-900 text-white rounded-full text-xs font-bold press">Browse Products</button>
          </div>
        ) : <>
          <div className="flex justify-end mb-3"><button onClick={clearCart} className="text-[11px] text-stone-400 hover:text-red-500 transition">Clear all</button></div>
          <div className="space-y-2 mb-5">{cart.map(c => (
            <div key={c.id} className="flex gap-3 items-center p-3 rounded-lg bg-stone-50 border border-stone-100 relative group">
              <button onClick={() => removeFromCart(c.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-stone-300 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs transition opacity-0 group-hover:opacity-100">×</button>
              <div className="w-14 h-14 bg-stone-100 rounded-lg overflow-hidden shrink-0">{c.img && <img src={thumb(c.img, 150)} className="w-full h-full object-cover" />}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium truncate text-stone-800">{c.name}</div>
                <div className="text-[13px] font-bold text-stone-900 mt-0.5">{money(c.price)}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updQty(c.id, -1)} className="w-7 h-7 rounded bg-white border border-stone-200 flex items-center justify-center text-stone-500">{I.minus}</button>
                <span className="w-6 text-center text-[12px] font-bold">{c.qty}</span>
                <button onClick={() => updQty(c.id, 1)} className="w-7 h-7 rounded bg-white border border-stone-200 flex items-center justify-center text-stone-500">{I.plus}</button>
              </div>
            </div>
          ))}</div>
          <div className="bg-stone-900 text-white rounded-lg p-4 mb-4 flex justify-between items-center">
            <span className="text-sm text-stone-400">Total</span>
            <span className="text-lg font-bold">{money(ct)}</span>
          </div>
          <button onClick={() => { setPage('checkout'); window.location.hash = '/checkout' }} className="w-full h-12 bg-stone-900 text-white rounded-full text-sm font-bold hover:bg-stone-700 transition press">Proceed to Checkout</button>
        </>}
      </div>}

      {/* ═══ CHECKOUT ═══ */}
      {page === 'checkout' && <div className="max-w-md mx-auto px-4 py-6">
        <button onClick={() => go('cart','/cart')} className="text-[11px] text-stone-400 hover:text-stone-700 mb-5 inline-block">← Back to cart</button>
        <h2 className="text-lg font-bold text-stone-900 mb-5" style={{ fontFamily: 'var(--font-display)' }}>Checkout</h2>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <button onClick={() => setFulfillment('delivery')} className={`h-12 rounded-lg text-xs font-bold transition press ${fulfillment === 'delivery' ? 'bg-stone-900 text-white' : 'bg-white text-stone-400 border border-stone-200'}`}>Delivery</button>
          <button onClick={() => setFulfillment('pickup')} className={`h-12 rounded-lg text-xs font-bold transition press ${fulfillment === 'pickup' ? 'bg-stone-900 text-white' : 'bg-white text-stone-400 border border-stone-200'}`}>Pickup</button>
        </div>

        <div className="space-y-3 mb-5">
          <input className="w-full h-11 px-4 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 transition" value={custName} onChange={e => setCustName(e.target.value)} placeholder="Full name" />
          <input className="w-full h-11 px-4 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 transition" value={custPhone} onChange={e => setCustPhone(e.target.value)} placeholder="Phone number" type="tel" />
          {fulfillment === 'delivery' && <textarea className="w-full h-16 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 transition resize-none" value={custAddress} onChange={e => setCustAddress(e.target.value)} placeholder="Delivery address" />}
          {fulfillment === 'pickup' && <div className="bg-stone-50 rounded-lg p-3 border border-stone-100 text-[11px] text-stone-500">Pickup at <strong className="text-stone-700">{SHOP.address}</strong></div>}
          <input className="w-full h-11 px-4 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 transition" value={custNotes} onChange={e => setCustNotes(e.target.value)} placeholder="Notes (optional)" />
        </div>

        <div className="bg-stone-50 border border-stone-100 rounded-lg p-4 mb-4">
          {cart.map(c => <div key={c.id} className="flex justify-between text-[12px] py-0.5"><span className="text-stone-500">{c.qty}× {c.name}</span><span className="font-semibold text-stone-800">{money(c.price * c.qty)}</span></div>)}
          <div className="flex justify-between font-bold text-sm border-t border-stone-200 pt-2 mt-2 text-stone-900"><span>Total</span><span>{money(ct)}</span></div>
        </div>

        <button onClick={placeOrder} disabled={!custName.trim() || !custPhone.trim() || (fulfillment === 'delivery' && !custAddress.trim()) || submitting}
          className="w-full h-12 bg-stone-900 text-white rounded-full text-sm font-bold hover:bg-stone-700 transition press disabled:opacity-30 flex items-center justify-center gap-2">
          {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : <>Pay {money(ct)} with MoMo</>}
        </button>
        <p className="text-center text-[10px] text-stone-300 mt-3">Secured by Paystack</p>
      </div>}

      {/* ═══ SUCCESS ═══ */}
      {page === 'success' && orderResult && <div className="max-w-sm mx-auto px-4 py-10 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-stone-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>Payment Successful!</h1>
        <p className="text-sm text-stone-400 mb-6">Your order has been confirmed.</p>
        <div className="bg-stone-50 rounded-lg p-4 text-left mb-6 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-stone-400">Order</span><span className="font-mono font-semibold text-stone-800">{orderResult.orderNo}</span></div>
          <div className="flex justify-between"><span className="text-stone-400">Total</span><span className="font-bold text-stone-900">{money(orderResult.total)}</span></div>
          <div className="flex justify-between"><span className="text-stone-400">{orderResult.fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}</span><span className="text-stone-700">{orderResult.fulfillment === 'pickup' ? SHOP.address : 'We\'ll contact you'}</span></div>
        </div>
        <button onClick={() => go('home','/')} className="h-10 px-6 bg-stone-900 text-white rounded-full text-xs font-semibold press">Continue Shopping</button>
      </div>}

      {/* ═══ TRACK ═══ */}
      {page === 'track' && <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-lg font-bold text-stone-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>Track Order</h1>
        <p className="text-sm text-stone-400 mb-6">Enter your phone number to find your orders.</p>
        <div className="flex gap-2 mb-6">
          <input type="tel" value={trackPhone} onChange={e => setTrackPhone(e.target.value)} onKeyDown={e => e.key === 'Enter' && trackOrder()} placeholder="024 000 0000"
            className="flex-1 h-11 px-4 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400" />
          <button onClick={trackOrder} className="h-11 px-6 bg-stone-900 text-white rounded-lg text-sm font-semibold press">Search</button>
        </div>
        {tracked && trackOrders.length === 0 && <p className="text-center text-stone-300 py-12 text-sm">No orders found.</p>}
        <div className="space-y-2">
          {trackOrders.map(o => (
            <div key={o.id} className="border border-stone-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-1">
                <div><div className="text-[11px] text-stone-300 font-mono">{o.order_no}</div><div className="text-sm font-semibold text-stone-900">{money(o.total)}</div></div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${o.status === 'Paid' || o.status === 'Completed' ? 'bg-green-100 text-green-700' : o.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-stone-100 text-stone-500'}`}>{o.status}</span>
              </div>
              <div className="text-[10px] text-stone-300 mt-1">{new Date(o.date || o.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>}

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-stone-900 mt-12 mb-16 md:mb-0">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between gap-6 mb-6">
            <div>
              <div className="text-white text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>Esterea Home</div>
              <p className="text-[11px] text-stone-500">Premium home decor & furnishings.</p>
            </div>
            <div className="flex gap-8">
              <div className="space-y-1.5">
                <button onClick={() => go('shop','/shop')} className="block text-[12px] text-stone-400 hover:text-white transition">Shop</button>
                <button onClick={() => go('track','/track')} className="block text-[12px] text-stone-400 hover:text-white transition">Track Order</button>
              </div>
              <div className="space-y-1.5">
                <a href={`tel:${SHOP.phone.replace(/\s/g,'')}`} className="block text-[12px] text-stone-400 hover:text-white transition">{SHOP.phone}</a>
                <a href={`https://wa.me/${SHOP.wa}`} target="_blank" className="block text-[12px] text-emerald-500 hover:text-emerald-400 transition">WhatsApp</a>
                {SHOP.mapsUrl !== '#' && <a href={SHOP.mapsUrl} target="_blank" className="block text-[12px] text-stone-400 hover:text-white transition">{SHOP.address}</a>}
              </div>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-4">
            <p className="text-[10px] text-stone-700">&copy; {new Date().getFullYear()} Esterea Home. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ═══ BOTTOM NAV ═══ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-stone-100 z-50 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around h-[58px] items-center">
          {[['Home','home','/',I.home],['Shop','shop','/shop',I.grid],['Cart','cart','/cart',I.cart],['Track','track','/track',I.track]].map(([l,p,h,ic]) => (
            <button key={p} onClick={() => go(p,h)} className={`flex flex-col items-center gap-1 relative transition ${page === p ? 'text-stone-900' : 'text-stone-400'}`}>
              <span className="relative">{ic}{p === 'cart' && cc > 0 && <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-stone-900 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-1">{cc}</span>}</span>
              <span className={`text-[9px] ${page === p ? 'font-bold' : 'font-medium'}`}>{l}</span>
              {page === p && <span className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-5 h-[2px] bg-stone-900 rounded-full" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
