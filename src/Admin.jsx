import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import './admin.css'

/* ─── ICONS (stroke line set, consistent weight) ─── */
const I = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  pos: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M2 9h20M8 21h8M12 17v4"/></svg>,
  invoice: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 3h11l3 3v15a0 0 0 01 0 0H5a0 0 0 01 0 0V3z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>,
  receipt: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 3v18l2-1.5L9 21l2-1.5L13 21l2-1.5L17 21l2-1.5V3l-2 1.5L15 3l-2 1.5L11 3 9 4.5 7 3 5 4.5z"/><path d="M8 9h8M8 13h6"/></svg>,
  refund: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7v6h6"/><path d="M3 13a9 9 0 103-7.7L3 8"/></svg>,
  box: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>,
  tag: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 13l-7 7-9-9V4h7l9 9z"/><circle cx="7.5" cy="7.5" r="1.2"/></svg>,
  inbox: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12h5l2 3h4l2-3h5"/><path d="M5 5h14l2 7v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6l2-7z"/></svg>,
  adjust: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 5a3 3 0 010 6M22 20c0-2.5-1.5-4.2-4-4.7"/></svg>,
  expense: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5c0-1 1-1.7 2.5-1.7s2.5.7 2.5 1.7-1 1.5-2.5 1.7-2.5.7-2.5 1.8 1 1.7 2.5 1.7 2.5-.7 2.5-1.7"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3v18h18"/><path d="M7 14l3-4 3 3 5-7"/></svg>,
  staff: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="3.5"/><path d="M5 21c0-4 3-6 7-6s7 2 7 6"/></svg>,
  store: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 9l1-5h14l1 5M4 9v11h16V9M4 9h16M9 20v-6h6v6"/></svg>,
  out: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  cart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.5 13h11l2-9H6"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12a9 9 0 11-2.6-6.4M21 4v4h-4"/></svg>,
  print: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9V3h12v6M6 18H4a1 1 0 01-1-1v-5a2 2 0 012-2h14a2 2 0 012 2v5a1 1 0 01-1 1h-2M6 14h12v7H6z"/></svg>,
  x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  coins: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><ellipse cx="9" cy="6" rx="6" ry="3"/><path d="M3 6v6c0 1.7 2.7 3 6 3s6-1.3 6-3V6"/><path d="M15 12c0 1.7 2.7 3 6 3M15 12v6c0 1.7 2.7 3 6 3s6-1.3 6-3"/></svg>,
  trend: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 17l6-6 4 4 8-8M21 7v5h-5"/></svg>,
  star: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9z"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5"/></svg>,
  doc: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5"/></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M3 12h18M3 18h18"/></svg>,
  chev: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18l6-6-6-6"/></svg>,
}

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
    <label>{label}{required && <span style={{color:'var(--bad)'}}> *</span>}</label>
    <input type={type} className="field-input" value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''}/>
  </div>
)
const NumField = ({label,value,onChange,step='0.01',required}) => (
  <div className="field">
    <label>{label}{required && <span style={{color:'var(--bad)'}}> *</span>}</label>
    <input type="number" step={step} min="0" className="field-input" value={value||''} onChange={e=>onChange(Number(e.target.value))}/>
  </div>
)
const Select = ({label,value,onChange,options,required}) => (
  <div className="field">
    <label>{label}{required && <span style={{color:'var(--bad)'}}> *</span>}</label>
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
  const map = {Paid:'good',Completed:'good','In Stock':'good',Active:'good',Low:'warn','Low Stock':'warn',Pending:'warn',Critical:'bad','Out of Stock':'bad',Cancelled:'bad',Inactive:'dim',Refunded:'good',Voided:'bad'}
  return <span className={`badge b-${map[status]||'dim'}`}>{status}</span>
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
    <div className="ovl" onClick={e=>e.target.classList.contains('ovl')&&onClose()}>
      <div className="modal" style={{maxWidth:wide?680:480}}>
        <div className="modal-head">
          <span className="modal-title">{title}</span>
          <button className="modal-x" onClick={onClose}>{I.x}</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
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
        <div style={{position:'relative',height:130,background:'var(--line-2)',marginBottom:8,overflow:'hidden',borderRadius:12}}>
          <img src={cdn(value,400)} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          <div style={{position:'absolute',inset:0,background:'rgba(13,27,62,.5)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:0,transition:'opacity .15s'}}
            onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0}>
            <button type="button" className="btn btn-brass btn-sm" onClick={()=>ref.current?.click()}>Change</button>
            <button type="button" className="btn btn-line btn-sm" style={{color:'#fff',borderColor:'rgba(255,255,255,.3)',background:'transparent'}} onClick={()=>onChange('')}>Remove</button>
          </div>
        </div>
      )}
      {!value&&(
        <div onClick={()=>!busy&&ref.current?.click()}
          onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);handle(e.dataTransfer.files[0])}}
          style={{height:90,border:`2px dashed ${drag?'var(--ink)':'var(--line)'}`,background:drag?'var(--line-2)':'var(--bg)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',borderRadius:12,marginBottom:8,transition:'all .15s'}}>
          {busy
            ? <div style={{textAlign:'center'}}><div style={{fontSize:12,color:'var(--ink-2)',marginBottom:6}}>Uploading {prog}%</div><div style={{width:120,height:3,background:'var(--line)',borderRadius:2}}><div style={{height:'100%',background:'var(--ink)',width:`${prog}%`,transition:'width .2s',borderRadius:2}}/></div></div>
            : <><div style={{fontSize:13,color:'var(--ink-2)',fontWeight:500}}>Drop image or click to upload</div><div style={{fontSize:11,color:'var(--ink-3)',marginTop:3}}>JPG / PNG / WebP · max 10 MB</div></>
          }
        </div>
      )}
      {value&&!busy&&<button type="button" style={{background:'none',border:'none',cursor:'pointer',fontSize:11,color:'var(--ink-3)',marginBottom:6}} onClick={()=>ref.current?.click()}>↑ Upload different image</button>}
      <input className="field-input" value={value||''} onChange={e=>onChange(e.target.value)} placeholder="Or paste Cloudinary URL…" style={{height:34,fontSize:12}}/>
      {err&&<p style={{fontSize:11,color:'var(--bad)',marginTop:4}}>{err}</p>}
      <input ref={ref} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(f)handle(f);e.target.value=''}}/>
    </div>
  )
}

/* ── Metric → renders as a white sub-card ── */
const Metric = ({label,value,sub}) => (
  <div className="subcard">
    <div className="subcard-label">{label}</div>
    <div className="subcard-val">{value}</div>
    {sub&&<div style={{fontSize:11,color:'var(--ink-3)',marginTop:6}}>{sub}</div>}
  </div>
)
const MetricStrip = ({cols,children}) => (
  <div className="subcards" style={{gridTemplateColumns:`repeat(${cols},1fr)`,marginBottom:18}}>{children}</div>
)

const Spinner = () => <div className="spin">Loading…</div>
const Empty = ({text='No data.'}) => <div className="empty">{I.doc}<div>{text}</div></div>

/* ════════════════════
   NAV CONFIG
════════════════════ */
const NAV_SECTIONS = [
  { label:'Sales', items:[
    {id:'dashboard',label:'Dashboard',icon:I.dashboard},
    {id:'pos',label:'Point of Sale',icon:I.pos},
    {id:'invoices',label:'Invoices',icon:I.invoice},
    {id:'receipts',label:'Receipts',icon:I.receipt},
    {id:'refunds',label:'Refunds',icon:I.refund},
  ]},
  { label:'Inventory', items:[
    {id:'products',label:'Products',icon:I.box},
    {id:'promos',label:'Promos & Bundles',icon:I.tag},
    {id:'restock',label:'Restock',icon:I.inbox},
    {id:'stock',label:'Stock & Adjust',icon:I.adjust},
  ]},
  { label:'Business', items:[
    {id:'customers',label:'Customers',icon:I.users},
    {id:'expenses',label:'Expenses',icon:I.expense},
    {id:'reports',label:'Reports',icon:I.chart},
    {id:'staff',label:'Staff',icon:I.staff},
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
    <div className="auth-wrap">
      <div className="auth-card">
        <div style={{textAlign:'center',marginBottom:26}}>
          <div className="auth-mark">E</div>
          <div style={{fontFamily:'var(--serif)',fontSize:22,color:'var(--ink)'}}>Esterea Home</div>
          <div style={{fontSize:10,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--ink-3)',marginTop:5}}>Admin Access</div>
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" className="field-input" value={pass} onChange={e=>{setPass(e.target.value);setErr(false)}} onKeyDown={e=>e.key==='Enter'&&login()} placeholder="Enter password" autoFocus style={{borderColor:err?'var(--bad)':undefined}}/>
          {err&&<div style={{fontSize:11,color:'var(--bad)',marginTop:6}}>Incorrect password</div>}
        </div>
        <button className="btn btn-brass" style={{width:'100%',justifyContent:'center',padding:'12px 0',fontSize:13,marginTop:4}} onClick={login}>Sign in</button>
      </div>
    </div>
  )

  const flatNav = NAV_SECTIONS.flatMap(s=>s.items)

  return (
    <div className="admin-root">
      {/* ICON RAIL */}
      <div className="rail">
        <div className="rail-logo" onClick={()=>setSideOpen(true)}>E</div>
        <div className="rail-icons">
          {flatNav.map(item=>(
            <button key={item.id} className={`rail-btn${tab===item.id?' active':''}`} onClick={()=>setTab(item.id)} title={item.label}>
              {item.icon}
              {item.id==='invoices'&&<span className="rail-dot"/>}
            </button>
          ))}
        </div>
        <div className="rail-foot">
          <button className="rail-btn" onClick={()=>setSideOpen(true)} title="Menu">{I.menu}</button>
          <div className="rail-avatar">A</div>
          <button className="rail-btn" onClick={logout} title="Sign out">{I.out}</button>
        </div>
      </div>

      {/* EXPANDED DRAWER */}
      {sideOpen&&<>
        <div className="drawer-scrim" onClick={()=>setSideOpen(false)}/>
        <div className="drawer">
          <div className="drawer-head">
            <div className="drawer-logo">E</div>
            <div className="drawer-brand">Esterea Home</div>
          </div>
          <nav className="drawer-nav">
            {NAV_SECTIONS.map(section=>(
              <div key={section.label}>
                <div className="drawer-sec">{section.label}</div>
                {section.items.map(item=>(
                  <button key={item.id} className={`drawer-item${tab===item.id?' active':''}`} onClick={()=>{setTab(item.id);setSideOpen(false)}}>
                    {item.icon}{item.label}
                    {item.id==='invoices'&&<span className="drawer-badge">!</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="drawer-foot">
            <a href="/" target="_blank" rel="noreferrer" className="drawer-foot-btn" style={{textDecoration:'none'}}>{I.store} View Store</a>
            <div className="drawer-foot-btn acct"><div style={{width:24,height:24,borderRadius:6,background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700}}>A</div> Admin</div>
            <button className="drawer-foot-btn" onClick={logout}>{I.out} Sign out</button>
          </div>
        </div>
      </>}

      {/* MAIN */}
      <div className="main">
        <div className="content fade" key={tab}>
          {tab==='dashboard' && <Dashboard onNav={setTab}/>}
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
function Dashboard({onNav}) {
  const [d,setD]=useState(null)
  useEffect(()=>{ load() },[])
  async function load() {
    const t=today(), now=new Date()
    const weekAgo=new Date(now); weekAgo.setDate(now.getDate()-6); const weekStart=weekAgo.toISOString().slice(0,10)
    const monthStart=t.slice(0,7)
    const [{count:pCount},{data:prods},{data:sales},{data:expenses}] = await Promise.all([
      supabase.from('products').select('*',{count:'exact',head:true}),
      supabase.from('products').select('name,quantity,price,cost_price,category,image'),
      supabase.from('sales').select('total,profit,payment,date,items,receipt_no,customer_name').eq('voided',false).order('date',{ascending:false}),
      supabase.from('expenses').select('amount,date'),
    ])
    const s=sales||[], e=expenses||[], pr=prods||[]
    const inDay=x=>x.date?.startsWith(t)
    const inWeek=x=>x.date>=weekStart
    const inMonth=x=>x.date?.startsWith(monthStart)
    const sum=(arr,k='total')=>arr.reduce((a,x)=>a+Number(x[k]||0),0)
    const todaySales=s.filter(inDay), weekSales=s.filter(inWeek), monthSales=s.filter(inMonth)
    const todayProfit=sum(todaySales,'profit')
    const monthExp=sum(e.filter(inMonth),'amount')
    // 7-day chart
    const days=[]
    for(let i=6;i>=0;i--){ const dd=new Date(now); dd.setDate(now.getDate()-i); const key=dd.toISOString().slice(0,10); days.push({key,label:dd.toLocaleDateString('en-GH',{weekday:'short'}),val:sum(s.filter(x=>x.date?.startsWith(key)),'total'),today:i===0}) }
    // payment split this month
    const pays={Cash:0,MoMo:0,Paystack:0,Split:0}
    monthSales.forEach(x=>{ const p=x.payment||'Cash'; pays[p]=(pays[p]||0)+Number(x.total||0) })
    const payTotal=Object.values(pays).reduce((a,b)=>a+b,0)||1
    // stock value & out of stock
    const stockVal=pr.reduce((a,x)=>a+Number(x.cost_price||x.price||0)*Number(x.quantity||0),0)
    const outCount=pr.filter(x=>(x.quantity||0)===0).length
    const lowStock=pr.filter(x=>(x.quantity||0)<=10).sort((a,b)=>(a.quantity||0)-(b.quantity||0)).slice(0,6)
    const lowCount=pr.filter(x=>(x.quantity||0)<=10).length
    const monthRev=sum(monthSales)
    const profitMargin=monthRev>0?(sum(monthSales,'profit')/monthRev*100):0
    setD({
      today:sum(todaySales), todayCount:todaySales.length,
      week:sum(weekSales), weekCount:weekSales.length,
      month:monthRev, monthCount:monthSales.length,
      allTime:sum(s), allCount:s.length,
      todayProfit, netToday:todayProfit, profitMargin, stockVal,
      outCount, days, pays, payTotal, monthExp, netProfit:sum(monthSales,'profit')-monthExp,
      recent:s.slice(0,6), lowStock, lowCount,
    })
  }
  if(!d) return <Spinner/>
  const maxBar=Math.max(...d.days.map(x=>x.val),1)
  const hour=new Date().getHours()
  const greeting=hour<12?'Good Morning':hour<17?'Good Afternoon':'Good Evening'
  const PAYS=[['Cash',d.pays.Cash||0],['MoMo',d.pays.MoMo||0],['Paystack',d.pays.Paystack||0],['Split',d.pays.Split||0]]

  return (
    <div>
      <div style={{marginBottom:18}}>
        <div className="greet-h1">{greeting}, Admin</div>
        <div className="greet-sub">{new Date().toLocaleDateString('en-GH',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
      </div>

      {d.outCount>0&&(
        <div className="alert" onClick={()=>onNav&&onNav('products')}>
          <span className="alert-num">{d.outCount}</span>
          <span className="alert-txt">Products out of stock</span>
          <span className="alert-chev">{I.chev}</span>
        </div>
      )}

      {/* Dark stat cards */}
      <div className="statcards">
        <div className="statcard"><div className="statcard-label">Today</div><div className="statcard-val">{ghs(d.today)}</div><div className="statcard-sub">{d.todayCount} sales</div></div>
        <div className="statcard"><div className="statcard-label">This Week</div><div className="statcard-val">{ghs(d.week)}</div><div className="statcard-sub">{d.weekCount} sales</div></div>
        <div className="statcard"><div className="statcard-label">This Month</div><div className="statcard-val">{ghs(d.month)}</div><div className="statcard-sub">{d.monthCount} sales</div></div>
        <div className="statcard"><div className="statcard-label">All Time</div><div className="statcard-val">{ghs(d.allTime)}</div><div className="statcard-sub">{d.allCount} total</div></div>
      </div>

      {/* White sub cards */}
      <div className="subcards">
        <div className="subcard"><div className="subcard-label">Today's Profit</div><div className="subcard-val">{ghs(d.todayProfit)}</div></div>
        <div className="subcard"><div className="subcard-label">Net Today</div><div className="subcard-val">{ghs(d.netToday)}</div></div>
        <div className="subcard"><div className="subcard-label">Profit Margin</div><div className={`subcard-val ${d.profitMargin>0?'green':'red'}`}>{d.profitMargin.toFixed(1)}%</div></div>
        <div className="subcard"><div className="subcard-label">Stock Value</div><div className="subcard-val">{ghs(d.stockVal)}</div></div>
      </div>

      {/* Chart + Payment split */}
      <div className="grid-2-wide">
        <div className="panel panel-pad">
          <div className="panel-title">Last 7 Days Revenue</div>
          <div className="chart">
            {d.days.map((day,i)=>(
              <div key={i} className="chart-col">
                <div className="chart-bar-wrap">
                  <div className="chart-bar" style={{height:`${Math.max(day.val/maxBar*100,1)}%`}}>
                    {day.val>0&&<span className="chart-bar-val">{day.val.toFixed(0)}</span>}
                  </div>
                </div>
                <div className={`chart-label${day.today?' today':''}`}>{day.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel panel-pad">
          <div className="panel-title" style={{marginBottom:16}}>Payment Split (This Month)</div>
          {PAYS.map(([name,val])=>(
            <div key={name} className="split-row">
              <div className="split-top"><span className="split-name">{name}</span><span className="split-val">{ghs(val)} ({(val/d.payTotal*100).toFixed(0)}%)</span></div>
              <div className="split-bar"><div className="split-fill" style={{width:`${val/d.payTotal*100}%`}}/></div>
            </div>
          ))}
          <div className="split-foot">
            <div className="split-foot-row"><span className="split-foot-label">Month Expenses</span><span style={{color:'var(--red)',fontWeight:600}}>{ghs(d.monthExp)}</span></div>
            <div className="split-foot-row"><span className="split-foot-label">Net Profit</span><span style={{color:'var(--green)',fontWeight:600}}>{ghs(d.netProfit)}</span></div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="panel panel-pad" style={{marginBottom:22}}>
        <div className="panel-title" style={{marginBottom:14}}>Quick Actions</div>
        <div className="qa-grid">
          {[['New Sale','pos'],['Products','products'],['Reports','reports'],['Expenses','expenses'],['Stock Take','stock'],['Receipts','receipts']].map(([l,t])=>(
            <button key={l} className="qa-btn" onClick={()=>onNav&&onNav(t)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Recent sales + Low stock */}
      <div className="grid-2">
        <div className="panel">
          <div className="panel-head"><span className="panel-title" style={{marginBottom:0}}>Recent Sales</span><button className="panel-link" onClick={()=>onNav&&onNav('receipts')}>View all →</button></div>
          {d.recent.length===0?<Empty text="No sales yet."/>:d.recent.map((sale,i)=>(
            <div key={i} className="lrow">
              <div className="lrow-thumb lrow-thumb-ph">E</div>
              <div className="lrow-main">
                <div className="lrow-title">{sale.receipt_no}</div>
                <div className="lrow-sub">{sale.customer_name||'Walk-in'}</div>
              </div>
              <div className="lrow-val">{ghs(sale.total)}</div>
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="panel-head"><span className="panel-title" style={{marginBottom:0}}>Low Stock</span><span className="panel-count">{d.lowCount}</span></div>
          {d.lowStock.length===0?<Empty text="All stock healthy."/>:d.lowStock.map((p,i)=>(
            <div key={i} className="lrow">
              {p.image?<img src={cdn(p.image,80)} className="lrow-thumb" alt=""/>:<div className="lrow-thumb lrow-thumb-ph">E</div>}
              <div className="lrow-main">
                <div className="lrow-title">{p.name}</div>
                <div className="lrow-sub">{p.category||'—'}</div>
              </div>
              {(p.quantity||0)===0?<span className="lrow-tag-out">OUT</span>:<span className="lrow-qty">{p.quantity}</span>}
            </div>
          ))}
        </div>
      </div>
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
      {toast&&<div style={{position:'fixed',top:70,left:'50%',transform:'translateX(-50%)',background:'var(--ink)',color:'#fff',padding:'8px 20px',borderRadius:20,fontSize:12,fontWeight:600,zIndex:300,whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,.2)'}}>{toast}</div>}
      {lastReceipt&&(
        <Modal title="Receipt" onClose={()=>setLastReceipt(null)} footer={<><button className="btn btn-brass" onClick={()=>window.print()}>{I.print} Print</button><button className="btn btn-line" onClick={()=>setLastReceipt(null)}>Close</button></>}>
          <div style={{textAlign:'center',marginBottom:20,paddingTop:8}}>
            <div style={{fontFamily:'var(--serif)',fontSize:22,fontWeight:600,color:'var(--ink)'}}>Esterea Home</div>
            <div style={{fontSize:11,color:'var(--ink-3)'}}>Accra, Ghana · 0547927722</div>
            <div style={{fontSize:11,color:'var(--ink-3)',marginTop:2}}>{fmt(lastReceipt.date)}</div>
            <div style={{fontSize:10,fontFamily:'monospace',color:'var(--ink-3)',marginTop:2}}>{lastReceipt.receipt_no}</div>
          </div>
          {lastReceipt.items.map((it,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'8px 0',borderBottom:'1px solid var(--line-2)'}}>
              <span>{it.qty}× {it.name}</span><span style={{fontWeight:700}}>{ghs((it.price||0)*it.qty)}</span>
            </div>
          ))}
          {lastReceipt.discount>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--bad)',marginTop:8}}><span>Discount</span><span>- {ghs(lastReceipt.discount)}</span></div>}
          <div style={{display:'flex',justifyContent:'space-between',fontSize:18,fontWeight:800,marginTop:12,padding:'12px 0',borderTop:'2px solid var(--ink)',color:'var(--ink)'}}><span>Total</span><span>{ghs(lastReceipt.total)}</span></div>
          <div style={{fontSize:12,color:'var(--ink-2)',marginTop:4}}>Payment: {lastReceipt.payment}</div>
          {lastReceipt.customer_name&&<div style={{fontSize:12,color:'var(--ink-3)'}}>Customer: {lastReceipt.customer_name}</div>}
          <div style={{textAlign:'center',fontSize:11,color:'var(--ink-3)',marginTop:20,padding:'12px',background:'var(--line-2)',borderRadius:10}}>Thank you for shopping with us!</div>
        </Modal>
      )}
      <div className="page-head">
        <div><div className="page-h1">Point of Sale</div><div className="page-desc">In-store sales terminal</div></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 330px',gap:16,alignItems:'start'}}>
        {/* Products */}
        <div>
          <div className="search" style={{marginBottom:14}}>{I.search}<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…"/>
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
        <div className="cart">
          <div className="cart-head">
            <span className="cart-head-title">Cart {cart.length>0&&<span style={{background:'var(--line-2)',color:'var(--ink)',borderRadius:10,padding:'1px 8px',fontSize:11,marginLeft:6}}>{cart.reduce((a,c)=>a+c.qty,0)}</span>}</span>
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
            {total>0&&<div style={{fontSize:11,color:'var(--good)',marginTop:3}}>Profit: {ghs(profit)}</div>}
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
        <Modal title={`Invoice ${detail.order_no}`} onClose={()=>setDetail(null)} footer={<button className="btn btn-line" onClick={()=>setDetail(null)}>Close</button>}>
          <div style={{display:'grid',gap:2}}>
            {[['Customer',detail.customer_name],['Phone',detail.customer_phone],['Date',fmt(detail.date||detail.created_at)],['Address',detail.address],['Notes',detail.notes]].map(([k,v])=>v&&(
              <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--line-2)',fontSize:13}}>
                <span style={{color:'var(--ink-2)'}}>{k}</span><span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
            <div style={{padding:'9px 0',borderBottom:'1px solid var(--line-2)',display:'flex',justifyContent:'space-between',fontSize:13}}><span style={{color:'var(--ink-2)'}}>Status</span><Badge status={detail.status}/></div>
          </div>
          <div style={{marginTop:16}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:8,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.05em'}}>Items</div>
            {(detail.items?(typeof detail.items==='string'?JSON.parse(detail.items):detail.items):[]).map((it,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'8px 0',borderBottom:'1px solid var(--line-2)'}}>
                <span>{it.qty}× {it.name}</span><span style={{fontWeight:700}}>{ghs((it.price||0)*it.qty)}</span>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',fontSize:16,fontWeight:800,marginTop:10,paddingTop:10,borderTop:'2px solid var(--ink)',color:'var(--ink)'}}><span>Total</span><span>{ghs(detail.total)}</span></div>
          </div>
        </Modal>
      )}
      <div className="page-head">
        <div><div className="page-h1">Invoices</div><div className="page-desc">Online orders & payments</div></div>
        <button className="btn btn-line" onClick={load}>{I.refresh} Refresh</button>
      </div>
      <MetricStrip cols={4}>
        <Metric label="Paid" value={counts.Paid||0} sub="completed" icon={I.check}/>
        <Metric label="Pending" value={counts.Pending||0} sub="awaiting payment" icon={I.refund}/>
        <Metric label="Completed" value={counts.Completed||0} sub="delivered" icon={I.box}/>
        <Metric label="Cancelled" value={counts.Cancelled||0} sub="cancelled" icon={I.x}/>
      </MetricStrip>
      <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
        <div className="search" style={{flex:1,minWidth:220}}>{I.search}<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, phone, or order #…"/>
        </div>
        <div className="tabs">
          {[['all','All'],['Pending','Pending'],['Paid','Paid'],['Completed','Completed'],['Cancelled','Cancelled']].map(([v,l])=>(
            <button key={v} className={`tab${filter===v?' active':''}`} onClick={()=>setFilter(v)}>{l}</button>
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
                    <div style={{fontSize:10,color:'var(--ink-3)',fontFamily:'monospace',marginBottom:2}}>{o.order_no}</div>
                    <div style={{fontSize:15,fontWeight:700}}>{o.customer_name||'Customer'}</div>
                    <div style={{fontSize:12,color:'var(--ink-2)'}}>{o.customer_phone} · {fmtDate(o.date||o.created_at)}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:18,fontWeight:800,color:'var(--ink)'}}>{ghs(o.total)}</div>
                    <Badge status={o.status}/>
                  </div>
                </div>
                {items.length>0&&<p style={{fontSize:12,color:'var(--ink-3)',marginBottom:6}}>{items.map(i=>`${i.qty}× ${i.name}`).join(' · ')}</p>}
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {o.status==='Pending'&&<button className="btn btn-brass btn-sm" onClick={()=>upd(o.id,'Paid')}>Mark Paid</button>}
                  {o.status==='Paid'&&<button className="btn btn-brass btn-sm" onClick={()=>upd(o.id,'Completed')}>Mark Completed</button>}
                  {!['Cancelled','Completed'].includes(o.status)&&<button className="btn btn-bad btn-sm" onClick={()=>upd(o.id,'Cancelled')}>Cancel</button>}
                  <button className="btn btn-line btn-sm" onClick={()=>setDetail(o)}>View Details</button>
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
        <Modal title={`Receipt ${detail.receipt_no}`} onClose={()=>setDetail(null)} footer={<><button className="btn btn-brass" onClick={()=>window.print()}>{I.print} Print</button><button className="btn btn-line" onClick={()=>setDetail(null)}>Close</button></>}>
          <div style={{textAlign:'center',marginBottom:20,paddingTop:8}}>
            <div style={{fontFamily:'var(--serif)',fontSize:22,color:'var(--ink)'}}>Esterea Home</div>
            <div style={{fontSize:11,color:'var(--ink-3)'}}>Accra, Ghana · 0547927722</div>
            <div style={{fontSize:11,color:'var(--ink-3)',marginTop:2}}>{fmt(detail.date)}</div>
            <div style={{fontSize:10,fontFamily:'monospace',color:'var(--ink-3)'}}>{detail.receipt_no}</div>
          </div>
          {(detail.items?(typeof detail.items==='string'?JSON.parse(detail.items):detail.items):[]).map((it,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'8px 0',borderBottom:'1px solid var(--line-2)'}}>
              <span>{it.qty}× {it.name}</span><span style={{fontWeight:700}}>{ghs((it.price||0)*it.qty)}</span>
            </div>
          ))}
          {detail.discount>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--bad)',marginTop:8}}><span>Discount</span><span>-{ghs(detail.discount)}</span></div>}
          <div style={{display:'flex',justifyContent:'space-between',fontSize:18,fontWeight:800,marginTop:10,paddingTop:10,borderTop:'2px solid var(--ink)',color:'var(--ink)'}}><span>Total</span><span>{ghs(detail.total)}</span></div>
          <div style={{fontSize:12,color:'var(--ink-2)',marginTop:4}}>Payment: {detail.payment}</div>
          {detail.customer_name&&<div style={{fontSize:12,color:'var(--ink-3)'}}>Customer: {detail.customer_name}</div>}
          <div style={{textAlign:'center',fontSize:11,color:'var(--ink-3)',marginTop:20}}>Thank you for shopping with us!</div>
        </Modal>
      )}
      <div className="page-head">
        <div><div className="page-h1">Receipts</div><div className="page-desc">{sales.length} receipts · {ghs(total)} revenue · {ghs(profit)} profit</div></div>
      </div>
      <div className="search" style={{maxWidth:380,marginBottom:14}}>{I.search}<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search receipt, customer…"/>
      </div>
      {loading?<Spinner/>:shown.length===0?<Empty text="No receipts."/>:(
        <div className="panel">
          {shown.map(s=>{
            const items=s.items?(typeof s.items==='string'?JSON.parse(s.items):s.items):[]
            return (
              <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
                <div>
                  <div style={{fontSize:10,color:'var(--ink-3)',fontFamily:'monospace'}}>{s.receipt_no}</div>
                  <div style={{fontSize:15,fontWeight:700}}>{ghs(s.total)}</div>
                  <div style={{fontSize:11,color:'var(--ink-2)'}}>{s.payment} · Profit: <span style={{color:'var(--good)',fontWeight:700}}>{ghs(s.profit)}</span></div>
                  {items.length>0&&<div style={{fontSize:11,color:'var(--ink-3)',marginTop:2}}>{items.map(i=>`${i.qty}× ${i.name}`).join(' · ')}</div>}
                </div>
                <div style={{textAlign:'right',display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
                  <div style={{fontSize:11,color:'var(--ink-3)'}}>{fmtDate(s.date)}</div>
                  <button className="btn btn-line btn-sm" onClick={()=>setDetail(s)}>View</button>
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
        <Modal title="Issue Refund" onClose={()=>setModal(false)} footer={<><button className="btn btn-brass" onClick={save} disabled={saving||!form.order_ref||!form.amount}>{saving?'Saving…':'Issue Refund'}</button><button className="btn btn-line" onClick={()=>setModal(false)}>Cancel</button></>}>
          <Field label="Order / Receipt Reference" value={form.order_ref} onChange={v=>setForm({...form,order_ref:v})} placeholder="e.g. POS-ABC123" required/>
          <NumField label="Refund Amount (GH₵)" value={form.amount} onChange={v=>setForm({...form,amount:v})} required/>
          <Select label="Refund Method" value={form.payment_method} onChange={v=>setForm({...form,payment_method:v})} options={['Cash','MoMo','Paystack']}/>
          <TextArea label="Reason" value={form.reason} onChange={v=>setForm({...form,reason:v})} placeholder="Why is this being refunded?" rows={2}/>
          <Field label="Approved by (Staff)" value={form.staff_name} onChange={v=>setForm({...form,staff_name:v})} placeholder="Staff name"/>
        </Modal>
      )}
      <div className="page-head">
        <div><div className="page-h1">Refunds</div><div className="page-desc">{refunds.length} issued · {ghs(total)} total</div></div>
        <button className="btn btn-brass" onClick={()=>setModal(true)}>{I.plus} Issue Refund</button>
      </div>
      {loading?<Spinner/>:refunds.length===0?<Empty text="No refunds issued."/>:(
        <div className="panel">
          {refunds.map(r=>(
            <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'14px 20px',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
              <div>
                <div style={{fontSize:11,color:'var(--ink-3)',marginBottom:2}}>Ref: {r.order_ref}</div>
                <div style={{fontSize:15,fontWeight:700,color:'var(--bad)'}}>{ghs(r.amount)}</div>
                <div style={{fontSize:11,color:'var(--ink-2)'}}>{r.payment_method}{r.staff_name&&` · ${r.staff_name}`}</div>
                {r.reason&&<div style={{fontSize:11,color:'var(--ink-3)',marginTop:2}}>{r.reason}</div>}
              </div>
              <div style={{textAlign:'right'}}><Badge status="Refunded"/><div style={{fontSize:11,color:'var(--ink-3)',marginTop:4}}>{fmtDate(r.created_at)}</div></div>
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
          footer={<><button className="btn btn-brass" onClick={save} disabled={saving||!editing.name?.trim()}>{saving?'Saving…':editing.id?'Save Changes':'Add Product'}</button><button className="btn btn-line" onClick={()=>setEditing(null)}>Cancel</button></>}>
          <ImgUpload value={editing.image||''} onChange={v=>setEditing({...editing,image:v})}/>
          <div style={{display:'grid',gap:0,borderTop:'1px solid #f0f0f0',paddingTop:14}}>
            <Field label="Product Name" value={editing.name} onChange={v=>setEditing({...editing,name:v})} placeholder="e.g. Rattan Side Table" required/>
            <Field label="Category" value={editing.category} onChange={v=>setEditing({...editing,category:v})} placeholder="e.g. Furniture"/>
            <TextArea label="Description" value={editing.description} onChange={v=>setEditing({...editing,description:v})} placeholder="Short description shown to customers" rows={2}/>
          </div>
          <div style={{border:'1px solid #f0f0f0',borderRadius:12,padding:'14px 16px',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--ink-3)',marginBottom:12}}>Pricing</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <NumField label="Selling Price (GH₵)" value={editing.price} onChange={v=>setEditing({...editing,price:v})} required/>
              <NumField label="Cost Price (GH₵)" value={editing.cost_price} onChange={v=>setEditing({...editing,cost_price:v})}/>
            </div>
            {editing.price>0&&editing.cost_price>0&&<div style={{fontSize:12,color:'var(--good)',marginTop:4,fontWeight:600}}>Margin: {ghs(editing.price-editing.cost_price)} ({((editing.price-editing.cost_price)/editing.price*100).toFixed(0)}%)</div>}
          </div>
          <div style={{border:'1px solid #f0f0f0',borderRadius:12,padding:'14px 16px',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--ink-3)',marginBottom:12}}>Stock & Wholesale</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
              <NumField label="Opening Qty" value={editing.quantity} onChange={v=>setEditing({...editing,quantity:v})} step="1"/>
              <NumField label="Wholesale Price" value={editing.wholesale_price} onChange={v=>setEditing({...editing,wholesale_price:v})}/>
              <NumField label="Wholesale Min Qty" value={editing.wholesale_min_qty} onChange={v=>setEditing({...editing,wholesale_min_qty:v})} step="1"/>
            </div>
          </div>
          <Toggle on={editing.visible} onToggle={()=>setEditing({...editing,visible:!editing.visible})} label="Visible in Store" sub="Customers can see and buy this product"/>
        </Modal>
      )}
      <div className="page-head">
        <div><div className="page-h1">Products</div><div className="page-desc">{products.length} products · {products.filter(p=>(p.quantity||0)<=10).length} low/out of stock</div></div>
        <button className="btn btn-brass" onClick={()=>setEditing(blank)}>{I.plus} Add Product</button>
      </div>
      <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
        <div className="search" style={{flex:1,minWidth:200}}>{I.search}<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…"/>
        </div>
        <div className="tabs">
          {[['all','All'],['active','Active'],['hidden','Hidden'],['low','Low Stock']].map(([v,l])=>(
            <button key={v} className={`tab${filter===v?' active':''}`} onClick={()=>setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>
      {loading?<Spinner/>:filtered.length===0?<Empty text="No products."/>:(
        <div className="panel" style={{overflow:'hidden'}}>
          <table className="tbl">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Cost</th><th>Stock</th><th>Visibility</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p=>{
                const [slabel,scls]=stockStatus(p.quantity||0)
                return (
                  <tr key={p.id} style={{opacity:p.visible?1:.55}}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        {p.image?<img src={cdn(p.image,84)} className="inv-row-img" alt=""/>:<div className="inv-row-img" style={{display:'flex',alignItems:'center',justifyContent:'center',color:'#ddd',fontFamily:'var(--serif)',fontSize:18}}>E</div>}
                        <div><div style={{fontSize:13,fontWeight:700,color:'var(--ink)'}}>{p.name}</div></div>
                      </div>
                    </td>
                    <td style={{color:'var(--ink-2)',fontSize:12}}>{p.category||'—'}</td>
                    <td><span style={{fontSize:14,fontWeight:800}}>{ghs(p.price)}</span></td>
                    <td style={{color:'var(--ink-3)',fontSize:12}}>{p.cost_price?ghs(p.cost_price):'—'}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span className="stock-num">{p.quantity||0}</span>
                        <span className={`stock-pill ${scls}`}>{slabel}</span>
                      </div>
                    </td>
                    <td><Badge status={p.visible?'Active':'Inactive'}/></td>
                    <td>
                      <div style={{display:'flex',gap:4,justifyContent:'flex-end'}}>
                        <button className="btn btn-line btn-sm" onClick={()=>setStockModal(p)}>± Stock</button>
                        <button className="btn btn-line btn-sm" onClick={()=>toggleVis(p.id,p.visible)}>{p.visible?'Hide':'Show'}</button>
                        <button className="btn btn-line btn-sm" onClick={()=>setEditing({...p})}>Edit</button>
                        <button className="btn btn-bad btn-sm" onClick={()=>del(p.id)}>Del</button>
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
        <Modal title="Add Promo / Sale Price" onClose={()=>setModal(false)} footer={<><button className="btn btn-brass" onClick={save} disabled={saving||!form.product_id||!form.price||!form.end_date}>{saving?'Saving…':'Save Promo'}</button><button className="btn btn-line" onClick={()=>setModal(false)}>Cancel</button></>}>
          <Select label="Product" value={form.product_id} onChange={v=>setForm({...form,product_id:v})} options={products.map(p=>({value:p.id,label:p.name}))} required/>
          <NumField label="Promo Price (GH₵)" value={form.price} onChange={v=>setForm({...form,price:v})} required/>
          <Field label="Label" value={form.label} onChange={v=>setForm({...form,label:v})} placeholder="e.g. Flash Sale, Bundle Deal"/>
          <div className="field"><label>End Date & Time</label><input type="datetime-local" className="field-input" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})}/></div>
        </Modal>
      )}
      <div className="page-head">
        <div><div className="page-h1">Promos & Bundles</div><div className="page-desc">{active.length} active · {expired.length} expired</div></div>
        <button className="btn btn-brass" onClick={()=>setModal(true)}>{I.plus} Add Promo</button>
      </div>
      {loading?<Spinner/>:<>
        {active.length>0&&<><div style={{fontSize:11,fontWeight:700,color:'var(--good)',marginBottom:8,textTransform:'uppercase',letterSpacing:'.06em'}}>Active Promos</div>
        <div className="panel" style={{marginBottom:16,overflow:'hidden'}}>
          {active.map(p=>(
            <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
              <div><div style={{fontSize:14,fontWeight:700}}>{p.products?.name||'Product'}</div><div style={{fontSize:12,color:'var(--ink-2)'}}>{p.label||'Sale'} · Price: {ghs(p.price)} · Ends {fmtDate(p.end_date)}</div></div>
              <div style={{display:'flex',alignItems:'center',gap:8}}><Badge status="Active"/><button className="btn btn-bad btn-sm" onClick={()=>del(p.id)}>Remove</button></div>
            </div>
          ))}
        </div></>}
        {expired.length>0&&<><div style={{fontSize:11,fontWeight:700,color:'var(--ink-3)',margin:'16px 0 8px',textTransform:'uppercase',letterSpacing:'.06em'}}>Expired</div>
        <div className="panel" style={{overflow:'hidden',opacity:.65}}>
          {expired.slice(0,5).map(p=>(
            <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 20px',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
              <div><div style={{fontSize:13,fontWeight:500}}>{p.products?.name||'Product'}</div><div style={{fontSize:11,color:'var(--ink-3)'}}>Was {ghs(p.price)} · Ended {fmtDate(p.end_date)}</div></div>
              <button className="btn btn-line btn-sm" onClick={()=>del(p.id)}>Remove</button>
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
        <Modal title="Record Restock" onClose={()=>setModal(false)} footer={<><button className="btn btn-brass" onClick={save} disabled={saving||!form.product_id||!form.qty}>{saving?'Saving…':'Record Restock'}</button><button className="btn btn-line" onClick={()=>setModal(false)}>Cancel</button></>}>
          <Select label="Product" value={form.product_id} onChange={v=>setForm({...form,product_id:v})} options={products.map(p=>({value:p.id,label:`${p.name} (stock: ${p.quantity||0})`}))} required/>
          <NumField label="Quantity Received" value={form.qty} onChange={v=>setForm({...form,qty:v})} step="1" required/>
          <NumField label="Cost per Unit (GH₵)" value={form.cost_per_unit} onChange={v=>setForm({...form,cost_per_unit:v})}/>
          <Field label="Supplier" value={form.supplier} onChange={v=>setForm({...form,supplier:v})} placeholder="Supplier name"/>
          <TextArea label="Notes" value={form.notes} onChange={v=>setForm({...form,notes:v})} placeholder="Notes about this delivery" rows={2}/>
        </Modal>
      )}
      <div className="page-head">
        <div><div className="page-h1">Restock</div><div className="page-desc">Record incoming stock deliveries</div></div>
        <button className="btn btn-brass" onClick={()=>setModal(true)}>{I.plus} Record Restock</button>
      </div>
      {loading?<Spinner/>:entries.length===0?<Empty text="No restock records."/>:(
        <div className="panel" style={{overflow:'hidden'}}>
          {entries.map(e=>(
            <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'14px 20px',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
              <div>
                <div style={{fontSize:14,fontWeight:700}}>{e.products?.name||'Product'}</div>
                <div style={{fontSize:13,color:'var(--good)',fontWeight:700}}>+{e.qty_change} units <span style={{color:'var(--ink-3)',fontWeight:400,fontSize:11}}>({e.qty_before} → {e.qty_after})</span></div>
                {e.supplier&&<div style={{fontSize:11,color:'var(--ink-2)'}}>From: {e.supplier}</div>}
                {e.cost_per_unit&&<div style={{fontSize:11,color:'var(--ink-2)'}}>Cost: {ghs(e.cost_per_unit)} ea. · Total: {ghs(e.cost_per_unit*e.qty_change)}</div>}
                {e.notes&&<div style={{fontSize:11,color:'var(--ink-3)'}}>{e.notes}</div>}
              </div>
              <div style={{fontSize:11,color:'var(--ink-3)',textAlign:'right',flexShrink:0}}>{fmtDate(e.created_at)}</div>
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
      <p style={{fontSize:13,color:'var(--ink-2)',marginBottom:12,fontWeight:500}}>{product.name}</p>
      <div style={{display:'flex',justifyContent:'space-between',padding:'12px 16px',background:'var(--line-2)',borderRadius:12,marginBottom:14}}>
        <span style={{fontSize:12,color:'var(--ink-2)',fontWeight:600}}>Current stock</span>
        <span style={{fontSize:18,fontWeight:800,color:(product.quantity||0)<=3?'var(--bad)':(product.quantity||0)<=10?'var(--warn)':'var(--good)'}}>{product.quantity||0} units</span>
      </div>
      <div style={{display:'flex',gap:4,marginBottom:14,background:'var(--line-2)',padding:4,borderRadius:10}}>
        {[['set','Set to'],['add','Add'],['remove','Remove']].map(([v,l])=>(
          <button key={v} onClick={()=>setMode(v)} style={{flex:1,padding:'8px 0',background:mode===v?'#fff':'transparent',border:'none',cursor:'pointer',fontSize:12,fontWeight:mode===v?700:400,color:mode===v?'var(--ink)':'#888',transition:'all .15s',borderRadius:8,fontFamily:'var(--sans)'}}>
            {l}
          </button>
        ))}
      </div>
      <div className="field">
        <label>{mode==='set'?'New quantity':mode==='add'?'Units to add':'Units to remove'}</label>
        <input type="number" min="0" className="field-input" value={qty} onChange={e=>setQty(e.target.value)} autoFocus style={{fontSize:24,fontWeight:800,textAlign:'center',height:56}}/>
      </div>
      {qty!==''&&<div style={{fontSize:13,color:'var(--good)',fontWeight:700,background:'#dcfce7',padding:'10px 14px',borderRadius:10,marginBottom:12}}>New stock will be <strong>{preview()}</strong> units</div>}
      <div className="field"><label>Reason (optional)</label><input className="field-input" value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Manual correction, damaged items"/></div>
      <button className="btn btn-brass" style={{width:'100%',justifyContent:'center',padding:'13px 0',fontSize:14,borderRadius:12}} disabled={!qty||saving} onClick={apply}>{saving?'Saving…':'Update Stock'}</button>
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
      <div className="page-head">
        <div><div className="page-h1">Stock & Adjust</div><div className="page-desc">View and correct stock levels</div></div>
      </div>
      <div className="search" style={{maxWidth:360,marginBottom:14}}>{I.search}<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…"/></div>
      {loading?<Spinner/>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:12,marginBottom:24}}>
          {shown.map(p=>{
            const q=p.quantity||0,clr=q===0?'var(--bad)':q<=3?'var(--bad)':q<=10?'var(--warn)':'var(--good)'
            return (
              <div key={p.id} className="panel" style={{padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}} onClick={()=>setSelected(p)}>
                <div><div style={{fontSize:13,fontWeight:700}}>{p.name}</div><div style={{fontSize:11,color:'var(--ink-3)'}}>{p.category}</div></div>
                <div style={{textAlign:'right'}}><div style={{fontSize:24,fontWeight:900,color:clr}}>{q}</div><button className="btn btn-brass btn-sm" style={{marginTop:4}}>Adjust</button></div>
              </div>
            )
          })}
        </div>
      )}
      {history.length>0&&<>
        <div style={{fontSize:12,fontWeight:700,marginBottom:10,color:'var(--ink-2)',textTransform:'uppercase',letterSpacing:'.05em'}}>Recent Adjustments</div>
        <div className="panel" style={{overflow:'hidden'}}>
          {history.map(h=>(
            <div key={h.id} style={{display:'flex',justifyContent:'space-between',padding:'11px 20px',borderBottom:'1px solid rgba(0,0,0,.04)',fontSize:13}}>
              <div><span style={{fontWeight:700}}>{h.products?.name}</span> <span style={{color:h.qty_change>0?'var(--good)':'var(--bad)',fontWeight:700}}>{h.qty_change>0?'+':''}{h.qty_change}</span> <span style={{color:'var(--ink-3)',fontSize:11}}>({h.qty_before}→{h.qty_after}) [{h.type}]</span>{h.notes&&<span style={{color:'var(--ink-3)',fontSize:11}}> · {h.notes}</span>}</div>
              <span style={{color:'var(--ink-3)',fontSize:11,flexShrink:0}}>{fmtDate(h.created_at)}</span>
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
      {detail&&<Modal title="Customer" onClose={()=>setDetail(null)} footer={<button className="btn btn-line" onClick={()=>setDetail(null)}>Close</button>}>
        {[['Name',detail.name||'—'],['Phone',detail.phone],['Total Spent',ghs(detail.total_spent||0)],['Purchases',detail.purchase_count||0],['Last Purchase',fmtDate(detail.last_purchase)],['Joined',fmtDate(detail.created_at)]].map(([k,v])=>(
          <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--line-2)',fontSize:13}}><span style={{color:'var(--ink-2)'}}>{k}</span><span style={{fontWeight:700}}>{v}</span></div>
        ))}
      </Modal>}
      <div className="page-head">
        <div><div className="page-h1">Customers</div><div className="page-desc">{customers.length} registered</div></div>
      </div>
      <div className="search" style={{maxWidth:360,marginBottom:14}}>{I.search}<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or phone…"/></div>
      {loading?<Spinner/>:shown.length===0?<Empty text="No customers."/>:(
        <div className="panel" style={{overflow:'hidden'}}>
          <table className="tbl">
            <thead><tr><th>Name</th><th>Phone</th><th>Purchases</th><th>Total Spent</th><th>Last Purchase</th><th></th></tr></thead>
            <tbody>{shown.map(c=>(
              <tr key={c.id}>
                <td><span style={{fontWeight:700}}>{c.name||<span style={{color:'var(--ink-3)'}}>—</span>}</span></td>
                <td style={{fontFamily:'monospace',fontSize:12}}>{c.phone}</td>
                <td><span style={{fontWeight:700}}>{c.purchase_count||0}</span></td>
                <td><span style={{fontWeight:800,color:'var(--ink)'}}>{ghs(c.total_spent||0)}</span></td>
                <td style={{color:'var(--ink-3)',fontSize:11}}>{fmtDate(c.last_purchase)}</td>
                <td><button className="btn btn-line btn-sm" onClick={()=>setDetail(c)}>View</button></td>
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
      {editing&&<Modal title={editing.id?'Edit Expense':'New Expense'} onClose={()=>setEditing(null)} footer={<><button className="btn btn-brass" onClick={save} disabled={saving}>{saving?'Saving…':'Save'}</button><button className="btn btn-line" onClick={()=>setEditing(null)}>Cancel</button></>}>
        <Field label="Description" value={editing.description} onChange={v=>setEditing({...editing,description:v})} placeholder="e.g. Monthly rent" required/>
        <NumField label="Amount (GH₵)" value={editing.amount} onChange={v=>setEditing({...editing,amount:v})} required/>
        <Field label="Category" value={editing.category} onChange={v=>setEditing({...editing,category:v})} placeholder="e.g. Rent, Logistics"/>
        <Field label="Notes" value={editing.notes} onChange={v=>setEditing({...editing,notes:v})} placeholder="Additional notes"/>
        <div className="field"><label>Date</label><input type="date" className="field-input" value={editing.date?.slice(0,10)||today()} onChange={e=>setEditing({...editing,date:e.target.value})}/></div>
      </Modal>}
      <div className="page-head">
        <div><div className="page-h1">Expenses</div><div className="page-desc">This month: <strong style={{color:'var(--bad)'}}>{ghs(monthTotal)}</strong> · All time: {ghs(total)}</div></div>
        <button className="btn btn-brass" onClick={()=>setEditing({description:'',amount:'',category:'',notes:'',date:today()})}>{I.plus} Add Expense</button>
      </div>
      <div className="tabs" style={{marginBottom:14}}>
        {cats.map(c=><button key={c} className={`tab${catFilter===c?' active':''}`} onClick={()=>setCatFilter(c)}>{c==='all'?'All Categories':c}</button>)}
      </div>
      {loading?<Spinner/>:shown.length===0?<Empty text="No expenses."/>:(
        <div className="panel" style={{overflow:'hidden'}}>
          {shown.map(e=>(
            <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
              <div><div style={{fontSize:14,fontWeight:700}}>{e.description}</div><div style={{fontSize:11,color:'var(--ink-3)'}}>{e.category&&`${e.category} · `}{fmtDate(e.date)}{e.notes&&` · ${e.notes}`}</div></div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:17,fontWeight:800,color:'var(--bad)'}}>{ghs(e.amount)}</span>
                <button className="btn btn-line btn-sm" onClick={()=>setEditing({...e})}>Edit</button>
                <button className="btn btn-bad btn-sm" onClick={()=>del(e.id)}>Del</button>
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
      <div className="page-head">
        <div><div className="page-h1">Reports</div><div className="page-desc">Business performance overview</div></div>
        <div className="tabs">
          {[['today','Today'],['week','Week'],['month','Month'],['year','Year']].map(([v,l])=>(
            <button key={v} className={`tab${period===v?' active':''}`} onClick={()=>setPeriod(v)}>{l}</button>
          ))}
        </div>
      </div>
      {loading?<Spinner/>:!data?null:<>
        <MetricStrip cols={5}>
          <Metric label="POS Revenue" value={ghs(data.revenue)} sub={<><b>{data.sales}</b> sales</>} icon={I.coins}/>
          <Metric label="Online Revenue" value={ghs(data.onlineRev)} sub={<><b>{data.orders}</b> orders</>} icon={I.invoice}/>
          <Metric label="Gross Profit" value={ghs(data.profit)} sub="Before expenses" icon={I.trend}/>
          <Metric label="Expenses" value={ghs(data.expenses)} sub="Recorded" icon={I.expense}/>
          <Metric label="Net Profit" value={ghs(data.net)} sub="After expenses" icon={I.star}/>
        </MetricStrip>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16}}>
          <div className="panel">
            <div className="panel-head"><span className="panel-title">Revenue by Payment Method</span></div>
            <div className="panel-body">
              {Object.entries(data.byPay).sort((a,b)=>b[1]-a[1]).map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--line-2)'}}>
                  <span style={{fontSize:13,color:'var(--ink-2)',fontWeight:600}}>{k}</span>
                  <span style={{fontSize:14,fontWeight:800,color:'var(--ink)'}}>{ghs(v)}</span>
                </div>
              ))}
              {Object.keys(data.byPay).length===0&&<p style={{color:'var(--ink-3)',fontSize:13}}>No sales in this period.</p>}
            </div>
          </div>
          <div className="panel">
            <div className="panel-head"><span className="panel-title">Expenses by Category</span></div>
            <div className="panel-body">
              {Object.entries(data.byCat).sort((a,b)=>b[1]-a[1]).map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--line-2)'}}>
                  <span style={{fontSize:13,color:'var(--ink-2)',fontWeight:600}}>{k}</span>
                  <span style={{fontSize:14,fontWeight:800,color:'var(--bad)'}}>{ghs(v)}</span>
                </div>
              ))}
              {Object.keys(data.byCat).length===0&&<p style={{color:'var(--ink-3)',fontSize:13}}>No expenses in this period.</p>}
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
      {modal&&<Modal title={form.id?'Edit Staff':'Add Staff Member'} onClose={()=>setModal(false)} footer={<><button className="btn btn-brass" onClick={save} disabled={saving||!form.name.trim()}>{saving?'Saving…':'Save'}</button><button className="btn btn-line" onClick={()=>setModal(false)}>Cancel</button></>}>
        <Field label="Full Name" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="e.g. Ama Mensah" required/>
        <Select label="Role" value={form.role} onChange={v=>setForm({...form,role:v})} options={['Manager','Cashier','Sales Rep','Delivery','Other']}/>
        <Field label="Phone" value={form.phone} onChange={v=>setForm({...form,phone:v})} placeholder="0XX XXX XXXX"/>
        <Field label="POS PIN" value={form.pin} onChange={v=>setForm({...form,pin:v})} placeholder="4-digit PIN" type="password"/>
        <Toggle on={form.active} onToggle={()=>setForm({...form,active:!form.active})} label="Active" sub="Staff member can access the system"/>
      </Modal>}
      <div className="page-head">
        <div><div className="page-h1">Staff</div><div className="page-desc">{staff.filter(s=>s.active).length} active members</div></div>
        <button className="btn btn-brass" onClick={()=>{setForm({name:'',role:'',phone:'',pin:'',active:true});setModal(true)}}>{I.plus} Add Staff</button>
      </div>
      {loading?<Spinner/>:staff.length===0?<Empty text="No staff members."/>:(
        <div className="panel" style={{overflow:'hidden'}}>
          <table className="tbl">
            <thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Status</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
            <tbody>{staff.map(m=>(
              <tr key={m.id}>
                <td><span style={{fontWeight:700}}>{m.name}</span></td>
                <td style={{color:'var(--ink-2)',fontSize:12}}>{m.role||'—'}</td>
                <td style={{fontSize:12}}>{m.phone||'—'}</td>
                <td><Badge status={m.active?'Active':'Inactive'}/></td>
                <td><div style={{display:'flex',gap:4,justifyContent:'flex-end'}}>
                  <button className="btn btn-line btn-sm" onClick={()=>{setForm({...m});setModal(true)}}>Edit</button>
                  <button className="btn btn-line btn-sm" onClick={async()=>{ await supabase.from('staff').update({active:!m.active}).eq('id',m.id); load() }}>{m.active?'Deactivate':'Activate'}</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
