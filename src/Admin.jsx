import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://tgdtjfquwbtvfsdnvvgm.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZHRqZnF1d2J0dmZzZG52dmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTM4MjUsImV4cCI6MjA5NjAyOTgyNX0.uXUkodx29_LQNU8pkpbxNnYGFgBYmoFTJHtxVWWAt8E'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
const ghs = n => `GH₵ ${Number(n||0).toFixed(2)}`
const cdn = (url,w=80) => url ? url.replace('/upload/',`/upload/w_${w},q_auto/`) : ''
const CLOUD = 'dls9fai0i', PRESET = 'esterea_unsigned'
const today = () => new Date().toISOString().slice(0,10)
const fmt = d => { try { return new Date(d).toLocaleString('en-GH',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) } catch { return d } }
const fmtDate = d => { try { return new Date(d).toLocaleDateString('en-GH',{day:'numeric',month:'short',year:'numeric'}) } catch { return d } }

/* ── CLOUDINARY ── */
async function uploadImage(file, onProg) {
  const fd = new FormData()
  fd.append('file',file); fd.append('upload_preset',PRESET); fd.append('folder','esterea')
  return new Promise((res,rej) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST',`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`)
    xhr.upload.onprogress = e => e.lengthComputable && onProg(Math.round(e.loaded/e.total*100))
    xhr.onload = () => xhr.status===200 ? res(JSON.parse(xhr.responseText).secure_url) : rej(new Error(JSON.parse(xhr.responseText)?.error?.message||'Upload failed'))
    xhr.onerror = ()=>rej(new Error('Network error'))
    xhr.send(fd)
  })
}

/* ── STYLES ── */
const s = {
  input: { width:'100%',height:38,padding:'0 10px',border:'1px solid #e2e2e2',fontSize:13,fontFamily:'var(--sans)',background:'#fff',color:'#222',outline:'none',borderRadius:4,boxSizing:'border-box' },
  textarea: { width:'100%',padding:'8px 10px',border:'1px solid #e2e2e2',fontSize:13,fontFamily:'var(--sans)',background:'#fff',color:'#222',outline:'none',borderRadius:4,resize:'vertical',boxSizing:'border-box' },
  label: { display:'block',fontSize:11,color:'#777',marginBottom:4,fontWeight:500 },
  btn: { display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',background:'#1a1a2e',color:'#fff',border:'none',cursor:'pointer',fontSize:12,fontWeight:600,borderRadius:5,fontFamily:'var(--sans)',whiteSpace:'nowrap' },
  btnSm: { display:'inline-flex',alignItems:'center',gap:4,padding:'5px 11px',background:'#1a1a2e',color:'#fff',border:'none',cursor:'pointer',fontSize:11,fontWeight:600,borderRadius:4,fontFamily:'var(--sans)',whiteSpace:'nowrap' },
  btnGhost: { display:'inline-flex',alignItems:'center',gap:6,padding:'7px 14px',background:'transparent',color:'#444',border:'1px solid #e2e2e2',cursor:'pointer',fontSize:12,fontWeight:500,borderRadius:5,fontFamily:'var(--sans)',whiteSpace:'nowrap' },
  btnGhostSm: { display:'inline-flex',alignItems:'center',gap:4,padding:'4px 10px',background:'transparent',color:'#555',border:'1px solid #ddd',cursor:'pointer',fontSize:11,fontWeight:500,borderRadius:4,fontFamily:'var(--sans)',whiteSpace:'nowrap' },
  card: { background:'#fff',border:'1px solid #ebebeb',borderRadius:8,padding:'16px 20px',marginBottom:10 },
  th: { fontSize:11,fontWeight:600,letterSpacing:'.05em',textTransform:'uppercase',color:'#999',padding:'10px 14px',textAlign:'left',borderBottom:'1px solid #ebebeb',whiteSpace:'nowrap',background:'#fafafa' },
  td: { fontSize:13,padding:'11px 14px',borderBottom:'1px solid #f5f5f5',verticalAlign:'middle',color:'#222' },
  sectionTitle: { fontFamily:'var(--serif)',fontSize:22,fontWeight:400,marginBottom:4,color:'#111' },
}

/* ── BADGE ── */
const Badge = ({status}) => {
  const map = { Paid:'#dcfce7:#15803d', Completed:'#dcfce7:#15803d', Pending:'#fef9c3:#92400e', Cancelled:'#fee2e2:#b91c1c', Active:'#dcfce7:#15803d', Inactive:'#f3f4f6:#6b7280', Low:'#fef9c3:#92400e', Critical:'#fee2e2:#b91c1c', 'Out of Stock':'#fee2e2:#b91c1c', 'In Stock':'#dcfce7:#15803d', Voided:'#fee2e2:#b91c1c', Refunded:'#e0f2fe:#0369a1' }
  const [bg,col] = (map[status]||'#f3f4f6:#6b7280').split(':')
  return <span style={{ display:'inline-block',padding:'2px 8px',background:bg,color:col,borderRadius:12,fontSize:11,fontWeight:600,whiteSpace:'nowrap' }}>{status}</span>
}

/* ── FIELD HELPERS ── */
const F = ({label,value,onChange,placeholder,type='text',required}) => (
  <div>
    <label style={s.label}>{label}{required&&<span style={{color:'#e53e3e'}}> *</span>}</label>
    <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={s.input} onFocus={e=>e.target.style.borderColor='#1a1a2e'} onBlur={e=>e.target.style.borderColor='#e2e2e2'} />
  </div>
)
const N = ({label,value,onChange,step='0.01',required}) => (
  <div>
    <label style={s.label}>{label}{required&&<span style={{color:'#e53e3e'}}> *</span>}</label>
    <input type="number" step={step} min="0" value={value||''} onChange={e=>onChange(Number(e.target.value))}
      style={s.input} onFocus={e=>e.target.style.borderColor='#1a1a2e'} onBlur={e=>e.target.style.borderColor='#e2e2e2'} />
  </div>
)
const Sel = ({label,value,onChange,options,required}) => (
  <div>
    <label style={s.label}>{label}{required&&<span style={{color:'#e53e3e'}}> *</span>}</label>
    <select value={value||''} onChange={e=>onChange(e.target.value)} style={{...s.input,cursor:'pointer'}}>
      <option value="">Select…</option>
      {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
    </select>
  </div>
)
const TA = ({label,value,onChange,placeholder,rows=3}) => (
  <div>
    <label style={s.label}>{label}</label>
    <textarea value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={s.textarea} onFocus={e=>e.target.style.borderColor='#1a1a2e'} onBlur={e=>e.target.style.borderColor='#e2e2e2'} />
  </div>
)

/* ── MODAL ── */
function Modal({ title, onClose, children, wide, fullscreen }) {
  useEffect(()=>{ document.body.style.overflow='hidden'; return ()=>{ document.body.style.overflow='' } },[])
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#fff',width:'100%',maxWidth:fullscreen?'95vw':wide?640:460,maxHeight:'92vh',display:'flex',flexDirection:'column',borderRadius:10,boxShadow:'0 25px 60px rgba(0,0,0,.25)',overflow:'hidden' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px',borderBottom:'1px solid #ebebeb',flexShrink:0,background:'#fff' }}>
          <span style={{ fontSize:15,fontWeight:700,color:'#111' }}>{title}</span>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#aaa',lineHeight:1,padding:'2px 6px' }}>✕</button>
        </div>
        <div style={{ overflowY:'auto',padding:20,flex:1 }}>{children}</div>
      </div>
    </div>
  )
}

/* ── IMAGE UPLOADER ── */
function ImgUpload({ value, onChange }) {
  const [prog,setProg]=useState(0), [busy,setBusy]=useState(false), [err,setErr]=useState(''), [drag,setDrag]=useState(false)
  const ref=useRef()
  async function handle(file) {
    if(!file||!file.type.startsWith('image/')) { setErr('Select an image file'); return }
    if(file.size>10*1024*1024) { setErr('Max 10 MB'); return }
    setErr(''); setBusy(true); setProg(0)
    try { onChange(await uploadImage(file,setProg)) } catch(e) { setErr(e.message) }
    setBusy(false); setProg(0)
  }
  return (
    <div>
      <label style={s.label}>Product Image</label>
      {value && !busy && (
        <div style={{ position:'relative',height:120,background:'#f5f5f3',marginBottom:8,overflow:'hidden',borderRadius:6 }}>
          <img src={cdn(value,400)} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
          <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,.4)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:0,transition:'opacity .15s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0}>
            <button type="button" onClick={()=>ref.current?.click()} style={{...s.btnSm}}>Change</button>
            <button type="button" onClick={()=>onChange('')} style={{...s.btnGhostSm,color:'#fff',borderColor:'rgba(255,255,255,.4)'}}>Remove</button>
          </div>
        </div>
      )}
      {!value && (
        <div onClick={()=>!busy&&ref.current?.click()}
          onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);handle(e.dataTransfer.files[0])}}
          style={{ height:80,border:`1.5px dashed ${drag?'#1a1a2e':'#ccc'}`,background:drag?'#f0f4ff':'#fafafa',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',marginBottom:8,borderRadius:6,transition:'all .15s' }}>
          {busy
            ? <div style={{textAlign:'center'}}><div style={{fontSize:12,color:'#888',marginBottom:4}}>Uploading {prog}%</div><div style={{width:120,height:2,background:'#e2e2e2',borderRadius:2}}><div style={{height:'100%',background:'#1a1a2e',width:`${prog}%`,borderRadius:2,transition:'width .2s'}}/></div></div>
            : <><div style={{fontSize:12,color:'#888'}}>Drop image or click to upload</div><div style={{fontSize:11,color:'#ccc',marginTop:2}}>JPG / PNG / WebP · max 10 MB</div></>
          }
        </div>
      )}
      {value && !busy && <button type="button" onClick={()=>ref.current?.click()} style={{background:'none',border:'none',cursor:'pointer',fontSize:11,color:'#999',marginBottom:6}}>↑ Upload different image</button>}
      <input value={value||''} onChange={e=>onChange(e.target.value)} placeholder="Or paste Cloudinary URL…" style={{...s.input,height:34,fontSize:12}} />
      {err && <p style={{fontSize:11,color:'#e53e3e',marginTop:4}}>{err}</p>}
      <input ref={ref} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(f)handle(f);e.target.value=''}}/>
    </div>
  )
}

/* ══════════════════════════════════
   NAV ITEMS
══════════════════════════════════ */
const NAV = [
  { id:'dashboard',  label:'Dashboard',       icon:'📊' },
  { id:'pos',        label:'POS',             icon:'🖥️' },
  { id:'invoices',   label:'Invoices',        icon:'📋' },
  { id:'receipts',   label:'Receipts',        icon:'🧾' },
  { id:'refunds',    label:'Refunds',         icon:'↩️' },
  { id:'products',   label:'Products',        icon:'📦' },
  { id:'promos',     label:'Promos & Bundles',icon:'🏷️' },
  { id:'restock',    label:'Restock',         icon:'📥' },
  { id:'stock',      label:'Stock & Adjust',  icon:'📐' },
  { id:'customers',  label:'Customers',       icon:'👥' },
  { id:'expenses',   label:'Expenses',        icon:'💸' },
  { id:'reports',    label:'Reports',         icon:'📈' },
  { id:'staff',      label:'Staff',           icon:'👤' },
]

/* ══════════════════════════════════
   MAIN ADMIN COMPONENT
══════════════════════════════════ */
export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass]     = useState('')
  const [err, setErr]       = useState(false)
  const [tab, setTab]       = useState('dashboard')
  const [sideOpen, setSideOpen] = useState(false)

  useEffect(()=>{ if(sessionStorage.getItem('esterea_admin')==='yes') setAuthed(true) },[])

  function login() {
    if(pass==='esterea2026') { setAuthed(true); sessionStorage.setItem('esterea_admin','yes') }
    else { setErr(true); setTimeout(()=>setErr(false),2000) }
  }
  function logout() { sessionStorage.removeItem('esterea_admin'); window.location.hash='/'; window.location.reload() }

  if (!authed) return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f2f5',fontFamily:'var(--sans)' }}>
      <div style={{ width:340,background:'#fff',borderRadius:12,padding:32,boxShadow:'0 4px 24px rgba(0,0,0,.08)' }}>
        <div style={{ textAlign:'center',marginBottom:28 }}>
          <div style={{ width:48,height:48,background:'#1a1a2e',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontFamily:'var(--serif)',fontSize:24,color:'#fff' }}>E</div>
          <div style={{ fontFamily:'var(--serif)',fontSize:22,color:'#111',marginBottom:2 }}>Esterea Home</div>
          <div style={{ fontSize:12,color:'#aaa' }}>Admin Panel</div>
        </div>
        <input type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr(false)}} onKeyDown={e=>e.key==='Enter'&&login()}
          placeholder="Password" autoFocus style={{...s.input,marginBottom:8,height:44,borderColor:err?'#e53e3e':'#e2e2e2',borderRadius:6}} />
        {err && <p style={{fontSize:11,color:'#e53e3e',marginBottom:8,textAlign:'center'}}>Incorrect password</p>}
        <button onClick={login} style={{...s.btn,width:'100%',justifyContent:'center',padding:'12px 0',borderRadius:6,fontSize:13}}>Sign in</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh',display:'flex',fontFamily:'var(--sans)',background:'#f0f2f5' }}>
      {sideOpen && <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.35)',zIndex:99 }} onClick={()=>setSideOpen(false)} />}

      {/* ── SIDEBAR ── */}
      <aside style={{ width:220,background:'#1a1a2e',flexShrink:0,display:'flex',flexDirection:'column',position:'fixed',top:0,bottom:0,left:0,zIndex:100,transform:sideOpen?'translateX(0)':'translateX(-100%)',transition:'transform .25s ease' }}>
        <div style={{ padding:'18px 16px 14px',borderBottom:'1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontFamily:'var(--serif)',fontSize:17,color:'#fff',lineHeight:1.2 }}>Esterea Home</div>
          <div style={{ fontSize:10,color:'rgba(255,255,255,.3)',marginTop:3,letterSpacing:'.08em',textTransform:'uppercase' }}>Admin</div>
        </div>
        <nav style={{ flex:1,overflowY:'auto',padding:'8px 8px' }}>
          {NAV.map(({id,label,icon})=>(
            <button key={id} onClick={()=>{setTab(id);setSideOpen(false)}}
              style={{ width:'100%',background:tab===id?'rgba(255,255,255,.12)':'transparent',border:'none',cursor:'pointer',padding:'9px 12px',textAlign:'left',fontSize:12,fontWeight:tab===id?600:400,color:tab===id?'#fff':'rgba(255,255,255,.5)',letterSpacing:'.01em',marginBottom:1,transition:'all .15s',fontFamily:'var(--sans)',borderRadius:6,display:'flex',alignItems:'center',gap:9 }}>
              <span style={{fontSize:14}}>{icon}</span>{label}
            </button>
          ))}
        </nav>
        <div style={{ padding:'10px 8px',borderTop:'1px solid rgba(255,255,255,.08)' }}>
          <a href="/" target="_blank" rel="noreferrer" style={{ display:'flex',alignItems:'center',gap:8,fontSize:11,color:'rgba(255,255,255,.3)',textDecoration:'none',padding:'8px 12px',borderRadius:6,marginBottom:2 }}>🏠 View Store</a>
          <button onClick={logout} style={{ width:'100%',background:'none',border:'none',cursor:'pointer',fontSize:11,color:'rgba(255,255,255,.3)',padding:'8px 12px',textAlign:'left',fontFamily:'var(--sans)',borderRadius:6,display:'flex',alignItems:'center',gap:8 }}>↗ Sign out</button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex:1,minWidth:0,display:'flex',flexDirection:'column' }}>
        <div style={{ height:52,background:'#fff',borderBottom:'1px solid #ebebeb',display:'flex',alignItems:'center',gap:12,padding:'0 20px',position:'sticky',top:0,zIndex:50,boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
          <button onClick={()=>setSideOpen(o=>!o)} style={{ background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',gap:4.5,padding:6 }}>
            <span style={{ display:'block',width:18,height:2,background:'#555',borderRadius:1 }}/>
            <span style={{ display:'block',width:14,height:2,background:'#555',borderRadius:1 }}/>
            <span style={{ display:'block',width:18,height:2,background:'#555',borderRadius:1 }}/>
          </button>
          <span style={{ fontSize:14,fontWeight:700,color:'#111' }}>{NAV.find(n=>n.id===tab)?.label}</span>
          <span style={{ fontSize:12,color:'#aaa',marginLeft:'auto' }}>{new Date().toLocaleDateString('en-GH',{weekday:'short',day:'numeric',month:'short'})}</span>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:20 }}>
          {tab==='dashboard'  && <Dashboard />}
          {tab==='pos'        && <POS />}
          {tab==='invoices'   && <Invoices />}
          {tab==='receipts'   && <Receipts />}
          {tab==='refunds'    && <Refunds />}
          {tab==='products'   && <Products />}
          {tab==='promos'     && <Promos />}
          {tab==='restock'    && <Restock />}
          {tab==='stock'      && <StockAdjust />}
          {tab==='customers'  && <Customers />}
          {tab==='expenses'   && <Expenses />}
          {tab==='reports'    && <Reports />}
          {tab==='staff'      && <Staff />}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════
   STAT CARD
══════════════════════════════════ */
function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background:color||'#1a1a2e',borderRadius:8,padding:'16px 20px',color:'#fff' }}>
      <div style={{ fontSize:11,fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase',color:'rgba(255,255,255,.5)',marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:26,fontWeight:700,lineHeight:1,marginBottom:4 }}>{value}</div>
      {sub && <div style={{ fontSize:11,color:'rgba(255,255,255,.45)' }}>{sub}</div>}
    </div>
  )
}

/* ══════════════════════════════════
   DASHBOARD
══════════════════════════════════ */
function Dashboard() {
  const [stats, setStats] = useState(null)
  useEffect(()=>{ load() },[])
  async function load() {
    const t = today()
    const [{count:pCount},{data:sales},{data:expenses},{data:orders},{data:customers}] = await Promise.all([
      supabase.from('products').select('*',{count:'exact',head:true}),
      supabase.from('sales').select('total,profit,date').eq('voided',false),
      supabase.from('expenses').select('amount,date'),
      supabase.from('whatsapp_orders').select('total,status,date,created_at'),
      supabase.from('customers').select('id').limit(1),
    ])
    const s=sales||[], e=expenses||[], o=orders||[]
    const tSales=s.filter(x=>x.date?.startsWith(t))
    const rev=s.reduce((a,x)=>a+Number(x.total||0),0)
    const profit=s.reduce((a,x)=>a+Number(x.profit||0),0)
    const exp=e.reduce((a,x)=>a+Number(x.amount||0),0)
    const {count:custCount}=await supabase.from('customers').select('*',{count:'exact',head:true})
    setStats({products:pCount||0,todayRev:tSales.reduce((a,x)=>a+Number(x.total||0),0),todaySales:tSales.length,revenue:rev,profit,expenses:exp,net:profit-exp,orders:o.length,pending:o.filter(x=>x.status==='Pending').length,paid:o.filter(x=>['Paid','Completed'].includes(x.status)).length,onlineRev:o.filter(x=>['Paid','Completed'].includes(x.status)).reduce((a,x)=>a+Number(x.total||0),0),customers:custCount||0})
  }
  if(!stats) return <Spinner/>
  return (
    <div>
      <h1 style={s.sectionTitle}>Dashboard</h1>
      <p style={{fontSize:12,color:'#aaa',marginBottom:20}}>{new Date().toLocaleDateString('en-GH',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12,marginBottom:20}}>
        <StatCard label="Today Revenue" value={ghs(stats.todayRev)} sub={`${stats.todaySales} POS sales`} />
        <StatCard label="Total Revenue" value={ghs(stats.revenue)} sub="All time POS" color="#0f4c81" />
        <StatCard label="Net Profit" value={ghs(stats.net)} sub="After expenses" color={stats.net>=0?'#14532d':'#7f1d1d'} />
        <StatCard label="Expenses" value={ghs(stats.expenses)} sub="Recorded" color="#7c3aed" />
        <StatCard label="Products" value={stats.products} sub="In catalogue" color="#0369a1" />
        <StatCard label="Customers" value={stats.customers} sub="Registered" color="#b45309" />
        <StatCard label="Online Orders" value={stats.orders} sub={`${stats.pending} pending`} color="#be185d" />
        <StatCard label="Orders Paid" value={stats.paid} sub={ghs(stats.onlineRev)+' revenue'} color="#065f46" />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
        <RecentOrders/>
        <LowStockWidget/>
      </div>
    </div>
  )
}
function RecentOrders() {
  const [orders,setOrders]=useState([])
  useEffect(()=>{ supabase.from('whatsapp_orders').select('order_no,customer_name,total,status,date').order('date',{ascending:false}).limit(5).then(({data})=>setOrders(data||[])) },[])
  return (
    <div style={{...s.card}}>
      <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Recent Online Orders</div>
      {orders.map(o=>(
        <div key={o.order_no} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #f5f5f5'}}>
          <div><div style={{fontSize:12,fontWeight:600}}>{o.customer_name||'Customer'}</div><div style={{fontSize:11,color:'#999'}}>{o.order_no}</div></div>
          <div style={{textAlign:'right'}}><div style={{fontSize:12,fontWeight:700}}>{ghs(o.total)}</div><Badge status={o.status}/></div>
        </div>
      ))}
    </div>
  )
}
function LowStockWidget() {
  const [items,setItems]=useState([])
  useEffect(()=>{ supabase.from('products').select('name,quantity').lte('quantity',10).order('quantity').limit(8).then(({data})=>setItems(data||[])) },[])
  return (
    <div style={{...s.card}}>
      <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Low Stock Alert</div>
      {items.length===0?<p style={{fontSize:12,color:'#aaa'}}>All stock levels OK</p>:items.map((p,i)=>(
        <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #f5f5f5'}}>
          <div style={{fontSize:12,fontWeight:500}}>{p.name}</div>
          <Badge status={p.quantity===0?'Out of Stock':p.quantity<=3?'Critical':'Low'}/>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════
   INVOICES (Online Orders)
══════════════════════════════════ */
function Invoices() {
  const [orders,setOrders]=useState([])
  const [filter,setFilter]=useState('all')
  const [search,setSearch]=useState('')
  const [loading,setLoading]=useState(true)
  const [detail,setDetail]=useState(null)

  useEffect(()=>{ load() },[])
  async function load() { setLoading(true); const{data}=await supabase.from('whatsapp_orders').select('*').order('date',{ascending:false}).limit(300); setOrders(data||[]); setLoading(false) }
  async function upd(id,status) { await supabase.from('whatsapp_orders').update({status}).eq('id',id); setOrders(os=>os.map(o=>o.id===id?{...o,status}:o)) }

  const counts = ['Pending','Paid','Completed','Cancelled'].reduce((a,st)=>({...a,[st]:orders.filter(o=>o.status===st).length}),{})
  const shown = orders.filter(o=>{
    if(filter!=='all'&&o.status!==filter) return false
    if(search&&!o.customer_name?.toLowerCase().includes(search.toLowerCase())&&!o.customer_phone?.includes(search)&&!o.order_no?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div><h1 style={s.sectionTitle}>Invoices</h1><p style={{fontSize:12,color:'#aaa'}}>Online orders & payments</p></div>
        <button onClick={load} style={s.btnGhost}>↻ Refresh</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:10,marginBottom:16}}>
        <StatCard label="Paid" value={counts.Paid||0} sub="completed"/>
        <StatCard label="Pending" value={counts.Pending||0} sub="awaiting payment" color="#92400e"/>
        <StatCard label="Completed" value={counts.Completed||0} sub="delivered" color="#065f46"/>
        <StatCard label="Cancelled" value={counts.Cancelled||0} sub="cancelled" color="#7f1d1d"/>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, phone, or order #…"
          style={{...s.input,flex:1,minWidth:200}} />
        {[['all','All'],['Pending','Pending'],['Paid','Paid'],['Completed','Completed'],['Cancelled','Cancelled']].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={filter===v?s.btn:s.btnGhost}>{l}</button>
        ))}
      </div>
      {loading?<Spinner/>:shown.length===0?<Empty text="No invoices."/>:shown.map(o=>{
        const items=o.items?(typeof o.items==='string'?JSON.parse(o.items):o.items):[]
        return (
          <div key={o.id} style={s.card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div style={{fontSize:11,color:'#aaa',letterSpacing:'.04em'}}>{o.order_no}</div>
                <div style={{fontSize:15,fontWeight:700,marginTop:2}}>{o.customer_name||'Customer'}</div>
                <div style={{fontSize:12,color:'#888'}}>{o.customer_phone} · {fmtDate(o.date||o.created_at)}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:17,fontWeight:700}}>{ghs(o.total)}</div>
                <Badge status={o.status}/>
              </div>
            </div>
            {items.length>0&&<p style={{fontSize:12,color:'#888',margin:'8px 0 4px'}}>{items.map(i=>`${i.qty}× ${i.name}`).join(' · ')}</p>}
            {o.address&&<p style={{fontSize:11,color:'#bbb',marginBottom:8}}>{o.address}</p>}
            <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
              {o.status==='Pending'&&<button onClick={()=>upd(o.id,'Paid')} style={s.btnSm}>Mark Paid</button>}
              {o.status==='Paid'&&<button onClick={()=>upd(o.id,'Completed')} style={s.btnSm}>Mark Completed</button>}
              {!['Cancelled','Completed'].includes(o.status)&&<button onClick={()=>upd(o.id,'Cancelled')} style={{...s.btnGhostSm,color:'#e53e3e',borderColor:'#fecaca'}}>Cancel</button>}
              <button onClick={()=>setDetail(o)} style={s.btnGhostSm}>View details</button>
            </div>
          </div>
        )
      })}
      {detail&&(
        <Modal title={`Invoice ${detail.order_no}`} onClose={()=>setDetail(null)}>
          {[['Customer',detail.customer_name],['Phone',detail.customer_phone],['Date',fmt(detail.date||detail.created_at)],['Address',detail.address],['Status',<Badge status={detail.status}/>],['Total',<strong>{ghs(detail.total)}</strong>],['Notes',detail.notes]].map(([k,v])=>v&&(
            <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f5f5f5',fontSize:13}}>
              <span style={{color:'#777'}}>{k}</span><span>{v}</span>
            </div>
          ))}
          <div style={{marginTop:16}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:8}}>Items</div>
            {(detail.items?(typeof detail.items==='string'?JSON.parse(detail.items):detail.items):[]).map((it,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'6px 0',borderBottom:'1px solid #f5f5f5'}}>
                <span>{it.qty}× {it.name}</span><span style={{fontWeight:600}}>{ghs(it.price*it.qty)}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ══════════════════════════════════
   RECEIPTS (POS Sales)
══════════════════════════════════ */
function Receipts() {
  const [sales,setSales]=useState([])
  const [search,setSearch]=useState('')
  const [loading,setLoading]=useState(true)
  const [detail,setDetail]=useState(null)

  useEffect(()=>{ load() },[])
  async function load() { setLoading(true); const{data}=await supabase.from('sales').select('*').eq('voided',false).order('date',{ascending:false}).limit(300); setSales(data||[]); setLoading(false) }

  const shown=sales.filter(s=>!search||s.receipt_no?.toLowerCase().includes(search.toLowerCase())||s.customer_name?.toLowerCase().includes(search.toLowerCase())||s.customer_phone?.includes(search))
  const total=sales.reduce((a,s)=>a+Number(s.total||0),0)
  const profit=sales.reduce((a,s)=>a+Number(s.profit||0),0)

  return (
    <div>
      <h1 style={s.sectionTitle}>Receipts</h1>
      <p style={{fontSize:12,color:'#aaa',marginBottom:16}}>{sales.length} receipts · {ghs(total)} revenue · {ghs(profit)} profit</p>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search receipt, customer…" style={{...s.input,maxWidth:360,marginBottom:12}}/>
      {loading?<Spinner/>:shown.length===0?<Empty text="No receipts."/>:shown.map(s=>{
        const items=s.items?(typeof s.items==='string'?JSON.parse(s.items):s.items):[]
        return (
          <div key={s.id} style={s.card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:11,color:'#aaa',fontFamily:'monospace'}}>{s.receipt_no}</div>
                <div style={{fontSize:15,fontWeight:700}}>{ghs(s.total)}</div>
                <div style={{fontSize:11,color:'#888'}}>{s.payment} · Profit: <span style={{color:'#15803d',fontWeight:600}}>{ghs(s.profit)}</span></div>
                {s.customer_name&&<div style={{fontSize:11,color:'#aaa'}}>{s.customer_name} {s.customer_phone&&`· ${s.customer_phone}`}</div>}
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:11,color:'#aaa'}}>{fmtDate(s.date)}</div>
                <button onClick={()=>setDetail(s)} style={{...s.btnGhostSm,marginTop:6}}>View</button>
              </div>
            </div>
            {items.length>0&&<p style={{fontSize:11,color:'#aaa',marginTop:4}}>{items.map(i=>`${i.qty}× ${i.name}`).join(' · ')}</p>}
          </div>
        )
      })}
      {detail&&(
        <Modal title={`Receipt ${detail.receipt_no}`} onClose={()=>setDetail(null)}>
          <div style={{textAlign:'center',padding:'12px 0 20px'}}>
            <div style={{fontFamily:'var(--serif)',fontSize:20,marginBottom:4}}>Esterea Home</div>
            <div style={{fontSize:11,color:'#aaa'}}>Accra, Ghana · 0547927722</div>
            <div style={{fontSize:11,color:'#aaa',marginTop:2}}>{fmt(detail.date)}</div>
          </div>
          {(detail.items?(typeof detail.items==='string'?JSON.parse(detail.items):detail.items):[]).map((it,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'7px 0',borderBottom:'1px solid #f5f5f5'}}>
              <span>{it.qty}× {it.name}</span><span style={{fontWeight:600}}>{ghs((it.price||0)*it.qty)}</span>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',fontSize:15,fontWeight:700,marginTop:12,padding:'10px 0',borderTop:'2px solid #111'}}>
            <span>Total</span><span>{ghs(detail.total)}</span>
          </div>
          <div style={{fontSize:12,color:'#888',marginTop:4}}>Payment: {detail.payment}</div>
          {detail.customer_name&&<div style={{fontSize:12,color:'#aaa',marginTop:2}}>Customer: {detail.customer_name}</div>}
          <div style={{textAlign:'center',fontSize:11,color:'#aaa',marginTop:16}}>Thank you for shopping with us!</div>
        </Modal>
      )}
    </div>
  )
}

/* ══════════════════════════════════
   REFUNDS
══════════════════════════════════ */
function Refunds() {
  const [refunds,setRefunds]=useState([])
  const [loading,setLoading]=useState(true)
  const [modal,setModal]=useState(false)
  const [form,setForm]=useState({order_ref:'',amount:'',reason:'',payment_method:'Cash',staff_name:''})
  const [saving,setSaving]=useState(false)

  useEffect(()=>{ load() },[])
  async function load() {
    setLoading(true)
    // ensure table exists gracefully
    const{data}=await supabase.from('refunds').select('*').order('created_at',{ascending:false}).limit(200)
    setRefunds(data||[]); setLoading(false)
  }
  async function save() {
    if(!form.order_ref||!form.amount) return; setSaving(true)
    await supabase.from('refunds').insert({...form,amount:Number(form.amount),created_at:new Date().toISOString(),status:'Refunded'})
    setSaving(false); setModal(false); setForm({order_ref:'',amount:'',reason:'',payment_method:'Cash',staff_name:''}); load()
  }

  const total=refunds.reduce((a,r)=>a+Number(r.amount||0),0)
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div><h1 style={s.sectionTitle}>Refunds</h1><p style={{fontSize:12,color:'#aaa'}}>{refunds.length} refunds · {ghs(total)} total</p></div>
        <button onClick={()=>setModal(true)} style={s.btn}>+ Issue Refund</button>
      </div>
      {modal&&(
        <Modal title="Issue Refund" onClose={()=>setModal(false)}>
          <div style={{display:'grid',gap:12}}>
            <F label="Order / Receipt Ref *" value={form.order_ref} onChange={v=>setForm({...form,order_ref:v})} placeholder="e.g. POS-ABC123 or EST-XYZ" required/>
            <N label="Refund Amount (GH₵) *" value={form.amount} onChange={v=>setForm({...form,amount:v})} required/>
            <Sel label="Refund Method" value={form.payment_method} onChange={v=>setForm({...form,payment_method:v})} options={['Cash','MoMo','Paystack']}/>
            <TA label="Reason" value={form.reason} onChange={v=>setForm({...form,reason:v})} placeholder="Why is this being refunded?" rows={2}/>
            <F label="Staff Name" value={form.staff_name} onChange={v=>setForm({...form,staff_name:v})} placeholder="Who approved this refund?"/>
            <div style={{display:'flex',gap:8,paddingTop:8}}>
              <button onClick={save} disabled={saving||!form.order_ref||!form.amount} style={{...s.btn,flex:1,justifyContent:'center',opacity:saving?0.5:1}}>{saving?'Saving…':'Issue Refund'}</button>
              <button onClick={()=>setModal(false)} style={{...s.btnGhost,flex:1,justifyContent:'center'}}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      {loading?<Spinner/>:refunds.length===0?<Empty text="No refunds issued."/>:refunds.map(r=>(
        <div key={r.id} style={s.card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:11,color:'#aaa'}}>Ref: {r.order_ref}</div>
              <div style={{fontSize:15,fontWeight:700,color:'#e53e3e'}}>{ghs(r.amount)}</div>
              <div style={{fontSize:12,color:'#888'}}>{r.payment_method} {r.staff_name&&`· ${r.staff_name}`}</div>
              {r.reason&&<div style={{fontSize:11,color:'#aaa',marginTop:2}}>{r.reason}</div>}
            </div>
            <div style={{textAlign:'right'}}>
              <Badge status="Refunded"/>
              <div style={{fontSize:11,color:'#aaa',marginTop:4}}>{fmtDate(r.created_at)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════
   POS
══════════════════════════════════ */
function POS() {
  const [products,setProducts]=useState([])
  const [cart,setCart]=useState([])
  const [search,setSearch]=useState('')
  const [payment,setPayment]=useState('Cash')
  const [custName,setCustName]=useState('')
  const [custPhone,setCustPhone]=useState('')
  const [discount,setDiscount]=useState(0)
  const [saved,setSaved]=useState(null)
  const [saving,setSaving]=useState(false)
  const [lastReceipt,setLastReceipt]=useState(null)

  useEffect(()=>{ supabase.from('products').select('*').eq('visible',true).gt('quantity',0).order('name').then(({data})=>setProducts(data||[])) },[])

  const shown=search?products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())):products
  const add=p=>setCart(c=>{ const e=c.find(x=>x.id===p.id); if(e) return c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x); return [...c,{id:p.id,name:p.name,price:p.price,cost:p.cost_price||0,qty:1}] })
  const subtotal=cart.reduce((a,c)=>a+c.price*c.qty,0)
  const discAmt=discount>0?Math.min(subtotal,Number(discount)):0
  const total=subtotal-discAmt
  const profit=cart.reduce((a,c)=>a+(c.price-c.cost)*c.qty,0)-discAmt

  async function complete() {
    if(!cart.length||saving) return; setSaving(true)
    const receipt='POS-'+Date.now().toString(36).toUpperCase()
    const items=cart.map(c=>({name:c.name,qty:c.qty,price:c.price}))
    const{error}=await supabase.from('sales').insert({date:new Date().toISOString(),items,total,profit,payment,discount:discAmt,customer_name:custName,customer_phone:custPhone,receipt_no:receipt,voided:false})
    if(!error) {
      for(const c of cart) await supabase.rpc('decrement_stock',{product_id:c.id,qty:c.qty}).catch(()=>{})
      if(custPhone) { const ph=custPhone.replace(/\s+/g,'').replace(/^0/,'233'); await supabase.from('customers').upsert({phone:ph,name:custName||null,last_purchase:new Date().toISOString()},{onConflict:'phone'}).catch(()=>{}) }
    }
    setLastReceipt({receipt_no:receipt,items,total,profit,payment,discount:discAmt,customer_name:custName,customer_phone:custPhone,date:new Date().toISOString()})
    setSaving(false); setCart([]); setCustName(''); setCustPhone(''); setDiscount(0); setSaved(receipt); setTimeout(()=>setSaved(null),4000)
  }

  return (
    <div>
      <h1 style={{...s.sectionTitle,marginBottom:16}}>Point of Sale</h1>
      {saved&&<div style={{background:'#dcfce7',color:'#15803d',fontSize:13,fontWeight:600,padding:'10px 16px',borderRadius:6,marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>✓ Sale recorded · {saved}<button onClick={()=>setLastReceipt(r=>r?{...r}:null)} style={{background:'none',border:'none',cursor:'pointer',fontSize:12,color:'#15803d',textDecoration:'underline'}}>Print receipt</button></div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:16,alignItems:'start'}}>
        <div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…" style={{...s.input,marginBottom:12}}/>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:8,maxHeight:'68vh',overflowY:'auto'}}>
            {shown.map(p=>(
              <button key={p.id} onClick={()=>add(p)} style={{background:'#fff',border:'1px solid #ebebeb',borderRadius:8,padding:10,textAlign:'left',cursor:'pointer',transition:'border-color .15s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#1a1a2e'} onMouseLeave={e=>e.currentTarget.style.borderColor='#ebebeb'}>
                {p.image&&<img src={cdn(p.image,200)} style={{width:'100%',height:70,objectFit:'cover',marginBottom:6,borderRadius:4,display:'block'}} alt=""/>}
                <div style={{fontSize:12,fontWeight:600,marginBottom:3}} className="clip2">{p.name}</div>
                <div style={{fontSize:13,fontWeight:700,color:'#1a1a2e'}}>{ghs(p.price)}</div>
                <div style={{fontSize:10,color:'#aaa',marginTop:2}}>Stock: {p.quantity}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{background:'#fff',border:'1px solid #ebebeb',borderRadius:8,padding:16,position:'sticky',top:0}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
            <span style={{fontSize:14,fontWeight:700}}>Cart</span>
            {cart.length>0&&<button onClick={()=>setCart([])} style={{background:'none',border:'none',cursor:'pointer',fontSize:11,color:'#aaa',textDecoration:'underline'}}>Clear</button>}
          </div>
          {cart.length===0?<p style={{fontSize:12,color:'#ccc',textAlign:'center',padding:'20px 0'}}>Tap a product to add</p>:(
            <div style={{maxHeight:'38vh',overflowY:'auto',marginBottom:10}}>
              {cart.map(c=>(
                <div key={c.id} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 0',borderBottom:'1px solid #f5f5f5',fontSize:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600}} className="clip1">{c.name}</div>
                    <div style={{color:'#888',fontSize:11}}>{ghs(c.price)} ea.</div>
                  </div>
                  <button onClick={()=>setCart(cs=>cs.filter(x=>x.id!==c.id))} style={{background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:16,lineHeight:1,padding:'0 2px'}}>×</button>
                  <button onClick={()=>setCart(cs=>cs.map(x=>x.id===c.id?{...x,qty:Math.max(1,x.qty-1)}:x))} style={{width:22,height:22,background:'#f5f5f3',border:'none',cursor:'pointer',borderRadius:3,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>-</button>
                  <span style={{width:22,textAlign:'center',fontWeight:700}}>{c.qty}</span>
                  <button onClick={()=>setCart(cs=>cs.map(x=>x.id===c.id?{...x,qty:x.qty+1}:x))} style={{width:22,height:22,background:'#f5f5f3',border:'none',cursor:'pointer',borderRadius:3,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                  <span style={{width:56,textAlign:'right',fontWeight:700}}>{ghs(c.price*c.qty)}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{borderTop:'1px solid #ebebeb',paddingTop:10,marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#888',marginBottom:4}}><span>Subtotal</span><span>{ghs(subtotal)}</span></div>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
              <span style={{fontSize:11,color:'#888',flexShrink:0}}>Discount GH₵</span>
              <input type="number" min="0" step="0.01" value={discount||''} onChange={e=>setDiscount(e.target.value)} placeholder="0.00" style={{...s.input,height:30,fontSize:12,flex:1}}/>
            </div>
            {discAmt>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#e53e3e',marginBottom:4}}><span>Discount</span><span>- {ghs(discAmt)}</span></div>}
            <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:16}}><span>Total</span><span>{ghs(total)}</span></div>
            {total>0&&<div style={{fontSize:11,color:'#15803d',marginTop:2}}>Profit: {ghs(profit)}</div>}
          </div>
          <div style={{display:'flex',gap:3,marginBottom:10,background:'#f5f5f3',padding:3,borderRadius:6}}>
            {['Cash','MoMo','Paystack'].map(m=>(
              <button key={m} onClick={()=>setPayment(m)} style={{flex:1,padding:'7px 0',background:payment===m?'#fff':'transparent',border:'none',cursor:'pointer',fontSize:11,fontWeight:payment===m?700:400,color:payment===m?'#111':'#888',transition:'all .15s',borderRadius:4}}>{m}</button>
            ))}
          </div>
          <input value={custName} onChange={e=>setCustName(e.target.value)} placeholder="Customer name (opt.)" style={{...s.input,marginBottom:6,height:34,fontSize:12}}/>
          <input value={custPhone} onChange={e=>setCustPhone(e.target.value)} placeholder="Phone (opt.)" style={{...s.input,marginBottom:10,height:34,fontSize:12}}/>
          <button onClick={complete} disabled={!cart.length||saving} style={{...s.btn,width:'100%',justifyContent:'center',padding:'12px 0',fontSize:13,opacity:!cart.length||saving?0.3:1,borderRadius:6}}>
            {saving?'Recording…':`Complete · ${ghs(total)}`}
          </button>
        </div>
      </div>
      {lastReceipt&&(
        <Modal title="Receipt" onClose={()=>setLastReceipt(null)}>
          <div style={{textAlign:'center',marginBottom:16}}>
            <div style={{fontFamily:'var(--serif)',fontSize:20}}>Esterea Home</div>
            <div style={{fontSize:11,color:'#aaa'}}>Accra, Ghana · 0547927722</div>
            <div style={{fontSize:11,color:'#aaa',marginTop:2}}>{fmt(lastReceipt.date)}</div>
            <div style={{fontSize:10,fontFamily:'monospace',color:'#bbb',marginTop:2}}>{lastReceipt.receipt_no}</div>
          </div>
          {lastReceipt.items.map((it,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'6px 0',borderBottom:'1px solid #f5f5f5'}}>
              <span>{it.qty}× {it.name}</span><span style={{fontWeight:600}}>{ghs((it.price||0)*it.qty)}</span>
            </div>
          ))}
          {lastReceipt.discount>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#e53e3e',marginTop:6}}><span>Discount</span><span>- {ghs(lastReceipt.discount)}</span></div>}
          <div style={{display:'flex',justifyContent:'space-between',fontSize:16,fontWeight:700,marginTop:10,paddingTop:10,borderTop:'2px solid #111'}}><span>Total</span><span>{ghs(lastReceipt.total)}</span></div>
          <div style={{fontSize:12,color:'#888',marginTop:4}}>Payment: {lastReceipt.payment}</div>
          {lastReceipt.customer_name&&<div style={{fontSize:12,color:'#aaa'}}>Customer: {lastReceipt.customer_name}</div>}
          <div style={{textAlign:'center',fontSize:11,color:'#aaa',marginTop:20}}>Thank you for shopping with us!</div>
          <button onClick={()=>window.print()} style={{...s.btnGhost,width:'100%',justifyContent:'center',marginTop:12}}>🖨 Print</button>
        </Modal>
      )}
    </div>
  )
}

/* ══════════════════════════════════
   PRODUCTS / INVENTORY
══════════════════════════════════ */
function Products() {
  const [products,setProducts]=useState([])
  const [editing,setEditing]=useState(null)
  const [stockModal,setStockModal]=useState(null)
  const [search,setSearch]=useState('')
  const [filter,setFilter]=useState('all')
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)

  useEffect(()=>{ load() },[])
  async function load() { setLoading(true); const{data}=await supabase.from('products').select('*').order('name'); setProducts(data||[]); setLoading(false) }
  async function save() {
    if(!editing?.name?.trim()) return; setSaving(true)
    const{id,created_at,...data}=editing
    id?await supabase.from('products').update(data).eq('id',id):await supabase.from('products').insert(data)
    setSaving(false); setEditing(null); load()
  }
  async function del(id) { if(!confirm('Delete product?')) return; await supabase.from('products').delete().eq('id',id); load() }
  async function toggleVis(id,v) { await supabase.from('products').update({visible:!v}).eq('id',id); setProducts(ps=>ps.map(p=>p.id===id?{...p,visible:!v}:p)) }

  const blank={name:'',category:'',price:0,cost_price:0,quantity:0,image:'',description:'',visible:true,wholesale_price:0,wholesale_min_qty:0}
  const stockLabel=q=>q===0?['Out of Stock','#fee2e2:#b91c1c']:q<=3?['Critical','#fee2e2:#b91c1c']:q<=10?['Low Stock','#fef9c3:#92400e']:['In Stock','#dcfce7:#15803d']

  const filtered=products.filter(p=>{
    if(search&&!p.name.toLowerCase().includes(search.toLowerCase())&&!(p.category||'').toLowerCase().includes(search.toLowerCase())) return false
    if(filter==='active'&&!p.visible) return false
    if(filter==='hidden'&&p.visible) return false
    if(filter==='low'&&(p.quantity||0)>10) return false
    return true
  })

  return (
    <div>
      {stockModal&&(
        <Modal title="Adjust Stock" onClose={()=>setStockModal(null)}>
          <StockAdjustInline product={stockModal} onDone={q=>{setProducts(ps=>ps.map(p=>p.id===stockModal.id?{...p,quantity:q}:p));setStockModal(null)}}/>
        </Modal>
      )}
      {editing&&(
        <Modal title={editing.id?'Edit Product':'New Product'} onClose={()=>setEditing(null)} wide>
          <div style={{display:'grid',gap:14}}>
            <ImgUpload value={editing.image||''} onChange={v=>setEditing({...editing,image:v})}/>
            <div style={{borderTop:'1px solid #f0f0f0',paddingTop:14,display:'grid',gap:12}}>
              <F label="Product Name" value={editing.name} onChange={v=>setEditing({...editing,name:v})} placeholder="e.g. Rattan Side Table" required/>
              <F label="Category" value={editing.category} onChange={v=>setEditing({...editing,category:v})} placeholder="e.g. Furniture"/>
              <TA label="Description" value={editing.description} onChange={v=>setEditing({...editing,description:v})} placeholder="Short description" rows={2}/>
            </div>
            <div style={{border:'1px solid #ebebeb',borderRadius:6,padding:14}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#aaa',marginBottom:10}}>Pricing</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <N label="Selling Price (GH₵)" value={editing.price} onChange={v=>setEditing({...editing,price:v})} required/>
                <N label="Cost Price (GH₵)" value={editing.cost_price} onChange={v=>setEditing({...editing,cost_price:v})}/>
              </div>
              {editing.price>0&&editing.cost_price>0&&<p style={{fontSize:11,color:'#15803d',marginTop:6}}>Margin: {ghs(editing.price-editing.cost_price)} ({((editing.price-editing.cost_price)/editing.price*100).toFixed(0)}%)</p>}
            </div>
            <div style={{border:'1px solid #ebebeb',borderRadius:6,padding:14}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#aaa',marginBottom:10}}>Stock</div>
              <N label="Opening Quantity" value={editing.quantity} onChange={v=>setEditing({...editing,quantity:v})} step="1"/>
              <p style={{fontSize:11,color:'#aaa',marginTop:4}}>Use Stock & Adjust to change stock after creation.</p>
            </div>
            <div style={{border:'1px solid #ebebeb',borderRadius:6,padding:14}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#aaa',marginBottom:10}}>Wholesale (optional)</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <N label="Wholesale Price" value={editing.wholesale_price} onChange={v=>setEditing({...editing,wholesale_price:v})}/>
                <N label="Min Quantity" value={editing.wholesale_min_qty} onChange={v=>setEditing({...editing,wholesale_min_qty:v})} step="1"/>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'#fafafa',borderRadius:6}}>
              <div><div style={{fontSize:13,fontWeight:600}}>Visible in Store</div><div style={{fontSize:11,color:'#aaa'}}>Customers can see and buy this product</div></div>
              <button type="button" onClick={()=>setEditing({...editing,visible:!editing.visible})}
                style={{width:44,height:24,borderRadius:12,background:editing.visible?'#1a1a2e':'#ddd',border:'none',cursor:'pointer',position:'relative',transition:'background .2s'}}>
                <span style={{position:'absolute',top:3,left:editing.visible?22:3,width:18,height:18,background:'#fff',borderRadius:'50%',transition:'left .2s',display:'block',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}/>
              </button>
            </div>
            <div style={{display:'flex',gap:8,paddingTop:6}}>
              <button onClick={save} disabled={saving||!editing.name?.trim()} style={{...s.btn,flex:1,justifyContent:'center',padding:'11px 0',opacity:saving||!editing.name?.trim()?0.4:1,borderRadius:5}}>{saving?'Saving…':editing.id?'Save Changes':'Add Product'}</button>
              <button onClick={()=>setEditing(null)} style={{...s.btnGhost,flex:1,justifyContent:'center',padding:'11px 0',borderRadius:5}}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:16}}>
        <div><h1 style={s.sectionTitle}>Products</h1><p style={{fontSize:12,color:'#aaa'}}>{products.length} products · {products.filter(p=>(p.quantity||0)<=10).length} low stock</p></div>
        <button onClick={()=>setEditing(blank)} style={s.btn}>+ Add Product</button>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{...s.input,flex:1,minWidth:160}}/>
        {[['all','All'],['active','Active'],['hidden','Hidden'],['low','Low Stock']].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={filter===v?s.btn:s.btnGhost}>{l}</button>
        ))}
      </div>

      {loading?<Spinner/>:filtered.length===0?<Empty text="No products."/>:(
        <div style={{background:'#fff',border:'1px solid #ebebeb',borderRadius:8,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr><th style={s.th}>Product</th><th style={s.th}>Category</th><th style={s.th}>Price</th><th style={s.th}>Cost</th><th style={s.th}>Stock</th><th style={s.th}>Status</th><th style={{...s.th,textAlign:'right'}}>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p=>{
                const [slabel,colors]=[...stockLabel(p.quantity||0)]
                const [sbg,scol]=colors.split(':')
                return (
                  <tr key={p.id} style={{opacity:p.visible?1:.5}}>
                    <td style={s.td}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:40,height:40,background:'#f5f5f3',borderRadius:6,overflow:'hidden',flexShrink:0}}>
                          {p.image&&<img src={cdn(p.image,80)} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>}
                        </div>
                        <div><div style={{fontSize:13,fontWeight:600}}>{p.name}</div></div>
                      </div>
                    </td>
                    <td style={s.td}><span style={{fontSize:12,color:'#666'}}>{p.category||'—'}</span></td>
                    <td style={s.td}><span style={{fontSize:13,fontWeight:600}}>{ghs(p.price)}</span></td>
                    <td style={s.td}><span style={{fontSize:12,color:'#888'}}>{p.cost_price?ghs(p.cost_price):'—'}</span></td>
                    <td style={s.td}><span style={{fontSize:14,fontWeight:700}}>{p.quantity||0}</span></td>
                    <td style={s.td}><span style={{display:'inline-block',padding:'2px 8px',background:sbg,color:scol,borderRadius:10,fontSize:11,fontWeight:600}}>{slabel}</span></td>
                    <td style={{...s.td,textAlign:'right'}}>
                      <div style={{display:'flex',gap:4,justifyContent:'flex-end'}}>
                        <button onClick={()=>setStockModal(p)} style={s.btnGhostSm}>± Stock</button>
                        <button onClick={()=>toggleVis(p.id,p.visible)} style={s.btnGhostSm}>{p.visible?'Hide':'Show'}</button>
                        <button onClick={()=>setEditing({...p})} style={s.btnGhostSm}>Edit</button>
                        <button onClick={()=>del(p.id)} style={{...s.btnGhostSm,color:'#e53e3e',borderColor:'#fecaca'}}>Del</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════
   PROMOS & BUNDLES
══════════════════════════════════ */
function Promos() {
  const [promos,setPromos]=useState([])
  const [products,setProducts]=useState([])
  const [modal,setModal]=useState(false)
  const [form,setForm]=useState({product_id:'',price:'',end_date:'',label:''})
  const [saving,setSaving]=useState(false)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{ load() },[])
  async function load() {
    setLoading(true)
    const[{data:pr},{data:p}]=await Promise.all([
      supabase.from('promos').select('*,products(name)').order('end_date',{ascending:false}),
      supabase.from('products').select('id,name').order('name')
    ])
    setPromos(pr||[]); setProducts(p||[]); setLoading(false)
  }
  async function save() {
    if(!form.product_id||!form.price||!form.end_date) return; setSaving(true)
    await supabase.from('promos').insert({product_id:form.product_id,price:Number(form.price),end_date:new Date(form.end_date).toISOString(),label:form.label||'Sale'})
    setSaving(false); setModal(false); setForm({product_id:'',price:'',end_date:'',label:''}); load()
  }
  async function del(id) { if(!confirm('Delete promo?')) return; await supabase.from('promos').delete().eq('id',id); load() }

  const active=promos.filter(p=>new Date(p.end_date)>new Date())
  const expired=promos.filter(p=>new Date(p.end_date)<=new Date())

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div><h1 style={s.sectionTitle}>Promos & Bundles</h1><p style={{fontSize:12,color:'#aaa'}}>{active.length} active · {expired.length} expired</p></div>
        <button onClick={()=>setModal(true)} style={s.btn}>+ Add Promo</button>
      </div>
      {modal&&(
        <Modal title="Add Promo / Sale Price" onClose={()=>setModal(false)}>
          <div style={{display:'grid',gap:12}}>
            <Sel label="Product *" value={form.product_id} onChange={v=>setForm({...form,product_id:v})} options={products.map(p=>({value:p.id,label:p.name}))} required/>
            <N label="Promo Price (GH₵) *" value={form.price} onChange={v=>setForm({...form,price:v})} required/>
            <F label="Label" value={form.label} onChange={v=>setForm({...form,label:v})} placeholder="e.g. Sale, Bundle Deal"/>
            <div><label style={s.label}>End Date *</label><input type="datetime-local" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} style={s.input}/></div>
            <div style={{display:'flex',gap:8,paddingTop:8}}>
              <button onClick={save} disabled={saving||!form.product_id||!form.price||!form.end_date} style={{...s.btn,flex:1,justifyContent:'center',opacity:saving?0.5:1}}>Save Promo</button>
              <button onClick={()=>setModal(false)} style={{...s.btnGhost,flex:1,justifyContent:'center'}}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      {loading?<Spinner/>:(
        <>
          {active.length>0&&<><div style={{fontSize:12,fontWeight:700,color:'#15803d',marginBottom:8,textTransform:'uppercase',letterSpacing:'.05em'}}>Active</div>
          {active.map(p=>(
            <div key={p.id} style={s.card}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><div style={{fontSize:14,fontWeight:600}}>{p.products?.name||'Product'}</div><div style={{fontSize:12,color:'#888'}}>Sale price: {ghs(p.price)} · Ends: {fmtDate(p.end_date)}</div></div>
                <div style={{display:'flex',gap:6,alignItems:'center'}}><Badge status="Active"/><button onClick={()=>del(p.id)} style={{...s.btnGhostSm,color:'#e53e3e',borderColor:'#fecaca'}}>Remove</button></div>
              </div>
            </div>
          ))}</>}
          {expired.length>0&&<><div style={{fontSize:12,fontWeight:700,color:'#aaa',margin:'16px 0 8px',textTransform:'uppercase',letterSpacing:'.05em'}}>Expired</div>
          {expired.slice(0,5).map(p=>(
            <div key={p.id} style={{...s.card,opacity:.6}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><div style={{fontSize:13,fontWeight:500}}>{p.products?.name||'Product'}</div><div style={{fontSize:11,color:'#aaa'}}>Was {ghs(p.price)} · Ended {fmtDate(p.end_date)}</div></div>
                <button onClick={()=>del(p.id)} style={s.btnGhostSm}>Remove</button>
              </div>
            </div>
          ))}</>}
        </>
      )}
    </div>
  )
}

/* ══════════════════════════════════
   RESTOCK
══════════════════════════════════ */
function Restock() {
  const [entries,setEntries]=useState([])
  const [products,setProducts]=useState([])
  const [modal,setModal]=useState(false)
  const [form,setForm]=useState({product_id:'',qty:'',cost_per_unit:'',supplier:'',notes:''})
  const [saving,setSaving]=useState(false)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{ load() },[])
  async function load() {
    setLoading(true)
    const[{data:e},{data:p}]=await Promise.all([
      supabase.from('stock_adjustments').select('*,products(name)').eq('type','restock').order('created_at',{ascending:false}).limit(100),
      supabase.from('products').select('id,name,quantity').order('name')
    ])
    setEntries(e||[]); setProducts(p||[]); setLoading(false)
  }
  async function save() {
    if(!form.product_id||!form.qty) return; setSaving(true)
    const qty=Number(form.qty)
    const prod=products.find(p=>p.id===form.product_id)
    const before=prod?.quantity||0
    await supabase.from('stock_adjustments').insert({product_id:form.product_id,type:'restock',qty_before:before,qty_change:qty,qty_after:before+qty,cost_per_unit:Number(form.cost_per_unit)||null,supplier:form.supplier,notes:form.notes,created_at:new Date().toISOString()})
    await supabase.from('products').update({quantity:before+qty}).eq('id',form.product_id)
    setSaving(false); setModal(false); setForm({product_id:'',qty:'',cost_per_unit:'',supplier:'',notes:''}); load()
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div><h1 style={s.sectionTitle}>Restock</h1><p style={{fontSize:12,color:'#aaa'}}>Record incoming stock</p></div>
        <button onClick={()=>setModal(true)} style={s.btn}>+ Record Restock</button>
      </div>
      {modal&&(
        <Modal title="Record Restock" onClose={()=>setModal(false)}>
          <div style={{display:'grid',gap:12}}>
            <Sel label="Product *" value={form.product_id} onChange={v=>setForm({...form,product_id:v})} options={products.map(p=>({value:p.id,label:`${p.name} (stock: ${p.quantity||0})`}))} required/>
            <N label="Quantity Received *" value={form.qty} onChange={v=>setForm({...form,qty:v})} step="1" required/>
            <N label="Cost per Unit (GH₵)" value={form.cost_per_unit} onChange={v=>setForm({...form,cost_per_unit:v})}/>
            <F label="Supplier" value={form.supplier} onChange={v=>setForm({...form,supplier:v})} placeholder="Supplier name"/>
            <TA label="Notes" value={form.notes} onChange={v=>setForm({...form,notes:v})} placeholder="Any notes about this restock" rows={2}/>
            <div style={{display:'flex',gap:8,paddingTop:8}}>
              <button onClick={save} disabled={saving||!form.product_id||!form.qty} style={{...s.btn,flex:1,justifyContent:'center',opacity:saving?0.5:1}}>Record Restock</button>
              <button onClick={()=>setModal(false)} style={{...s.btnGhost,flex:1,justifyContent:'center'}}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      {loading?<Spinner/>:entries.length===0?<Empty text="No restock records."/>:entries.map(e=>(
        <div key={e.id} style={s.card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <div style={{fontSize:14,fontWeight:600}}>{e.products?.name||'Product'}</div>
              <div style={{fontSize:13,color:'#15803d',fontWeight:600}}>+{e.qty_change} units <span style={{color:'#aaa',fontWeight:400,fontSize:11}}>({e.qty_before} → {e.qty_after})</span></div>
              {e.supplier&&<div style={{fontSize:11,color:'#888',marginTop:2}}>From: {e.supplier}</div>}
              {e.cost_per_unit&&<div style={{fontSize:11,color:'#888'}}>Cost: {ghs(e.cost_per_unit)} per unit · Total: {ghs(e.cost_per_unit*e.qty_change)}</div>}
              {e.notes&&<div style={{fontSize:11,color:'#aaa',marginTop:2}}>{e.notes}</div>}
            </div>
            <div style={{fontSize:11,color:'#aaa',textAlign:'right'}}>{fmtDate(e.created_at)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════
   STOCK & ADJUST
══════════════════════════════════ */
function StockAdjustInline({ product, onDone }) {
  const [mode,setMode]=useState('set')
  const [qty,setQty]=useState('')
  const [note,setNote]=useState('')
  const [saving,setSaving]=useState(false)
  const preview=()=>{ const n=parseInt(qty)||0; if(mode==='set') return n; if(mode==='add') return (product.quantity||0)+n; return Math.max(0,(product.quantity||0)-n) }
  async function apply() {
    const n=parseInt(qty); if(isNaN(n)||n<0) return; setSaving(true)
    const newQ=mode==='set'?n:mode==='add'?(product.quantity||0)+n:Math.max(0,(product.quantity||0)-n)
    await supabase.from('stock_adjustments').insert({product_id:product.id,type:'manual',qty_before:product.quantity||0,qty_change:mode==='add'?n:-n,qty_after:newQ,notes:note,created_at:new Date().toISOString()})
    await supabase.from('products').update({quantity:newQ}).eq('id',product.id)
    onDone(newQ); setSaving(false)
  }
  return (
    <div>
      <p style={{fontSize:12,color:'#888',marginBottom:12}}>{product.name}</p>
      <div style={{display:'flex',justifyContent:'space-between',padding:'10px 14px',background:'#fafafa',borderRadius:6,marginBottom:12}}>
        <span style={{fontSize:12,color:'#888'}}>Current stock</span>
        <span style={{fontSize:15,fontWeight:700,color:(product.quantity||0)<=3?'#b91c1c':(product.quantity||0)<=10?'#92400e':'#15803d'}}>{product.quantity||0} units</span>
      </div>
      <div style={{display:'flex',gap:3,marginBottom:12,background:'#f5f5f3',padding:3,borderRadius:6}}>
        {[['set','Set to'],['add','Add'],['remove','Remove']].map(([v,l])=>(
          <button key={v} onClick={()=>setMode(v)} style={{flex:1,padding:'8px 0',background:mode===v?'#fff':'transparent',border:'none',cursor:'pointer',fontSize:12,fontWeight:mode===v?700:400,color:mode===v?'#111':'#888',transition:'all .15s',borderRadius:4}}>{l}</button>
        ))}
      </div>
      <div style={{marginBottom:10}}>
        <label style={s.label}>{mode==='set'?'New quantity':mode==='add'?'Units to add':'Units to remove'}</label>
        <input type="number" min="0" value={qty} onChange={e=>setQty(e.target.value)} autoFocus style={{...s.input,fontSize:20,fontWeight:700,textAlign:'center',height:52}}/>
      </div>
      {qty!==''&&<div style={{fontSize:12,color:'#15803d',background:'#dcfce7',padding:'8px 12px',borderRadius:4,marginBottom:10}}>New stock will be <strong>{preview()}</strong> units</div>}
      <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Reason (optional)" style={{...s.input,height:34,fontSize:12,marginBottom:12}}/>
      <button onClick={apply} disabled={!qty||saving} style={{...s.btn,width:'100%',justifyContent:'center',opacity:!qty||saving?0.4:1}}>
        {saving?'Saving…':'Update Stock'}
      </button>
    </div>
  )
}

function StockAdjust() {
  const [products,setProducts]=useState([])
  const [history,setHistory]=useState([])
  const [selected,setSelected]=useState(null)
  const [loading,setLoading]=useState(true)
  const [search,setSearch]=useState('')

  useEffect(()=>{ load() },[])
  async function load() {
    setLoading(true)
    const[{data:p},{data:h}]=await Promise.all([
      supabase.from('products').select('id,name,quantity,category').order('name'),
      supabase.from('stock_adjustments').select('*,products(name)').order('created_at',{ascending:false}).limit(50)
    ])
    setProducts(p||[]); setHistory(h||[]); setLoading(false)
  }

  const shown=search?products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())):products

  return (
    <div>
      <h1 style={s.sectionTitle}>Stock & Adjust</h1>
      <p style={{fontSize:12,color:'#aaa',marginBottom:16}}>Select a product to adjust its stock level</p>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…" style={{...s.input,maxWidth:360,marginBottom:12}}/>
      {selected&&(
        <Modal title="Adjust Stock" onClose={()=>{setSelected(null);load()}}>
          <StockAdjustInline product={selected} onDone={q=>{setSelected(null);setProducts(ps=>ps.map(p=>p.id===selected.id?{...p,quantity:q}:p));load()}}/>
        </Modal>
      )}
      {loading?<Spinner/>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:10,marginBottom:24}}>
          {shown.map(p=>{
            const q=p.quantity||0
            const clr=q===0?'#e53e3e':q<=3?'#c27803':q<=10?'#8a5a00':'#15803d'
            return (
              <div key={p.id} style={{...s.card,display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}} onClick={()=>setSelected(p)}>
                <div><div style={{fontSize:13,fontWeight:600}}>{p.name}</div><div style={{fontSize:11,color:'#aaa'}}>{p.category}</div></div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:20,fontWeight:700,color:clr}}>{q}</div>
                  <button style={{...s.btnSm,marginTop:4}} onClick={e=>{e.stopPropagation();setSelected(p)}}>Adjust</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {history.length>0&&(
        <>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Recent Adjustments</div>
          {history.map(h=>(
            <div key={h.id} style={{...s.card,padding:'10px 14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                <div><span style={{fontWeight:600}}>{h.products?.name}</span> <span style={{color:h.qty_change>0?'#15803d':'#e53e3e'}}>{h.qty_change>0?'+':''}{h.qty_change}</span> <span style={{color:'#aaa'}}>({h.qty_before}→{h.qty_after})</span> <span style={{color:'#888',fontSize:11}}>[{h.type}]</span></div>
                <span style={{color:'#aaa'}}>{fmtDate(h.created_at)}</span>
              </div>
              {h.notes&&<div style={{fontSize:11,color:'#aaa',marginTop:2}}>{h.notes}</div>}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

/* ══════════════════════════════════
   CUSTOMERS
══════════════════════════════════ */
function Customers() {
  const [customers,setCustomers]=useState([])
  const [loading,setLoading]=useState(true)
  const [search,setSearch]=useState('')
  const [detail,setDetail]=useState(null)

  useEffect(()=>{ load() },[])
  async function load() {
    setLoading(true)
    const{data}=await supabase.from('customers').select('*').order('last_purchase',{ascending:false}).limit(300)
    setCustomers(data||[]); setLoading(false)
  }

  const shown=customers.filter(c=>!search||c.name?.toLowerCase().includes(search.toLowerCase())||c.phone?.includes(search))

  return (
    <div>
      <div style={{marginBottom:16}}>
        <h1 style={s.sectionTitle}>Customers</h1>
        <p style={{fontSize:12,color:'#aaa'}}>{customers.length} registered customers</p>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or phone…" style={{...s.input,maxWidth:360,marginBottom:12}}/>
      {detail&&(
        <Modal title="Customer Details" onClose={()=>setDetail(null)}>
          <div style={{display:'grid',gap:2}}>
            {[['Name',detail.name||'—'],['Phone',detail.phone],['Total Purchases',ghs(detail.total_spent||0)],['Purchase Count',detail.purchase_count||0],['Last Purchase',fmtDate(detail.last_purchase)],['Created',fmtDate(detail.created_at)]].map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f5f5f5',fontSize:13}}>
                <span style={{color:'#777'}}>{k}</span><span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {loading?<Spinner/>:shown.length===0?<Empty text="No customers yet."/>:(
        <div style={{background:'#fff',border:'1px solid #ebebeb',borderRadius:8,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr><th style={s.th}>Name</th><th style={s.th}>Phone</th><th style={s.th}>Purchases</th><th style={s.th}>Total Spent</th><th style={s.th}>Last Purchase</th><th style={s.th}></th></tr></thead>
            <tbody>
              {shown.map(c=>(
                <tr key={c.id}>
                  <td style={s.td}><span style={{fontWeight:600}}>{c.name||<span style={{color:'#bbb'}}>—</span>}</span></td>
                  <td style={s.td}>{c.phone}</td>
                  <td style={s.td}>{c.purchase_count||0}</td>
                  <td style={s.td}><span style={{fontWeight:600}}>{ghs(c.total_spent||0)}</span></td>
                  <td style={s.td}><span style={{fontSize:11,color:'#888'}}>{fmtDate(c.last_purchase)}</span></td>
                  <td style={s.td}><button onClick={()=>setDetail(c)} style={s.btnGhostSm}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════
   EXPENSES
══════════════════════════════════ */
function Expenses() {
  const [expenses,setExpenses]=useState([])
  const [editing,setEditing]=useState(null)
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [catFilter,setCatFilter]=useState('all')

  useEffect(()=>{ load() },[])
  async function load() { setLoading(true); const{data}=await supabase.from('expenses').select('*').order('date',{ascending:false}).limit(300); setExpenses(data||[]); setLoading(false) }
  async function save() {
    if(!editing?.description?.trim()||!editing?.amount) return; setSaving(true)
    const{id,...data}=editing
    id?await supabase.from('expenses').update(data).eq('id',id):await supabase.from('expenses').insert({...data,date:new Date().toISOString()})
    setSaving(false); setEditing(null); load()
  }
  async function del(id) { if(!confirm('Delete?')) return; await supabase.from('expenses').delete().eq('id',id); load() }

  const cats=['all',...new Set(expenses.map(e=>e.category).filter(Boolean))]
  const shown=catFilter==='all'?expenses:expenses.filter(e=>e.category===catFilter)
  const total=shown.reduce((a,e)=>a+Number(e.amount||0),0)
  const monthTotal=expenses.filter(e=>e.date?.startsWith(today().slice(0,7))).reduce((a,e)=>a+Number(e.amount||0),0)

  return (
    <div>
      {editing&&(
        <Modal title={editing.id?'Edit Expense':'New Expense'} onClose={()=>setEditing(null)}>
          <div style={{display:'grid',gap:12}}>
            <F label="Description *" value={editing.description} onChange={v=>setEditing({...editing,description:v})} placeholder="e.g. Rent" required/>
            <N label="Amount (GH₵) *" value={editing.amount} onChange={v=>setEditing({...editing,amount:v})} required/>
            <F label="Category" value={editing.category} onChange={v=>setEditing({...editing,category:v})} placeholder="e.g. Operations, Logistics"/>
            <F label="Notes" value={editing.notes} onChange={v=>setEditing({...editing,notes:v})} placeholder="Additional notes"/>
            <div><label style={s.label}>Date</label><input type="date" value={editing.date?.slice(0,10)||today()} onChange={e=>setEditing({...editing,date:e.target.value})} style={s.input}/></div>
            <div style={{display:'flex',gap:8,paddingTop:8}}>
              <button onClick={save} disabled={saving} style={{...s.btn,flex:1,justifyContent:'center',opacity:saving?0.5:1}}>{saving?'Saving…':'Save'}</button>
              <button onClick={()=>setEditing(null)} style={{...s.btnGhost,flex:1,justifyContent:'center'}}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:16}}>
        <div>
          <h1 style={s.sectionTitle}>Expenses</h1>
          <p style={{fontSize:12,color:'#aaa'}}>This month: <strong style={{color:'#e53e3e'}}>{ghs(monthTotal)}</strong> · All time: {ghs(expenses.reduce((a,e)=>a+Number(e.amount||0),0))}</p>
        </div>
        <button onClick={()=>setEditing({description:'',amount:'',category:'',notes:'',date:today()})} style={s.btn}>+ Add Expense</button>
      </div>
      <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
        {cats.map(c=><button key={c} onClick={()=>setCatFilter(c)} style={catFilter===c?s.btn:s.btnGhost}>{c==='all'?'All':c}</button>)}
      </div>
      {loading?<Spinner/>:shown.length===0?<Empty text="No expenses recorded."/>:shown.map(e=>(
        <div key={e.id} style={s.card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:14,fontWeight:600}}>{e.description}</div>
              <div style={{fontSize:11,color:'#aaa',marginTop:2}}>{e.category&&`${e.category} · `}{fmtDate(e.date)}</div>
              {e.notes&&<div style={{fontSize:11,color:'#bbb'}}>{e.notes}</div>}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:16,fontWeight:700,color:'#e53e3e'}}>{ghs(e.amount)}</span>
              <button onClick={()=>setEditing({...e})} style={s.btnGhostSm}>Edit</button>
              <button onClick={()=>del(e.id)} style={{...s.btnGhostSm,color:'#e53e3e',borderColor:'#fecaca'}}>Del</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════
   REPORTS
══════════════════════════════════ */
function Reports() {
  const [data,setData]=useState(null)
  const [period,setPeriod]=useState('month')
  const [loading,setLoading]=useState(true)

  useEffect(()=>{ load() },[period])
  async function load() {
    setLoading(true)
    const now=new Date()
    let from
    if(period==='today') from=now.toISOString().slice(0,10)
    else if(period==='week') { const d=new Date(now); d.setDate(d.getDate()-7); from=d.toISOString() }
    else if(period==='month') { from=now.toISOString().slice(0,7) }
    else { from=now.getFullYear()+'' }

    const filter=period==='today'?q=>q.gte('date',from):period==='month'?q=>q.gte('date',from+'-01'):period==='year'?q=>q.gte('date',from+'-01-01'):q=>q.gte('date',from)

    const[{data:sales},{data:expenses},{data:orders}]=await Promise.all([
      filter(supabase.from('sales').select('total,profit,payment,date').eq('voided',false)),
      filter(supabase.from('expenses').select('amount,category,date')),
      filter(supabase.from('whatsapp_orders').select('total,status,date')),
    ])
    const s=sales||[], e=expenses||[], o=orders||[]
    const rev=s.reduce((a,x)=>a+Number(x.total||0),0)
    const profit=s.reduce((a,x)=>a+Number(x.profit||0),0)
    const exp=e.reduce((a,x)=>a+Number(x.amount||0),0)

    const byPay=s.reduce((a,x)=>{ a[x.payment]=(a[x.payment]||0)+Number(x.total||0); return a },{})
    const byCat=e.reduce((a,x)=>{ a[x.category||'Other']=(a[x.category||'Other']||0)+Number(x.amount||0); return a },{})
    const onlineRev=o.filter(x=>['Paid','Completed'].includes(x.status)).reduce((a,x)=>a+Number(x.total||0),0)

    setData({revenue:rev,profit,expenses:exp,net:profit-exp,sales:s.length,orders:o.length,onlineRev,byPay,byCat})
    setLoading(false)
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h1 style={s.sectionTitle}>Reports</h1>
        <div style={{display:'flex',gap:6}}>
          {[['today','Today'],['week','This Week'],['month','This Month'],['year','This Year']].map(([v,l])=>(
            <button key={v} onClick={()=>setPeriod(v)} style={period===v?s.btn:s.btnGhost}>{l}</button>
          ))}
        </div>
      </div>
      {loading?<Spinner/>:!data?null:(
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12,marginBottom:20}}>
            <StatCard label="Revenue" value={ghs(data.revenue)} sub={`${data.sales} POS sales`}/>
            <StatCard label="Online Revenue" value={ghs(data.onlineRev)} sub={`${data.orders} orders`} color="#0f4c81"/>
            <StatCard label="Gross Profit" value={ghs(data.profit)} sub="Before expenses" color="#065f46"/>
            <StatCard label="Expenses" value={ghs(data.expenses)} sub="Recorded" color="#7c3aed"/>
            <StatCard label="Net Profit" value={ghs(data.net)} sub="After expenses" color={data.net>=0?'#14532d':'#7f1d1d'}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:12}}>
            <div style={s.card}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Sales by Payment Method</div>
              {Object.entries(data.byPay).sort((a,b)=>b[1]-a[1]).map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #f5f5f5',fontSize:13}}>
                  <span style={{color:'#666'}}>{k}</span><span style={{fontWeight:600}}>{ghs(v)}</span>
                </div>
              ))}
            </div>
            <div style={s.card}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Expenses by Category</div>
              {Object.keys(data.byCat).length===0?<p style={{fontSize:12,color:'#aaa'}}>No expenses.</p>:Object.entries(data.byCat).sort((a,b)=>b[1]-a[1]).map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #f5f5f5',fontSize:13}}>
                  <span style={{color:'#666'}}>{k}</span><span style={{fontWeight:700,color:'#e53e3e'}}>{ghs(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ══════════════════════════════════
   STAFF
══════════════════════════════════ */
function Staff() {
  const [staff,setStaff]=useState([])
  const [modal,setModal]=useState(false)
  const [form,setForm]=useState({name:'',role:'',phone:'',pin:'',active:true})
  const [saving,setSaving]=useState(false)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{ load() },[])
  async function load() { setLoading(true); const{data}=await supabase.from('staff').select('*').order('name'); setStaff(data||[]); setLoading(false) }
  async function save() {
    if(!form.name.trim()) return; setSaving(true)
    const{id,...data}=form
    id?await supabase.from('staff').update(data).eq('id',id):await supabase.from('staff').insert({...data,created_at:new Date().toISOString()})
    setSaving(false); setModal(false); setForm({name:'',role:'',phone:'',pin:'',active:true}); load()
  }
  async function toggleActive(id,active) { await supabase.from('staff').update({active:!active}).eq('id',id); load() }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div><h1 style={s.sectionTitle}>Staff</h1><p style={{fontSize:12,color:'#aaa'}}>{staff.filter(s=>s.active).length} active staff members</p></div>
        <button onClick={()=>setModal(true)} style={s.btn}>+ Add Staff</button>
      </div>
      {modal&&(
        <Modal title={form.id?'Edit Staff':'Add Staff Member'} onClose={()=>setModal(false)}>
          <div style={{display:'grid',gap:12}}>
            <F label="Full Name *" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="e.g. Ama Mensah" required/>
            <Sel label="Role" value={form.role} onChange={v=>setForm({...form,role:v})} options={['Manager','Cashier','Sales Rep','Delivery','Other']}/>
            <F label="Phone" value={form.phone} onChange={v=>setForm({...form,phone:v})} placeholder="0XX XXX XXXX"/>
            <F label="PIN (for POS)" value={form.pin} onChange={v=>setForm({...form,pin:v})} placeholder="4-digit PIN" type="password"/>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'#fafafa',borderRadius:6}}>
              <span style={{fontSize:13,fontWeight:500}}>Active</span>
              <button type="button" onClick={()=>setForm({...form,active:!form.active})}
                style={{width:44,height:24,borderRadius:12,background:form.active?'#1a1a2e':'#ddd',border:'none',cursor:'pointer',position:'relative',transition:'background .2s'}}>
                <span style={{position:'absolute',top:3,left:form.active?22:3,width:18,height:18,background:'#fff',borderRadius:'50%',transition:'left .2s',display:'block'}}/>
              </button>
            </div>
            <div style={{display:'flex',gap:8,paddingTop:8}}>
              <button onClick={save} disabled={saving||!form.name.trim()} style={{...s.btn,flex:1,justifyContent:'center',opacity:saving?0.5:1}}>Save</button>
              <button onClick={()=>setModal(false)} style={{...s.btnGhost,flex:1,justifyContent:'center'}}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      {loading?<Spinner/>:staff.length===0?<Empty text="No staff members."/>:(
        <div style={{background:'#fff',border:'1px solid #ebebeb',borderRadius:8,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr><th style={s.th}>Name</th><th style={s.th}>Role</th><th style={s.th}>Phone</th><th style={s.th}>Status</th><th style={{...s.th,textAlign:'right'}}>Actions</th></tr></thead>
            <tbody>
              {staff.map(m=>(
                <tr key={m.id}>
                  <td style={s.td}><span style={{fontWeight:600}}>{m.name}</span></td>
                  <td style={s.td}><span style={{fontSize:12,color:'#666'}}>{m.role||'—'}</span></td>
                  <td style={s.td}><span style={{fontSize:12}}>{m.phone||'—'}</span></td>
                  <td style={s.td}><Badge status={m.active?'Active':'Inactive'}/></td>
                  <td style={{...s.td,textAlign:'right'}}>
                    <div style={{display:'flex',gap:4,justifyContent:'flex-end'}}>
                      <button onClick={()=>{setForm({...m});setModal(true)}} style={s.btnGhostSm}>Edit</button>
                      <button onClick={()=>toggleActive(m.id,m.active)} style={s.btnGhostSm}>{m.active?'Deactivate':'Activate'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ── UTILS ── */
const Spinner = () => <div style={{textAlign:'center',padding:40,color:'#aaa',fontSize:13}}>Loading…</div>
const Empty = ({text}) => <div style={{textAlign:'center',padding:'48px 20px',color:'#bbb',fontSize:13}}>{text}</div>
