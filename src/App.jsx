import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import Admin from './Admin.jsx'

// ============ CONFIG ============
const SUPABASE_URL = 'https://tgdtjfquwbtvfsdnvvgm.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZHRqZnF1d2J0dmZzZG52dmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTM4MjUsImV4cCI6MjA5NjAyOTgyNX0.uXUkodx29_LQNU8pkpbxNnYGFgBYmoFTJHtxVWWAt8E'
const PAYSTACK_KEY = 'pk_live_e77125e62b94f8222c402f584769d28fe505c92b'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

const SHOP = {
  name: 'Esterea Home',
  phone: '054 792 7722',
  wa: '233547927722',
  address: 'Accra, Ghana',
  tagline: 'Curated home decor & furnishings',
}

// ============ HELPERS ============
const money = n => `GH₵ ${Number(n || 0).toFixed(2)}`
const thumb = (url, w = 400) => url ? url.replace('/upload/', `/upload/w_${w},q_auto,f_auto/`) : ''
const formatPhone = p => p.replace(/\s+/g, '').replace(/^0/, '233')

function getPage() {
  const h = window.location.hash.replace('#', '') || '/'
  const map = { '/': 'home', '/shop': 'shop', '/cart': 'cart', '/checkout': 'checkout', '/track': 'track', '/admin': 'admin', '/success': 'success' }
  return map[h] || 'home'
}

// ============ ICONS ============
const Icons = {
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  cart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
  grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  track: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  arrowLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  minus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
  phone: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  wa: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  x: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
}

// ============ PRODUCT CARD ============
function Card({ p, promo, onOpen, onAdd }) {
  const [added, setAdded] = useState(false)
  const handleAdd = e => {
    e.stopPropagation()
    onAdd()
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }
  return (
    <div className="group cursor-pointer card-hover" onClick={onOpen}>
      <div className="relative aspect-[3/4] bg-[#f5f2ee] rounded-2xl overflow-hidden mb-3">
        {p.image
          ? <img src={thumb(p.image, 600)} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-[#c8bfb4] text-4xl font-light" style={{fontFamily:'var(--font-display)'}}>E</div>
        }
        {promo && <span className="absolute top-3 left-3 bg-[#c8382b] text-white text-[9px] font-semibold px-2.5 py-1 rounded-full tracking-wider uppercase">Sale</span>}
        <button
          onClick={handleAdd}
          className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-lg ${added ? 'bg-[#2d7a4f] text-white scale-110' : 'bg-white text-[#1a1a1a] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'}`}
        >
          {added ? Icons.check : Icons.plus}
        </button>
      </div>
      <div className="px-0.5">
        <div className="text-[10px] text-[#a89d93] uppercase tracking-widest mb-1">{p.category}</div>
        <div className="text-[13.5px] font-medium leading-snug line-clamp-2 text-[#1a1a1a] mb-2">{p.name}</div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-semibold text-[#1a1a1a]">{money(promo ? promo.price : p.price)}</span>
            {promo && <span className="text-[11px] text-[#c8bfb4] line-through">{money(p.price)}</span>}
          </div>
          <button onClick={handleAdd}
            className={`text-[10px] font-semibold px-3 py-1.5 rounded-full transition-all press ${added ? 'bg-[#2d7a4f] text-white' : 'bg-[#1a1a1a] text-white hover:bg-[#333]'}`}>
            {added ? '✓' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============ SKELETON ============
function CardSkeleton() {
  return (
    <div>
      <div className="aspect-[3/4] rounded-2xl skeleton mb-3" />
      <div className="skeleton h-2.5 w-16 rounded mb-2" />
      <div className="skeleton h-3.5 w-full rounded mb-1" />
      <div className="skeleton h-3.5 w-3/4 rounded mb-2.5" />
      <div className="skeleton h-5 w-20 rounded" />
    </div>
  )
}

// ============ LOAD PAYSTACK ============
function loadPaystack() {
  return new Promise(resolve => {
    if (window.PaystackPop) { resolve(); return }
    const s = document.createElement('script')
    s.src = 'https://js.paystack.co/v2/inline.js'
    s.onload = resolve
    document.head.appendChild(s)
  })
}

// ============ MAIN APP ============
export default function App() {
  // Routing — check hash FIRST before any state
  const initialPage = getPage()
  
  // If admin, render immediately without any store loading
  if (initialPage === 'admin') return <Admin />

  return <Store initialPage={initialPage} />
}

function Store({ initialPage }) {
  const [page, setPage] = useState(initialPage)
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
  const [tracking, setTracking] = useState(false)

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    const heroProducts = products.filter(p => p.image)
    if (heroProducts.length === 0) return
    const t = setInterval(() => setHeroIdx(i => (i + 1) % heroProducts.length), 5000)
    return () => clearInterval(t)
  }, [products.length])

  useEffect(() => {
    const onHash = () => {
      const p = getPage()
      if (p === 'admin') { window.location.reload(); return }
      setPage(p)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [{ data: p }, { data: pr }] = await Promise.all([
        supabase.from('products').select('*').eq('visible', true).order('name'),
        supabase.from('promos').select('*').gte('end_date', new Date().toISOString()),
      ])
      const prods = p || []
      setProducts(prods)
      setPromos(pr || [])
      const cats = ['All', ...new Set(prods.map(x => x.category).filter(Boolean))]
      setCategories(cats)
    } catch (e) {
      console.error('Load error:', e)
    }
    setLoading(false)
  }

  const go = useCallback((pg, hash) => {
    setPage(pg)
    window.location.hash = hash
    window.scrollTo(0, 0)
  }, [])

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }, [])

  const getPromo = pid => promos.find(pr => pr.product_id === pid && new Date(pr.end_date) > new Date())
  const heroProducts = products.filter(p => p.image).slice(0, 5)

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.category?.toLowerCase().includes(search.toLowerCase())) return false
    if (catFilter !== 'All' && p.category !== catFilter) return false
    return true
  })

  // Cart
  const addToCart = useCallback((p) => {
    const promo = getPromo(p.id)
    const price = promo ? promo.price : p.price
    setCart(c => {
      const ex = c.find(x => x.id === p.id)
      if (ex) return c.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x)
      return [...c, { id: p.id, name: p.name, price, img: p.image, qty: 1 }]
    })
    showToast(`${p.name.slice(0, 28)} added`)
  }, [promos])

  const updQty = (id, d) => setCart(c => c.map(x => x.id === id ? { ...x, qty: Math.max(1, x.qty + d) } : x))
  const removeFromCart = id => setCart(c => c.filter(x => x.id !== id))
  const cc = cart.reduce((a, c) => a + c.qty, 0)
  const ct = cart.reduce((a, c) => a + c.price * c.qty, 0)

  // Place order
  async function placeOrder() {
    if (!custName.trim() || !custPhone.trim() || (fulfillment === 'delivery' && !custAddress.trim())) return
    setSubmitting(true)
    try {
      await loadPaystack()
      const { data: noData } = await supabase.rpc('generate_wa_order_no').catch(() => ({ data: null }))
      const orderNo = noData || `EST-${Date.now().toString(36).toUpperCase()}`
      const items = cart.map(c => ({ name: c.name, qty: c.qty, price: c.price }))
      const ref = `PAY-${orderNo}-${Date.now()}`

      await supabase.from('whatsapp_orders').insert({
        order_no: orderNo,
        date: new Date().toISOString(),
        customer_name: custName.trim(),
        customer_phone: formatPhone(custPhone.trim()),
        items,
        subtotal: ct,
        delivery_fee: 0,
        total: ct,
        address: fulfillment === 'pickup' ? 'PICKUP' : custAddress.trim(),
        notes: custNotes.trim(),
        status: 'Pending',
        paystack_ref: ref,
        created_at: new Date().toISOString(),
      })

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: formatPhone(custPhone.trim()) + '@estereahome.com',
        amount: Math.round(ct * 100),
        currency: 'GHS',
        ref,
        channels: ['mobile_money'],
        metadata: { order_no: orderNo, customer_name: custName.trim(), items },
        callback: async (response) => {
          await supabase.from('whatsapp_orders').update({
            status: 'Paid',
            paystack_ref: response.reference,
            paid_at: new Date().toISOString(),
          }).eq('order_no', orderNo)
          setOrderResult({ orderNo, total: ct, fulfillment })
          setCart([])
          setCustName(''); setCustPhone(''); setCustAddress(''); setCustNotes('')
          go('success', '/success')
          setSubmitting(false)
        },
        onClose: () => setSubmitting(false),
      })
      handler.openIframe()
    } catch (e) {
      console.error(e)
      setSubmitting(false)
      showToast('Something went wrong. Try again.')
    }
  }

  // Track
  async function trackOrder() {
    if (!trackPhone.trim()) return
    setTracking(true)
    const phone = formatPhone(trackPhone.trim())
    const { data } = await supabase.from('whatsapp_orders').select('*').eq('customer_phone', phone).order('date', { ascending: false }).limit(10)
    setTrackOrders(data || [])
    setTracked(true)
    setTracking(false)
  }

  const statusColor = s => {
    if (s === 'Paid' || s === 'Completed') return 'bg-[#e8f5ee] text-[#2d7a4f]'
    if (s === 'Pending') return 'bg-[#fef3e2] text-[#c67d00]'
    if (s === 'Cancelled') return 'bg-[#fde8e8] text-[#c8382b]'
    return 'bg-[#f0ede8] text-[#8a7d72]'
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] pb-20 md:pb-0" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] fade-in pointer-events-none">
          <div className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full text-[12px] font-medium shadow-xl max-w-[280px] text-center">{toast}</div>
        </div>
      )}

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 bg-[#fafaf8]/95 backdrop-blur-xl border-b border-[#e8e4df]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[58px] flex items-center justify-between gap-4">
          <button onClick={() => go('home', '/')} className="shrink-0">
            <span className="text-[20px] font-semibold tracking-tight text-[#1a1a1a]" style={{ fontFamily: 'var(--font-display)' }}>Esterea Home</span>
          </button>

          <nav className="hidden md:flex items-center gap-7">
            {[['Home','home','/'],['Shop','shop','/shop'],['Track Order','track','/track']].map(([l,p,h]) => (
              <button key={p} onClick={() => go(p,h)}
                className={`text-[12.5px] font-medium transition-colors ${page===p ? 'text-[#1a1a1a]' : 'text-[#a89d93] hover:text-[#1a1a1a]'}`}>{l}</button>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button onClick={() => { setShowSearch(s => !s); if (page !== 'shop') go('shop', '/shop') }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8a7d72] hover:text-[#1a1a1a] hover:bg-[#f0ede8] transition">
              {Icons.search}
            </button>
            <button onClick={() => go('cart', '/cart')}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[#8a7d72] hover:text-[#1a1a1a] hover:bg-[#f0ede8] transition">
              {Icons.cart}
              {cc > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-[#1a1a1a] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{cc}</span>}
            </button>
          </div>
        </div>
        {showSearch && (
          <div className="px-4 sm:px-6 pb-3 max-w-6xl mx-auto slide-down">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89d93]">{Icons.search}</span>
              <input autoFocus className="w-full h-11 pl-10 pr-4 bg-[#f0ede8] rounded-xl text-[13px] border-none focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 transition"
                placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a89d93] hover:text-[#1a1a1a]">{Icons.x}</button>}
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════ HOME ═══════════════ */}
      {page === 'home' && (
        <main>
          {/* Hero */}
          <section className="relative overflow-hidden" style={{ height: 'min(70vh, 520px)', background: '#1a1a1a' }}>
            {heroProducts.map((p, i) => (
              <div key={p.id} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === heroIdx ? 1 : 0 }}>
                <img src={thumb(p.image, 1400)} alt="" className="w-full h-full object-cover" style={{ filter: 'brightness(0.45)' }} />
              </div>
            ))}
            {heroProducts.length === 0 && (
              <div className="absolute inset-0 bg-[#2a2520]" />
            )}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,26,26,0.9) 0%, transparent 60%)' }} />
            <div className="relative z-10 h-full flex flex-col justify-end max-w-6xl mx-auto px-4 sm:px-6 pb-12">
              <div className="fade-up">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#c8bfb4] mb-3">Premium Home Decor · Accra, Ghana</p>
                <h1 className="text-4xl md:text-6xl font-semibold text-white leading-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  Make your home<br />feel extraordinary.
                </h1>
                <p className="text-[#a89d93] text-sm max-w-md mb-8">Handpicked home decor, furnishings & accessories — delivered across Ghana.</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <button onClick={() => go('shop', '/shop')}
                    className="h-12 px-8 bg-white text-[#1a1a1a] rounded-full text-[12.5px] font-semibold hover:bg-[#f0ede8] transition press flex items-center gap-2">
                    Shop Now {Icons.arrow}
                  </button>
                  <a href={`https://wa.me/${SHOP.wa}`} target="_blank" rel="noreferrer"
                    className="h-12 px-6 border border-white/20 text-white/70 rounded-full text-[12.5px] font-medium hover:bg-white/5 transition flex items-center gap-2">
                    {Icons.wa} WhatsApp
                  </a>
                </div>
              </div>
              {heroProducts.length > 1 && (
                <div className="flex gap-2 mt-8">
                  {heroProducts.map((_, i) => (
                    <button key={i} onClick={() => setHeroIdx(i)}
                      className={`rounded-full transition-all duration-500 ${i === heroIdx ? 'w-8 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'}`} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Categories */}
          {categories.length > 1 && (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-2">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {categories.map(c => (
                  <button key={c} onClick={() => { setCatFilter(c); go('shop', '/shop') }}
                    className="px-4 py-2 rounded-full text-[11.5px] font-medium whitespace-nowrap transition press border border-[#e8e4df] hover:border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white bg-white text-[#5a5048]">
                    {c}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Products */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#1a1a1a]" style={{ fontFamily: 'var(--font-display)' }}>Our Collection</h2>
              {products.length > 8 && (
                <button onClick={() => go('shop', '/shop')} className="text-[12px] text-[#a89d93] hover:text-[#1a1a1a] transition flex items-center gap-1">
                  View all {Icons.arrow}
                </button>
              )}
            </div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.slice(0, 8).map((p, i) => (
                  <div key={p.id} className={`fade-up stagger-${Math.min(i + 1, 4)}`}>
                    <Card p={p} promo={getPromo(p.id)} onOpen={() => { setDetail(p); go('detail', '/detail') }} onAdd={() => addToCart(p)} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* About strip */}
          <section className="bg-[#1a1a1a] py-12 mt-6">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                ['✦', 'Curated Selection', 'Only the finest home decor pieces, handpicked for quality and style.'],
                ['◈', 'Ghana-wide Delivery', 'Fast, reliable delivery to your door anywhere in Ghana.'],
                ['◇', 'Quality Guaranteed', 'Every product meets our quality standards. Shop with confidence.'],
              ].map(([icon, title, desc]) => (
                <div key={title} className="text-white/80">
                  <div className="text-2xl mb-3 text-[#c8bfb4]">{icon}</div>
                  <div className="text-sm font-semibold text-white mb-1">{title}</div>
                  <div className="text-[12px] text-[#8a7d72] leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ═══════════════ SHOP ═══════════════ */}
      {page === 'shop' && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Category filter */}
          {categories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-7 pb-1">
              {categories.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`px-4 py-2 rounded-full text-[11.5px] font-medium whitespace-nowrap transition press border ${catFilter===c ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'border-[#e8e4df] text-[#5a5048] hover:border-[#1a1a1a]'}`}>
                  {c}
                </button>
              ))}
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <div className="text-4xl mb-3 text-[#e8e4df]">○</div>
              <p className="text-[#a89d93] text-sm">No products found.</p>
              {search && <button onClick={() => setSearch('')} className="mt-3 text-[12px] text-[#1a1a1a] underline">Clear search</button>}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((p, i) => (
                <div key={p.id} className={`fade-up stagger-${Math.min(i%4+1,4)}`}>
                  <Card p={p} promo={getPromo(p.id)} onOpen={() => { setDetail(p); go('detail', '/detail') }} onAdd={() => addToCart(p)} />
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ═══════════════ DETAIL ═══════════════ */}
      {page === 'detail' && detail && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => go('shop', '/shop')} className="flex items-center gap-2 text-[#a89d93] hover:text-[#1a1a1a] transition text-[12.5px] mb-6">
            {Icons.arrowLeft} Back to shop
          </button>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square bg-[#f5f2ee] rounded-2xl overflow-hidden">
              {detail.image
                ? <img src={thumb(detail.image, 900)} alt={detail.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-[#c8bfb4] text-7xl font-light" style={{fontFamily:'var(--font-display)'}}>E</div>
              }
            </div>
            <div className="flex flex-col justify-center fade-up">
              <div className="text-[10px] text-[#a89d93] uppercase tracking-widest mb-2">{detail.category}</div>
              <h1 className="text-3xl font-semibold text-[#1a1a1a] leading-tight mb-3" style={{fontFamily:'var(--font-display)'}}>{detail.name}</h1>
              {detail.description && <p className="text-[13.5px] text-[#5a5048] leading-relaxed mb-5">{detail.description}</p>}
              <div className="flex items-baseline gap-3 mb-6">
                {getPromo(detail.id) ? <>
                  <span className="text-2xl font-semibold text-[#1a1a1a]">{money(getPromo(detail.id).price)}</span>
                  <span className="text-base text-[#c8bfb4] line-through">{money(detail.price)}</span>
                </> : <span className="text-2xl font-semibold text-[#1a1a1a]">{money(detail.price)}</span>}
              </div>
              <button onClick={() => addToCart(detail)}
                className="w-full h-12 bg-[#1a1a1a] text-white rounded-xl text-[13px] font-semibold hover:bg-[#333] transition press mb-3">
                Add to Cart
              </button>
              <a href={`https://wa.me/${SHOP.wa}?text=Hi, I'm interested in: ${detail.name}`} target="_blank" rel="noreferrer"
                className="w-full h-12 border border-[#e8e4df] text-[#5a5048] rounded-xl text-[13px] font-medium hover:border-[#1a1a1a] transition flex items-center justify-center gap-2">
                {Icons.wa} Enquire on WhatsApp
              </a>
            </div>
          </div>
        </main>
      )}

      {/* ═══════════════ CART ═══════════════ */}
      {page === 'cart' && (
        <main className="max-w-lg mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-semibold text-[#1a1a1a] mb-1" style={{fontFamily:'var(--font-display)'}}>Cart</h1>
          <p className="text-[12px] text-[#a89d93] mb-6">{cc > 0 ? `${cc} item${cc !== 1 ? 's' : ''}` : 'Empty'}</p>

          {cart.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-[#f0ede8] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#c8bfb4]">{Icons.cart}</div>
              <p className="text-[#a89d93] text-sm mb-5">Your cart is empty</p>
              <button onClick={() => go('shop', '/shop')} className="h-11 px-7 bg-[#1a1a1a] text-white rounded-full text-[12.5px] font-semibold press">Browse Products</button>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-3">
                <button onClick={() => setCart([])} className="text-[11px] text-[#a89d93] hover:text-[#c8382b] transition">Clear all</button>
              </div>
              <div className="space-y-2 mb-6">
                {cart.map(c => (
                  <div key={c.id} className="flex gap-3 items-center p-3 rounded-xl bg-white border border-[#e8e4df]">
                    <div className="w-14 h-14 bg-[#f5f2ee] rounded-lg overflow-hidden shrink-0">
                      {c.img && <img src={thumb(c.img, 150)} className="w-full h-full object-cover" alt={c.name} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-medium truncate text-[#1a1a1a]">{c.name}</div>
                      <div className="text-[13px] font-semibold text-[#1a1a1a] mt-0.5">{money(c.price)}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updQty(c.id, -1)} className="w-7 h-7 rounded-lg bg-[#f5f2ee] flex items-center justify-center text-[#5a5048] hover:bg-[#e8e4df] transition">{Icons.minus}</button>
                      <span className="w-7 text-center text-[13px] font-semibold text-[#1a1a1a]">{c.qty}</span>
                      <button onClick={() => updQty(c.id, 1)} className="w-7 h-7 rounded-lg bg-[#f5f2ee] flex items-center justify-center text-[#5a5048] hover:bg-[#e8e4df] transition">{Icons.plus}</button>
                    </div>
                    <button onClick={() => removeFromCart(c.id)} className="w-7 h-7 flex items-center justify-center text-[#c8bfb4] hover:text-[#c8382b] transition">{Icons.x}</button>
                  </div>
                ))}
              </div>
              <div className="bg-[#1a1a1a] rounded-2xl p-4 flex justify-between items-center mb-4">
                <span className="text-[13px] text-[#8a7d72]">Total</span>
                <span className="text-xl font-semibold text-white">{money(ct)}</span>
              </div>
              <button onClick={() => go('checkout', '/checkout')} className="w-full h-12 bg-[#1a1a1a] text-white rounded-full text-[13px] font-semibold hover:bg-[#333] transition press">
                Proceed to Checkout
              </button>
            </>
          )}
        </main>
      )}

      {/* ═══════════════ CHECKOUT ═══════════════ */}
      {page === 'checkout' && (
        <main className="max-w-md mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => go('cart', '/cart')} className="flex items-center gap-2 text-[#a89d93] hover:text-[#1a1a1a] transition text-[12px] mb-6">
            {Icons.arrowLeft} Back to cart
          </button>
          <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-6" style={{fontFamily:'var(--font-display)'}}>Checkout</h2>

          <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-[#f0ede8] rounded-xl">
            <button onClick={() => setFulfillment('delivery')}
              className={`h-10 rounded-lg text-[12px] font-semibold transition ${fulfillment==='delivery' ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#8a7d72]'}`}>
              Delivery
            </button>
            <button onClick={() => setFulfillment('pickup')}
              className={`h-10 rounded-lg text-[12px] font-semibold transition ${fulfillment==='pickup' ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#8a7d72]'}`}>
              Pickup
            </button>
          </div>

          <div className="space-y-3 mb-5">
            {[
              { val: custName, set: setCustName, ph: 'Full name', type: 'text' },
              { val: custPhone, set: setCustPhone, ph: 'Phone number (for MoMo)', type: 'tel' },
            ].map(f => (
              <input key={f.ph} type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                className="w-full h-11 px-4 bg-white border border-[#e8e4df] rounded-xl text-[13px] focus:outline-none focus:border-[#1a1a1a] transition" />
            ))}
            {fulfillment === 'delivery' ? (
              <textarea value={custAddress} onChange={e => setCustAddress(e.target.value)} placeholder="Delivery address"
                className="w-full h-20 px-4 py-3 bg-white border border-[#e8e4df] rounded-xl text-[13px] focus:outline-none focus:border-[#1a1a1a] transition resize-none" />
            ) : (
              <div className="bg-[#f5f2ee] rounded-xl p-3 border border-[#e8e4df] text-[12px] text-[#5a5048]">
                📍 Pickup from <strong className="text-[#1a1a1a]">{SHOP.address}</strong>
              </div>
            )}
            <input value={custNotes} onChange={e => setCustNotes(e.target.value)} placeholder="Notes (optional)"
              className="w-full h-11 px-4 bg-white border border-[#e8e4df] rounded-xl text-[13px] focus:outline-none focus:border-[#1a1a1a] transition" />
          </div>

          <div className="bg-[#f5f2ee] rounded-xl p-4 mb-5 border border-[#e8e4df]">
            <div className="text-[11px] font-semibold text-[#8a7d72] uppercase tracking-wider mb-3">Order Summary</div>
            {cart.map(c => (
              <div key={c.id} className="flex justify-between text-[12.5px] py-1">
                <span className="text-[#5a5048]">{c.qty}× {c.name}</span>
                <span className="font-semibold text-[#1a1a1a]">{money(c.price * c.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold text-[13.5px] border-t border-[#e8e4df] pt-3 mt-2">
              <span>Total</span><span>{money(ct)}</span>
            </div>
          </div>

          <button onClick={placeOrder}
            disabled={!custName.trim() || !custPhone.trim() || (fulfillment==='delivery' && !custAddress.trim()) || submitting}
            className="w-full h-12 bg-[#1a1a1a] text-white rounded-full text-[13px] font-semibold hover:bg-[#333] transition press disabled:opacity-30 flex items-center justify-center gap-2">
            {submitting
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
              : <>Pay {money(ct)} · MoMo</>
            }
          </button>
          <p className="text-center text-[10.5px] text-[#c8bfb4] mt-3">Secured by Paystack · Mobile Money</p>
        </main>
      )}

      {/* ═══════════════ SUCCESS ═══════════════ */}
      {page === 'success' && orderResult && (
        <main className="max-w-sm mx-auto px-4 py-16 text-center fade-up">
          <div className="w-16 h-16 bg-[#e8f5ee] rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#2d7a4f]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#1a1a1a] mb-2" style={{fontFamily:'var(--font-display)'}}>Order Confirmed!</h1>
          <p className="text-[13px] text-[#8a7d72] mb-7">Payment received. We'll be in touch shortly.</p>
          <div className="bg-[#f5f2ee] rounded-2xl p-4 text-left mb-7 space-y-2">
            {[
              ['Order', <span className="font-mono font-semibold text-[#1a1a1a] text-[12px]">{orderResult.orderNo}</span>],
              ['Total', <span className="font-semibold">{money(orderResult.total)}</span>],
              [orderResult.fulfillment==='pickup' ? 'Pickup' : 'Delivery', <span className="text-[#5a5048]">{orderResult.fulfillment==='pickup' ? SHOP.address : "We'll contact you"}</span>],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between items-center text-[13px]">
                <span className="text-[#a89d93]">{k}</span>{v}
              </div>
            ))}
          </div>
          <a href={`https://wa.me/${SHOP.wa}?text=Hi! I just placed order ${orderResult.orderNo}. Can you confirm delivery?`} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full h-11 bg-[#2d7a4f] text-white rounded-full text-[12.5px] font-semibold mb-3 press hover:bg-[#25663f] transition">
            {Icons.wa} Confirm on WhatsApp
          </a>
          <button onClick={() => go('home', '/')} className="text-[12.5px] text-[#a89d93] hover:text-[#1a1a1a] transition">Continue Shopping →</button>
        </main>
      )}

      {/* ═══════════════ TRACK ═══════════════ */}
      {page === 'track' && (
        <main className="max-w-lg mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-semibold text-[#1a1a1a] mb-1" style={{fontFamily:'var(--font-display)'}}>Track Order</h1>
          <p className="text-[13px] text-[#8a7d72] mb-7">Enter your phone number to view your orders.</p>
          <div className="flex gap-2 mb-8">
            <input type="tel" value={trackPhone} onChange={e => setTrackPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && trackOrder()} placeholder="024 000 0000"
              className="flex-1 h-12 px-4 bg-white border border-[#e8e4df] rounded-xl text-[13px] focus:outline-none focus:border-[#1a1a1a] transition" />
            <button onClick={trackOrder} disabled={tracking}
              className="h-12 px-6 bg-[#1a1a1a] text-white rounded-xl text-[12.5px] font-semibold press hover:bg-[#333] transition disabled:opacity-50 flex items-center gap-2">
              {tracking ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Search'}
            </button>
          </div>
          {tracked && trackOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-3xl mb-3 text-[#e8e4df]">◇</div>
              <p className="text-[#a89d93] text-sm">No orders found for this number.</p>
            </div>
          )}
          <div className="space-y-3">
            {trackOrders.map(o => (
              <div key={o.id} className="bg-white rounded-2xl border border-[#e8e4df] p-4 fade-up">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-[10px] text-[#a89d93] font-mono mb-0.5">{o.order_no}</div>
                    <div className="text-base font-semibold text-[#1a1a1a]">{money(o.total)}</div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColor(o.status)}`}>{o.status}</span>
                </div>
                {o.items && (
                  <p className="text-[11.5px] text-[#8a7d72] mb-2">
                    {(typeof o.items === 'string' ? JSON.parse(o.items) : o.items).map(i => `${i.qty}× ${i.name}`).join(' · ')}
                  </p>
                )}
                <div className="text-[11px] text-[#c8bfb4]">{new Date(o.date || o.created_at).toLocaleString('en-GH')}</div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-[#1a1a1a] mt-16 mb-20 md:mb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
            <div className="max-w-xs">
              <div className="text-white font-semibold text-lg mb-2" style={{fontFamily:'var(--font-display)'}}>Esterea Home</div>
              <p className="text-[12px] text-[#5a5048] leading-relaxed">Premium home decor and furnishings, curated for Ghanaian homes. Quality you can trust.</p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-[12px]">
              <div>
                <div className="text-[10px] text-[#5a5048] uppercase tracking-widest mb-3">Shop</div>
                <div className="space-y-2">
                  <button onClick={() => go('shop','/shop')} className="block text-[#8a7d72] hover:text-white transition">All Products</button>
                  <button onClick={() => go('track','/track')} className="block text-[#8a7d72] hover:text-white transition">Track Order</button>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#5a5048] uppercase tracking-widest mb-3">Contact</div>
                <div className="space-y-2">
                  <a href={`tel:${SHOP.phone.replace(/\s/g,'')}`} className="flex items-center gap-1.5 text-[#8a7d72] hover:text-white transition">{Icons.phone} {SHOP.phone}</a>
                  <a href={`https://wa.me/${SHOP.wa}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#4ade80] hover:text-[#86efac] transition">{Icons.wa} WhatsApp</a>
                  <span className="block text-[#5a5048]">{SHOP.address}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#2a2520] pt-5 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-[11px] text-[#3a3330]">&copy; {new Date().getFullYear()} Esterea Home. All rights reserved.</p>
            <p className="text-[11px] text-[#3a3330]">Accra, Ghana</p>
          </div>
        </div>
      </footer>

      {/* ═══════════════ BOTTOM NAV ═══════════════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#e8e4df]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex justify-around h-[58px] items-center px-2">
          {[
            ['Home','home','/',Icons.home],
            ['Shop','shop','/shop',Icons.grid],
            ['Cart','cart','/cart',Icons.cart],
            ['Track','track','/track',Icons.track],
          ].map(([l,p,h,ic]) => (
            <button key={p} onClick={() => go(p,h)}
              className={`flex flex-col items-center gap-1 relative transition-colors ${page===p ? 'text-[#1a1a1a]' : 'text-[#c8bfb4]'}`}>
              <span className="relative">
                {ic}
                {p==='cart' && cc>0 && <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#1a1a1a] text-white text-[8px] font-bold rounded-full flex items-center justify-center">{cc}</span>}
              </span>
              <span className={`text-[9px] leading-none ${page===p ? 'font-semibold' : 'font-medium'}`}>{l}</span>
              {page===p && <span className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-5 h-[2px] bg-[#1a1a1a] rounded-full" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
