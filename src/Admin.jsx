import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import './admin.css'

const SUPABASE_URL  = 'https://tgdtjfquwbtvfsdnvvgm.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZHRqZnF1d2J0dmZzZG52dmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTM4MjUsImV4cCI6MjA5NjAyOTgyNX0.uXUkodx29_LQNU8pkpbxNnYGFgBYmoFTJHtxVWWAt8E'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
const ghs = n => `GH₵ ${Number(n||0).toFixed(2)}`
const cdn = (url,w=80) => url ? url.replace('/upload/',`/upload/w_${w},q_auto/`) : ''
const CLOUD = 'dls9fai0i', PRESET = 'esterea_unsigned'
const today = () => new Date().toISOString().slice(0,10)
const fmt = d => { try { return new Date(d).toLocaleString('en-GH',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) } catch { return d } }
const fmtDate = d => { try { return new Date(d).toLocaleDateString('en-GH',{day:'numeric',month:'short',year:'numeric'}) } catch { return d } }

/* ── Upload ── */
async function uploadImage(file, onProg) {
  const fd = new FormData()
  fd.append('file',file); fd.append('upload_preset',PRESET); fd.append('folder','esterea')
  return new Promise((res,rej) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST',`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`)
    xhr.upload.onprogress = e => e.lengthComputable && onProg(Math.round(e.loaded/e.total*100))
    xhr.onload = () => xhr.status===200 ? res(JSON.parse(xhr.responseText).secure_url) : rej(new Error('Upload failed'))
    xhr.onerror = ()=>rej(new Error('Network error'))
    xhr.send(fd)
  })
}

/* ── Field helpers ── */
const Field = ({label,value,onChange,placeholder,type='text',required}) => (
  <div className="field">
    <label>{label}{required && <span style={{color:'#ef4444'}}> *</span>}</label>
    <input type={type} className="field-input" value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''}/>
  </div>
)
const NumField = ({label,value,onChange,step='0.01',required}) => (
  <div className="field">
    <label>{label}{required && <span style={{color:'#ef4444'}}> *</span>}</label>
    <input type="number" step={step} min="0" className="field-input" value={value||''} onChange={e=>onChange(Number(e.target.value))}/>
  </div>
)
const Select = ({label,value,onChange,options,required}) => (
  <div className="field">
    <label>{label}{required && <span style={{color:'#ef4444'}}> *</span>}</label>
    <select className="field-select" value={value||''} onChange={e=>onChange(e.target.value)}>
      <option value="">Select…</option>
      {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
    </select>
  </div>
)
const TextArea = ({label,value,onChange,placeholder,rows=3}) => (
  <div className="field">
    <label>{label}</label>
    <textarea className="field-textarea" rows={rows} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''}/>
  </div>
)

/* ── Badge ── */
const Badge = ({status}) => {
  const map = {Paid:'green',Completed:'green',Pending:'amber','In Stock':'green','Low Stock':'amber',Low:'amber',Critical:'red','Out of Stock':'red',Cancelled:'red',Active:'green',Inactive:'gray',Refunded:'blue',Voided:'red'}
  const cls = `badge badge-${map[status]||'gray'}`
  return <span className={cls}>{status}</span>
}

/* ── Toggle ── */
const Toggle = ({on,onToggle,label,sub}) => (
  <div className="toggle-wrap">
    <div><div className="toggle-label">{label}</div>{sub&&<div className="toggle-sub">{sub}</div>}</div>
    <button type="button" className={`toggle${on?' on':''}`} onClick={onToggle}><span className="toggle-knob"/></button>
  </div>
)

/* ── Modal ── */
function Modal({title,onClose,children,wide,footer}) {
  useEffect(()=>{ document.body.style.overflow='hidden'; return()=>{ document.body.style.overflow='' } },[])
  return (
    <div className="modal-overlay" onClick={e=>e.target.classList.contains('modal-overlay')&&onClose()}>
      <div className="modal-box" style={{maxWidth:wide?680:480}}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

/* ── Image Uploader ── */
function ImgUpload({value,onChange}) {
  const [prog,setProg]=useState(0),[busy,setBusy]=useState(false),[err,setErr]=useState(''),[drag,setDrag]=useState(false)
  const ref=useRef()
  async function handle(file) {
    if(!file||!file.type.startsWith('image/')) { setErr('Select an image file'); return }
    if(file.size>10*1024*1024) { setErr('Max 10 MB'); return }
    setErr(''); setBusy(true); setProg(0)
    try { onChange(await uploadImage(file,setProg)) } catch(e) { setErr(e.message) }
    setBusy(false); setProg(0)
  }
  return (
    <div className="field">
      <label>Product Image</label>
      {value&&!busy&&(
        <div style={{position:'relative',height:130,background:'#f4f6fb',marginBottom:8,overflow:'hidden',borderRadius:12}}>
          <img src={cdn(value,400)} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          <div style={{position:'absolute',inset:0,background:'rgba(13,27,62,.5)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:0,transition:'opacity .15s'}}
            onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0}>
            <button type="button" className="btn-primary btn-sm" onClick={()=>ref.current?.click()}>Change</button>
            <button type="button" className="btn-secondary btn-sm" style={{color:'#fff',borderColor:'rgba(255,255,255,.3)',background:'transparent'}} onClick={()=>onChange('')}>Remove</button>
          </div>
        </div>
      )}
      {!value&&(
        <div onClick={()=>!busy&&ref.current?.click()}
          onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);handle(e.dataTransfer.files[0])}}
          style={{height:90,border:`2px dashed ${drag?'#3b82f6':'#ddd'}`,background:drag?'#eff6ff':'#f4f6fb',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',borderRadius:12,marginBottom:8,transition:'all .15s'}}>
          {busy
            ? <div style={{textAlign:'center'}}><div style={{fontSize:12,color:'#888',marginBottom:6}}>Uploading {prog}%</div><div style={{width:120,height:3,background:'#e2e2e2',borderRadius:2}}><div style={{height:'100%',background:'#3b82f6',width:`${prog}%`,transition:'width .2s',borderRadius:2}}/></div></div>
            : <><div style={{fontSize:13,color:'#888',fontWeight:500}}>Drop image or click to upload</div><div style={{fontSize:11,color:'#bbb',marginTop:3}}>JPG / PNG / WebP · max 10 MB</div></>
          }
        </div>
      )}
      {value&&!busy&&<button type="button" style={{background:'none',border:'none',cursor:'pointer',fontSize:11,color:'#aaa',marginBottom:6}} onClick={()=>ref.current?.click()}>↑ Upload different image</button>}
      <input className="field-input" value={value||''} onChange={e=>onChange(e.target.value)} placeholder="Or paste Cloudinary URL…" style={{height:34,fontSize:12}}/>
      {err&&<p style={{fontSize:11,color:'#ef4444',marginTop:4}}>{err}</p>}
      <input ref={ref} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(f)handle(f);e.target.value=''}}/>
    </div>
  )
}

/* ── Stat Card ── */
const StatCard = ({label,value,sub,icon,variant='default'}) => (
  <div className={`stat-card ${variant}`}>
    {icon&&<div className="stat-card-icon">{icon}</div>}
    <div className="stat-card-label">{label}</div>
    <div className="stat-card-value">{value}</div>
    {sub&&<div className="stat-card-sub">{sub}</div>}
  </div>
)

const Spinner = () => <div style={{textAlign:'center',padding:48,color:'#aaa',fontSize:13,fontWeight:500}}>Loading…</div>
const Empty = ({text='No data.'}) => <div style={{textAlign:'center',padding:'48px 20px',color:'#bbb',fontSize:13}}><div style={{fontSize:32,marginBottom:8}}>◇</div>{text}</div>

/* ════════════════════
   NAV CONFIG
════════════════════ */
const NAV_SECTIONS = [
  { label:'Sales', items:[
    {id:'dashboard',label:'Dashboard',icon:'📊'},
    {id:'pos',label:'POS',icon:'🖥️'},
    {id:'invoices',label:'Invoices',icon:'📋'},
    {id:'receipts',label:'Receipts',icon:'🧾'},
    {id:'refunds',label:'Refunds',icon:'↩️'},
  ]},
  { label:'Inventory', items:[
    {id:'products',label:'Products',icon:'📦'},
    {id:'promos',label:'Promos & Bundles',icon:'🏷️'},
    {id:'restock',label:'Restock',icon:'📥'},
    {id:'stock',label:'Stock & Adjust',icon:'📐'},
  ]},
  { label:'Business', items:[
    {id:'customers',label:'Customers',icon:'👥'},
    {id:'expenses',label:'Expenses',icon:'💸'},
    {id:'reports',label:'Reports',icon:'📈'},
    {id:'staff',label:'Staff',icon:'👤'},
  ]},
]

/* ════════════════════
   MAIN ADMIN
════════════════════ */
export default function Admin() {
  const [authed,setAuthed]=useState(false)
  const [pass,setPass]=useState('')
  const [err,setErr]=useState(false)
  const [tab,setTab]=useState('dashboard')
  const [sideOpen,setSideOpen]=useState(false)

  useEffect(()=>{ if(sessionStorage.getItem('esterea_admin')==='yes') setAuthed(true) },[])

  function login() {
    if(pass==='esterea2026') { setAuthed(true); sessionStorage.setItem('esterea_admin','yes') }
    else { setErr(true); setTimeout(()=>setErr(false),2000) }
  }
  function logout() { sessionStorage.removeItem('esterea_admin'); window.location.hash='/'; window.location.reload() }

  const allItems = NAV_SECTIONS.flatMap(s=>s.items)
  const activeItem = allItems.find(i=>i.id===tab)

  if(!authed) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#0d1b3e 0%,#1e2f5a 100%)'}}>
      <div style={{width:360,background:'#fff',borderRadius:24,padding:36,boxShadow:'0 30px 80px rgba(13,27,62,.35)'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{width:52,height:52,background:'linear-gradient(135deg,#2563eb,#3b82f6)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontFamily:'var(--serif)',fontSize:26,color:'#fff',boxShadow:'0 6px 20px rgba(59,130,246,.4)'}}>E</div>
          <div style={{fontSize:20,fontWeight:800,color:'#0d1b3e',marginBottom:2}}>Esterea Home</div>
          <div style={{fontSize:12,color:'#aaa',letterSpacing:'.03em'}}>Admin Panel</div>
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" className="field-input" value={pass} onChange={e=>{setPass(e.target.value);setErr(false)}} onKeyDown={e=>e.key==='Enter'&&login()} placeholder="Enter password" autoFocus style={{borderColor:err?'#ef4444':undefined}}/>
          {err&&<div style={{fontSize:11,color:'#ef4444',marginTop:4}}>Incorrect password</div>}
        </div>
        <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'13px 0',fontSize:14,borderRadius:12,marginTop:4}} onClick={login}>Sign in</button>
      </div>
    </div>
  )

  return (
    <div className="admin-root">
      {sideOpen&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.35)',zIndex:99}} onClick={()=>setSideOpen(false)}/>}

      {/* SIDEBAR */}
      <aside className="admin-sidebar" style={{transform:sideOpen?'translateX(0)':undefined}}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">E</div>
          <div className="sidebar-logo-name">Esterea Home</div>
          <div className="sidebar-logo-sub">Management</div>
        </div>
        <nav className="sidebar-nav">
          {NAV_SECTIONS.map(section=>(
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map(item=>(
                <button key={item.id} className={`nav-item${tab===item.id?' active':''}`}
                  onClick={()=>{setTab(item.id);setSideOpen(false)}}>
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <a href="/" target="_blank" rel="noreferrer" className="sidebar-footer-btn" style={{textDecoration:'none'}}>
            <span>🏠</span> View Store
          </a>
          <button className="sidebar-footer-btn" onClick={logout}>
            <span>↗</span> Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="admin-main admin-content-wrap">
        <div className="admin-topbar">
          <button className="topbar-hamburger" onClick={()=>setSideOpen(o=>!o)}>
            <span style={{width:18}}/><span style={{width:14}}/><span style={{width:18}}/>
          </button>
          <span className="topbar-title">{activeItem?.label}</span>
          <span className="topbar-date">{new Date().toLocaleDateString('en-GH',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</span>
        </div>
        <div className="admin-content fade-in" key={tab}>
          {tab==='dashboard' && <Dashboard/>}
          {tab==='pos'       && <POS/>}
          {tab==='invoices'  && <Invoices/>}
          {tab==='receipts'  && <Receipts/>}
          {tab==='refunds'   && <Refunds/>}
          {tab==='products'  && <Products/>}
          {tab==='promos'    && <Promos/>}
          {tab==='restock'   && <Restock/>}
          {tab==='stock'     && <StockAdjust/>}
          {tab==='customers' && <Customers/>}
          {tab==='expenses'  && <Expenses/>}
          {tab==='reports'   && <Reports/>}
          {tab==='staff'     && <Staff/>}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════
   DASHBOARD
════════════════════ */
function Dashboard() {
  const [stats,setStats]=useState(null)
  useEffect(()=>{ load() },[])
  async function load() {
    const t=today()
    const [{count:pCount},{data:sales},{data:expenses},{data:orders}] = await Promise.all([
      supabase.from('products').select('*',{count:'exact',head:true}),
      supabase.from('sales').select('total,profit,date').eq('voided',false),
      supabase.from('expenses').select('amount,date'),
      supabase.from('whatsapp_orders').select('total,status,date,created_at'),
    ])
    const s=sales||[],e=expenses||[],o=orders||[]
    const tSales=s.filter(x=>x.date?.startsWith(t))
    const rev=s.reduce((a,x)=>a+Number(x.total||0),0)
    const profit=s.reduce((a,x)=>a+Number(x.profit||0),0)
    const exp=e.reduce((a,x)=>a+Number(x.amount||0),0)
    const {count:cCount}=await supabase.from('customers').select('*',{count:'exact',head:true}).catch(()=>({count:0}))
    setStats({products:pCount||0,todayRev:tSales.reduce((a,x)=>a+Number(x.total||0),0),todaySales:tSales.length,revenue:rev,profit,expenses:exp,net:profit-exp,orders:o.length,pending:o.filter(x=>x.status==='Pending').length,paid:o.filter(x=>['Paid','Completed'].includes(x.status)).length,onlineRev:o.filter(x=>['Paid','Completed'].includes(x.status)).reduce((a,x)=>a+Number(x.total||0),0),customers:cCount||0})
  }
  if(!stats) return <Spinner/>
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Dashboard</div><div className="page-sub">{new Date().toLocaleDateString('en-GH',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div>
        <button className="btn-secondary" onClick={load}>↻ Refresh</button>
      </div>
      <div className="stat-grid">
        <StatCard label="Today's Revenue" value={ghs(stats.todayRev)} sub={`${stats.todaySales} POS sales`} icon="💰"/>
        <StatCard label="Total Revenue" value={ghs(stats.revenue)} sub="All time POS" icon="📈" variant="blue"/>
        <StatCard label="Net Profit" value={ghs(stats.net)} sub="After expenses" icon="✦" variant={stats.net>=0?'green':'red'}/>
        <StatCard label="Total Expenses" value={ghs(stats.expenses)} sub="All recorded" icon="💸" variant="purple"/>
        <StatCard label="Products" value={stats.products} sub="In catalogue" icon="📦" variant="teal"/>
        <StatCard label="Customers" value={stats.customers} sub="Registered" icon="👥" variant="amber"/>
        <StatCard label="Online Orders" value={stats.orders} sub={`${stats.pending} pending`} icon="📋"/>
        <StatCard label="Orders Paid" value={stats.paid} sub={ghs(stats.onlineRev)} icon="✓" variant="green"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:16}}>
        <RecentOrders/>
        <LowStockWidget/>
      </div>
    </div>
  )
}
function RecentOrders() {
  const [orders,setOrders]=useState([])
  useEffect(()=>{ supabase.from('whatsapp_orders').select('order_no,customer_name,total,status').order('created_at',{ascending:false}).limit(6).then(({data})=>setOrders(data||[])) },[])
  return (
    <div className="panel">
      <div className="panel-header"><span className="panel-title">Recent Online Orders</span></div>
      {orders.map(o=>(
        <div key={o.order_no} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 20px',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
          <div><div style={{fontSize:13,fontWeight:700}}>{o.customer_name||'Customer'}</div><div style={{fontSize:11,color:'#aaa',fontFamily:'monospace'}}>{o.order_no}</div></div>
          <div style={{textAlign:'right',display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}><div style={{fontSize:14,fontWeight:800}}>{ghs(o.total)}</div><Badge status={o.status}/></div>
        </div>
      ))}
      {orders.length===0&&<Empty text="No orders yet."/>}
    </div>
  )
}
function LowStockWidget() {
  const [items,setItems]=useState([])
  useEffect(()=>{ supabase.from('products').select('name,quantity').lte('quantity',10).order('quantity').limit(8).then(({data})=>setItems(data||[])) },[])
  return (
    <div className="panel">
      <div className="panel-header"><span className="panel-title">⚠ Low Stock Alert</span></div>
      {items.length===0?<div style={{padding:'20px',textAlign:'center'}}><span style={{fontSize:13,color:'#aaa'}}>All stock levels OK ✓</span></div>:items.map((p,i)=>(
        <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 20px',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
          <div style={{fontSize:13,fontWeight:600}}>{p.name}</div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:16,fontWeight:800,color:p.quantity===0?'#ef4444':p.quantity<=3?'#ef4444':'#f59e0b'}}>{p.quantity}</span>
            <Badge status={p.quantity===0?'Out of Stock':p.quantity<=3?'Critical':'Low Stock'}/>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ════════════════════
   POS
════════════════════ */
function POS() {
  const [products,setProducts]=useState([])
  const [cart,setCart]=useState([])
  const [search,setSearch]=useState('')
  const [payment,setPayment]=useState('Cash')
  const [custName,setCustName]=useState('')
  const [custPhone,setCustPhone]=useState('')
  const [discount,setDiscount]=useState('')
  const [saving,setSaving]=useState(false)
  const [lastReceipt,setLastReceipt]=useState(null)
  const [toast,setToast]=useState('')

  useEffect(()=>{ supabase.from('products').select('*').eq('visible',true).gt('quantity',0).order('name').then(({data})=>setProducts(data||[])) },[])

  const showToast=m=>{ setToast(m); setTimeout(()=>setToast(''),2500) }
  const shown=search?products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())):products
  const add=p=>{ setCart(c=>{ const e=c.find(x=>x.id===p.id); if(e) return c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x); return [...c,{id:p.id,name:p.name,price:p.price,cost:p.cost_price||0,qty:1}] }); showToast(`${p.name.slice(0,20)} added`) }
  const subtotal=cart.reduce((a,c)=>a+c.price*c.qty,0)
  const discAmt=Number(discount)||0
  const total=Math.max(0,subtotal-discAmt)
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
    const rec={receipt_no:receipt,items,total,profit,payment,discount:discAmt,customer_name:custName,customer_phone:custPhone,date:new Date().toISOString()}
    setSaving(false); setLastReceipt(rec); setCart([]); setCustName(''); setCustPhone(''); setDiscount('')
  }

  return (
    <div>
      {toast&&<div style={{position:'fixed',top:70,left:'50%',transform:'translateX(-50%)',background:'#0d1b3e',color:'#fff',padding:'8px 20px',borderRadius:20,fontSize:12,fontWeight:600,zIndex:300,whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,.2)'}}>{toast}</div>}
      {lastReceipt&&(
        <Modal title="Receipt" onClose={()=>setLastReceipt(null)} footer={<><button className="btn-primary" onClick={()=>window.print()}>🖨 Print</button><button className="btn-secondary" onClick={()=>setLastReceipt(null)}>Close</button></>}>
          <div style={{textAlign:'center',marginBottom:20,paddingTop:8}}>
            <div style={{fontFamily:'var(--serif)',fontSize:22,fontWeight:600,color:'#0d1b3e'}}>Esterea Home</div>
            <div style={{fontSize:11,color:'#aaa'}}>Accra, Ghana · 0547927722</div>
            <div style={{fontSize:11,color:'#aaa',marginTop:2}}>{fmt(lastReceipt.date)}</div>
            <div style={{fontSize:10,fontFamily:'monospace',color:'#ccc',marginTop:2}}>{lastReceipt.receipt_no}</div>
          </div>
          {lastReceipt.items.map((it,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'8px 0',borderBottom:'1px solid #f5f5f5'}}>
              <span>{it.qty}× {it.name}</span><span style={{fontWeight:700}}>{ghs((it.price||0)*it.qty)}</span>
            </div>
          ))}
          {lastReceipt.discount>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#ef4444',marginTop:8}}><span>Discount</span><span>- {ghs(lastReceipt.discount)}</span></div>}
          <div style={{display:'flex',justifyContent:'space-between',fontSize:18,fontWeight:800,marginTop:12,padding:'12px 0',borderTop:'2px solid #0d1b3e',color:'#0d1b3e'}}><span>Total</span><span>{ghs(lastReceipt.total)}</span></div>
          <div style={{fontSize:12,color:'#888',marginTop:4}}>Payment: {lastReceipt.payment}</div>
          {lastReceipt.customer_name&&<div style={{fontSize:12,color:'#aaa'}}>Customer: {lastReceipt.customer_name}</div>}
          <div style={{textAlign:'center',fontSize:11,color:'#aaa',marginTop:20,padding:'12px',background:'#f4f6fb',borderRadius:10}}>Thank you for shopping with us!</div>
        </Modal>
      )}
      <div className="page-header">
        <div><div className="page-title">Point of Sale</div><div className="page-sub">In-store sales terminal</div></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 330px',gap:16,alignItems:'start'}}>
        {/* Products */}
        <div>
          <div className="search-box" style={{marginBottom:14}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…"/>
          </div>
          <div className="pos-product-grid">
            {shown.map(p=>(
              <div key={p.id} className="pos-card" onClick={()=>add(p)}>
                {p.image
                  ? <img src={cdn(p.image,240)} className="pos-card-img" alt={p.name}/>
                  : <div className="pos-card-img" style={{display:'flex',alignItems:'center',justifyContent:'center',color:'#ddd',fontSize:28,fontFamily:'var(--serif)'}}>E</div>
                }
                <div className="pos-card-name">{p.name}</div>
                <div className="pos-card-price">{ghs(p.price)}</div>
                <div className="pos-card-stock">Stock: {p.quantity}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="cart-panel">
          <div className="cart-panel-header">
            <span className="cart-panel-title">🛒 Cart {cart.length>0&&<span style={{background:'rgba(59,130,246,.3)',color:'#93c5fd',borderRadius:10,padding:'1px 8px',fontSize:11,marginLeft:6}}>{cart.reduce((a,c)=>a+c.qty,0)}</span>}</span>
            {cart.length>0&&<button onClick={()=>setCart([])} style={{background:'none',border:'none',cursor:'pointer',fontSize:11,color:'rgba(255,255,255,.3)',textDecoration:'underline'}}>Clear</button>}
          </div>
          {cart.length===0
            ? <div style={{padding:'32px 20px',textAlign:'center',color:'rgba(255,255,255,.25)',fontSize:13}}>Tap a product to add</div>
            : <div className="cart-body">
                {cart.map(c=>(
                  <div key={c.id} className="cart-item">
                    <div style={{flex:1,minWidth:0}}>
                      <div className="cart-item-name" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
                      <div className="cart-item-price">{ghs(c.price)} ea.</div>
                    </div>
                    <button className="qty-btn" onClick={()=>setCart(cs=>cs.filter(x=>x.id!==c.id))} style={{background:'rgba(239,68,68,.2)',color:'#fca5a5',fontSize:14}}>×</button>
                    <button className="qty-btn" onClick={()=>setCart(cs=>cs.map(x=>x.id===c.id?{...x,qty:Math.max(1,x.qty-1)}:x))}>−</button>
                    <span className="qty-num">{c.qty}</span>
                    <button className="qty-btn" onClick={()=>setCart(cs=>cs.map(x=>x.id===c.id?{...x,qty:x.qty+1}:x))}>+</button>
                    <span style={{fontSize:12,fontWeight:800,color:'#fff',width:56,textAlign:'right',flexShrink:0}}>{ghs(c.price*c.qty)}</span>
                  </div>
                ))}
              </div>
          }
          <div className="cart-total">
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'rgba(255,255,255,.45)',marginBottom:4}}><span>Subtotal</span><span>{ghs(subtotal)}</span></div>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
              <span style={{fontSize:11,color:'rgba(255,255,255,.4)',flexShrink:0}}>Discount GH₵</span>
              <input type="number" min="0" value={discount} onChange={e=>setDiscount(e.target.value)} placeholder="0.00" className="cart-input" style={{height:28,marginBottom:0}}/>
            </div>
            <div className="cart-total-row">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-value">{ghs(total)}</span>
            </div>
            {total>0&&<div style={{fontSize:11,color:'#34d399',marginTop:3}}>Profit: {ghs(profit)}</div>}
          </div>
          <div className="pay-methods">
            {['Cash','MoMo','Paystack'].map(m=>(
              <button key={m} className={`pay-btn${payment===m?' active':''}`} onClick={()=>setPayment(m)}>{m}</button>
            ))}
          </div>
          <div className="cart-inputs">
            <input value={custName} onChange={e=>setCustName(e.target.value)} placeholder="Customer name (optional)" className="cart-input"/>
            <input value={custPhone} onChange={e=>setCustPhone(e.target.value)} placeholder="Phone (optional)" className="cart-input" style={{marginBottom:0}}/>
          </div>
          <button className="cart-complete-btn" disabled={!cart.length||saving} onClick={complete}>
            {saving?'Recording…':`Complete Sale · ${ghs(total)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════
   INVOICES
════════════════════ */
function Invoices() {
  const [orders,setOrders]=useState([]),[filter,setFilter]=useState('all'),[search,setSearch]=useState(''),[loading,setLoading]=useState(true),[detail,setDetail]=useState(null)
  useEffect(()=>{ load() },[])
  async function load() { setLoading(true); const{data}=await supabase.from('whatsapp_orders').select('*').order('date',{ascending:false}).limit(300); setOrders(data||[]); setLoading(false) }
  async function upd(id,status) { await supabase.from('whatsapp_orders').update({status}).eq('id',id); setOrders(os=>os.map(o=>o.id===id?{...o,status}:o)) }
  const counts=['Pending','Paid','Completed','Cancelled'].reduce((a,st)=>({...a,[st]:orders.filter(o=>o.status===st).length}),{})
  const shown=orders.filter(o=>{
    if(filter!=='all'&&o.status!==filter) return false
    if(search&&!o.customer_name?.toLowerCase().includes(search.toLowerCase())&&!o.customer_phone?.includes(search)&&!o.order_no?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  return (
    <div>
      {detail&&(
        <Modal title={`Invoice ${detail.order_no}`} onClose={()=>setDetail(null)} footer={<button className="btn-secondary" onClick={()=>setDetail(null)}>Close</button>}>
          <div style={{display:'grid',gap:2}}>
            {[['Customer',detail.customer_name],['Phone',detail.customer_phone],['Date',fmt(detail.date||detail.created_at)],['Address',detail.address],['Notes',detail.notes]].map(([k,v])=>v&&(
              <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #f5f5f5',fontSize:13}}>
                <span style={{color:'#777'}}>{k}</span><span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
            <div style={{padding:'9px 0',borderBottom:'1px solid #f5f5f5',display:'flex',justifyContent:'space-between',fontSize:13}}><span style={{color:'#777'}}>Status</span><Badge status={detail.status}/></div>
          </div>
          <div style={{marginTop:16}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:8,color:'#aaa',textTransform:'uppercase',letterSpacing:'.05em'}}>Items</div>
            {(detail.items?(typeof detail.items==='string'?JSON.parse(detail.items):detail.items):[]).map((it,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'8px 0',borderBottom:'1px solid #f5f5f5'}}>
                <span>{it.qty}× {it.name}</span><span style={{fontWeight:700}}>{ghs((it.price||0)*it.qty)}</span>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',fontSize:16,fontWeight:800,marginTop:10,paddingTop:10,borderTop:'2px solid #0d1b3e',color:'#0d1b3e'}}><span>Total</span><span>{ghs(detail.total)}</span></div>
          </div>
        </Modal>
      )}
      <div className="page-header">
        <div><div className="page-title">Invoices</div><div className="page-sub">Online orders & payments</div></div>
        <button className="btn-secondary" onClick={load}>↻ Refresh</button>
      </div>
      <div className="stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <StatCard label="Paid" value={counts.Paid||0} sub="completed" variant="green"/>
        <StatCard label="Pending" value={counts.Pending||0} sub="awaiting" variant="amber"/>
        <StatCard label="Completed" value={counts.Completed||0} sub="delivered"/>
        <StatCard label="Cancelled" value={counts.Cancelled||0} sub="cancelled" variant="red"/>
      </div>
      <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
        <div className="search-box" style={{flex:1,minWidth:220}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, phone, or order #…"/>
        </div>
        <div className="filter-tabs">
          {[['all','All'],['Pending','Pending'],['Paid','Paid'],['Completed','Completed'],['Cancelled','Cancelled']].map(([v,l])=>(
            <button key={v} className={`filter-tab${filter===v?' active':''}`} onClick={()=>setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>
      {loading?<Spinner/>:shown.length===0?<Empty text="No invoices found."/>:(
        <div className="panel">
          {shown.map(o=>{
            const items=o.items?(typeof o.items==='string'?JSON.parse(o.items):o.items):[]
            return (
              <div key={o.id} style={{padding:'16px 20px',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                  <div>
                    <div style={{fontSize:10,color:'#aaa',fontFamily:'monospace',marginBottom:2}}>{o.order_no}</div>
                    <div style={{fontSize:15,fontWeight:700}}>{o.customer_name||'Customer'}</div>
                    <div style={{fontSize:12,color:'#888'}}>{o.customer_phone} · {fmtDate(o.date||o.created_at)}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:18,fontWeight:800,color:'#0d1b3e'}}>{ghs(o.total)}</div>
                    <Badge status={o.status}/>
                  </div>
                </div>
                {items.length>0&&<p style={{fontSize:12,color:'#aaa',marginBottom:6}}>{items.map(i=>`${i.qty}× ${i.name}`).join(' · ')}</p>}
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {o.status==='Pending'&&<button className="btn-primary btn-sm" onClick={()=>upd(o.id,'Paid')}>Mark Paid</button>}
                  {o.status==='Paid'&&<button className="btn-primary btn-sm" onClick={()=>upd(o.id,'Completed')}>Mark Completed</button>}
                  {!['Cancelled','Completed'].includes(o.status)&&<button className="btn-danger btn-sm" onClick={()=>upd(o.id,'Cancelled')}>Cancel</button>}
                  <button className="btn-secondary btn-sm" onClick={()=>setDetail(o)}>View Details</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ════════════════════
   RECEIPTS
════════════════════ */
function Receipts() {
  const [sales,setSales]=useState([]),[search,setSearch]=useState(''),[loading,setLoading]=useState(true),[detail,setDetail]=useState(null)
  useEffect(()=>{ load() },[])
  async function load() { setLoading(true); const{data}=await supabase.from('sales').select('*').eq('voided',false).order('date',{ascending:false}).limit(300); setSales(data||[]); setLoading(false) }
  const shown=sales.filter(s=>!search||s.receipt_no?.toLowerCase().includes(search.toLowerCase())||s.customer_name?.toLowerCase().includes(search.toLowerCase()))
  const total=sales.reduce((a,s)=>a+Number(s.total||0),0),profit=sales.reduce((a,s)=>a+Number(s.profit||0),0)
  return (
    <div>
      {detail&&(
        <Modal title={`Receipt ${detail.receipt_no}`} onClose={()=>setDetail(null)} footer={<><button className="btn-primary" onClick={()=>window.print()}>🖨 Print</button><button className="btn-secondary" onClick={()=>setDetail(null)}>Close</button></>}>
          <div style={{textAlign:'center',marginBottom:20,paddingTop:8}}>
            <div style={{fontFamily:'var(--serif)',fontSize:22,color:'#0d1b3e'}}>Esterea Home</div>
            <div style={{fontSize:11,color:'#aaa'}}>Accra, Ghana · 0547927722</div>
            <div style={{fontSize:11,color:'#aaa',marginTop:2}}>{fmt(detail.date)}</div>
            <div style={{fontSize:10,fontFamily:'monospace',color:'#ccc'}}>{detail.receipt_no}</div>
          </div>
          {(detail.items?(typeof detail.items==='string'?JSON.parse(detail.items):detail.items):[]).map((it,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'8px 0',borderBottom:'1px solid #f5f5f5'}}>
              <span>{it.qty}× {it.name}</span><span style={{fontWeight:700}}>{ghs((it.price||0)*it.qty)}</span>
            </div>
          ))}
          {detail.discount>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#ef4444',marginTop:8}}><span>Discount</span><span>-{ghs(detail.discount)}</span></div>}
          <div style={{display:'flex',justifyContent:'space-between',fontSize:18,fontWeight:800,marginTop:10,paddingTop:10,borderTop:'2px solid #0d1b3e',color:'#0d1b3e'}}><span>Total</span><span>{ghs(detail.total)}</span></div>
          <div style={{fontSize:12,color:'#888',marginTop:4}}>Payment: {detail.payment}</div>
          {detail.customer_name&&<div style={{fontSize:12,color:'#aaa'}}>Customer: {detail.customer_name}</div>}
          <div style={{textAlign:'center',fontSize:11,color:'#aaa',marginTop:20}}>Thank you for shopping with us!</div>
        </Modal>
      )}
      <div className="page-header">
        <div><div className="page-title">Receipts</div><div className="page-sub">{sales.length} receipts · {ghs(total)} revenue · {ghs(profit)} profit</div></div>
      </div>
      <div className="search-box" style={{maxWidth:380,marginBottom:14}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search receipt, customer…"/>
      </div>
      {loading?<Spinner/>:shown.length===0?<Empty text="No receipts."/>:(
        <div className="panel">
          {shown.map(s=>{
            const items=s.items?(typeof s.items==='string'?JSON.parse(s.items):s.items):[]
            return (
              <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
                <div>
                  <div style={{fontSize:10,color:'#aaa',fontFamily:'monospace'}}>{s.receipt_no}</div>
                  <div style={{fontSize:15,fontWeight:700}}>{ghs(s.total)}</div>
                  <div style={{fontSize:11,color:'#888'}}>{s.payment} · Profit: <span style={{color:'#10b981',fontWeight:700}}>{ghs(s.profit)}</span></div>
                  {items.length>0&&<div style={{fontSize:11,color:'#aaa',marginTop:2}}>{items.map(i=>`${i.qty}× ${i.name}`).join(' · ')}</div>}
                </div>
                <div style={{textAlign:'right',display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
                  <div style={{fontSize:11,color:'#aaa'}}>{fmtDate(s.date)}</div>
                  <button className="btn-secondary btn-sm" onClick={()=>setDetail(s)}>View</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ════════════════════
   REFUNDS
════════════════════ */
function Refunds() {
  const [refunds,setRefunds]=useState([]),[loading,setLoading]=useState(true),[modal,setModal]=useState(false),[saving,setSaving]=useState(false)
  const [form,setForm]=useState({order_ref:'',amount:'',reason:'',payment_method:'Cash',staff_name:''})
  useEffect(()=>{ load() },[])
  async function load() { setLoading(true); const{data}=await supabase.from('refunds').select('*').order('created_at',{ascending:false}).limit(200); setRefunds(data||[]); setLoading(false) }
  async function save() {
    if(!form.order_ref||!form.amount) return; setSaving(true)
    await supabase.from('refunds').insert({...form,amount:Number(form.amount),created_at:new Date().toISOString(),status:'Refunded'})
    setSaving(false); setModal(false); setForm({order_ref:'',amount:'',reason:'',payment_method:'Cash',staff_name:''}); load()
  }
  const total=refunds.reduce((a,r)=>a+Number(r.amount||0),0)
  return (
    <div>
      {modal&&(
        <Modal title="Issue Refund" onClose={()=>setModal(false)} footer={<><button className="btn-primary" onClick={save} disabled={saving||!form.order_ref||!form.amount}>{saving?'Saving…':'Issue Refund'}</button><button className="btn-secondary" onClick={()=>setModal(false)}>Cancel</button></>}>
          <Field label="Order / Receipt Reference" value={form.order_ref} onChange={v=>setForm({...form,order_ref:v})} placeholder="e.g. POS-ABC123" required/>
          <NumField label="Refund Amount (GH₵)" value={form.amount} onChange={v=>setForm({...form,amount:v})} required/>
          <Select label="Refund Method" value={form.payment_method} onChange={v=>setForm({...form,payment_method:v})} options={['Cash','MoMo','Paystack']}/>
          <TextArea label="Reason" value={form.reason} onChange={v=>setForm({...form,reason:v})} placeholder="Why is this being refunded?" rows={2}/>
          <Field label="Approved by (Staff)" value={form.staff_name} onChange={v=>setForm({...form,staff_name:v})} placeholder="Staff name"/>
        </Modal>
      )}
      <div className="page-header">
        <div><div className="page-title">Refunds</div><div className="page-sub">{refunds.length} issued · {ghs(total)} total</div></div>
        <button className="btn-primary" onClick={()=>setModal(true)}>+ Issue Refund</button>
      </div>
      {loading?<Spinner/>:refunds.length===0?<Empty text="No refunds issued."/>:(
        <div className="panel">
          {refunds.map(r=>(
            <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'14px 20px',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
              <div>
                <div style={{fontSize:11,color:'#aaa',marginBottom:2}}>Ref: {r.order_ref}</div>
                <div style={{fontSize:15,fontWeight:700,color:'#ef4444'}}>{ghs(r.amount)}</div>
                <div style={{fontSize:11,color:'#888'}}>{r.payment_method}{r.staff_name&&` · ${r.staff_name}`}</div>
                {r.reason&&<div style={{fontSize:11,color:'#aaa',marginTop:2}}>{r.reason}</div>}
              </div>
              <div style={{textAlign:'right'}}><Badge status="Refunded"/><div style={{fontSize:11,color:'#aaa',marginTop:4}}>{fmtDate(r.created_at)}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ════════════════════
   PRODUCTS
════════════════════ */
function Products() {
  const [products,setProducts]=useState([]),[editing,setEditing]=useState(null),[stockModal,setStockModal]=useState(null)
  const [search,setSearch]=useState(''),[filter,setFilter]=useState('all'),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false)
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
  const stockStatus=q=>q===0?['Out of Stock','stock-crit']:q<=3?['Critical','stock-crit']:q<=10?['Low Stock','stock-low']:['In Stock','stock-ok']
  const filtered=products.filter(p=>{
    if(search&&!p.name.toLowerCase().includes(search.toLowerCase())&&!(p.category||'').toLowerCase().includes(search.toLowerCase())) return false
    if(filter==='active'&&!p.visible) return false; if(filter==='hidden'&&p.visible) return false; if(filter==='low'&&(p.quantity||0)>10) return false
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
        <Modal title={editing.id?'Edit Product':'New Product'} onClose={()=>setEditing(null)} wide
          footer={<><button className="btn-primary" onClick={save} disabled={saving||!editing.name?.trim()}>{saving?'Saving…':editing.id?'Save Changes':'Add Product'}</button><button className="btn-secondary" onClick={()=>setEditing(null)}>Cancel</button></>}>
          <ImgUpload value={editing.image||''} onChange={v=>setEditing({...editing,image:v})}/>
          <div style={{display:'grid',gap:0,borderTop:'1px solid #f0f0f0',paddingTop:14}}>
            <Field label="Product Name" value={editing.name} onChange={v=>setEditing({...editing,name:v})} placeholder="e.g. Rattan Side Table" required/>
            <Field label="Category" value={editing.category} onChange={v=>setEditing({...editing,category:v})} placeholder="e.g. Furniture"/>
            <TextArea label="Description" value={editing.description} onChange={v=>setEditing({...editing,description:v})} placeholder="Short description shown to customers" rows={2}/>
          </div>
          <div style={{border:'1px solid #f0f0f0',borderRadius:12,padding:'14px 16px',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#aaa',marginBottom:12}}>Pricing</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <NumField label="Selling Price (GH₵)" value={editing.price} onChange={v=>setEditing({...editing,price:v})} required/>
              <NumField label="Cost Price (GH₵)" value={editing.cost_price} onChange={v=>setEditing({...editing,cost_price:v})}/>
            </div>
            {editing.price>0&&editing.cost_price>0&&<div style={{fontSize:12,color:'#10b981',marginTop:4,fontWeight:600}}>Margin: {ghs(editing.price-editing.cost_price)} ({((editing.price-editing.cost_price)/editing.price*100).toFixed(0)}%)</div>}
          </div>
          <div style={{border:'1px solid #f0f0f0',borderRadius:12,padding:'14px 16px',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#aaa',marginBottom:12}}>Stock & Wholesale</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
              <NumField label="Opening Qty" value={editing.quantity} onChange={v=>setEditing({...editing,quantity:v})} step="1"/>
              <NumField label="Wholesale Price" value={editing.wholesale_price} onChange={v=>setEditing({...editing,wholesale_price:v})}/>
              <NumField label="Wholesale Min Qty" value={editing.wholesale_min_qty} onChange={v=>setEditing({...editing,wholesale_min_qty:v})} step="1"/>
            </div>
          </div>
          <Toggle on={editing.visible} onToggle={()=>setEditing({...editing,visible:!editing.visible})} label="Visible in Store" sub="Customers can see and buy this product"/>
        </Modal>
      )}
      <div className="page-header">
        <div><div className="page-title">Products</div><div className="page-sub">{products.length} products · {products.filter(p=>(p.quantity||0)<=10).length} low/out of stock</div></div>
        <button className="btn-primary" onClick={()=>setEditing(blank)}>+ Add Product</button>
      </div>
      <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
        <div className="search-box" style={{flex:1,minWidth:200}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…"/>
        </div>
        <div className="filter-tabs">
          {[['all','All'],['active','Active'],['hidden','Hidden'],['low','Low Stock']].map(([v,l])=>(
            <button key={v} className={`filter-tab${filter===v?' active':''}`} onClick={()=>setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>
      {loading?<Spinner/>:filtered.length===0?<Empty text="No products."/>:(
        <div className="panel" style={{overflow:'hidden'}}>
          <table className="data-table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Cost</th><th>Stock</th><th>Visibility</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p=>{
                const [slabel,scls]=stockStatus(p.quantity||0)
                return (
                  <tr key={p.id} style={{opacity:p.visible?1:.55}}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        {p.image?<img src={cdn(p.image,84)} className="inv-row-img" alt=""/>:<div className="inv-row-img" style={{display:'flex',alignItems:'center',justifyContent:'center',color:'#ddd',fontFamily:'var(--serif)',fontSize:18}}>E</div>}
                        <div><div style={{fontSize:13,fontWeight:700,color:'#0d1b3e'}}>{p.name}</div></div>
                      </div>
                    </td>
                    <td style={{color:'#888',fontSize:12}}>{p.category||'—'}</td>
                    <td><span style={{fontSize:14,fontWeight:800}}>{ghs(p.price)}</span></td>
                    <td style={{color:'#aaa',fontSize:12}}>{p.cost_price?ghs(p.cost_price):'—'}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span className="stock-num">{p.quantity||0}</span>
                        <span className={`stock-pill ${scls}`}>{slabel}</span>
                      </div>
                    </td>
                    <td><Badge status={p.visible?'Active':'Inactive'}/></td>
                    <td>
                      <div style={{display:'flex',gap:4,justifyContent:'flex-end'}}>
                        <button className="btn-secondary btn-sm" onClick={()=>setStockModal(p)}>± Stock</button>
                        <button className="btn-secondary btn-sm" onClick={()=>toggleVis(p.id,p.visible)}>{p.visible?'Hide':'Show'}</button>
                        <button className="btn-secondary btn-sm" onClick={()=>setEditing({...p})}>Edit</button>
                        <button className="btn-danger btn-sm" onClick={()=>del(p.id)}>Del</button>
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

/* ════════════════════
   PROMOS
════════════════════ */
function Promos() {
  const [promos,setPromos]=useState([]),[products,setProducts]=useState([]),[modal,setModal]=useState(false),[saving,setSaving]=useState(false),[loading,setLoading]=useState(true)
  const [form,setForm]=useState({product_id:'',price:'',end_date:'',label:''})
  useEffect(()=>{ load() },[])
  async function load() {
    setLoading(true)
    const[{data:pr},{data:p}]=await Promise.all([supabase.from('promos').select('*,products(name)').order('end_date',{ascending:false}),supabase.from('products').select('id,name').order('name')])
    setPromos(pr||[]); setProducts(p||[]); setLoading(false)
  }
  async function save() {
    if(!form.product_id||!form.price||!form.end_date) return; setSaving(true)
    await supabase.from('promos').insert({product_id:form.product_id,price:Number(form.price),end_date:new Date(form.end_date).toISOString(),label:form.label||'Sale'})
    setSaving(false); setModal(false); setForm({product_id:'',price:'',end_date:'',label:''}); load()
  }
  async function del(id) { if(!confirm('Remove promo?')) return; await supabase.from('promos').delete().eq('id',id); load() }
  const active=promos.filter(p=>new Date(p.end_date)>new Date()),expired=promos.filter(p=>new Date(p.end_date)<=new Date())
  return (
    <div>
      {modal&&(
        <Modal title="Add Promo / Sale Price" onClose={()=>setModal(false)} footer={<><button className="btn-primary" onClick={save} disabled={saving||!form.product_id||!form.price||!form.end_date}>{saving?'Saving…':'Save Promo'}</button><button className="btn-secondary" onClick={()=>setModal(false)}>Cancel</button></>}>
          <Select label="Product" value={form.product_id} onChange={v=>setForm({...form,product_id:v})} options={products.map(p=>({value:p.id,label:p.name}))} required/>
          <NumField label="Promo Price (GH₵)" value={form.price} onChange={v=>setForm({...form,price:v})} required/>
          <Field label="Label" value={form.label} onChange={v=>setForm({...form,label:v})} placeholder="e.g. Flash Sale, Bundle Deal"/>
          <div className="field"><label>End Date & Time</label><input type="datetime-local" className="field-input" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})}/></div>
        </Modal>
      )}
      <div className="page-header">
        <div><div className="page-title">Promos & Bundles</div><div className="page-sub">{active.length} active · {expired.length} expired</div></div>
        <button className="btn-primary" onClick={()=>setModal(true)}>+ Add Promo</button>
      </div>
      {loading?<Spinner/>:<>
        {active.length>0&&<><div style={{fontSize:11,fontWeight:700,color:'#10b981',marginBottom:8,textTransform:'uppercase',letterSpacing:'.06em'}}>Active Promos</div>
        <div className="panel" style={{marginBottom:16,overflow:'hidden'}}>
          {active.map(p=>(
            <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
              <div><div style={{fontSize:14,fontWeight:700}}>{p.products?.name||'Product'}</div><div style={{fontSize:12,color:'#888'}}>{p.label||'Sale'} · Price: {ghs(p.price)} · Ends {fmtDate(p.end_date)}</div></div>
              <div style={{display:'flex',alignItems:'center',gap:8}}><Badge status="Active"/><button className="btn-danger btn-sm" onClick={()=>del(p.id)}>Remove</button></div>
            </div>
          ))}
        </div></>}
        {expired.length>0&&<><div style={{fontSize:11,fontWeight:700,color:'#aaa',margin:'16px 0 8px',textTransform:'uppercase',letterSpacing:'.06em'}}>Expired</div>
        <div className="panel" style={{overflow:'hidden',opacity:.65}}>
          {expired.slice(0,5).map(p=>(
            <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 20px',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
              <div><div style={{fontSize:13,fontWeight:500}}>{p.products?.name||'Product'}</div><div style={{fontSize:11,color:'#aaa'}}>Was {ghs(p.price)} · Ended {fmtDate(p.end_date)}</div></div>
              <button className="btn-secondary btn-sm" onClick={()=>del(p.id)}>Remove</button>
            </div>
          ))}
        </div></>}
        {active.length===0&&expired.length===0&&<Empty text="No promos set up."/>}
      </>}
    </div>
  )
}

/* ════════════════════
   RESTOCK
════════════════════ */
function Restock() {
  const [entries,setEntries]=useState([]),[products,setProducts]=useState([]),[modal,setModal]=useState(false),[saving,setSaving]=useState(false),[loading,setLoading]=useState(true)
  const [form,setForm]=useState({product_id:'',qty:'',cost_per_unit:'',supplier:'',notes:''})
  useEffect(()=>{ load() },[])
  async function load() {
    setLoading(true)
    const[{data:e},{data:p}]=await Promise.all([supabase.from('stock_adjustments').select('*,products(name)').eq('type','restock').order('created_at',{ascending:false}).limit(100),supabase.from('products').select('id,name,quantity').order('name')])
    setEntries(e||[]); setProducts(p||[]); setLoading(false)
  }
  async function save() {
    if(!form.product_id||!form.qty) return; setSaving(true)
    const qty=Number(form.qty),prod=products.find(p=>p.id===form.product_id),before=prod?.quantity||0
    await supabase.from('stock_adjustments').insert({product_id:form.product_id,type:'restock',qty_before:before,qty_change:qty,qty_after:before+qty,cost_per_unit:Number(form.cost_per_unit)||null,supplier:form.supplier,notes:form.notes,created_at:new Date().toISOString()})
    await supabase.from('products').update({quantity:before+qty}).eq('id',form.product_id)
    setSaving(false); setModal(false); setForm({product_id:'',qty:'',cost_per_unit:'',supplier:'',notes:''}); load()
  }
  return (
    <div>
      {modal&&(
        <Modal title="Record Restock" onClose={()=>setModal(false)} footer={<><button className="btn-primary" onClick={save} disabled={saving||!form.product_id||!form.qty}>{saving?'Saving…':'Record Restock'}</button><button className="btn-secondary" onClick={()=>setModal(false)}>Cancel</button></>}>
          <Select label="Product" value={form.product_id} onChange={v=>setForm({...form,product_id:v})} options={products.map(p=>({value:p.id,label:`${p.name} (stock: ${p.quantity||0})`}))} required/>
          <NumField label="Quantity Received" value={form.qty} onChange={v=>setForm({...form,qty:v})} step="1" required/>
          <NumField label="Cost per Unit (GH₵)" value={form.cost_per_unit} onChange={v=>setForm({...form,cost_per_unit:v})}/>
          <Field label="Supplier" value={form.supplier} onChange={v=>setForm({...form,supplier:v})} placeholder="Supplier name"/>
          <TextArea label="Notes" value={form.notes} onChange={v=>setForm({...form,notes:v})} placeholder="Notes about this delivery" rows={2}/>
        </Modal>
      )}
      <div className="page-header">
        <div><div className="page-title">Restock</div><div className="page-sub">Record incoming stock deliveries</div></div>
        <button className="btn-primary" onClick={()=>setModal(true)}>+ Record Restock</button>
      </div>
      {loading?<Spinner/>:entries.length===0?<Empty text="No restock records."/>:(
        <div className="panel" style={{overflow:'hidden'}}>
          {entries.map(e=>(
            <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'14px 20px',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
              <div>
                <div style={{fontSize:14,fontWeight:700}}>{e.products?.name||'Product'}</div>
                <div style={{fontSize:13,color:'#10b981',fontWeight:700}}>+{e.qty_change} units <span style={{color:'#aaa',fontWeight:400,fontSize:11}}>({e.qty_before} → {e.qty_after})</span></div>
                {e.supplier&&<div style={{fontSize:11,color:'#888'}}>From: {e.supplier}</div>}
                {e.cost_per_unit&&<div style={{fontSize:11,color:'#888'}}>Cost: {ghs(e.cost_per_unit)} ea. · Total: {ghs(e.cost_per_unit*e.qty_change)}</div>}
                {e.notes&&<div style={{fontSize:11,color:'#aaa'}}>{e.notes}</div>}
              </div>
              <div style={{fontSize:11,color:'#aaa',textAlign:'right',flexShrink:0}}>{fmtDate(e.created_at)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ════════════════════
   STOCK ADJUST
════════════════════ */
function StockAdjustInline({product,onDone}) {
  const [mode,setMode]=useState('set'),[qty,setQty]=useState(''),[note,setNote]=useState(''),[saving,setSaving]=useState(false)
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
      <p style={{fontSize:13,color:'#888',marginBottom:12,fontWeight:500}}>{product.name}</p>
      <div style={{display:'flex',justifyContent:'space-between',padding:'12px 16px',background:'#f4f6fb',borderRadius:12,marginBottom:14}}>
        <span style={{fontSize:12,color:'#888',fontWeight:600}}>Current stock</span>
        <span style={{fontSize:18,fontWeight:800,color:(product.quantity||0)<=3?'#ef4444':(product.quantity||0)<=10?'#f59e0b':'#10b981'}}>{product.quantity||0} units</span>
      </div>
      <div style={{display:'flex',gap:4,marginBottom:14,background:'#f4f6fb',padding:4,borderRadius:10}}>
        {[['set','Set to'],['add','Add'],['remove','Remove']].map(([v,l])=>(
          <button key={v} onClick={()=>setMode(v)} style={{flex:1,padding:'8px 0',background:mode===v?'#fff':'transparent',border:'none',cursor:'pointer',fontSize:12,fontWeight:mode===v?700:400,color:mode===v?'#0d1b3e':'#888',transition:'all .15s',borderRadius:8,fontFamily:'var(--sans)'}}>
            {l}
          </button>
        ))}
      </div>
      <div className="field">
        <label>{mode==='set'?'New quantity':mode==='add'?'Units to add':'Units to remove'}</label>
        <input type="number" min="0" className="field-input" value={qty} onChange={e=>setQty(e.target.value)} autoFocus style={{fontSize:24,fontWeight:800,textAlign:'center',height:56}}/>
      </div>
      {qty!==''&&<div style={{fontSize:13,color:'#10b981',fontWeight:700,background:'#dcfce7',padding:'10px 14px',borderRadius:10,marginBottom:12}}>New stock will be <strong>{preview()}</strong> units</div>}
      <div className="field"><label>Reason (optional)</label><input className="field-input" value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Manual correction, damaged items"/></div>
      <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'13px 0',fontSize:14,borderRadius:12}} disabled={!qty||saving} onClick={apply}>{saving?'Saving…':'Update Stock'}</button>
    </div>
  )
}

function StockAdjust() {
  const [products,setProducts]=useState([]),[history,setHistory]=useState([]),[selected,setSelected]=useState(null),[loading,setLoading]=useState(true),[search,setSearch]=useState('')
  useEffect(()=>{ load() },[])
  async function load() {
    setLoading(true)
    const[{data:p},{data:h}]=await Promise.all([supabase.from('products').select('id,name,quantity,category').order('name'),supabase.from('stock_adjustments').select('*,products(name)').order('created_at',{ascending:false}).limit(50)])
    setProducts(p||[]); setHistory(h||[]); setLoading(false)
  }
  const shown=search?products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())):products
  return (
    <div>
      {selected&&<Modal title="Adjust Stock" onClose={()=>{setSelected(null);load()}}><StockAdjustInline product={selected} onDone={q=>{setSelected(null);setProducts(ps=>ps.map(p=>p.id===selected.id?{...p,quantity:q}:p));load()}}/></Modal>}
      <div className="page-header">
        <div><div className="page-title">Stock & Adjust</div><div className="page-sub">View and correct stock levels</div></div>
      </div>
      <div className="search-box" style={{maxWidth:360,marginBottom:14}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…"/></div>
      {loading?<Spinner/>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:12,marginBottom:24}}>
          {shown.map(p=>{
            const q=p.quantity||0,clr=q===0?'#ef4444':q<=3?'#ef4444':q<=10?'#f59e0b':'#10b981'
            return (
              <div key={p.id} className="panel" style={{padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}} onClick={()=>setSelected(p)}>
                <div><div style={{fontSize:13,fontWeight:700}}>{p.name}</div><div style={{fontSize:11,color:'#aaa'}}>{p.category}</div></div>
                <div style={{textAlign:'right'}}><div style={{fontSize:24,fontWeight:900,color:clr}}>{q}</div><button className="btn-primary btn-sm" style={{marginTop:4}}>Adjust</button></div>
              </div>
            )
          })}
        </div>
      )}
      {history.length>0&&<>
        <div style={{fontSize:12,fontWeight:700,marginBottom:10,color:'#555',textTransform:'uppercase',letterSpacing:'.05em'}}>Recent Adjustments</div>
        <div className="panel" style={{overflow:'hidden'}}>
          {history.map(h=>(
            <div key={h.id} style={{display:'flex',justifyContent:'space-between',padding:'11px 20px',borderBottom:'1px solid rgba(0,0,0,.04)',fontSize:13}}>
              <div><span style={{fontWeight:700}}>{h.products?.name}</span> <span style={{color:h.qty_change>0?'#10b981':'#ef4444',fontWeight:700}}>{h.qty_change>0?'+':''}{h.qty_change}</span> <span style={{color:'#aaa',fontSize:11}}>({h.qty_before}→{h.qty_after}) [{h.type}]</span>{h.notes&&<span style={{color:'#bbb',fontSize:11}}> · {h.notes}</span>}</div>
              <span style={{color:'#aaa',fontSize:11,flexShrink:0}}>{fmtDate(h.created_at)}</span>
            </div>
          ))}
        </div>
      </>}
    </div>
  )
}

/* ════════════════════
   CUSTOMERS
════════════════════ */
function Customers() {
  const [customers,setCustomers]=useState([]),[loading,setLoading]=useState(true),[search,setSearch]=useState(''),[detail,setDetail]=useState(null)
  useEffect(()=>{ load() },[])
  async function load() { setLoading(true); const{data}=await supabase.from('customers').select('*').order('last_purchase',{ascending:false}).limit(300); setCustomers(data||[]); setLoading(false) }
  const shown=customers.filter(c=>!search||c.name?.toLowerCase().includes(search.toLowerCase())||c.phone?.includes(search))
  return (
    <div>
      {detail&&<Modal title="Customer" onClose={()=>setDetail(null)} footer={<button className="btn-secondary" onClick={()=>setDetail(null)}>Close</button>}>
        {[['Name',detail.name||'—'],['Phone',detail.phone],['Total Spent',ghs(detail.total_spent||0)],['Purchases',detail.purchase_count||0],['Last Purchase',fmtDate(detail.last_purchase)],['Joined',fmtDate(detail.created_at)]].map(([k,v])=>(
          <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f5f5f5',fontSize:13}}><span style={{color:'#777'}}>{k}</span><span style={{fontWeight:700}}>{v}</span></div>
        ))}
      </Modal>}
      <div className="page-header">
        <div><div className="page-title">Customers</div><div className="page-sub">{customers.length} registered</div></div>
      </div>
      <div className="search-box" style={{maxWidth:360,marginBottom:14}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or phone…"/></div>
      {loading?<Spinner/>:shown.length===0?<Empty text="No customers."/>:(
        <div className="panel" style={{overflow:'hidden'}}>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Purchases</th><th>Total Spent</th><th>Last Purchase</th><th></th></tr></thead>
            <tbody>{shown.map(c=>(
              <tr key={c.id}>
                <td><span style={{fontWeight:700}}>{c.name||<span style={{color:'#ccc'}}>—</span>}</span></td>
                <td style={{fontFamily:'monospace',fontSize:12}}>{c.phone}</td>
                <td><span style={{fontWeight:700}}>{c.purchase_count||0}</span></td>
                <td><span style={{fontWeight:800,color:'#0d1b3e'}}>{ghs(c.total_spent||0)}</span></td>
                <td style={{color:'#aaa',fontSize:11}}>{fmtDate(c.last_purchase)}</td>
                <td><button className="btn-secondary btn-sm" onClick={()=>setDetail(c)}>View</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ════════════════════
   EXPENSES
════════════════════ */
function Expenses() {
  const [expenses,setExpenses]=useState([]),[editing,setEditing]=useState(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[catFilter,setCatFilter]=useState('all')
  useEffect(()=>{ load() },[])
  async function load() { setLoading(true); const{data}=await supabase.from('expenses').select('*').order('date',{ascending:false}).limit(300); setExpenses(data||[]); setLoading(false) }
  async function save() {
    if(!editing?.description?.trim()||!editing?.amount) return; setSaving(true)
    const{id,...data}=editing; id?await supabase.from('expenses').update(data).eq('id',id):await supabase.from('expenses').insert({...data,date:editing.date||new Date().toISOString()})
    setSaving(false); setEditing(null); load()
  }
  async function del(id) { if(!confirm('Delete?')) return; await supabase.from('expenses').delete().eq('id',id); load() }
  const cats=['all',...new Set(expenses.map(e=>e.category).filter(Boolean))]
  const shown=catFilter==='all'?expenses:expenses.filter(e=>e.category===catFilter)
  const total=expenses.reduce((a,e)=>a+Number(e.amount||0),0)
  const monthTotal=expenses.filter(e=>e.date?.startsWith(today().slice(0,7))).reduce((a,e)=>a+Number(e.amount||0),0)
  return (
    <div>
      {editing&&<Modal title={editing.id?'Edit Expense':'New Expense'} onClose={()=>setEditing(null)} footer={<><button className="btn-primary" onClick={save} disabled={saving}>{saving?'Saving…':'Save'}</button><button className="btn-secondary" onClick={()=>setEditing(null)}>Cancel</button></>}>
        <Field label="Description" value={editing.description} onChange={v=>setEditing({...editing,description:v})} placeholder="e.g. Monthly rent" required/>
        <NumField label="Amount (GH₵)" value={editing.amount} onChange={v=>setEditing({...editing,amount:v})} required/>
        <Field label="Category" value={editing.category} onChange={v=>setEditing({...editing,category:v})} placeholder="e.g. Rent, Logistics"/>
        <Field label="Notes" value={editing.notes} onChange={v=>setEditing({...editing,notes:v})} placeholder="Additional notes"/>
        <div className="field"><label>Date</label><input type="date" className="field-input" value={editing.date?.slice(0,10)||today()} onChange={e=>setEditing({...editing,date:e.target.value})}/></div>
      </Modal>}
      <div className="page-header">
        <div><div className="page-title">Expenses</div><div className="page-sub">This month: <strong style={{color:'#ef4444'}}>{ghs(monthTotal)}</strong> · All time: {ghs(total)}</div></div>
        <button className="btn-primary" onClick={()=>setEditing({description:'',amount:'',category:'',notes:'',date:today()})}>+ Add Expense</button>
      </div>
      <div className="filter-tabs" style={{marginBottom:14}}>
        {cats.map(c=><button key={c} className={`filter-tab${catFilter===c?' active':''}`} onClick={()=>setCatFilter(c)}>{c==='all'?'All Categories':c}</button>)}
      </div>
      {loading?<Spinner/>:shown.length===0?<Empty text="No expenses."/>:(
        <div className="panel" style={{overflow:'hidden'}}>
          {shown.map(e=>(
            <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
              <div><div style={{fontSize:14,fontWeight:700}}>{e.description}</div><div style={{fontSize:11,color:'#aaa'}}>{e.category&&`${e.category} · `}{fmtDate(e.date)}{e.notes&&` · ${e.notes}`}</div></div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:17,fontWeight:800,color:'#ef4444'}}>{ghs(e.amount)}</span>
                <button className="btn-secondary btn-sm" onClick={()=>setEditing({...e})}>Edit</button>
                <button className="btn-danger btn-sm" onClick={()=>del(e.id)}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ════════════════════
   REPORTS
════════════════════ */
function Reports() {
  const [data,setData]=useState(null),[period,setPeriod]=useState('month'),[loading,setLoading]=useState(true)
  useEffect(()=>{ load() },[period])
  async function load() {
    setLoading(true)
    const now=new Date(),t=today()
    const from=period==='today'?t:period==='week'?new Date(now.setDate(now.getDate()-7)).toISOString().slice(0,10):period==='month'?t.slice(0,7)+'-01':t.slice(0,4)+'-01-01'
    const[{data:sales},{data:expenses},{data:orders}]=await Promise.all([
      supabase.from('sales').select('total,profit,payment,date').eq('voided',false).gte('date',from),
      supabase.from('expenses').select('amount,category,date').gte('date',from),
      supabase.from('whatsapp_orders').select('total,status,date').gte('date',from),
    ])
    const s=sales||[],e=expenses||[],o=orders||[]
    const rev=s.reduce((a,x)=>a+Number(x.total||0),0),profit=s.reduce((a,x)=>a+Number(x.profit||0),0),exp=e.reduce((a,x)=>a+Number(x.amount||0),0)
    const byPay=s.reduce((a,x)=>{ a[x.payment]=(a[x.payment]||0)+Number(x.total||0); return a },{})
    const byCat=e.reduce((a,x)=>{ a[x.category||'Other']=(a[x.category||'Other']||0)+Number(x.amount||0); return a },{})
    const onlineRev=o.filter(x=>['Paid','Completed'].includes(x.status)).reduce((a,x)=>a+Number(x.total||0),0)
    setData({revenue:rev,profit,expenses:exp,net:profit-exp,sales:s.length,orders:o.length,onlineRev,byPay,byCat}); setLoading(false)
  }
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Reports</div><div className="page-sub">Business performance overview</div></div>
        <div className="filter-tabs">
          {[['today','Today'],['week','Week'],['month','Month'],['year','Year']].map(([v,l])=>(
            <button key={v} className={`filter-tab${period===v?' active':''}`} onClick={()=>setPeriod(v)}>{l}</button>
          ))}
        </div>
      </div>
      {loading?<Spinner/>:!data?null:<>
        <div className="stat-grid">
          <StatCard label="POS Revenue" value={ghs(data.revenue)} sub={`${data.sales} sales`}/>
          <StatCard label="Online Revenue" value={ghs(data.onlineRev)} sub={`${data.orders} orders`} variant="blue"/>
          <StatCard label="Gross Profit" value={ghs(data.profit)} sub="Before expenses" variant="green"/>
          <StatCard label="Expenses" value={ghs(data.expenses)} sub="Recorded" variant="red"/>
          <StatCard label="Net Profit" value={ghs(data.net)} sub="After expenses" variant={data.net>=0?'green':'red'}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16}}>
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Revenue by Payment Method</span></div>
            <div className="panel-body">
              {Object.entries(data.byPay).sort((a,b)=>b[1]-a[1]).map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f5f5f5'}}>
                  <span style={{fontSize:13,color:'#555',fontWeight:600}}>{k}</span>
                  <span style={{fontSize:14,fontWeight:800,color:'#0d1b3e'}}>{ghs(v)}</span>
                </div>
              ))}
              {Object.keys(data.byPay).length===0&&<p style={{color:'#aaa',fontSize:13}}>No sales in this period.</p>}
            </div>
          </div>
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Expenses by Category</span></div>
            <div className="panel-body">
              {Object.entries(data.byCat).sort((a,b)=>b[1]-a[1]).map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f5f5f5'}}>
                  <span style={{fontSize:13,color:'#555',fontWeight:600}}>{k}</span>
                  <span style={{fontSize:14,fontWeight:800,color:'#ef4444'}}>{ghs(v)}</span>
                </div>
              ))}
              {Object.keys(data.byCat).length===0&&<p style={{color:'#aaa',fontSize:13}}>No expenses in this period.</p>}
            </div>
          </div>
        </div>
      </>}
    </div>
  )
}

/* ════════════════════
   STAFF
════════════════════ */
function Staff() {
  const [staff,setStaff]=useState([]),[modal,setModal]=useState(false),[saving,setSaving]=useState(false),[loading,setLoading]=useState(true)
  const [form,setForm]=useState({name:'',role:'',phone:'',pin:'',active:true})
  useEffect(()=>{ load() },[])
  async function load() { setLoading(true); const{data}=await supabase.from('staff').select('*').order('name'); setStaff(data||[]); setLoading(false) }
  async function save() {
    if(!form.name.trim()) return; setSaving(true)
    const{id,...data}=form; id?await supabase.from('staff').update(data).eq('id',id):await supabase.from('staff').insert({...data,created_at:new Date().toISOString()})
    setSaving(false); setModal(false); setForm({name:'',role:'',phone:'',pin:'',active:true}); load()
  }
  return (
    <div>
      {modal&&<Modal title={form.id?'Edit Staff':'Add Staff Member'} onClose={()=>setModal(false)} footer={<><button className="btn-primary" onClick={save} disabled={saving||!form.name.trim()}>{saving?'Saving…':'Save'}</button><button className="btn-secondary" onClick={()=>setModal(false)}>Cancel</button></>}>
        <Field label="Full Name" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="e.g. Ama Mensah" required/>
        <Select label="Role" value={form.role} onChange={v=>setForm({...form,role:v})} options={['Manager','Cashier','Sales Rep','Delivery','Other']}/>
        <Field label="Phone" value={form.phone} onChange={v=>setForm({...form,phone:v})} placeholder="0XX XXX XXXX"/>
        <Field label="POS PIN" value={form.pin} onChange={v=>setForm({...form,pin:v})} placeholder="4-digit PIN" type="password"/>
        <Toggle on={form.active} onToggle={()=>setForm({...form,active:!form.active})} label="Active" sub="Staff member can access the system"/>
      </Modal>}
      <div className="page-header">
        <div><div className="page-title">Staff</div><div className="page-sub">{staff.filter(s=>s.active).length} active members</div></div>
        <button className="btn-primary" onClick={()=>{setForm({name:'',role:'',phone:'',pin:'',active:true});setModal(true)}}>+ Add Staff</button>
      </div>
      {loading?<Spinner/>:staff.length===0?<Empty text="No staff members."/>:(
        <div className="panel" style={{overflow:'hidden'}}>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Status</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
            <tbody>{staff.map(m=>(
              <tr key={m.id}>
                <td><span style={{fontWeight:700}}>{m.name}</span></td>
                <td style={{color:'#888',fontSize:12}}>{m.role||'—'}</td>
                <td style={{fontSize:12}}>{m.phone||'—'}</td>
                <td><Badge status={m.active?'Active':'Inactive'}/></td>
                <td><div style={{display:'flex',gap:4,justifyContent:'flex-end'}}>
                  <button className="btn-secondary btn-sm" onClick={()=>{setForm({...m});setModal(true)}}>Edit</button>
                  <button className="btn-secondary btn-sm" onClick={async()=>{ await supabase.from('staff').update({active:!m.active}).eq('id',m.id); load() }}>{m.active?'Deactivate':'Activate'}</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
