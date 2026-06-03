import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://tgdtjfquwbtvfsdnvvgm.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZHRqZnF1d2J0dmZzZG52dmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTM4MjUsImV4cCI6MjA5NjAyOTgyNX0.uXUkodx29_LQNU8pkpbxNnYGFgBYmoFTJHtxVWWAt8E'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
const ghs = n => `GH₵\u00a0${Number(n||0).toFixed(2)}`
const cdn = (url,w=80) => url ? url.replace('/upload/',`/upload/w_${w},q_auto/`) : ''
const CLOUD = 'dls9fai0i'
const PRESET = 'esterea_unsigned'

/* ── Cloudinary upload ── */
async function uploadImage(file, onProg) {
  const fd = new FormData()
  fd.append('file', file); fd.append('upload_preset', PRESET); fd.append('folder','esterea')
  return new Promise((res,rej) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST',`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`)
    xhr.upload.onprogress = e => e.lengthComputable && onProg(Math.round(e.loaded/e.total*100))
    xhr.onload = () => { if(xhr.status===200) res(JSON.parse(xhr.responseText).secure_url); else rej(new Error(JSON.parse(xhr.responseText)?.error?.message||'Upload failed')) }
    xhr.onerror = ()=>rej(new Error('Network error'))
    xhr.send(fd)
  })
}

/* ── styles ── */
const S = {
  input: { width:'100%', height:40, padding:'0 12px', borderRadius:0, border:'1px solid #e2e2e2', fontSize:13, fontFamily:'var(--sans)', background:'#fff', color:'#222', outline:'none', boxSizing:'border-box' },
  label: { display:'block', fontSize:11, color:'#888', marginBottom:5, fontWeight:500, letterSpacing:'.03em' },
  btn:   { display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', background:'#111', color:'#fff', border:'none', cursor:'pointer', fontSize:12, fontWeight:500, letterSpacing:'.03em', fontFamily:'var(--sans)' },
  btnGhost: { display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', background:'transparent', color:'#444', border:'1px solid #e2e2e2', cursor:'pointer', fontSize:12, fontWeight:500, fontFamily:'var(--sans)' },
  th:    { fontSize:10, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', color:'#aaa', padding:'10px 12px', textAlign:'left', borderBottom:'1px solid #e2e2e2', whiteSpace:'nowrap' },
  td:    { fontSize:13, padding:'12px', borderBottom:'1px solid #f0f0f0', verticalAlign:'middle' },
}

/* ── Image uploader ── */
function ImgUpload({ value, onChange }) {
  const [prog, setProg] = useState(0)
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState('')
  const [drag, setDrag] = useState(false)
  const ref = useRef()

  async function handle(file) {
    if (!file || !file.type.startsWith('image/')) { setErr('Select an image file'); return }
    if (file.size > 10*1024*1024) { setErr('Max 10 MB'); return }
    setErr(''); setBusy(true); setProg(0)
    try { onChange(await uploadImage(file, setProg)) }
    catch(e) { setErr(e.message) }
    setBusy(false); setProg(0)
  }

  return (
    <div>
      <label style={S.label}>Product Image</label>
      {value && !busy && (
        <div style={{ position:'relative', height:140, background:'#f5f5f3', marginBottom:8, overflow:'hidden' }}>
          <img src={cdn(value,400)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:0, transition:'opacity .15s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0}>
            <button type="button" onClick={()=>ref.current?.click()} style={{ ...S.btn, padding:'6px 14px', fontSize:11 }}>Change</button>
            <button type="button" onClick={()=>onChange('')} style={{ ...S.btnGhost, padding:'6px 14px', fontSize:11, background:'transparent', color:'#fff', borderColor:'rgba(255,255,255,.4)' }}>Remove</button>
          </div>
        </div>
      )}
      {!value && (
        <div onClick={()=>!busy&&ref.current?.click()}
          onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);handle(e.dataTransfer.files[0])}}
          style={{ height:100, border:`1.5px dashed ${drag?'#111':'#ccc'}`, background:drag?'#fafaf8':'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', marginBottom:8, transition:'border-color .15s, background .15s' }}>
          {busy
            ? <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:12, color:'#888', marginBottom:6 }}>Uploading {prog}%</div>
                <div style={{ width:120, height:2, background:'#e2e2e2' }}><div style={{ height:'100%', background:'#111', transition:'width .2s', width:`${prog}%` }} /></div>
              </div>
            : <>
                <div style={{ fontSize:12, color:'#888', marginBottom:4 }}>Drop image or click to upload</div>
                <div style={{ fontSize:11, color:'#ccc' }}>JPG / PNG / WebP, max 10 MB</div>
              </>
          }
        </div>
      )}
      {value && !busy && <button type="button" onClick={()=>ref.current?.click()} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:'#aaa', marginBottom:6 }}>↑ Upload different image</button>}
      <input value={value||''} onChange={e=>onChange(e.target.value)} placeholder="Or paste image URL…"
        style={{ ...S.input, height:36, fontSize:12 }} />
      {err && <p style={{ fontSize:11, color:'#c0392b', marginTop:4 }}>{err}</p>}
      <input ref={ref} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>{const f=e.target.files[0];if(f)handle(f);e.target.value=''}} />
    </div>
  )
}

/* ── Field helpers ── */
const F = ({label,value,onChange,placeholder,type='text'}) => (
  <div><label style={S.label}>{label}</label>
    <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={S.input} onFocus={e=>e.target.style.borderColor='#111'} onBlur={e=>e.target.style.borderColor='#e2e2e2'} />
  </div>
)
const N = ({label,value,onChange,step='0.01'}) => (
  <div><label style={S.label}>{label}</label>
    <input type="number" step={step} min="0" value={value||''} onChange={e=>onChange(Number(e.target.value))}
      style={S.input} onFocus={e=>e.target.style.borderColor='#111'} onBlur={e=>e.target.style.borderColor='#e2e2e2'} />
  </div>
)

/* ── Status badge ── */
const Badge = ({s}) => {
  const cls = s==='Paid'||s==='Completed'?'tag tag-green':s==='Pending'?'tag tag-amber':s==='Cancelled'?'tag tag-red':'tag tag-gray'
  return <span className={cls}>{s}</span>
}

/* ── Modal wrapper ── */
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', width:'100%', maxWidth:wide?640:480, maxHeight:'90vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid #e2e2e2', flexShrink:0 }}>
          <span style={{ fontSize:14, fontWeight:600, color:'#111' }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#aaa', fontSize:18, lineHeight:1, padding:4 }}>✕</button>
        </div>
        <div style={{ overflowY:'auto', padding:'20px', flex:1 }}>{children}</div>
      </div>
    </div>
  )
}

/* ── Stock modal ── */
function StockModal({ product, onClose, onDone }) {
  const [mode, setMode] = useState('set')
  const [qty, setQty] = useState('')
  const [saving, setSaving] = useState(false)
  const preview = () => { const n=parseInt(qty)||0; if(mode==='set') return n; if(mode==='add') return (product.quantity||0)+n; return Math.max(0,(product.quantity||0)-n) }

  async function apply() {
    const n = parseInt(qty); if(isNaN(n)||n<0) return
    setSaving(true)
    const newQ = mode==='set'?n:mode==='add'?(product.quantity||0)+n:Math.max(0,(product.quantity||0)-n)
    await supabase.from('products').update({quantity:newQ}).eq('id',product.id)
    onDone(newQ); onClose(); setSaving(false)
  }

  return (
    <Modal title="Adjust Stock" onClose={onClose}>
      <p style={{ fontSize:12, color:'#888', marginBottom:16 }}>{product.name}</p>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #e2e2e2', marginBottom:16 }}>
        <span style={{ fontSize:12, color:'#888' }}>Current stock</span>
        <span style={{ fontSize:15, fontWeight:600, color: (product.quantity||0)<=3?'#c0392b':(product.quantity||0)<=10?'#8a5a00':'#1d6340' }}>
          {product.quantity||0} units
        </span>
      </div>
      <div style={{ display:'flex', gap:1, marginBottom:16, background:'#f5f5f3', padding:2 }}>
        {[['set','Set to'],['add','Add'],['remove','Remove']].map(([v,l])=>(
          <button key={v} onClick={()=>setMode(v)} style={{ flex:1, padding:'8px 0', background:mode===v?'#fff':'transparent', border:'none', cursor:'pointer', fontSize:12, fontWeight:500, color:mode===v?'#111':'#888', transition:'background .15s' }}>{l}</button>
        ))}
      </div>
      <div style={{ marginBottom:12 }}>
        <label style={S.label}>{mode==='set'?'New quantity':mode==='add'?'Units to add':'Units to remove'}</label>
        <input type="number" min="0" value={qty} onChange={e=>setQty(e.target.value)} autoFocus
          style={{ ...S.input, fontSize:18, fontWeight:600, textAlign:'center', height:52 }} />
      </div>
      {qty!=='' && <div style={{ fontSize:12, color:'#1d6340', background:'#e8f5ee', padding:'8px 12px', marginBottom:16 }}>New stock will be <strong>{preview()}</strong> units</div>}
      <button onClick={apply} disabled={!qty||saving} style={{ ...S.btn, width:'100%', justifyContent:'center', padding:'12px 0', opacity:(!qty||saving)?0.4:1 }}>
        {saving?'Saving…':'Update Stock'}
      </button>
    </Modal>
  )
}

/* ══════════════════════════════════════════════
   MAIN ADMIN
══════════════════════════════════════════════ */
export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass]     = useState('')
  const [err, setErr]       = useState(false)
  const [tab, setTab]       = useState('dashboard')
  const [sideOpen, setSideOpen] = useState(false)

  useEffect(()=>{ if(sessionStorage.getItem('esterea_admin')==='yes') setAuthed(true) },[])

  function login() {
    if (pass==='esterea2026') { setAuthed(true); sessionStorage.setItem('esterea_admin','yes') }
    else { setErr(true); setTimeout(()=>setErr(false),2000) }
  }

  function logout() { sessionStorage.removeItem('esterea_admin'); window.location.hash='/'; window.location.reload() }

  if (!authed) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fafaf8', fontFamily:'var(--sans)' }}>
      <div style={{ width:320, padding:32 }}>
        <div style={{ fontFamily:'var(--serif)', fontSize:24, marginBottom:4 }}>Esterea Home</div>
        <div style={{ fontSize:12, color:'#aaa', marginBottom:28 }}>Admin Panel</div>
        <input type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr(false)}} onKeyDown={e=>e.key==='Enter'&&login()}
          placeholder="Password" autoFocus
          style={{ ...S.input, marginBottom:8, borderColor:err?'#c0392b':'#e2e2e2', height:44 }} />
        {err && <p style={{ fontSize:11, color:'#c0392b', marginBottom:8 }}>Incorrect password</p>}
        <button onClick={login} style={{ ...S.btn, width:'100%', justifyContent:'center', padding:'12px 0' }}>Sign in</button>
      </div>
    </div>
  )

  const TABS = [['dashboard','Dashboard'],['products','Inventory'],['orders','Orders'],['pos','POS'],['sales','Sales'],['expenses','Expenses']]

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:'var(--sans)', background:'#fafaf8' }}>
      {sideOpen && <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.3)', zIndex:20 }} onClick={()=>setSideOpen(false)} />}

      {/* Sidebar */}
      <aside style={{ width:200, background:'#111', flexShrink:0, display:'flex', flexDirection:'column', position:'fixed', top:0, bottom:0, left:0, zIndex:30, transform: sideOpen?'translateX(0)':'translateX(-100%)', transition:'transform .25s ease' }}>
        <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontFamily:'var(--serif)', fontSize:18, color:'#fff' }}>Esterea Home</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,.3)', marginTop:2, letterSpacing:'.06em' }}>ADMIN</div>
        </div>
        <nav style={{ flex:1, padding:'12px 12px' }}>
          {TABS.map(([id,label])=>(
            <button key={id} onClick={()=>{setTab(id);setSideOpen(false)}}
              style={{ width:'100%', background:tab===id?'rgba(255,255,255,.1)':'transparent', border:'none', cursor:'pointer', padding:'9px 12px', textAlign:'left', fontSize:12, fontWeight:500, color:tab===id?'#fff':'rgba(255,255,255,.45)', letterSpacing:'.02em', marginBottom:2, transition:'background .15s, color .15s', fontFamily:'var(--sans)' }}>
              {label}
            </button>
          ))}
        </nav>
        <div style={{ padding:'12px', borderTop:'1px solid rgba(255,255,255,.08)' }}>
          <a href="/" target="_blank" rel="noreferrer" style={{ display:'block', fontSize:11, color:'rgba(255,255,255,.3)', textDecoration:'none', padding:'8px 12px', marginBottom:4 }}>View Store ↗</a>
          <button onClick={logout} style={{ width:'100%', background:'none', border:'none', cursor:'pointer', fontSize:11, color:'rgba(255,255,255,.3)', padding:'8px 12px', textAlign:'left', fontFamily:'var(--sans)' }}>Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
        {/* Top bar */}
        <div style={{ height:52, background:'#fff', borderBottom:'1px solid #e2e2e2', display:'flex', alignItems:'center', gap:12, padding:'0 24px', position:'sticky', top:0, zIndex:10 }}>
          <button onClick={()=>setSideOpen(s=>!s)} style={{ background:'none', border:'none', cursor:'pointer', padding:6, display:'flex', flexDirection:'column', gap:4 }}>
            <span style={{ display:'block', width:18, height:1.5, background:'#666' }} />
            <span style={{ display:'block', width:14, height:1.5, background:'#666' }} />
            <span style={{ display:'block', width:18, height:1.5, background:'#666' }} />
          </button>
          <span style={{ fontSize:13, fontWeight:600, color:'#111' }}>{TABS.find(t=>t[0]===tab)?.[1]}</span>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:24 }}>
          {tab==='dashboard' && <Dashboard />}
          {tab==='products'  && <Products />}
          {tab==='orders'    && <Orders />}
          {tab==='pos'       && <POS />}
          {tab==='sales'     && <Sales />}
          {tab==='expenses'  && <Expenses />}
        </div>
      </div>
    </div>
  )
}

/* ── DASHBOARD ── */
function Dashboard() {
  const [stats, setStats] = useState(null)
  useEffect(()=>{ load() },[])
  async function load() {
    const today = new Date().toISOString().slice(0,10)
    const [{count:pCount},{data:sales},{data:expenses},{data:orders}] = await Promise.all([
      supabase.from('products').select('*',{count:'exact',head:true}),
      supabase.from('sales').select('total,profit,date').eq('voided',false),
      supabase.from('expenses').select('amount,date'),
      supabase.from('whatsapp_orders').select('total,status,date,created_at'),
    ])
    const s=sales||[], e=expenses||[], o=orders||[]
    const tSales=s.filter(x=>x.date?.startsWith(today))
    const totalRev=s.reduce((a,x)=>a+Number(x.total||0),0)
    const totalProfit=s.reduce((a,x)=>a+Number(x.profit||0),0)
    const totalExp=e.reduce((a,x)=>a+Number(x.amount||0),0)
    setStats({products:pCount||0,todayRev:tSales.reduce((a,x)=>a+Number(x.total||0),0),todaySales:tSales.length,revenue:totalRev,profit:totalProfit,expenses:totalExp,net:totalProfit-totalExp,orders:o.length,pending:o.filter(x=>x.status==='Pending').length,paid:o.filter(x=>['Paid','Completed'].includes(x.status)).length,onlineRev:o.filter(x=>['Paid','Completed'].includes(x.status)).reduce((a,x)=>a+Number(x.total||0),0)})
  }
  if (!stats) return <div style={{fontSize:13,color:'#888'}}>Loading…</div>
  const cards = [
    ["Today's Revenue",ghs(stats.todayRev),`${stats.todaySales} POS sales`],
    ["Total Revenue",ghs(stats.revenue),"All POS sales"],
    ["Total Profit",ghs(stats.profit),"Before expenses"],
    ["Net Profit",ghs(stats.net),"After expenses"],
    ["Expenses",ghs(stats.expenses),"Total recorded"],
    ["Products",stats.products,"In catalogue"],
    ["Online Orders",stats.orders,`${stats.pending} pending`],
    ["Orders Paid",stats.paid,ghs(stats.onlineRev)+" revenue"],
  ]
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--serif)', fontSize:26, fontWeight:400, marginBottom:4 }}>Dashboard</h1>
        <p style={{ fontSize:12, color:'#aaa' }}>{new Date().toLocaleDateString('en-GH',{weekday:'long',day:'numeric',month:'long'})}</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
        {cards.map(([l,v,note])=>(
          <div key={l} style={{ background:'#fff', border:'1px solid #e2e2e2', padding:'16px 18px' }}>
            <div style={{ fontSize:10, color:'#aaa', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:8 }}>{l}</div>
            <div style={{ fontSize:20, fontWeight:600, color:'#111', marginBottom:4 }}>{v}</div>
            <div style={{ fontSize:11, color:'#bbb' }}>{note}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── PRODUCTS (INVENTORY) ── */
function Products() {
  const [products, setProducts] = useState([])
  const [editing,  setEditing]  = useState(null)
  const [stockP,   setStockP]   = useState(null)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)

  useEffect(()=>{ load() },[])
  async function load() { setLoading(true); const{data}=await supabase.from('products').select('*').order('name'); setProducts(data||[]); setLoading(false) }
  async function save() {
    if(!editing?.name?.trim()) return; setSaving(true)
    const{id,created_at,...data}=editing
    id ? await supabase.from('products').update(data).eq('id',id) : await supabase.from('products').insert(data)
    setSaving(false); setEditing(null); load()
  }
  async function del(id) { if(!confirm('Delete product?')) return; await supabase.from('products').delete().eq('id',id); load() }
  async function toggleVis(id,v) { await supabase.from('products').update({visible:!v}).eq('id',id); setProducts(ps=>ps.map(p=>p.id===id?{...p,visible:!v}:p)) }

  const blank = { name:'',category:'',price:0,cost_price:0,quantity:0,image:'',description:'',visible:true,wholesale_price:0,wholesale_min_qty:0 }

  const stockLabel = q => q===0?['Out','tag tag-red']:q<=3?['Critical','tag tag-red']:q<=10?['Low','tag tag-amber']:['OK','tag tag-green']

  const filtered = products.filter(p=>{
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.category||'').toLowerCase().includes(search.toLowerCase())) return false
    if (filter==='active' && !p.visible) return false
    if (filter==='hidden' && p.visible) return false
    if (filter==='low' && (p.quantity||0)>10) return false
    return true
  })

  return (
    <div>
      {stockP && <StockModal product={stockP} onClose={()=>setStockP(null)} onDone={q=>setProducts(ps=>ps.map(p=>p.id===stockP.id?{...p,quantity:q}:p))} />}

      {editing && (
        <Modal title={editing.id?'Edit Product':'New Product'} onClose={()=>setEditing(null)} wide>
          <div style={{ display:'grid', gap:16 }}>
            <ImgUpload value={editing.image||''} onChange={v=>setEditing({...editing,image:v})} />
            <div style={{ borderTop:'1px solid #f0f0f0', paddingTop:16, display:'grid', gap:12 }}>
              <F label="Product Name *" value={editing.name} onChange={v=>setEditing({...editing,name:v})} placeholder="e.g. Rattan Side Table" />
              <F label="Category" value={editing.category} onChange={v=>setEditing({...editing,category:v})} placeholder="e.g. Furniture" />
              <div><label style={S.label}>Description</label>
                <textarea value={editing.description||''} onChange={e=>setEditing({...editing,description:e.target.value})} placeholder="Brief description shown to customers"
                  style={{ ...S.input, height:64, padding:'10px 12px', resize:'none' }} />
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <N label="Selling Price (GH₵) *" value={editing.price} onChange={v=>setEditing({...editing,price:v})} />
              <N label="Cost Price (GH₵)" value={editing.cost_price} onChange={v=>setEditing({...editing,cost_price:v})} />
            </div>
            {editing.price>0 && editing.cost_price>0 && <p style={{ fontSize:11, color:'#1d6340' }}>Margin: {ghs(editing.price-editing.cost_price)} ({((editing.price-editing.cost_price)/editing.price*100).toFixed(0)}%)</p>}
            <N label="Opening Stock Qty" value={editing.quantity} onChange={v=>setEditing({...editing,quantity:v})} step="1" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <N label="Wholesale Price" value={editing.wholesale_price} onChange={v=>setEditing({...editing,wholesale_price:v})} />
              <N label="Wholesale Min Qty" value={editing.wholesale_min_qty} onChange={v=>setEditing({...editing,wholesale_min_qty:v})} step="1" />
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderTop:'1px solid #f0f0f0' }}>
              <div><div style={{ fontSize:13, fontWeight:500 }}>Show in Store</div><div style={{ fontSize:11, color:'#aaa' }}>Customers can see this product</div></div>
              <button type="button" onClick={()=>setEditing({...editing,visible:!editing.visible})}
                style={{ width:44, height:24, borderRadius:12, background:editing.visible?'#111':'#ddd', border:'none', cursor:'pointer', position:'relative', transition:'background .2s' }}>
                <span style={{ position:'absolute', top:3, left:editing.visible?22:3, width:18, height:18, background:'#fff', borderRadius:'50%', transition:'left .2s', display:'block' }} />
              </button>
            </div>
            <div style={{ display:'flex', gap:8, paddingTop:8, borderTop:'1px solid #f0f0f0' }}>
              <button onClick={save} disabled={saving||!editing.name?.trim()} style={{ ...S.btn, flex:1, justifyContent:'center', padding:'12px 0', opacity:saving||!editing.name?.trim()?0.4:1 }}>
                {saving?'Saving…':editing.id?'Save Changes':'Add Product'}
              </button>
              <button onClick={()=>setEditing(null)} style={{ ...S.btnGhost, flex:1, justifyContent:'center', padding:'12px 0' }}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:26, fontWeight:400, marginBottom:2 }}>Inventory</h1>
          <p style={{ fontSize:12, color:'#aaa' }}>{products.length} products · {products.filter(p=>(p.quantity||0)<=10).length} low/out of stock</p>
        </div>
        <button onClick={()=>setEditing(blank)} style={{ ...S.btn, padding:'9px 16px' }}>+ Add Product</button>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:180 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{ ...S.input, paddingLeft:32 }} />
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#ccc', fontSize:14 }}>⌕</span>
        </div>
        {[['all','All'],['active','Active'],['hidden','Hidden'],['low','Low Stock']].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{ ...filter===v?S.btn:S.btnGhost, padding:'8px 14px' }}>{l}</button>
        ))}
      </div>

      {loading
        ? <div style={{ fontSize:13, color:'#aaa', padding:32, textAlign:'center' }}>Loading…</div>
        : filtered.length===0
          ? <div style={{ fontSize:13, color:'#aaa', padding:48, textAlign:'center' }}>No products.</div>
          : (
            <div style={{ background:'#fff', border:'1px solid #e2e2e2', overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <th style={S.th}>Image</th>
                    <th style={S.th}>Product</th>
                    <th style={{ ...S.th, display:'none' }} className="d-md">Category</th>
                    <th style={{ ...S.th, display:'none' }} className="d-md">Price</th>
                    <th style={{ ...S.th, display:'none' }} className="d-md">Cost</th>
                    <th style={S.th}>Stock</th>
                    <th style={{ ...S.th, textAlign:'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p=>{
                    const [label,cls] = stockLabel(p.quantity||0)
                    return (
                      <tr key={p.id} style={{ opacity:p.visible?1:.45 }}>
                        <td style={S.td}>
                          <div style={{ width:44, height:44, background:'#f5f5f3', overflow:'hidden', flexShrink:0 }}>
                            {p.image && <img src={cdn(p.image,88)} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" />}
                          </div>
                        </td>
                        <td style={S.td}>
                          <div style={{ fontSize:13, fontWeight:500, color:'#111', marginBottom:2 }}>{p.name}</div>
                          <div style={{ fontSize:11, color:'#aaa' }}>{p.category}</div>
                        </td>
                        <td style={{ ...S.td, display:'none' }} className="d-md"><span style={{ fontSize:12, color:'#666' }}>{p.category||'—'}</span></td>
                        <td style={{ ...S.td, display:'none' }} className="d-md"><span style={{ fontSize:13, fontWeight:500 }}>{ghs(p.price)}</span></td>
                        <td style={{ ...S.td, display:'none' }} className="d-md"><span style={{ fontSize:12, color:'#888' }}>{p.cost_price?ghs(p.cost_price):'—'}</span></td>
                        <td style={S.td}>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <span style={{ fontSize:13, fontWeight:600, minWidth:24 }}>{p.quantity||0}</span>
                            <span className={cls}>{label}</span>
                          </div>
                        </td>
                        <td style={{ ...S.td, textAlign:'right' }}>
                          <div style={{ display:'flex', gap:4, justifyContent:'flex-end' }}>
                            <button onClick={()=>setStockP(p)} style={{ ...S.btnGhost, padding:'5px 10px', fontSize:11 }}>± Stock</button>
                            <button onClick={()=>toggleVis(p.id,p.visible)} style={{ ...S.btnGhost, padding:'5px 10px', fontSize:11 }}>{p.visible?'Hide':'Show'}</button>
                            <button onClick={()=>setEditing(p)} style={{ ...S.btnGhost, padding:'5px 10px', fontSize:11 }}>Edit</button>
                            <button onClick={()=>del(p.id)} style={{ ...S.btnGhost, padding:'5px 10px', fontSize:11, color:'#c0392b', borderColor:'#fdecea' }}>Del</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
      }
      <style>{`@media(min-width:700px){.d-md{display:table-cell !important}}`}</style>
    </div>
  )
}

/* ── ORDERS ── */
function Orders() {
  const [orders,  setOrders]  = useState([])
  const [filter,  setFilter]  = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ load() },[])
  async function load() { setLoading(true); const{data}=await supabase.from('whatsapp_orders').select('*').order('date',{ascending:false}).limit(200); setOrders(data||[]); setLoading(false) }
  async function upd(id,status) { await supabase.from('whatsapp_orders').update({status}).eq('id',id); setOrders(os=>os.map(o=>o.id===id?{...o,status}:o)) }

  const counts = ['Pending','Paid','Completed','Cancelled'].reduce((a,s)=>({...a,[s]:orders.filter(o=>o.status===s).length}),{})
  const shown  = filter==='all'?orders:orders.filter(o=>o.status===filter)

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontFamily:'var(--serif)', fontSize:26, fontWeight:400, marginBottom:2 }}>Orders</h1>
        <p style={{ fontSize:12, color:'#aaa' }}>{orders.length} total · {counts.Pending||0} pending</p>
      </div>
      <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
        {[['all',`All (${orders.length})`],...['Pending','Paid','Completed','Cancelled'].map(s=>[s,`${s} (${counts[s]||0})`])].map(([f,l])=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ ...filter===f?S.btn:S.btnGhost, padding:'7px 14px' }}>{l}</button>
        ))}
      </div>
      {loading ? <div style={{ fontSize:13, color:'#aaa', padding:32 }}>Loading…</div>
        : shown.length===0 ? <div style={{ fontSize:13, color:'#aaa', padding:48, textAlign:'center' }}>No orders.</div>
        : shown.map(o=>{
          const items = o.items?(typeof o.items==='string'?JSON.parse(o.items):o.items):[]
          return (
            <div key={o.id} style={{ background:'#fff', border:'1px solid #e2e2e2', padding:'16px 20px', marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:10, letterSpacing:'.06em', color:'#aaa', marginBottom:3 }}>{o.order_no}</div>
                  <div style={{ fontSize:15, fontWeight:600, marginBottom:2 }}>{o.customer_name||'Customer'}</div>
                  <div style={{ fontSize:12, color:'#888' }}>{o.customer_phone}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>{ghs(o.total)}</div>
                  <Badge s={o.status} />
                </div>
              </div>
              {items.length>0 && <p style={{ fontSize:12, color:'#888', marginBottom:6 }}>{items.map(i=>`${i.qty}× ${i.name}`).join(' · ')}</p>}
              <div style={{ fontSize:11, color:'#bbb', marginBottom:10 }}>{o.address&&o.address!=='PICKUP'?o.address:'Pickup'} · {new Date(o.date||o.created_at).toLocaleString('en-GH')}</div>
              <div style={{ display:'flex', gap:6 }}>
                {o.status==='Pending'  && <button onClick={()=>upd(o.id,'Paid')}      style={{ ...S.btn, padding:'6px 14px', fontSize:11 }}>Mark Paid</button>}
                {o.status==='Paid'     && <button onClick={()=>upd(o.id,'Completed')} style={{ ...S.btn, padding:'6px 14px', fontSize:11 }}>Complete</button>}
                {!['Cancelled','Completed'].includes(o.status) && <button onClick={()=>upd(o.id,'Cancelled')} style={{ ...S.btnGhost, padding:'6px 14px', fontSize:11, color:'#c0392b', borderColor:'#fdecea' }}>Cancel</button>}
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

/* ── POS ── */
function POS() {
  const [products, setProducts] = useState([])
  const [cart, setCart]         = useState([])
  const [search, setSearch]     = useState('')
  const [payment, setPayment]   = useState('Cash')
  const [custName, setCustName] = useState('')
  const [custPhone,setCustPhone]= useState('')
  const [saved, setSaved]       = useState(false)
  const [saving, setSaving]     = useState(false)

  useEffect(()=>{ supabase.from('products').select('*').eq('visible',true).gt('quantity',0).order('name').then(({data})=>setProducts(data||[])) },[])

  const shown = search?products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())):products
  const add = p=>setCart(c=>{ const e=c.find(x=>x.id===p.id); if(e) return c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x); return [...c,{id:p.id,name:p.name,price:p.price,cost:p.cost_price||0,qty:1}] })
  const total  = cart.reduce((a,c)=>a+c.price*c.qty,0)
  const profit = cart.reduce((a,c)=>a+(c.price-c.cost)*c.qty,0)

  async function complete() {
    if(!cart.length||saving) return; setSaving(true)
    const receipt='POS-'+Date.now().toString(36).toUpperCase()
    const items=cart.map(c=>({name:c.name,qty:c.qty,price:c.price}))
    const{error}=await supabase.from('sales').insert({date:new Date().toISOString(),items,total,profit,payment,customer_name:custName,customer_phone:custPhone,receipt_no:receipt})
    if(!error) for(const c of cart) await supabase.rpc('decrement_stock',{product_id:c.id,qty:c.qty}).catch(()=>{})
    setSaving(false); setCart([]); setCustName(''); setCustPhone(''); setSaved(true); setTimeout(()=>setSaved(false),3000)
  }

  return (
    <div>
      <h1 style={{ fontFamily:'var(--serif)', fontSize:26, fontWeight:400, marginBottom:4 }}>Point of Sale</h1>
      <p style={{ fontSize:12, color:'#aaa', marginBottom:20 }}>In-store sales</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20 }}>
        {/* Products */}
        <div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…"
            style={{ ...S.input, marginBottom:12 }} />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:8, maxHeight:'65vh', overflowY:'auto' }}>
            {shown.map(p=>(
              <button key={p.id} onClick={()=>add(p)} style={{ background:'#fff', border:'1px solid #e2e2e2', padding:'12px', textAlign:'left', cursor:'pointer', transition:'border-color .15s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#111'} onMouseLeave={e=>e.currentTarget.style.borderColor='#e2e2e2'}>
                {p.image && <img src={cdn(p.image,200)} style={{ width:'100%', height:80, objectFit:'cover', marginBottom:8, display:'block' }} alt="" />}
                <div style={{ fontSize:12, fontWeight:500, marginBottom:4 }} className="clip2">{p.name}</div>
                <div style={{ fontSize:13, fontWeight:600 }}>{ghs(p.price)}</div>
                <div style={{ fontSize:10, color:'#aaa', marginTop:2 }}>Stock: {p.quantity}</div>
              </button>
            ))}
          </div>
        </div>
        {/* Cart */}
        <div style={{ background:'#fff', border:'1px solid #e2e2e2', padding:'16px', display:'flex', flexDirection:'column', height:'fit-content' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
            <span style={{ fontSize:13, fontWeight:600 }}>Cart</span>
            {cart.length>0 && <button onClick={()=>setCart([])} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:'#aaa', textDecoration:'underline' }}>Clear</button>}
          </div>
          {saved && <div style={{ background:'#e8f5ee', color:'#1d6340', fontSize:12, fontWeight:500, padding:'8px 12px', marginBottom:12 }}>✓ Sale recorded</div>}
          {cart.length===0
            ? <p style={{ fontSize:12, color:'#ccc', textAlign:'center', padding:'24px 0' }}>Tap a product to add</p>
            : <div style={{ marginBottom:12, maxHeight:'35vh', overflowY:'auto' }}>
                {cart.map(c=>(
                  <div key={c.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'1px solid #f0f0f0', fontSize:12 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:500 }} className="clip1">{c.name}</div>
                      <div style={{ color:'#888', fontSize:11 }}>{ghs(c.price)}</div>
                    </div>
                    <button onClick={()=>setCart(c2=>c2.filter(x=>x.id!==c.id))} style={{ background:'none', border:'none', cursor:'pointer', color:'#ddd', fontSize:16 }}>×</button>
                    <button onClick={()=>setCart(c2=>c2.map(x=>x.id===c.id?{...x,qty:Math.max(1,x.qty-1)}:x))} style={{ width:24, height:24, background:'#f5f5f3', border:'none', cursor:'pointer', fontSize:14 }}>-</button>
                    <span style={{ width:20, textAlign:'center', fontWeight:600 }}>{c.qty}</span>
                    <button onClick={()=>setCart(c2=>c2.map(x=>x.id===c.id?{...x,qty:x.qty+1}:x))} style={{ width:24, height:24, background:'#f5f5f3', border:'none', cursor:'pointer', fontSize:14 }}>+</button>
                    <span style={{ width:56, textAlign:'right', fontWeight:600 }}>{ghs(c.price*c.qty)}</span>
                  </div>
                ))}
              </div>
          }
          <div style={{ display:'flex', justifyContent:'space-between', fontWeight:600, fontSize:16, borderTop:'1px solid #e2e2e2', paddingTop:12, marginBottom:12 }}>
            <span>Total</span><span>{ghs(total)}</span>
          </div>
          {total>0 && <p style={{ fontSize:11, color:'#1d6340', marginBottom:12 }}>Profit: {ghs(profit)}</p>}
          <div style={{ display:'flex', gap:4, marginBottom:10, background:'#f5f5f3', padding:2 }}>
            {['Cash','MoMo','Paystack'].map(m=>(
              <button key={m} onClick={()=>setPayment(m)} style={{ flex:1, padding:'7px 0', background:payment===m?'#fff':'transparent', border:'none', cursor:'pointer', fontSize:11, fontWeight:500, color:payment===m?'#111':'#888', transition:'background .15s' }}>{m}</button>
            ))}
          </div>
          <input value={custName} onChange={e=>setCustName(e.target.value)} placeholder="Customer name (opt.)" style={{ ...S.input, marginBottom:6, height:36, fontSize:12 }} />
          <input value={custPhone} onChange={e=>setCustPhone(e.target.value)} placeholder="Phone (opt.)" style={{ ...S.input, marginBottom:12, height:36, fontSize:12 }} />
          <button onClick={complete} disabled={!cart.length||saving} style={{ ...S.btn, width:'100%', justifyContent:'center', padding:'12px 0', fontSize:13, opacity:!cart.length||saving?0.35:1 }}>
            {saving?'Recording…':`Complete · ${ghs(total)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── SALES ── */
function Sales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{ supabase.from('sales').select('*').eq('voided',false).order('date',{ascending:false}).limit(200).then(({data})=>{setSales(data||[]);setLoading(false)}) },[])
  const total  = sales.reduce((a,s)=>a+Number(s.total||0),0)
  const profit = sales.reduce((a,s)=>a+Number(s.profit||0),0)
  return (
    <div>
      <h1 style={{ fontFamily:'var(--serif)', fontSize:26, fontWeight:400, marginBottom:4 }}>Sales</h1>
      <p style={{ fontSize:12, color:'#aaa', marginBottom:20 }}>{sales.length} sales · {ghs(total)} revenue · {ghs(profit)} profit</p>
      {loading ? <div style={{ fontSize:13, color:'#aaa', padding:32 }}>Loading…</div>
        : sales.length===0 ? <div style={{ fontSize:13, color:'#aaa', padding:48, textAlign:'center' }}>No sales yet.</div>
        : sales.map(s=>{
          const items=s.items?(typeof s.items==='string'?JSON.parse(s.items):s.items):[]
          return (
            <div key={s.id} style={{ background:'#fff', border:'1px solid #e2e2e2', padding:'14px 18px', marginBottom:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <div>
                  <div style={{ fontSize:10, color:'#aaa', letterSpacing:'.06em', marginBottom:2 }}>{s.receipt_no}</div>
                  <div style={{ fontSize:15, fontWeight:600 }}>{ghs(s.total)}</div>
                  <div style={{ fontSize:11, color:'#888' }}>{s.payment} · Profit: <span style={{ color:'#1d6340' }}>{ghs(s.profit)}</span></div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:11, color:'#aaa' }}>{new Date(s.date).toLocaleDateString('en-GH')}</div>
                  <div style={{ fontSize:11, color:'#bbb' }}>{new Date(s.date).toLocaleTimeString('en-GH',{hour:'2-digit',minute:'2-digit'})}</div>
                </div>
              </div>
              {items.length>0 && <p style={{ fontSize:11, color:'#aaa' }}>{items.map(i=>`${i.qty}× ${i.name}`).join(' · ')}</p>}
            </div>
          )
        })
      }
    </div>
  )
}

/* ── EXPENSES ── */
function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [editing,  setEditing]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  useEffect(()=>{ load() },[])
  async function load() { setLoading(true); const{data}=await supabase.from('expenses').select('*').order('date',{ascending:false}).limit(200); setExpenses(data||[]); setLoading(false) }
  async function save() {
    if(!editing?.description?.trim()||!editing?.amount) return; setSaving(true)
    const{id,...data}=editing
    id ? await supabase.from('expenses').update(data).eq('id',id) : await supabase.from('expenses').insert({...data,date:new Date().toISOString()})
    setSaving(false); setEditing(null); load()
  }
  async function del(id) { if(!confirm('Delete?')) return; await supabase.from('expenses').delete().eq('id',id); load() }
  const total = expenses.reduce((a,e)=>a+Number(e.amount||0),0)
  return (
    <div>
      {editing && (
        <Modal title={editing.id?'Edit Expense':'New Expense'} onClose={()=>setEditing(null)}>
          <div style={{ display:'grid', gap:12 }}>
            <F label="Description *" value={editing.description} onChange={v=>setEditing({...editing,description:v})} placeholder="e.g. Rent" />
            <N label="Amount (GH₵) *" value={editing.amount} onChange={v=>setEditing({...editing,amount:v})} />
            <F label="Category" value={editing.category} onChange={v=>setEditing({...editing,category:v})} placeholder="e.g. Operations" />
            <div style={{ display:'flex', gap:8, paddingTop:8 }}>
              <button onClick={save} disabled={saving} style={{ ...S.btn, flex:1, justifyContent:'center', padding:'11px 0', opacity:saving?0.4:1 }}>{saving?'Saving…':'Save'}</button>
              <button onClick={()=>setEditing(null)} style={{ ...S.btnGhost, flex:1, justifyContent:'center', padding:'11px 0' }}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:26, fontWeight:400, marginBottom:2 }}>Expenses</h1>
          <p style={{ fontSize:12, color:'#aaa' }}>Total: <strong style={{ color:'#c0392b' }}>{ghs(total)}</strong></p>
        </div>
        <button onClick={()=>setEditing({description:'',amount:'',category:''})} style={{ ...S.btn, padding:'9px 14px' }}>+ Add</button>
      </div>
      {loading ? <div style={{ fontSize:13, color:'#aaa', padding:32 }}>Loading…</div>
        : expenses.length===0 ? <div style={{ fontSize:13, color:'#aaa', padding:48, textAlign:'center' }}>No expenses recorded.</div>
        : expenses.map(e=>(
          <div key={e.id} style={{ background:'#fff', border:'1px solid #e2e2e2', padding:'14px 18px', marginBottom:6, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:500 }}>{e.description}</div>
              <div style={{ fontSize:11, color:'#aaa', marginTop:2 }}>{e.category&&`${e.category} · `}{new Date(e.date).toLocaleDateString('en-GH')}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:15, fontWeight:600, color:'#c0392b' }}>{ghs(e.amount)}</span>
              <button onClick={()=>setEditing(e)} style={{ ...S.btnGhost, padding:'5px 12px', fontSize:11 }}>Edit</button>
              <button onClick={()=>del(e.id)} style={{ ...S.btnGhost, padding:'5px 12px', fontSize:11, color:'#c0392b', borderColor:'#fdecea' }}>Del</button>
            </div>
          </div>
        ))
      }
    </div>
  )
}
