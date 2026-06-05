import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ghs, fmtDate, today, sum } from '../lib/format'
import { useAsync, toast } from '../lib/hooks'
import { Button, Input, NumberInput, Select, TextArea, Spinner, Empty } from '../ui'
import { PageHeader, Panel, Table } from '../ui/Layout'
import Modal from '../ui/Modal'

const BLANK = { order_ref: '', amount: 0, method: 'Cash', reason: '', date: today() }

export default function Refunds({ session }) {
  const { data, loading, reload } = useAsync(async () => {
    const { data } = await supabase.from('refunds').select('*').order('date', { ascending: false })
    return data || []
  })
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const list = data || []

  async function save() {
    setSaving(true)
    const res = await supabase.from('refunds').insert({ ...form, staff_id: session?.id || null, staff_name: session?.name || 'Admin' })
    setSaving(false)
    if (res.error) return toast(res.error.message, 'bad')
    toast('Refund issued', 'good'); setModal(false); setForm(BLANK); reload()
  }

  return (
    <div>
      <PageHeader title="Refunds" subtitle={`${list.length} issued · ${ghs(sum(list, 'amount'))} total`} action={<Button icon="plus" onClick={() => { setForm(BLANK); setModal(true) }}>Issue Refund</Button>} />
      <Panel>
        {loading ? <Spinner /> : (
          <Table columns={[{ label: 'Date' }, { label: 'Reference' }, { label: 'Method' }, { label: 'Reason' }, { label: 'Amount' }]} rows={list}
            empty={<Empty icon="refund" title="No refunds yet" sub="Run the SUPABASE_SETUP.sql if this section is unexpectedly empty." />}
            renderRow={r => (
              <tr key={r.id}>
                <td className="cell-dim">{fmtDate(r.date)}</td>
                <td className="cell-mono">{r.order_ref}</td>
                <td className="cell-dim">{r.method}</td>
                <td className="cell-dim">{r.reason || '—'}</td>
                <td className="cell-num" style={{ color: 'var(--bad)' }}>−{ghs(r.amount)}</td>
              </tr>
            )} />
        )}
      </Panel>

      {modal && (
        <Modal title="Issue Refund" onClose={() => setModal(false)}
          footer={<><Button variant="line" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save} disabled={saving || !form.order_ref || !form.amount}>{saving ? 'Saving…' : 'Issue Refund'}</Button></>}>
          <Input label="Order / Receipt Reference" required value={form.order_ref} onChange={e => setForm({ ...form, order_ref: e.target.value })} placeholder="e.g. POS-ABC123" />
          <NumberInput label="Refund Amount (GH₵)" required value={form.amount} onChange={v => setForm({ ...form, amount: v })} />
          <Select label="Refund Method" options={['Cash', 'MoMo', 'Paystack', 'Bank']} value={form.method} onChange={v => setForm({ ...form, method: v })} />
          <TextArea label="Reason" hint="(optional)" rows={2} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
          <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        </Modal>
      )}
    </div>
  )
}
