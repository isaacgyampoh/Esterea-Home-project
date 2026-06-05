import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { fmtPhone, fmtDate } from '../lib/format'
import { useAsync, toast } from '../lib/hooks'
import { Button, Input, TextArea, SearchBar, Spinner, Empty } from '../ui'
import { PageHeader, Panel, Table } from '../ui/Layout'
import Modal from '../ui/Modal'

const BLANK = { name: '', phone: '', notes: '' }

export default function Customers() {
  const { data, loading, reload } = useAsync(async () => {
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
    return data || []
  })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const list = (data || []).filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search))

  async function save() {
    setSaving(true)
    const { id, ...d } = editing
    const res = id ? await supabase.from('customers').update(d).eq('id', id) : await supabase.from('customers').insert(d)
    setSaving(false)
    if (res.error) return toast(res.error.message, 'bad')
    toast('Saved', 'good'); setEditing(null); reload()
  }
  async function del(c) { if (!confirm('Delete customer?')) return; await supabase.from('customers').delete().eq('id', c.id); reload() }

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${(data || []).length} registered`} action={<Button icon="plus" onClick={() => setEditing({ ...BLANK })}>Add Customer</Button>} />
      <div className="mb18"><SearchBar value={search} onChange={setSearch} placeholder="Search by name or phone…" /></div>
      <Panel>
        {loading ? <Spinner /> : (
          <Table columns={[{ label: 'Name' }, { label: 'Phone' }, { label: 'Notes' }, { label: 'Added' }, { label: '', align: 'right' }]} rows={list}
            empty={<Empty icon="users" title="No customers yet" sub="Run the SUPABASE_SETUP.sql if this section is unexpectedly empty." />}
            renderRow={c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td className="cell-dim">{fmtPhone(c.phone) || '—'}</td>
                <td className="cell-dim">{c.notes || '—'}</td>
                <td className="cell-dim">{fmtDate(c.created_at)}</td>
                <td><div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Button variant="line" size="sm" icon="edit" onClick={() => setEditing(c)}>Edit</Button><Button variant="bad" size="sm" icon="trash" onClick={() => del(c)}>Delete</Button></div></td>
              </tr>
            )} />
        )}
      </Panel>

      {editing && (
        <Modal title={editing.id ? 'Edit Customer' : 'Add Customer'} onClose={() => setEditing(null)}
          footer={<><Button variant="line" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} disabled={saving || !editing.name?.trim()}>{saving ? 'Saving…' : 'Save'}</Button></>}>
          <Input label="Name" required value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Customer name" />
          <Input label="Phone" value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} placeholder="0XX XXX XXXX" />
          <TextArea label="Notes" hint="(optional)" rows={2} value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
        </Modal>
      )}
    </div>
  )
}
