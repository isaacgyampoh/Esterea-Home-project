import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAsync, toast } from '../lib/hooks'
import { Button, Input, Select, Spinner, Empty, Badge } from '../ui'
import { PageHeader, Panel, Table } from '../ui/Layout'
import Modal from '../ui/Modal'

const BLANK = { name: '', role: 'Staff', phone: '', active: true }
const ROLES = ['Owner', 'Manager', 'Staff', 'Cashier']

export default function Staff() {
  const { data, loading, reload } = useAsync(async () => {
    const { data } = await supabase.from('staff').select('*').order('name')
    return data || []
  })
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const { id, ...d } = form
    const res = id ? await supabase.from('staff').update(d).eq('id', id) : await supabase.from('staff').insert(d)
    setSaving(false)
    if (res.error) return toast(res.error.message, 'bad')
    toast('Saved', 'good'); setModal(false); reload()
  }
  async function del(s) { if (!confirm('Remove staff member?')) return; await supabase.from('staff').delete().eq('id', s.id); reload() }

  return (
    <div>
      <PageHeader title="Staff" subtitle={`${(data || []).length} members`} action={<Button icon="plus" onClick={() => { setForm(BLANK); setModal(true) }}>Add Staff</Button>} />
      <Panel>
        {loading ? <Spinner /> : (
          <Table columns={[{ label: 'Name' }, { label: 'Role' }, { label: 'Phone' }, { label: 'Status' }, { label: '', align: 'right' }]} rows={data || []}
            empty={<Empty icon="staff" title="No staff yet" sub="Run the SUPABASE_SETUP.sql if this section is unexpectedly empty." />}
            renderRow={s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td className="cell-dim">{s.role}</td>
                <td className="cell-dim">{s.phone || '—'}</td>
                <td><Badge tone={s.active ? 'good' : 'dim'}>{s.active ? 'Active' : 'Inactive'}</Badge></td>
                <td><div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Button variant="line" size="sm" icon="edit" onClick={() => { setForm(s); setModal(true) }}>Edit</Button><Button variant="bad" size="sm" icon="trash" onClick={() => del(s)}>Delete</Button></div></td>
              </tr>
            )} />
        )}
      </Panel>

      {modal && (
        <Modal title={form.id ? 'Edit Staff' : 'Add Staff Member'} onClose={() => setModal(false)}
          footer={<><Button variant="line" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save} disabled={saving || !form.name.trim()}>{saving ? 'Saving…' : 'Save'}</Button></>}>
          <Input label="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          <Select label="Role" options={ROLES} value={form.role} onChange={v => setForm({ ...form, role: v })} />
          <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0XX XXX XXXX" />
        </Modal>
      )}
    </div>
  )
}
