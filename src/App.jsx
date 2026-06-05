import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import Admin from './Admin.jsx'

const SUPABASE_URL  = 'https://tgdtjfquwbtvfsdnvvgm.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZHRqZnF1d2J0dmZzZG52dmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTM4MjUsImV4cCI6MjA5NjAyOTgyNX0.uXUkodx29_LQNU8pkpbxNnYGFgBYmoFTJHtxVWWAt8E'
const PAYSTACK_KEY  = 'pk_live_e77125e62b94f8222c402f584769d28fe505c92b'
const supabase      = createClient(SUPABASE_URL, SUPABASE_ANON)
const WA            = '233547927722'
const PHONE         = '0547927722'

const ghs   = n => `GH₵\u00a0${Number(n||0).toFixed(2)}`
const img   = (url, w=600) => url ? url.replace('/upload/', `/upload/w_${w},q_auto,f_auto/`) : ''
const fmtPh = p => p.replace(/\s+/g,'').replace(/^0/,'233')

function page() {
  const h = window.location.hash.replace('#','') || '/'
  const map = {'/':'home','/shop':'shop','/detail':'detail','/cart':'cart','/checkout':'checkout','/track':'track','/admin':'admin','/success':'success'}
  return map[h] || 'home'
}

function loadPaystack() {
  return new Promise(res => {
    if (window.PaystackPop) { res(); return }
    const s = document.createElement('script')
    s.src = 'https://js.paystack.co/v2/inline.js'
    s.onload = res
    document.head.appendChild(s)
  })
}

/* ─── ICONS (minimal, hand-drawn feel) ─── */
const Ico = {
  bag:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>,
  x:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  back:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  plus:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>,
  minus:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>,
  home:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
  grid:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  cart:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39A2 2 0 0 0 9.68 16h9.72a2 2 0 0 0 1.96-1.61L23 6H6"/></svg>,
  pin:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  wa:     <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
}

/* ─── PRODUCT CARD ─── */
function Card({ p, promo, onOpen, onAdd }) {
  const [done, setDone] = useState(false)
  const add = e => { e.stopPropagation(); onAdd(); setDone(true); setTimeout(()=>setDone(false),1400) }
  const price = promo ? promo.price : p.price
  const hasWholesale = p.wholesale_price > 0 && p.wholesale_min_qty > 0

  return (
    <div className="card anim-up" onClick={onOpen} style={{ cursor:'pointer' }}>
      <div className="card-img" style={{ position:'relative', aspectRatio:'1/1', borderRadius:'var(--r-md)', overflow:'hidden', background:'var(--cream)' }}>
        {p.image
          ? <img src={img(p.image,600)} alt={p.name} loading="lazy" style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .5s ease' }} className="card-zoom" />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#ddd', fontSize:34, fontWeight:700 }}>E</div>
        }
        {promo && <span style={{ position:'absolute', top:10, left:10, background:'var(--green)', color:'#fff', fontSize:9, letterSpacing:'.06em', fontWeight:700, padding:'3px 9px', borderRadius:20, textTransform:'uppercase' }}>Sale</span>}
      </div>
      <div style={{ marginTop:12 }}>
        {p.category && <div style={{ fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:5 }}>{p.category}</div>}
        <div className="clip2" style={{ fontSize:13.5, fontWeight:500, color:'var(--ink)', lineHeight:1.4, marginBottom:8, minHeight:38 }}>{p.name}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, minWidth:0 }}>
            <span style={{ fontSize:15, fontWeight:700, whiteSpace:'nowrap' }}>{ghs(price)}</span>
            {promo && <span style={{ fontSize:11, color:'var(--ink-3)', textDecoration:'line-through' }}>{ghs(p.price)}</span>}
          </div>
          <button onClick={add} className="btn" style={{ padding:'7px 16px', borderRadius:8, fontSize:12, background: done ? 'var(--ink)' : 'var(--green)', color:'#fff', flexShrink:0 }}>
            {done ? '✓ Added' : 'Add'}
          </button>
        </div>
        {hasWholesale && <div style={{ fontSize:11, color:'var(--green)', marginTop:7, fontWeight:500 }}>Buy {p.wholesale_min_qty}+ for {ghs(p.wholesale_price)} each</div>}
      </div>
    </div>
  )
}

/* ─── SKELETON ─── */
const CardSkel = () => (
  <div>
    <div className="skel" style={{ aspectRatio:'3/4', borderRadius:2 }} />
    <div className="skel" style={{ height:10, width:'60%', marginTop:12, marginBottom:6 }} />
    <div className="skel" style={{ height:13, width:'90%', marginBottom:4 }} />
    <div className="skel" style={{ height:13, width:'70%', marginBottom:10 }} />
    <div className="skel" style={{ height:14, width:'40%' }} />
  </div>
)

/* ─── ROOT ─── */
export default function App() {
  if (page() === 'admin') return <Admin />
  return <Store />
}

/* ─── STORE ─── */
function Store() {
  const [pg, setPg]         = useState(page)
  const [products, setProducts] = useState([])
  const [promos, setPromos] = useState([])
  const [cats, setCats]     = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart]     = useState([])
  const [toast, setToast]   = useState('')
  const [q, setQ]           = useState('')
  const [showQ, setShowQ]   = useState(false)
  const [cat, setCat]       = useState('All')
  const [detail, setDetail] = useState(null)
  const [heroI, setHeroI]   = useState(0)
  const [recent, setRecent] = useState([])

  // Checkout
  const [fulfill, setFulfill]     = useState('delivery')
  const [name, setName]           = useState('')
  const [phone, setPhone]         = useState('')
  const [addr, setAddr]           = useState('')
  const [notes, setNotes]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState(null)

  // Track
  const [tPhone, setTPhone] = useState('')
  const [tOrders, setTOrders] = useState([])
  const [tracked, setTracked] = useState(false)
  const [tracking, setTracking] = useState(false)

  useEffect(() => { load() }, [])
  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem('esterea_recent')||'[]')) } catch {}
  }, [])
  useEffect(() => {
    const heroes = products.filter(p=>p.image)
    if (!heroes.length) return
    const t = setInterval(()=>setHeroI(i=>(i+1)%heroes.length), 5000)
    return ()=>clearInterval(t)
  }, [products.length])
  useEffect(() => {
    const h = () => { const p=page(); if(p==='admin'){window.location.reload();return}; setPg(p); window.scrollTo(0,0) }
    window.addEventListener('hashchange', h)
    return ()=>window.removeEventListener('hashchange', h)
  }, [])

  async function load() {
    const [{ data: p },{ data: pr }] = await Promise.all([
      supabase.from('products').select('*').eq('visible',true).order('name'),
      supabase.from('promos').select('*').gte('end_date', new Date().toISOString()),
    ])
    setProducts(p||[])
    setPromos(pr||[])
    setCats(['All', ...new Set((p||[]).map(x=>x.category).filter(Boolean))])
    setLoading(false)
  }

  const go = useCallback((p,h)=>{ setPg(p); window.location.hash=h; window.scrollTo(0,0) },[])
  const openDetail = useCallback(p=>{
    setDetail(p)
    setRecent(prev=>{
      const next=[p.id,...prev.filter(id=>id!==p.id)].slice(0,8)
      try { localStorage.setItem('esterea_recent', JSON.stringify(next)) } catch {}
      return next
    })
    go('detail','/detail')
  },[go])
  const toast_ = m=>{ setToast(m); setTimeout(()=>setToast(''),2000) }
  const promo  = id => promos.find(pr=>pr.product_id===id && new Date(pr.end_date)>new Date())
  const heroes = products.filter(p=>p.image).slice(0,5)
  const recentProducts = recent.map(id=>products.find(p=>p.id===id)).filter(Boolean).slice(0,6)
  const filtered = products.filter(p=>{
    if (q && !p.name.toLowerCase().includes(q.toLowerCase()) && !p.category?.toLowerCase().includes(q.toLowerCase())) return false
    if (cat!=='All' && p.category!==cat) return false
    return true
  })

  const addCart = useCallback(p=>{
    const pr=promo(p.id); const price=pr?pr.price:p.price
    setCart(c=>{ const e=c.find(x=>x.id===p.id); if(e) return c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x); return [...c,{id:p.id,name:p.name,price,img:p.image,qty:1}] })
    toast_(p.name.slice(0,30)+' added')
  },[promos])
  const updQty = (id,d)=>setCart(c=>c.map(x=>x.id===id?{...x,qty:Math.max(1,x.qty+d)}:x))
  const remCart = id=>setCart(c=>c.filter(x=>x.id!==id))
  const cc = cart.reduce((a,c)=>a+c.qty,0)
  const ct = cart.reduce((a,c)=>a+c.price*c.qty,0)

  async function checkout() {
    if (!name.trim()||!phone.trim()||(fulfill==='delivery'&&!addr.trim())) return
    setSubmitting(true)
    try {
      await loadPaystack()
      const {data:no}=await supabase.rpc('generate_wa_order_no').catch(()=>({data:null}))
      const orderNo = no||`EST-${Date.now().toString(36).toUpperCase()}`
      const items = cart.map(c=>({name:c.name,qty:c.qty,price:c.price}))
      const ref   = `PAY-${orderNo}-${Date.now()}`
      await supabase.from('whatsapp_orders').insert({ order_no:orderNo, date:new Date().toISOString(), customer_name:name.trim(), customer_phone:fmtPh(phone.trim()), items, subtotal:ct, delivery_fee:0, total:ct, address:fulfill==='pickup'?'PICKUP':addr.trim(), notes:notes.trim(), status:'Pending', paystack_ref:ref, created_at:new Date().toISOString() })
      window.PaystackPop.setup({ key:PAYSTACK_KEY, email:fmtPh(phone.trim())+'@estereahome.com', amount:Math.round(ct*100), currency:'GHS', ref, channels:['mobile_money'], metadata:{order_no:orderNo},
        callback: async resp=>{
          await supabase.from('whatsapp_orders').update({status:'Paid',paystack_ref:resp.reference,paid_at:new Date().toISOString()}).eq('order_no',orderNo)
          setOrderResult({orderNo,total:ct,fulfill}); setCart([]); setName(''); setPhone(''); setAddr(''); setNotes('')
          go('success','/success'); setSubmitting(false)
        },
        onClose:()=>setSubmitting(false),
      }).openIframe()
    } catch(e){ console.error(e); setSubmitting(false); toast_('Something went wrong. Try again.') }
  }

  async function track() {
    if(!tPhone.trim()) return; setTracking(true)
    const {data}=await supabase.from('whatsapp_orders').select('*').eq('customer_phone',fmtPh(tPhone.trim())).order('date',{ascending:false}).limit(10)
    setTOrders(data||[]); setTracked(true); setTracking(false)
  }

  const statusBadge = s => {
    if (s==='Paid'||s==='Completed') return 'tag tag-green'
    if (s==='Pending') return 'tag tag-amber'
    if (s==='Cancelled') return 'tag tag-red'
    return 'tag tag-gray'
  }

  const S = { // shared inline styles
    page: { maxWidth:1240, margin:'0 auto', padding:'0 24px' },
    narrow: { maxWidth:520, margin:'0 auto', padding:'0 20px' },
    rule: { borderBottom:'1px solid #e2e2e2' },
  }

  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:'var(--sans)', paddingBottom: 72 }}>

      {/* Toast */}
      {toast && (
        <div className="anim-fade" style={{ position:'fixed', top:16, left:'50%', transform:'translateX(-50%)', background:'#111', color:'#fff', padding:'8px 18px', fontSize:12, fontWeight:500, zIndex:200, whiteSpace:'nowrap', pointerEvents:'none' }}>
          {toast}
        </div>
      )}

      {/* ── NAV ── */}
      <nav style={{ position:'sticky', top:0, zIndex:50, background:'rgba(255,255,255,.96)', backdropFilter:'blur(12px)', borderBottom:'1px solid #e2e2e2' }}>
        <div style={{ ...S.page, display:'flex', alignItems:'center', justifyContent:'space-between', height:56 }}>
          <button onClick={()=>go('home','/')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, fontWeight:800, color:'#111', letterSpacing:'-.02em' }}>
            Esterea Home
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:30 }}>
            {[['Home','home','/'],['Shop','shop','/shop'],['Track','track','/track']].map(([l,p,h])=>(
              <button key={p} onClick={()=>go(p,h)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:600, color:pg===p?'var(--green)':'var(--ink-2)', transition:'color .15s' }}
                className="desktop-nav-link">{l}</button>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <button onClick={()=>{setShowQ(s=>!s);if(pg!=='shop')go('shop','/shop')}} style={{ background:'none', border:'none', cursor:'pointer', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', color:'#888' }}>
              {showQ ? Ico.x : Ico.search}
            </button>
            <button onClick={()=>go('cart','/cart')} style={{ background:'none', border:'none', cursor:'pointer', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', color:'#888', position:'relative' }}>
              {Ico.cart}
              {cc>0 && <span style={{ position:'absolute', top:6, right:6, width:16, height:16, background:'#111', color:'#fff', borderRadius:'50%', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{cc}</span>}
            </button>
          </div>
        </div>
        {showQ && (
          <div className="anim-fade" style={{ ...S.page, paddingBottom:12 }}>
            <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products…" style={{ width:'100%', height:40, padding:'0 12px', borderRadius:2, fontSize:13 }} />
          </div>
        )}
      </nav>

      <style>{`.desktop-nav-link { display: none !important } @media(min-width:760px){ .desktop-nav-link { display: block !important } } .card:hover .card-zoom { transform: scale(1.05) }`}</style>

      {/* ══════ HOME ══════ */}
      {pg==='home' && <>
        {/* Hero */}
        <div style={{ position:'relative', height:'min(72vh,560px)', background:'#111', overflow:'hidden' }}>
          {heroes.map((p,i)=>(
            <div key={p.id} style={{ position:'absolute', inset:0, opacity:i===heroI?1:0, transition:'opacity 1s ease' }}>
              <img src={img(p.image,1600)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(.5)' }} />
            </div>
          ))}
          {!heroes.length && <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, #1a2e22 0%, #0f1a14 50%, #1a1a1a 100%)' }} />}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(0,0,0,.65) 0%, rgba(0,0,0,.25) 60%, transparent 100%)' }} />
          <div style={{ position:'relative', zIndex:1, height:'100%', display:'flex', flexDirection:'column', justifyContent:'center', ...S.page }}>
            <div style={{ maxWidth:560 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#5fd397', fontSize:11, letterSpacing:'.14em', textTransform:'uppercase', fontWeight:600, marginBottom:18 }}>
                {Ico.pin} Accra, Ghana
              </div>
              <h1 className="anim-up" style={{ fontSize:'clamp(34px,5.5vw,58px)', fontWeight:800, color:'#fff', lineHeight:1.08, marginBottom:18, letterSpacing:'-.03em' }}>
                Beautiful décor<br/>for every space.
              </h1>
              <p style={{ fontSize:15, color:'rgba(255,255,255,.78)', lineHeight:1.6, marginBottom:28, maxWidth:440 }}>
                Curated home décor that turns your house into a statement. Delivered anywhere in Ghana.
              </p>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <button onClick={()=>go('shop','/shop')} className="btn" style={{ padding:'13px 28px', borderRadius:30, fontSize:13, background:'#fff', color:'#111' }}>
                  Shop Collection &nbsp;→
                </button>
                <a href={`tel:${PHONE}`} className="btn" style={{ padding:'13px 26px', borderRadius:30, fontSize:13, background:'transparent', border:'1.5px solid rgba(255,255,255,.35)', color:'#fff', textDecoration:'none' }}>
                  <span style={{ color:'#5fd397' }}>{Ico.wa}</span> Call Us
                </a>
              </div>
            </div>
            {heroes.length>1 && (
              <div style={{ display:'flex', gap:7, marginTop:34, position:'absolute', bottom:28, left:20 }}>
                {heroes.map((_,i)=>(
                  <button key={i} onClick={()=>setHeroI(i)} style={{ border:'none', cursor:'pointer', background: i===heroI?'#fff':'rgba(255,255,255,.4)', width: i===heroI?24:8, height:8, borderRadius:4, padding:0, transition:'all .4s ease' }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category pills */}
        {cats.length>1 && (
          <div style={{ ...S.page, paddingTop:24, paddingBottom:4 }}>
            <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:4 }}>
              {cats.map(c=>(
                <button key={c} onClick={()=>{setCat(c);go('shop','/shop')}}
                  style={{ background: c===cat?'var(--ink)':'#fff', color: c===cat?'#fff':'var(--ink-2)', border:'1px solid', borderColor: c===cat?'var(--ink)':'var(--line)', cursor:'pointer', padding:'8px 18px', fontSize:12.5, fontWeight:600, borderRadius:30, whiteSpace:'nowrap', transition:'all .15s', flexShrink:0 }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentProducts.length>0 && (
          <div style={{ ...S.page, paddingTop:24 }}>
            <h2 style={{ fontSize:16, fontWeight:700, marginBottom:14 }}>Recently Viewed</h2>
            <div className="scrollbar-hide" style={{ display:'flex', gap:16, overflowX:'auto', paddingBottom:6 }}>
              {recentProducts.map(p=>(
                <div key={p.id} onClick={()=>openDetail(p)} style={{ flexShrink:0, width:130, cursor:'pointer' }}>
                  <div style={{ width:130, height:130, borderRadius:'var(--r-md)', overflow:'hidden', background:'var(--cream)' }}>
                    {p.image && <img src={img(p.image,260)} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                  </div>
                  <div className="clip1" style={{ fontSize:11.5, marginTop:8, color:'var(--ink-2)' }}>{p.name}</div>
                  <div style={{ fontSize:12.5, fontWeight:700, marginTop:2 }}>{ghs(promo(p.id)?promo(p.id).price:p.price)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div style={{ ...S.page, padding:'32px 20px 60px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:20 }}>
            <h2 style={{ fontSize:18, fontWeight:700 }}>All Products</h2>
            {products.length>10 && <button onClick={()=>go('shop','/shop')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:12.5, color:'var(--green)', fontWeight:600 }}>View all →</button>}
          </div>
          {loading
            ? <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'28px 22px' }}>{[...Array(10)].map((_,i)=><CardSkel key={i}/>)}</div>
            : products.length===0
              ? <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--ink-3)' }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>🛍️</div>
                  <div style={{ fontSize:15, fontWeight:600, color:'var(--ink-2)', marginBottom:6 }}>No products yet</div>
                  <div style={{ fontSize:13 }}>Check back soon — we're stocking up.</div>
                </div>
              : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'28px 22px' }}>
                {products.slice(0,10).map((p,i)=><div key={p.id} className={`d${Math.min(i+1,4)}`}><Card p={p} promo={promo(p.id)} onOpen={()=>openDetail(p)} onAdd={()=>addCart(p)}/></div>)}
              </div>
          }
        </div>

        {/* Strip */}
        <div style={{ background:'#111', padding:'48px 20px' }}>
          <div style={{ ...S.page, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:32 }}>
            {[['Handpicked Décor','Every piece chosen to elevate your space.'],['Nationwide Delivery','We deliver across Ghana — fast and reliable.'],['WhatsApp Support','Questions? Message us anytime.']].map(([t,d])=>(
              <div key={t}>
                <div style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:6, letterSpacing:'-.01em' }}>{t}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.45)', lineHeight:1.6 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </>}

      {/* ══════ SHOP ══════ */}
      {pg==='shop' && (
        <div style={{ ...S.page, padding:'32px 20px 60px' }}>
          {cats.length>1 && (
            <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto', marginBottom:28, paddingBottom:4 }}>
              {cats.map(c=>(
                <button key={c} onClick={()=>setCat(c)} style={{ background: c===cat?'var(--ink)':'#fff', color: c===cat?'#fff':'var(--ink-2)', border:'1px solid', borderColor: c===cat?'var(--ink)':'var(--line)', cursor:'pointer', padding:'8px 18px', fontSize:12.5, fontWeight:600, borderRadius:30, whiteSpace:'nowrap', transition:'all .15s', flexShrink:0 }}>
                  {c}
                </button>
              ))}
            </div>
          )}
          {loading
            ? <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'28px 22px' }}>{[...Array(8)].map((_,i)=><CardSkel key={i}/>)}</div>
            : filtered.length===0
              ? <div style={{ padding:'80px 0', textAlign:'center', color:'#bbb', fontSize:14 }}>No products found.</div>
              : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'28px 22px' }}>
                  {filtered.map((p,i)=><div key={p.id} className={`d${Math.min(i%4+1,4)}`}><Card p={p} promo={promo(p.id)} onOpen={()=>openDetail(p)} onAdd={()=>addCart(p)}/></div>)}
                </div>
          }
        </div>
      )}

      {/* ══════ DETAIL ══════ */}
      {pg==='detail' && detail && (
        <div style={{ ...S.page, padding:'32px 20px 60px' }}>
          <button onClick={()=>go('shop','/shop')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:'#888', fontSize:12, marginBottom:28 }}>
            {Ico.back} Back
          </button>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:48, alignItems:'start' }}>
            <div style={{ aspectRatio:'1/1', background:'var(--cream)', borderRadius:'var(--r-lg)', overflow:'hidden' }}>
              {detail.image ? <img src={img(detail.image,900)} alt={detail.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : null}
            </div>
            <div className="anim-up">
              {detail.category && <div style={{ fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:10 }}>{detail.category}</div>}
              <h1 style={{ fontSize:28, fontWeight:800, lineHeight:1.15, marginBottom:16, letterSpacing:'-.02em' }}>{detail.name}</h1>
              {detail.description && <p style={{ fontSize:14, color:'var(--ink-2)', lineHeight:1.7, marginBottom:20 }}>{detail.description}</p>}
              <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:8 }}>
                <span style={{ fontSize:26, fontWeight:700 }}>{ghs(promo(detail.id)?promo(detail.id).price:detail.price)}</span>
                {promo(detail.id) && <span style={{ fontSize:15, color:'var(--ink-3)', textDecoration:'line-through' }}>{ghs(detail.price)}</span>}
              </div>
              {detail.wholesale_price>0 && detail.wholesale_min_qty>0 && <div style={{ fontSize:13, color:'var(--green)', fontWeight:600, marginBottom:24, background:'var(--green-bg)', padding:'8px 12px', borderRadius:8, display:'inline-block' }}>Buy {detail.wholesale_min_qty}+ for {ghs(detail.wholesale_price)} each</div>}
              <div style={{ marginBottom:28 }} />
              <button onClick={()=>addCart(detail)} className="btn btn-green" style={{ width:'100%', justifyContent:'center', padding:'15px 0', borderRadius:10, fontSize:13.5, marginBottom:12 }}>
                Add to Cart
              </button>
              <a href={`https://wa.me/${WA}?text=Hi, I'm interested in: ${detail.name}`} target="_blank" rel="noreferrer" className="btn" style={{ width:'100%', justifyContent:'center', padding:'15px 0', borderRadius:10, fontSize:13.5, textDecoration:'none', background:'#fff', border:'1.5px solid var(--line)', color:'var(--ink)' }}>
                {Ico.wa} Enquire on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ══════ CART ══════ */}
      {pg==='cart' && (
        <div style={{ ...S.narrow, padding:'32px 20px 60px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:28 }}>
            <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:'-.02em' }}>Cart {cc>0 && <span style={{ fontSize:14, color:'#aaa', fontFamily:'var(--sans)', fontWeight:400 }}>({cc})</span>}</h1>
            {cc>0 && <button onClick={()=>setCart([])} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:'#bbb', textDecoration:'underline' }}>Clear</button>}
          </div>
          {cart.length===0
            ? <div style={{ padding:'60px 0', textAlign:'center' }}>
                <p style={{ color:'#bbb', fontSize:13, marginBottom:20 }}>Your cart is empty.</p>
                <button onClick={()=>go('shop','/shop')} className="btn btn-dark" style={{ padding:'11px 24px', borderRadius:2 }}>Browse</button>
              </div>
            : <>
                <div style={{ marginBottom:20 }}>
                  {cart.map(c=>(
                    <div key={c.id} style={{ display:'flex', gap:14, alignItems:'center', padding:'14px 0', borderBottom:'1px solid #e2e2e2' }}>
                      <div style={{ width:56, height:56, background:'#f5f5f3', flexShrink:0, overflow:'hidden', borderRadius:2 }}>
                        {c.img && <img src={img(c.img,150)} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt={c.name} />}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }} className="clip1">{c.name}</div>
                        <div style={{ fontSize:12, color:'#888' }}>{ghs(c.price)}</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <button onClick={()=>updQty(c.id,-1)} style={{ width:28, height:28, background:'#f5f5f3', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:2 }}>{Ico.minus}</button>
                        <span style={{ fontSize:13, fontWeight:500, width:20, textAlign:'center' }}>{c.qty}</span>
                        <button onClick={()=>updQty(c.id,1)} style={{ width:28, height:28, background:'#f5f5f3', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:2 }}>{Ico.plus}</button>
                        <button onClick={()=>remCart(c.id)} style={{ width:28, height:28, background:'none', border:'none', cursor:'pointer', color:'#ccc', marginLeft:4 }}>{Ico.x}</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:500, marginBottom:24, paddingTop:4 }}>
                  <span>Total</span><span>{ghs(ct)}</span>
                </div>
                <button onClick={()=>go('checkout','/checkout')} className="btn btn-dark" style={{ width:'100%', justifyContent:'center', padding:'14px 0', borderRadius:10, fontSize:13, letterSpacing:'.04em' }}>
                  Checkout
                </button>
              </>
          }
        </div>
      )}

      {/* ══════ CHECKOUT ══════ */}
      {pg==='checkout' && (
        <div style={{ ...S.narrow, padding:'32px 20px 60px' }}>
          <button onClick={()=>go('cart','/cart')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:'#888', fontSize:12, marginBottom:24 }}>{Ico.back} Cart</button>
          <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:'-.02em', marginBottom:28 }}>Checkout</h1>

          <div style={{ display:'flex', gap:8, marginBottom:24, background:'#f5f5f3', padding:4, borderRadius:2 }}>
            {[['delivery','Delivery'],['pickup','Pickup']].map(([v,l])=>(
              <button key={v} onClick={()=>setFulfill(v)} style={{ flex:1, padding:'9px 0', background:fulfill===v?'#fff':'transparent', border:'none', cursor:'pointer', fontSize:12, fontWeight:500, color:fulfill===v?'#111':'#888', borderRadius:1, transition:'background .2s' }}>{l}</button>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
            {[{val:name,set:setName,ph:'Full name',type:'text'},{val:phone,set:setPhone,ph:'Phone (MoMo number)',type:'tel'}].map(f=>(
              <input key={f.ph} type={f.type} value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} style={{ width:'100%', height:44, padding:'0 14px', borderRadius:2 }} />
            ))}
            {fulfill==='delivery'
              ? <textarea value={addr} onChange={e=>setAddr(e.target.value)} placeholder="Delivery address" style={{ width:'100%', height:72, padding:'12px 14px', resize:'none', borderRadius:2 }} />
              : <div style={{ background:'#f5f5f3', padding:12, fontSize:12, color:'#666', borderRadius:2 }}>📍 Pickup at Accra, Ghana</div>
            }
            <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes (optional)" style={{ width:'100%', height:44, padding:'0 14px', borderRadius:2 }} />
          </div>

          <div style={{ borderTop:'1px solid #e2e2e2', paddingTop:16, marginBottom:20 }}>
            {cart.map(c=>(
              <div key={c.id} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'4px 0', color:'#666' }}>
                <span>{c.qty}× {c.name}</span><span style={{ fontWeight:500 }}>{ghs(c.price*c.qty)}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:500, fontSize:14, borderTop:'1px solid #e2e2e2', marginTop:10, paddingTop:10 }}>
              <span>Total</span><span>{ghs(ct)}</span>
            </div>
          </div>

          <button onClick={checkout} disabled={!name.trim()||!phone.trim()||(fulfill==='delivery'&&!addr.trim())||submitting} className="btn btn-dark" style={{ width:'100%', justifyContent:'center', padding:'14px 0', borderRadius:10, fontSize:13, letterSpacing:'.04em', opacity:(!name.trim()||!phone.trim()||(fulfill==='delivery'&&!addr.trim())||submitting)?0.4:1 }}>
            {submitting ? 'Processing…' : `Pay ${ghs(ct)} · MoMo`}
          </button>
          <p style={{ textAlign:'center', fontSize:11, color:'#ccc', marginTop:10 }}>Secured by Paystack</p>
        </div>
      )}

      {/* ══════ SUCCESS ══════ */}
      {pg==='success' && orderResult && (
        <div className="anim-up" style={{ ...S.narrow, padding:'64px 20px', textAlign:'center' }}>
          <div style={{ width:56, height:56, background:'#111', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', color:'#fff', fontSize:22 }}>✓</div>
          <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:'-.02em', marginBottom:8 }}>Order Confirmed</h1>
          <p style={{ color:'#888', fontSize:13, marginBottom:32 }}>Payment received. We'll be in touch shortly.</p>
          <div style={{ textAlign:'left', borderTop:'1px solid #e2e2e2', borderBottom:'1px solid #e2e2e2', padding:'16px 0', marginBottom:28 }}>
            {[['Order',<code style={{ fontFamily:'var(--sans)', fontWeight:600 }}>{orderResult.orderNo}</code>],['Total',ghs(orderResult.total)],[orderResult.fulfill==='pickup'?'Pickup':'Delivery',orderResult.fulfill==='pickup'?'Accra, Ghana':"We'll contact you"]].map(([k,v])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:13 }}>
                <span style={{ color:'#888' }}>{k}</span><span style={{ fontWeight:500 }}>{v}</span>
              </div>
            ))}
          </div>
          <a href={`https://wa.me/${WA}?text=Hi! Order ${orderResult.orderNo} — confirming delivery.`} target="_blank" rel="noreferrer" className="btn" style={{ background:'#25d366', color:'#fff', padding:'12px 24px', borderRadius:2, fontSize:12, letterSpacing:'.03em', textDecoration:'none', justifyContent:'center', marginBottom:14, display:'flex', gap:8 }}>
            {Ico.wa} Confirm on WhatsApp
          </a>
          <button onClick={()=>go('home','/')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'#aaa', textDecoration:'underline' }}>Continue Shopping</button>
        </div>
      )}

      {/* ══════ TRACK ══════ */}
      {pg==='track' && (
        <div style={{ ...S.narrow, padding:'32px 20px 60px' }}>
          <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:'-.02em', marginBottom:8 }}>Track Order</h1>
          <p style={{ fontSize:13, color:'#888', marginBottom:28 }}>Enter your phone number to view your orders.</p>
          <div style={{ display:'flex', gap:8, marginBottom:32 }}>
            <input type="tel" value={tPhone} onChange={e=>setTPhone(e.target.value)} onKeyDown={e=>e.key==='Enter'&&track()} placeholder="024 000 0000" style={{ flex:1, height:44, padding:'0 14px', borderRadius:2 }} />
            <button onClick={track} disabled={tracking} className="btn btn-dark" style={{ padding:'0 20px', borderRadius:2, flexShrink:0 }}>
              {tracking ? '…' : 'Search'}
            </button>
          </div>
          {tracked && tOrders.length===0 && <p style={{ textAlign:'center', color:'#bbb', fontSize:13, padding:'40px 0' }}>No orders found.</p>}
          <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
            {tOrders.map(o=>(
              <div key={o.id} className="anim-up" style={{ padding:'16px 0', borderBottom:'1px solid #e2e2e2' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <div>
                    <div style={{ fontSize:10, letterSpacing:'.06em', color:'#aaa', marginBottom:2 }}>{o.order_no}</div>
                    <div style={{ fontSize:15, fontWeight:500 }}>{ghs(o.total)}</div>
                  </div>
                  <span className={statusBadge(o.status)}>{o.status}</span>
                </div>
                {o.items && <p style={{ fontSize:11, color:'#888' }}>{(typeof o.items==='string'?JSON.parse(o.items):o.items).map(i=>`${i.qty}× ${i.name}`).join(' · ')}</p>}
                <div style={{ fontSize:11, color:'#bbb', marginTop:4 }}>{new Date(o.date||o.created_at).toLocaleString('en-GH')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════ FOOTER ══════ */}
      <footer style={{ background:'#111', color:'rgba(255,255,255,.5)', marginTop:40 }}>
        <div style={{ ...S.page, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:32, padding:'40px 20px 28px' }}>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:'#fff', marginBottom:10, letterSpacing:'-.01em' }}>Esterea Home</div>
            <p style={{ fontSize:11, lineHeight:1.7 }}>Curated home décor that makes every space beautiful.</p>
          </div>
          <div>
            <div style={{ fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:12, color:'rgba(255,255,255,.25)' }}>Links</div>
            {[['Shop','shop','/shop'],['Track Order','track','/track']].map(([l,p,h])=>(
              <button key={p} onClick={()=>go(p,h)} style={{ display:'block', background:'none', border:'none', cursor:'pointer', fontSize:12, color:'rgba(255,255,255,.5)', marginBottom:8, textAlign:'left', padding:0 }}>{l}</button>
            ))}
          </div>
          <div>
            <div style={{ fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:12, color:'rgba(255,255,255,.25)' }}>Contact</div>
            <a href={`tel:${PHONE}`} style={{ display:'block', fontSize:12, color:'rgba(255,255,255,.5)', marginBottom:8, textDecoration:'none' }}>{PHONE}</a>
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#4cde80', textDecoration:'none' }}>{Ico.wa} WhatsApp</a>
          </div>
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,.08)', padding:'16px 20px', ...S.page }}>
          <p style={{ fontSize:11 }}>© {new Date().getFullYear()} Esterea Home · Accra, Ghana</p>
        </div>
      </footer>

      {/* ══════ BOTTOM NAV (mobile) ══════ */}
      <nav style={{ position:'fixed', bottom:0, left:0, right:0, background:'rgba(255,255,255,.97)', borderTop:'1px solid #e2e2e2', zIndex:50, display:'flex', justifyContent:'space-around', padding:'0 0 env(safe-area-inset-bottom)', height:58 }}>
        {[['Home','home','/',Ico.home],['Shop','shop','/shop',Ico.grid],['Cart','cart','/cart',Ico.cart],['Track','track','/track',Ico.pin]].map(([l,p,h,ic])=>(
          <button key={p} onClick={()=>go(p,h)} style={{ flex:1, background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, color:pg===p?'var(--green)':'#bbb', transition:'color .15s', position:'relative' }}>
            <span style={{ position:'relative' }}>
              {ic}
              {p==='cart' && cc>0 && <span style={{ position:'absolute', top:-4, right:-6, width:14, height:14, background:'#111', color:'#fff', borderRadius:'50%', fontSize:8, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{cc}</span>}
            </span>
            <span style={{ fontSize:9, fontWeight:pg===p?600:400, letterSpacing:'.03em' }}>{l}</span>
            {pg===p && <span style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:20, height:2, background:'var(--green)' }} />}
          </button>
        ))}
      </nav>
    </div>
  )
}
