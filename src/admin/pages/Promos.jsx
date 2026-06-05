import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ghs, fmtDate } from '../lib/format'
import { useAsync, toast } from '../lib/hooks'
import { Button, Input, NumberInput, Select, Spinner, Empty } from '../ui'
import { PageHeader, Panel, Table } from '../ui/Layout'
import Modal from '../ui/Modal'

const BLANK = { product_id: '', price: 0, label: '', end_date: '' }

export default function Promos() {
  const { data, loading, reload } = useAsync(async () => {
    const [{ data: promos }, { data: products }] = await Promise.all([
      supabase.from('promos').select('*, products(name)').order('end_date', { ascending: false }),
      supabase.from('products').select('id,name,price').order('name'),
    ])
    return { promos: promos || [], products: products || [] }
  })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  if (loading || !data) return <Spinner />

  const now = new Date().toISOString()
  const active = data.promos.filter(p => p.end_date > now)
  const expired = data.promos.filter(p => p.end_date <= now)

  async function save() {
    setSaving(true)
    const { id, products, ...d } = editing
    const res = id ? await supabase.from('promos').update(d).eq('id', id) : await supabase.from('promos').insert(d)
    setSaving(false)
    if (res.error) return toast(res.error.message, 'bad')
    toast('Promo saved', 'good'); setEditing(null); reload()
  }
  async function del(p) { if (!confirm('Delete promo?')) return; await supabase.from('promos').delete().eq('id', p.id); reload() }

  const row = p => (
    <tr key={p.id}>
      <td style={{ fontWeight: 600 }}>{p.products?.name || '—'}</td>
      <td className="cell-num">{ghs(p.price)}</td>
      <td className="cell-dim">{p.label || '—'}</td>
      <td className="cell-dim">{fmtDate(p.end_date)}</td>
      <td><div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Button variant="line" size="sm" icon="edit" onClick={() => setEditing(p)}>Edit</Button><Button variant="bad" size="sm" icon="trash" onClick={() => del(p)}>Delete</Button></div></td>
    </tr>
  )

  return (
    <div>
      <PageHeader title="Promos & Bundles" subtitle={`${active.length} active · ${expired.length} expired`} action={<Button icon="plus" onClick={() => setEditing({ ...BLANK })}>Add Promo</Button>} />
      <Panel title="Active Promos" pad={false}>
        <Table columns={[{ label: 'Product' }, { label: 'Promo Price' }, { label: 'Label' }, { label: 'Ends' }, { label: '', align: 'right' }]} rows={active} empty={<Empty icon="tag" title="No active promos" />} renderRow={row} />
      </Panel>
      {expired.length > 0 && <div style={{ marginTop: 18 }}><Panel title="Expired"><Table columns={[{ label: 'Product' }, { label: 'Promo Price' }, { label: 'Label' }, { label: 'Ended' }, { label: '', align: 'right' }]} rows={expired} renderRow={row} /></Panel></div>}

      {editing && (
        <Modal title={editing.id ? 'Edit Promo' : 'Add Promo / Sale Price'} onClose={() => setEditing(null)}
          footer={<><Button variant="line" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} disabled={saving || !editing.product_id || !editing.price || !editing.end_date}>{saving ? 'Saving…' : 'Save Promo'}</Button></>}>
          <Select label="Product" required placeholder="Select…" options={data.products.map(p => ({ value: p.id, label: `${p.name} (${ghs(p.price)})` }))} value={editing.product_id} onChange={v => setEditing({ ...editing, product_id: v })} />
          <NumberInput label="Promo Price (GH₵)" required value={editing.price} onChange={v => setEditing({ ...editing, price: v })} />
          <Input label="Label" value={editing.label} onChange={e => setEditing({ ...editing, label: e.target.value })} placeholder="e.g. Flash Sale, Bundle Deal" />
          <Input label="End Date & Time" required type="datetime-local" value={editing.end_date?.slice(0, 16)} onChange={e => setEditing({ ...editing, end_date: new Date(e.target.value).toISOString() })} />
        </Modal>
      )}
    </div>
  )
}
