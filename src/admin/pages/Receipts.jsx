import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ghs, fmtDateTime } from '../lib/format'
import { useAsync, toast } from '../lib/hooks'
import { Button, SearchBar, Spinner, Empty, Badge } from '../ui'
import { PageHeader, Panel, Table } from '../ui/Layout'
import Modal from '../ui/Modal'

export default function Receipts() {
  const { data, loading, reload } = useAsync(async () => {
    const { data } = await supabase.from('sales').select('*').order('date', { ascending: false }).limit(200)
    return data || []
  })
  const [detail, setDetail] = useState(null)
  const [search, setSearch] = useState('')
  const list = (data || []).filter(s => !search || s.receipt_no?.toLowerCase().includes(search.toLowerCase()) || (s.customer_name || '').toLowerCase().includes(search.toLowerCase()))

  async function voidSale(s) {
    if (!confirm(`Void receipt ${s.receipt_no}? This cannot be undone.`)) return
    const { error } = await supabase.from('sales').update({ voided: true }).eq('id', s.id)
    if (error) return toast(error.message, 'bad')
    toast('Receipt voided', 'good'); setDetail(null); reload()
  }

  return (
    <div>
      <PageHeader title="Receipts" subtitle={`${(data || []).length} sales`} />
      <div className="mb18"><SearchBar value={search} onChange={setSearch} placeholder="Search receipt or customer…" /></div>
      <Panel>
        {loading ? <Spinner /> : (
          <Table columns={[{ label: 'Receipt' }, { label: 'Customer' }, { label: 'Staff' }, { label: 'Date' }, { label: 'Payment' }, { label: 'Total' }, { label: '', align: 'right' }]} rows={list}
            empty={<Empty icon="receipt" title="No sales yet" sub="Complete a sale in POS to see receipts here." />}
            renderRow={s => (
              <tr key={s.id} style={s.voided ? { opacity: .5 } : undefined}>
                <td className="cell-mono">{s.receipt_no}{s.voided && ' (void)'}</td>
                <td style={{ fontWeight: 600 }}>{s.customer_name || 'Walk-in'}</td>
                <td className="cell-dim">{s.staff_name || '—'}</td>
                <td className="cell-dim">{fmtDateTime(s.date)}</td>
                <td className="cell-dim">{s.payment}</td>
                <td className="cell-num">{ghs(s.total)}</td>
                <td><div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button variant="line" size="sm" onClick={() => setDetail(s)}>View</Button></div></td>
              </tr>
            )} />
        )}
      </Panel>

      {detail && (
        <Modal title={`Receipt ${detail.receipt_no}`} onClose={() => setDetail(null)}
          footer={<>
            {!detail.voided && <Button variant="bad" onClick={() => voidSale(detail)}>Void</Button>}
            <Button variant="line" icon="print" onClick={() => window.print()}>Print</Button>
            <Button onClick={() => setDetail(null)}>Done</Button>
          </>}>
          <div className="receipt">
            <div className="receipt__brand">Esterea Home</div>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-3)', marginBottom: 2 }}>Accra, Ghana · 0547927722</div>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-3)', marginBottom: 10 }}>{fmtDateTime(detail.date)}</div>
            <div className="receipt__rule" />
            <div className="receipt__row"><span className="cell-dim">Receipt</span><span className="cell-mono">{detail.receipt_no}</span></div>
            <div className="receipt__row"><span className="cell-dim">Customer</span><span>{detail.customer_name || 'Walk-in'}</span></div>
            {detail.staff_name && <div className="receipt__row"><span className="cell-dim">Served by</span><span>{detail.staff_name}</span></div>}
            <div className="receipt__rule" />
            {(detail.items || []).map((it, i) => (
              <div key={i} className="receipt__row"><span>{it.qty}× {it.name}</span><span>{ghs(it.price * it.qty)}</span></div>
            ))}
            <div className="receipt__rule" />
            <div className="receipt__row"><span className="cell-dim">Subtotal</span><span>{ghs(detail.subtotal)}</span></div>
            {detail.discount > 0 && <div className="receipt__row"><span className="cell-dim">Discount</span><span>−{ghs(detail.discount)}</span></div>}
            <div className="receipt__row" style={{ fontSize: 15, fontWeight: 700 }}><span>Total</span><span>{ghs(detail.total)}</span></div>
            <div className="receipt__row"><span className="cell-dim">Payment</span><Badge>{detail.payment}</Badge></div>
            <div className="receipt__rule" />
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>Thank you for shopping with us!</div>
            <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>estereahome.com</div>
          </div>
        </Modal>
      )}
    </div>
  )
}
