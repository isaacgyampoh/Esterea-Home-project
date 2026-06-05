import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ghs } from '../lib/format'
import { cdn } from '../lib/cloudinary'
import { useAsync, toast } from '../lib/hooks'
import { Button, Input, NumberInput, TextArea, Toggle, Spinner, Empty, Badge } from '../ui'
import { PageHeader, Panel, Table } from '../ui/Layout'
import Modal from '../ui/Modal'
import ImageUpload from '../ui/ImageUpload'

const BLANK = { title: '', description: '', price_from: 0, image: '', visible: true, sort: 0 }

export default function Services() {
  const { data, loading, reload } = useAsync(async () => {
    const { data } = await supabase.from('services').select('*').order('sort')
    return data || []
  })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const { id, created_at, ...d } = editing
    const res = id ? await supabase.from('services').update(d).eq('id', id) : await supabase.from('services').insert(d)
    setSaving(false)
    if (res.error) return toast(res.error.message, 'bad')
    toast('Saved', 'good'); setEditing(null); reload()
  }
  async function del(s) { if (!confirm(`Delete "${s.title}"?`)) return; await supabase.from('services').delete().eq('id', s.id); reload() }

  return (
    <div>
      <PageHeader title="Services" subtitle={`${(data || []).length} services offered`} action={<Button icon="plus" onClick={() => setEditing({ ...BLANK })}>Add Service</Button>} />
      <Panel>
        {loading ? <Spinner /> : (
          <Table columns={[{ label: 'Service' }, { label: 'From' }, { label: 'Visible' }, { label: '', align: 'right' }]} rows={data || []}
            empty={<Empty icon="pkg" title="No services yet" sub="Run SERVICES_SETUP.sql, then add or edit your services here." />}
            renderRow={s => (
              <tr key={s.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {s.image ? <img className="rowthumb" src={cdn(s.image, 90)} alt="" /> : <div className="rowthumb rowthumb--ph">E</div>}
                    <div><div style={{ fontWeight: 600 }}>{s.title}</div><div className="cell-dim" style={{ maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.description}</div></div>
                  </div>
                </td>
                <td className="cell-num">{s.price_from > 0 ? ghs(s.price_from) : '—'}</td>
                <td><Badge tone={s.visible ? 'good' : 'dim'}>{s.visible ? 'Live' : 'Hidden'}</Badge></td>
                <td><div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Button variant="line" size="sm" icon="edit" onClick={() => setEditing(s)}>Edit</Button><Button variant="bad" size="sm" icon="trash" onClick={() => del(s)}>Delete</Button></div></td>
              </tr>
            )} />
        )}
      </Panel>

      {editing && (
        <Modal title={editing.id ? 'Edit Service' : 'Add Service'} onClose={() => setEditing(null)}
          footer={<><Button variant="line" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} disabled={saving || !editing.title?.trim()}>{saving ? 'Saving…' : 'Save'}</Button></>}>
          <ImageUpload label="Service Image" value={editing.image} onChange={v => setEditing({ ...editing, image: v })} />
          <div style={{ marginTop: 18 }}>
            <Input label="Service Title" required value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="e.g. Full Room Makeover" />
            <TextArea label="Description" rows={3} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="What this service includes…" />
            <div className="formgrid-2">
              <NumberInput label="Price From (GH₵)" hint="(0 = hide price)" value={editing.price_from} onChange={v => setEditing({ ...editing, price_from: v })} />
              <NumberInput label="Sort Order" step="1" value={editing.sort} onChange={v => setEditing({ ...editing, sort: v })} />
            </div>
            <Toggle on={editing.visible} onToggle={() => setEditing({ ...editing, visible: !editing.visible })} label="Visible on Site" sub="Show this service on the storefront" />
          </div>
        </Modal>
      )}
    </div>
  )
}
