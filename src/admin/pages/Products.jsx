import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { ghs, uniq } from '../lib/format'
import { cdn, uploadImage } from '../lib/cloudinary'
import { DEFAULT_CATEGORIES } from '../lib/categories'
import { useAsync, toast } from '../lib/hooks'
import { Button, Input, NumberInput, TextArea, Combo, Toggle, SearchBar, Tabs, Spinner, Empty } from '../ui'
import { PageHeader, Panel, Table } from '../ui/Layout'
import Modal from '../ui/Modal'
import ImageUpload from '../ui/ImageUpload'

const BLANK = { name: '', category: '', price: 0, cost_price: 0, quantity: 0, image: '', description: '', visible: true, wholesale_price: 0, wholesale_min_qty: 0, variant_label: '', variants: [] }
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
  const categories = uniq([...DEFAULT_CATEGORIES, ...list.map(p => p.category).filter(Boolean)]).sort()

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
    // if variable, total stock = sum of variant stock; clean empty variants
    if (data.variants?.length > 0) {
      data.variants = data.variants.filter(v => v.name?.trim())
      data.quantity = data.variants.reduce((a, v) => a + Number(v.quantity || 0), 0)
    }
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
              <NumberInput label="Stock" step="1" value={editing.quantity} onChange={v => setEditing({ ...editing, quantity: v })} disabled={editing.variants?.length > 0} />
            </div>
            {editing.variants?.length > 0 && <div style={{ fontSize: 11, color: 'var(--ink-3)', margin: '-8px 0 14px' }}>Stock is managed per variant below.</div>}

            <VariantsEditor editing={editing} setEditing={setEditing} />

            <Toggle on={editing.visible} onToggle={() => setEditing({ ...editing, visible: !editing.visible })} label="Visible in Store" sub="Customers can see and buy this product" />
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ─── Variants editor (Color/Size/etc — each with own image & stock) ─── */
function VariantsEditor({ editing, setEditing }) {
  const variants = editing.variants || []
  const setVariants = v => setEditing({ ...editing, variants: v })
  const add = () => setVariants([...variants, { name: '', image: '', quantity: 0 }])
  const update = (i, patch) => setVariants(variants.map((v, idx) => idx === i ? { ...v, ...patch } : v))
  const remove = i => setVariants(variants.filter((_, idx) => idx !== i))

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 16, marginBottom: 15 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: variants.length ? 12 : 0 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Variants</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>For products with options like color or size</div>
        </div>
        <Button variant="line" size="sm" icon="plus" onClick={add}>Add Variant</Button>
      </div>

      {variants.length > 0 && (
        <>
          <Input label="Option name" value={editing.variant_label} onChange={e => setEditing({ ...editing, variant_label: e.target.value })} placeholder="e.g. Color, Size, Material" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {variants.map((v, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--line-2)', borderRadius: 10, padding: 10 }}>
                <VariantImage value={v.image} onChange={img => update(i, { image: img })} />
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 90px', gap: 8 }}>
                  <input className="input" value={v.name} onChange={e => update(i, { name: e.target.value })} placeholder={`${editing.variant_label || 'Variant'} name`} style={{ height: 36 }} />
                  <input className="input input--num" type="number" min="0" value={v.quantity === 0 ? '' : v.quantity} onChange={e => update(i, { quantity: Number(e.target.value) || 0 })} placeholder="Stock" style={{ height: 36 }} />
                </div>
                <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bad)', padding: 6, flexShrink: 0 }}>✕</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* compact 48px image picker for a variant */
function VariantImage({ value, onChange }) {
  const [busy, setBusy] = useState(false)
  const ref = useRef()
  async function handle(file) {
    if (!file) return
    setBusy(true)
    try { onChange(await uploadImage(file)) } catch (e) { toast(e.message, 'bad') }
    setBusy(false)
  }
  return (
    <>
      <button type="button" onClick={() => !busy && ref.current?.click()} style={{ width: 48, height: 48, borderRadius: 8, background: '#fff', border: '1px solid var(--line)', overflow: 'hidden', flexShrink: 0, cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0 }}>
        {busy ? <span style={{ fontSize: 9 }}>…</span> : value ? <img src={cdn(value, 100)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 18, color: 'var(--ink-3)' }}>+</span>}
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={e => { handle(e.target.files[0]); e.target.value = '' }} />
    </>
  )
}
