import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ghs, fmtDateTime, fmtPhone } from '../lib/format'
import { useAsync } from '../lib/hooks'
import { Button, SearchBar, Tabs, Spinner, Empty, Badge } from '../ui'
import { PageHeader, Panel, Table } from '../ui/Layout'
import Modal from '../ui/Modal'

const tone = s => ({ Paid: 'good', Completed: 'good', Pending: 'warn', Cancelled: 'bad' }[s] || 'dim')

export default function Invoices() {
  const { data, loading } = useAsync(async () => {
    const { data } = await supabase.from('whatsapp_orders').select('*').order('created_at', { ascending: false })
    return data || []
  })
  const [detail, setDetail] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const list = (data || []).filter(o => {
    if (status !== 'all' && o.status !== status) return false
    if (search && !o.order_no?.toLowerCase().includes(search.toLowerCase()) && !(o.customer_name || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <PageHeader title="Online Orders" subtitle={`${(data || []).length} total`} />
      <div className="mb18" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search order or customer…" />
        <Tabs tabs={[{ value: 'all', label: 'All' }, { value: 'Pending', label: 'Pending' }, { value: 'Paid', label: 'Paid' }, { value: 'Completed', label: 'Completed' }]} value={status} onChange={setStatus} />
      </div>
      <Panel>
        {loading ? <Spinner /> : (
          <Table columns={[{ label: 'Order' }, { label: 'Customer' }, { label: 'Date' }, { label: 'Total' }, { label: 'Status' }, { label: '', align: 'right' }]} rows={list}
            empty={<Empty icon="invoice" title="No orders yet" />}
            renderRow={o => (
              <tr key={o.order_no}>
                <td className="cell-mono">{o.order_no}</td>
                <td style={{ fontWeight: 600 }}>{o.customer_name || 'Customer'}</td>
                <td className="cell-dim">{fmtDateTime(o.created_at)}</td>
                <td className="cell-num">{ghs(o.total)}</td>
                <td><Badge tone={tone(o.status)}>{o.status}</Badge></td>
                <td><div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button variant="line" size="sm" onClick={() => setDetail(o)}>View</Button></div></td>
              </tr>
            )} />
        )}
      </Panel>

      {detail && (
        <Modal title={`Invoice ${detail.order_no}`} onClose={() => setDetail(null)} footer={<Button variant="line" onClick={() => setDetail(null)}>Close</Button>}>
          <div className="receipt">
            <div className="receipt__row"><span className="cell-dim">Customer</span><b>{detail.customer_name || '—'}</b></div>
            <div className="receipt__row"><span className="cell-dim">Phone</span><span>{fmtPhone(detail.customer_phone) || '—'}</span></div>
            <div className="receipt__row"><span className="cell-dim">Address</span><span>{detail.address || '—'}</span></div>
            <div className="receipt__row"><span className="cell-dim">Status</span><Badge tone={tone(detail.status)}>{detail.status}</Badge></div>
            <div className="receipt__rule" />
            {(detail.items || []).map((it, i) => (
              <div key={i} className="receipt__row"><span>{it.qty}× {it.name}</span><span>{ghs(it.price * it.qty)}</span></div>
            ))}
            <div className="receipt__rule" />
            <div className="receipt__row" style={{ fontSize: 15, fontWeight: 700 }}><span>Total</span><span>{ghs(detail.total)}</span></div>
            {detail.notes && <><div className="receipt__rule" /><div className="cell-dim" style={{ fontSize: 12 }}>{detail.notes}</div></>}
          </div>
        </Modal>
      )}
    </div>
  )
}
