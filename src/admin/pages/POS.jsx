import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ghs, today, isoNow, fmtDateTime, shortId } from '../lib/format'
import { cdn } from '../lib/cloudinary'
import { useAsync, toast } from '../lib/hooks'
import { SearchBar, Spinner, Empty, Button, Badge } from '../ui'
import { PageHeader } from '../ui/Layout'
import Modal from '../ui/Modal'
import Icon from '../ui/Icon'

export default function POS({ session }) {
  const { data: products, loading, reload } = useAsync(async () => {
    const { data } = await supabase.from('products').select('*').gt('quantity', 0).order('name')
    return data || []
  })
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [payment, setPayment] = useState('Cash')
  const [customer, setCustomer] = useState('')
  const [phone, setPhone] = useState('')
  const [discount, setDiscount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [lastSale, setLastSale] = useState(null)

  const list = (products || []).filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))

  const add = p => setCart(c => {
    const ex = c.find(x => x.id === p.id)
    if (ex) return c.map(x => x.id === p.id ? { ...x, qty: Math.min(x.qty + 1, p.quantity) } : x)
    return [...c, { id: p.id, name: p.name, price: p.price, cost: p.cost_price || 0, qty: 1, max: p.quantity }]
  })
  const setQty = (id, d) => setCart(c => c.flatMap(x => {
    if (x.id !== id) return [x]
    const q = x.qty + d
    if (q <= 0) return []
    return [{ ...x, qty: Math.min(q, x.max) }]
  }))

  const subtotal = cart.reduce((a, x) => a + x.price * x.qty, 0)
  const total = Math.max(0, subtotal - discount)
  const profit = cart.reduce((a, x) => a + (x.price - x.cost) * x.qty, 0) - discount

  async function complete() {
    if (!cart.length) return
    setSaving(true)
    const sale = {
      receipt_no: shortId('POS'),
      date: isoNow(),
      items: cart.map(x => ({ id: x.id, name: x.name, price: x.price, qty: x.qty })),
      subtotal, discount, total, profit,
      payment, customer_name: customer.trim() || null, customer_phone: phone.trim() || null,
      staff_id: session?.id || null, staff_name: session?.name || 'Admin',
      voided: false,
    }
    const { error } = await supabase.from('sales').insert(sale)
    if (!error) {
      for (const x of cart) await supabase.from('products').update({ quantity: x.max - x.qty }).eq('id', x.id)
    }
    setSaving(false)
    if (error) return toast(error.message, 'bad')
    toast(`Sale complete · ${ghs(total)}`, 'good')
    setLastSale(sale)
    setCart([]); setDiscount(0); setCustomer(''); setPhone(''); reload()
  }

  return (
    <div>
      <PageHeader title="Point of Sale" subtitle="In-store sales terminal" />
      <div className="pos">
        <div className="pos__main">
          <div className="mb18"><SearchBar value={search} onChange={setSearch} placeholder="Search products…" /></div>
          {loading ? <Spinner /> : list.length === 0 ? (
            <Empty icon="box" title={products?.length ? 'No products match' : 'No products in stock'} sub="Add products with stock to sell them here." />
          ) : (
            <div className="pos__grid">
              {list.map(p => (
                <button key={p.id} className="pos__card" onClick={() => add(p)}>
                  {p.image ? <img src={cdn(p.image, 240)} alt="" /> : <div className="pos__cardph">E</div>}
                  <div className="pos__cardname">{p.name}</div>
                  <div className="pos__cardprice">{ghs(p.price)}</div>
                  <div className="pos__cardstock">{p.quantity} in stock</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="pos__cart">
          <div className="cart__head">
            <span>Cart</span>
            {cart.length > 0 && <span className="cart__count">{cart.reduce((a, x) => a + x.qty, 0)}</span>}
          </div>
          <div className="cart__body">
            {cart.length === 0 ? <div className="cart__empty">Tap a product to add</div> : cart.map(x => (
              <div key={x.id} className="cart__line">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="cart__name">{x.name}</div>
                  <div className="cart__price">{ghs(x.price)}</div>
                </div>
                <button className="cart__qbtn" onClick={() => setQty(x.id, -1)}>−</button>
                <span className="cart__qnum">{x.qty}</span>
                <button className="cart__qbtn" onClick={() => setQty(x.id, +1)}>+</button>
              </div>
            ))}
          </div>
          <div className="cart__foot">
            <div className="cart__totrow"><span>Subtotal</span><span>{ghs(subtotal)}</span></div>
            <div className="cart__totrow">
              <span>Discount</span>
              <input className="cart__disc" type="number" min="0" value={discount === 0 ? '' : discount} placeholder="0.00" onChange={e => setDiscount(Number(e.target.value) || 0)} />
            </div>
            <div className="cart__total"><span>TOTAL</span><b>{ghs(total)}</b></div>
            {profit > 0 && <div className="cart__profit">Profit: {ghs(profit)}</div>}
            <div className="cart__pays">
              {['Cash', 'MoMo', 'Paystack'].map(m => (
                <button key={m} className={`cart__pay${payment === m ? ' cart__pay--on' : ''}`} onClick={() => setPayment(m)}>{m}</button>
              ))}
            </div>
            <input className="cart__input" placeholder="Customer name (optional)" value={customer} onChange={e => setCustomer(e.target.value)} />
            <input className="cart__input" placeholder="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} />
            <button className="cart__cta" disabled={!cart.length || saving} onClick={complete}>
              {saving ? 'Processing…' : `Complete Sale · ${ghs(total)}`}
            </button>
          </div>
        </aside>
      </div>

      {lastSale && (
        <Modal title="Sale Complete" onClose={() => setLastSale(null)} size="sm"
          footer={<>
            <Button variant="line" icon="print" onClick={() => window.print()}>Print Receipt</Button>
            <Button onClick={() => setLastSale(null)}>New Sale</Button>
          </>}>
          <div className="receipt">
            <div className="receipt__brand">Esterea Home</div>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-3)', marginBottom: 2 }}>Accra, Ghana · 0547927722</div>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-3)', marginBottom: 10 }}>{fmtDateTime(lastSale.date)}</div>
            <div className="receipt__rule" />
            <div className="receipt__row"><span className="cell-dim">Receipt</span><span className="cell-mono">{lastSale.receipt_no}</span></div>
            <div className="receipt__row"><span className="cell-dim">Customer</span><span>{lastSale.customer_name || 'Walk-in'}</span></div>
            {lastSale.staff_name && <div className="receipt__row"><span className="cell-dim">Served by</span><span>{lastSale.staff_name}</span></div>}
            <div className="receipt__rule" />
            {lastSale.items.map((it, i) => (
              <div key={i} className="receipt__row"><span>{it.qty}× {it.name}</span><span>{ghs(it.price * it.qty)}</span></div>
            ))}
            <div className="receipt__rule" />
            <div className="receipt__row"><span className="cell-dim">Subtotal</span><span>{ghs(lastSale.subtotal)}</span></div>
            {lastSale.discount > 0 && <div className="receipt__row"><span className="cell-dim">Discount</span><span>−{ghs(lastSale.discount)}</span></div>}
            <div className="receipt__row" style={{ fontSize: 15, fontWeight: 700 }}><span>Total</span><span>{ghs(lastSale.total)}</span></div>
            <div className="receipt__row"><span className="cell-dim">Payment</span><Badge>{lastSale.payment}</Badge></div>
            <div className="receipt__rule" />
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>Thank you for shopping with us!</div>
            <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>estereahome.com</div>
          </div>
        </Modal>
      )}
    </div>
  )
}
