import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAsync, toast } from '../lib/hooks'
import { setAdminPassword } from '../lib/auth'
import { Button, Input, Select, Toggle, Spinner, Empty, Badge } from '../ui'
import { PageHeader, Panel, Table } from '../ui/Layout'
import Modal from '../ui/Modal'

const BLANK = { name: '', role: 'Cashier', phone: '', pin: '', active: true }
const ROLES = ['Manager', 'Staff', 'Cashier']

export default function Staff({ session }) {
  const { data, loading, reload } = useAsync(async () => {
    const { data } = await supabase.from('staff').select('*').order('name')
    return data || []
  })
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [pwModal, setPwModal] = useState(false)

  async function save() {
    if (form.pin && !/^\d{4,6}$/.test(form.pin)) return toast('PIN must be 4-6 digits', 'bad')
    if (form.pin) {
      const clash = (data || []).find(s => s.pin === form.pin && s.id !== form.id)
      if (clash) return toast(`PIN already used by ${clash.name}`, 'bad')
    }
    setSaving(true)
    const { id, ...d } = form
    const res = id ? await supabase.from('staff').update(d).eq('id', id) : await supabase.from('staff').insert(d)
    setSaving(false)
    if (res.error) return toast(res.error.message, 'bad')
    toast('Saved', 'good'); setModal(false); reload()
  }
  async function del(s) { if (!confirm(`Remove ${s.name}?`)) return; await supabase.from('staff').delete().eq('id', s.id); reload() }
  async function toggleActive(s) { await supabase.from('staff').update({ active: !s.active }).eq('id', s.id); reload() }

  return (
    <div>
      <PageHeader
        title="Staff & Access"
        subtitle={`${(data || []).length} members · staff sign in with their PIN`}
        action={<div style={{ display: 'flex', gap: 10 }}>
          <Button variant="line" icon="staff" onClick={() => setPwModal(true)}>Change Admin Password</Button>
          <Button icon="plus" onClick={() => { setForm(BLANK); setModal(true) }}>Add Staff</Button>
        </div>}
      />

      <div style={{ background: 'var(--line-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 18px', marginBottom: 18, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
        <b style={{ color: 'var(--ink)' }}>How access works:</b> Managers see everything. Staff &amp; Cashiers can only use POS, Receipts, Online Orders &amp; Refunds. Each person signs in with their own PIN, and every sale records who made it.
      </div>

      <Panel>
        {loading ? <Spinner /> : (
          <Table columns={[{ label: 'Name' }, { label: 'Role' }, { label: 'PIN' }, { label: 'Phone' }, { label: 'Status' }, { label: '', align: 'right' }]} rows={data || []}
            empty={<Empty icon="staff" title="No staff yet" sub="Run AUTH_SETUP.sql, then add your first staff member." />}
            renderRow={s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td className="cell-dim">{s.role}</td>
                <td><span className="cell-mono" style={{ fontSize: 13, letterSpacing: '.15em' }}>{s.pin || '—'}</span></td>
                <td className="cell-dim">{s.phone || '—'}</td>
                <td><button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} onClick={() => toggleActive(s)}><Badge tone={s.active ? 'good' : 'dim'}>{s.active ? 'Active' : 'Inactive'}</Badge></button></td>
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
          <Input label="Login PIN" hint="(4-6 digits)" inputMode="numeric" value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="e.g. 1234" />
          <Input label="Phone" hint="(optional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0XX XXX XXXX" />
          <Toggle on={form.active} onToggle={() => setForm({ ...form, active: !form.active })} label="Active" sub="Inactive staff can't sign in" />
        </Modal>
      )}

      {pwModal && <ChangePasswordModal onClose={() => setPwModal(false)} />}
    </div>
  )
}

function ChangePasswordModal({ onClose }) {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [saving, setSaving] = useState(false)
  async function save() {
    if (pw.length < 5) return toast('Password must be at least 5 characters', 'bad')
    if (pw !== pw2) return toast('Passwords do not match', 'bad')
    setSaving(true)
    const err = await setAdminPassword(pw)
    setSaving(false)
    if (err) return toast(err.message, 'bad')
    toast('Admin password updated', 'good'); onClose()
  }
  return (
    <Modal title="Change Admin Password" onClose={onClose} size="sm"
      footer={<><Button variant="line" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving || !pw}>{saving ? 'Saving…' : 'Update Password'}</Button></>}>
      <p style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 16, lineHeight: 1.5 }}>This is the password the owner/admin uses to sign in with full access.</p>
      <Input label="New Password" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="New password" />
      <Input label="Confirm Password" type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Re-enter password" />
    </Modal>
  )
}
