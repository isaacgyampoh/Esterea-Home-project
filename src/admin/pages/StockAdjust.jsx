import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { fmtDateTime, isoNow } from '../lib/format'
import { useAsync, toast } from '../lib/hooks'
import { Button, Select, NumberInput, TextArea, Spinner, Empty, Badge } from '../ui'
import { PageHeader, Panel, Table } from '../ui/Layout'
import Modal from '../ui/Modal'

export default function StockAdjust() {
  const { data, loading, reload } = useAsync(async () => {
    const [{ data: products }, { data: history }] = await Promise.all([
      supabase.from('products').select('id,name,quantity').order('name'),
      supabase.from('stock_adjustments').select('*, products(name)').order('created_at', { ascending: false }).limit(50),
    ])
    return { products: products || [], history: history || [] }
  })
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ product_id: '', delta: 0, reason: '' })
  const [saving, setSaving] = useState(false)
  if (loading || !data) return <Spinner />

  async function save() {
    setSaving(true)
    const p = data.products.find(x => x.id === form.product_id)
    const newQty = Math.max(0, (p?.quantity || 0) + Number(form.delta))
    const r1 = await supabase.from('stock_adjustments').insert({ product_id: form.product_id, delta: Number(form.delta), reason: form.reason, created_at: isoNow() })
    const r2 = await supabase.from('products').update({ quantity: newQty }).eq('id', form.product_id)
    setSaving(false)
    if (r1.error || r2.error) return toast((r1.error || r2.error).message, 'bad')
    toast('Stock adjusted', 'good'); setModal(false); setForm({ product_id: '', delta: 0, reason: '' }); reload()
  }

  return (
    <div>
      <PageHeader title="Stock & Adjust" subtitle="Manual stock corrections (damage, count, loss)" action={<Button icon="plus" onClick={() => setModal(true)}>New Adjustment</Button>} />
      <Panel title="Recent Adjustments">
        <Table columns={[{ label: 'When' }, { label: 'Product' }, { label: 'Change' }, { label: 'Reason' }]} rows={data.history}
          empty={<Empty icon="adjust" title="No adjustments yet" sub="Run the SUPABASE_SETUP.sql if this section is unexpectedly empty." />}
          renderRow={h => (
            <tr key={h.id}>
              <td className="cell-dim">{fmtDateTime(h.created_at)}</td>
              <td style={{ fontWeight: 600 }}>{h.products?.name || '—'}</td>
              <td><Badge tone={h.delta >= 0 ? 'good' : 'bad'}>{h.delta >= 0 ? '+' : ''}{h.delta}</Badge></td>
              <td className="cell-dim">{h.reason || '—'}</td>
            </tr>
          )} />
      </Panel>

      {modal && (
        <Modal title="Stock Adjustment" onClose={() => setModal(false)}
          footer={<><Button variant="line" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save} disabled={saving || !form.product_id || !form.delta}>{saving ? 'Saving…' : 'Apply'}</Button></>}>
          <Select label="Product" required placeholder="Select…" options={data.products.map(p => ({ value: p.id, label: `${p.name} (${p.quantity || 0})` }))} value={form.product_id} onChange={v => setForm({ ...form, product_id: v })} />
          <NumberInput label="Change (use negative to reduce)" required step="1" value={form.delta} onChange={v => setForm({ ...form, delta: v })} />
          <TextArea label="Reason" rows={2} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Damaged in storage, stock count correction" />
        </Modal>
      )}
    </div>
  )
}
