import { supabase } from '../lib/supabase'
import { fmtDateTime, fmtPhone } from '../lib/format'
import { useAsync, toast } from '../lib/hooks'
import { Spinner, Empty, Badge, Tabs } from '../ui'
import { PageHeader, Panel, Table } from '../ui/Layout'
import { useState } from 'react'

const STATUSES = ['New', 'Contacted', 'Scheduled', 'Done', 'Cancelled']
const tone = s => ({ New: 'warn', Contacted: 'dim', Scheduled: 'good', Done: 'good', Cancelled: 'bad' }[s] || 'dim')

export default function Bookings() {
  const { data, loading, reload } = useAsync(async () => {
    const { data } = await supabase.from('service_bookings').select('*').order('created_at', { ascending: false })
    return data || []
  })
  const [filter, setFilter] = useState('all')
  const list = (data || []).filter(b => filter === 'all' || b.status === filter)

  async function setStatus(b, status) {
    const { error } = await supabase.from('service_bookings').update({ status }).eq('id', b.id)
    if (error) return toast(error.message, 'bad')
    toast(`Marked ${status}`, 'good'); reload()
  }

  return (
    <div>
      <PageHeader title="Service Bookings" subtitle={`${(data || []).length} requests · ${(data || []).filter(b => b.status === 'New').length} new`} />
      <div className="mb18"><Tabs tabs={[{ value: 'all', label: 'All' }, ...STATUSES.map(s => ({ value: s, label: s }))]} value={filter} onChange={setFilter} /></div>
      <Panel>
        {loading ? <Spinner /> : (
          <Table columns={[{ label: 'When' }, { label: 'Customer' }, { label: 'Service' }, { label: 'Message' }, { label: 'Status' }, { label: 'Update', align: 'right' }]} rows={list}
            empty={<Empty icon="invoice" title="No bookings yet" sub="Run SERVICES_SETUP.sql if this is unexpectedly empty. Requests from the website appear here." />}
            renderRow={b => (
              <tr key={b.id}>
                <td className="cell-dim">{fmtDateTime(b.created_at)}</td>
                <td><div style={{ fontWeight: 600 }}>{b.name}</div><a href={`https://wa.me/233${fmtPhone(b.phone).replace(/^0/, '')}`} target="_blank" rel="noreferrer" className="cell-dim" style={{ color: 'var(--good)' }}>{fmtPhone(b.phone)}</a></td>
                <td>{b.service_title}</td>
                <td className="cell-dim" style={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.message || '—'}</td>
                <td><Badge tone={tone(b.status)}>{b.status}</Badge></td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <select value={b.status} onChange={e => setStatus(b, e.target.value)} className="input input--select" style={{ height: 34, width: 130, fontSize: 12 }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </td>
              </tr>
            )} />
        )}
      </Panel>
    </div>
  )
}
