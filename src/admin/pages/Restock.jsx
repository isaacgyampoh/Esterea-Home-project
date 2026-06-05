import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ghs, fmtDate, isoNow } from '../lib/format'
import { useAsync, toast } from '../lib/hooks'
import { Button, Select, NumberInput, Spinner, Empty } from '../ui'
import { PageHeader, Panel, Table } from '../ui/Layout'
import Modal from '../ui/Modal'

export default function Restock() {
  const { data, loading, reload } = useAsync(async () => {
    const { data: products } = await supabase.from('products').select('id,name,quantity').order('name')
    return { products: products || [] }
  })
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ product_id: '', qty: 0, cost: 0 })
  const [saving, setSaving] = useState(false)
  if (loading || !data) return <Spinner />

  async function save() {
    setSaving(true)
    const p = data.products.find(x => x.id === form.product_id)
    const res = await supabase.from('products').update({ quantity: (p?.quantity || 0) + Number(form.qty) }).eq('id', form.product_id)
    setSaving(false)
    if (res.error) return toast(res.error.message, 'bad')
    toast(`Restocked +${form.qty}`, 'good'); setModal(false); setForm({ product_id: '', qty: 0, cost: 0 }); reload()
  }

  return (
    <div>
      <PageHeader title="Restock" subtitle="Add incoming stock to products" action={<Button icon="plus" onClick={() => setModal(true)}>Record Restock</Button>} />
      <Panel title="Current Stock">
        <Table columns={[{ label: 'Product' }, { label: 'In Stock' }, { label: '', align: 'right' }]} rows={data.products} empty={<Empty icon="truck" title="No products" />}
          renderRow={p => (
            <tr key={p.id}>
              <td style={{ fontWeight: 600 }}>{p.name}</td>
              <td className="cell-num">{p.quantity || 0}</td>
              <td><div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button variant="line" size="sm" icon="plus" onClick={() => { setForm({ product_id: p.id, qty: 0, cost: 0 }); setModal(true) }}>Restock</Button></div></td>
            </tr>
          )} />
      </Panel>

      {modal && (
        <Modal title="Record Restock" onClose={() => setModal(false)}
          footer={<><Button variant="line" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save} disabled={saving || !form.product_id || !form.qty}>{saving ? 'Saving…' : 'Record Restock'}</Button></>}>
          <Select label="Product" required placeholder="Select…" options={data.products.map(p => ({ value: p.id, label: `${p.name} (${p.quantity || 0} in stock)` }))} value={form.product_id} onChange={v => setForm({ ...form, product_id: v })} />
          <NumberInput label="Quantity Added" required step="1" value={form.qty} onChange={v => setForm({ ...form, qty: v })} />
          <NumberInput label="Unit Cost (GH₵)" hint="(optional)" value={form.cost} onChange={v => setForm({ ...form, cost: v })} />
        </Modal>
      )}
    </div>
  )
}
