import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ghs, uniq } from '../lib/format'
import { cdn } from '../lib/cloudinary'
import { useAsync, toast } from '../lib/hooks'
import { Button, Input, NumberInput, TextArea, Combo, Toggle, SearchBar, Tabs, Spinner, Empty } from '../ui'
import { PageHeader, Panel, Table } from '../ui/Layout'
import Modal from '../ui/Modal'
import ImageUpload from '../ui/ImageUpload'

const BLANK = { name: '', category: '', price: 0, cost_price: 0, quantity: 0, image: '', description: '', visible: true, wholesale_price: 0, wholesale_min_qty: 0 }
const stockClass = q => q === 0 ? 'crit' : q <= 3 ? 'crit' : q <= 10 ? 'low' : 'ok'
const stockLabel = q => q === 0 ? 'Out of Stock' : q <= 3 ? 'Critical' : q <= 10 ? 'Low Stock' : 'In Stock'

export default function Products() {
  const { data: products, loading, reload } = useAsync(async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    return data || []
  })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const list = products || []
  const categories = uniq(list.map(p => p.category).filter(Boolean)).sort()

  const filtered = list.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.category || '').toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'active' && !p.visible) return false
    if (filter === 'hidden' && p.visible) return false
    if (filter === 'low' && (p.quantity || 0) > 10) return false
    return true
  })

  async function save() {
    setSaving(true)
    const { id, ...data } = editing
    const res = id
      ? await supabase.from('products').update(data).eq('id', id)
      : await supabase.from('products').insert(data)
    setSaving(false)
    if (res.error) return toast(res.error.message, 'bad')
    toast(id ? 'Product updated' : 'Product added', 'good')
    setEditing(null); reload()
  }
  async function del(p) {
    if (!confirm(`Delete "${p.name}"?`)) return
    const { error } = await supabase.from('products').delete().eq('id', p.id)
    if (error) return toast(error.message, 'bad')
    toast('Product deleted', 'good'); reload()
  }

  const margin = editing && editing.price > 0 && editing.cost_price > 0
    ? `${ghs(editing.price - editing.cost_price)} (${((editing.price - editing.cost_price) / editing.price * 100).toFixed(0)}%)`
    : null

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${list.length} products · ${list.filter(p => (p.quantity || 0) <= 10).length} low/out of stock`}
        action={<Button icon="plus" onClick={() => setEditing({ ...BLANK })}>Add Product</Button>}
      />

      <div className="mb18" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search products…" />
        <Tabs tabs={[{ value: 'all', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'hidden', label: 'Hidden' }, { value: 'low', label: 'Low Stock' }]} value={filter} onChange={setFilter} />
      </div>

      <Panel>
        {loading ? <Spinner /> : (
          <Table
            columns={[{ label: 'Product' }, { label: 'Price' }, { label: 'Margin' }, { label: 'Stock' }, { label: 'Actions', align: 'right' }]}
            rows={filtered}
            empty={<Empty icon="box" title="No products found" sub={search ? 'Try a different search.' : 'Add your first product to get started.'} />}
            renderRow={p => {
              const m = p.price > 0 && p.cost_price > 0 ? ((p.price - p.cost_price) / p.price * 100).toFixed(0) + '%' : '—'
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {p.image ? <img className="rowthumb" src={cdn(p.image, 90)} alt="" /> : <div className="rowthumb rowthumb--ph">E</div>}
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div className="cell-dim">{p.category || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="cell-num">{ghs(p.price)}</td>
                  <td className="cell-dim">{m}</td>
                  <td><span className={`stockpill stockpill--${stockClass(p.quantity || 0)}`}>{p.quantity || 0} · {stockLabel(p.quantity || 0)}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Button variant="line" size="sm" icon="edit" onClick={() => setEditing(p)}>Edit</Button>
                      <Button variant="bad" size="sm" icon="trash" onClick={() => del(p)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              )
            }}
          />
        )}
      </Panel>

      {editing && (
        <Modal
          title={editing.id ? 'Edit Product' : 'Add Product'}
          onClose={() => setEditing(null)}
          footer={<>
            <Button variant="line" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving || !editing.name?.trim()}>{saving ? 'Saving…' : 'Save'}</Button>
          </>}
        >
          <ImageUpload value={editing.image} onChange={v => setEditing({ ...editing, image: v })} />
          <div style={{ marginTop: 18 }}>
            <Input label="Name" required value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Ceramic Vase" />
            <Combo label="Category" options={categories} value={editing.category} onChange={v => setEditing({ ...editing, category: v })} placeholder="Select or type a category…" />
            <TextArea label="Description" hint="(optional)" rows={2} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Short description shown to customers" />
            <div className="formgrid-2">
              <NumberInput label="Cost (GH₵)" value={editing.cost_price} onChange={v => setEditing({ ...editing, cost_price: v })} />
              <NumberInput label="Price (GH₵)" required value={editing.price} onChange={v => setEditing({ ...editing, price: v })} />
            </div>
            {margin && <div style={{ fontSize: 12, color: 'var(--good)', fontWeight: 600, margin: '-6px 0 14px' }}>Margin: {margin}</div>}
            <div className="formgrid-3">
              <NumberInput label="Wholesale Price" value={editing.wholesale_price} onChange={v => setEditing({ ...editing, wholesale_price: v })} />
              <NumberInput label="Min Qty" step="1" value={editing.wholesale_min_qty} onChange={v => setEditing({ ...editing, wholesale_min_qty: v })} />
              <NumberInput label="Stock" step="1" value={editing.quantity} onChange={v => setEditing({ ...editing, quantity: v })} />
            </div>
            <Toggle on={editing.visible} onToggle={() => setEditing({ ...editing, visible: !editing.visible })} label="Visible in Store" sub="Customers can see and buy this product" />
          </div>
        </Modal>
      )}
    </div>
  )
}
