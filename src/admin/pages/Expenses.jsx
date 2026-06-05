import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ghs, today, fmtDate, sum, uniq } from '../lib/format'
import { useAsync, toast } from '../lib/hooks'
import { Button, Input, NumberInput, Combo, TextArea, Tabs, Spinner, Empty } from '../ui'
import { PageHeader, Panel, Table, SubCard } from '../ui/Layout'
import Modal from '../ui/Modal'

const BLANK = { category: '', amount: 0, date: today(), notes: '' }

export default function Expenses() {
  const { data, loading, reload } = useAsync(async () => {
    const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false })
    return data || []
  })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [cat, setCat] = useState('all')

  const list = data || []
  const cats = ['all', ...uniq(list.map(e => e.category).filter(Boolean))]
  const shown = cat === 'all' ? list : list.filter(e => e.category === cat)
  const monthTotal = sum(list.filter(e => e.date?.startsWith(today().slice(0, 7))), 'amount')

  async function save() {
    setSaving(true)
    const { id, ...d } = editing
    const res = id ? await supabase.from('expenses').update(d).eq('id', id) : await supabase.from('expenses').insert(d)
    setSaving(false)
    if (res.error) return toast(res.error.message, 'bad')
    toast('Saved', 'good'); setEditing(null); reload()
  }
  async function del(e) {
    if (!confirm('Delete this expense?')) return
    await supabase.from('expenses').delete().eq('id', e.id); reload()
  }

  return (
    <div>
      <PageHeader title="Expenses" subtitle={`${list.length} recorded`} action={<Button icon="plus" onClick={() => setEditing({ ...BLANK })}>Add Expense</Button>} />
      <div className="subcards mb18" style={{ gridTemplateColumns: 'repeat(2,minmax(0,260px))' }}>
        <SubCard label="This Month" value={ghs(monthTotal)} />
        <SubCard label="All Time" value={ghs(sum(list, 'amount'))} />
      </div>
      <div className="mb18"><Tabs tabs={cats.map(c => ({ value: c, label: c === 'all' ? 'All' : c }))} value={cat} onChange={setCat} /></div>
      <Panel>
        {loading ? <Spinner /> : (
          <Table
            columns={[{ label: 'Date' }, { label: 'Category' }, { label: 'Notes' }, { label: 'Amount' }, { label: '', align: 'right' }]}
            rows={shown}
            empty={<Empty icon="expense" title="No expenses yet" />}
            renderRow={e => (
              <tr key={e.id}>
                <td className="cell-dim">{fmtDate(e.date)}</td>
                <td style={{ fontWeight: 600 }}>{e.category || '—'}</td>
                <td className="cell-dim">{e.notes || '—'}</td>
                <td className="cell-num">{ghs(e.amount)}</td>
                <td><div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Button variant="line" size="sm" icon="edit" onClick={() => setEditing(e)}>Edit</Button><Button variant="bad" size="sm" icon="trash" onClick={() => del(e)}>Delete</Button></div></td>
              </tr>
            )}
          />
        )}
      </Panel>

      {editing && (
        <Modal title={editing.id ? 'Edit Expense' : 'New Expense'} onClose={() => setEditing(null)}
          footer={<><Button variant="line" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} disabled={saving || !editing.amount}>{saving ? 'Saving…' : 'Save'}</Button></>}>
          <Combo label="Category" options={uniq(list.map(e => e.category).filter(Boolean))} value={editing.category} onChange={v => setEditing({ ...editing, category: v })} placeholder="e.g. Rent, Transport, Supplies" />
          <NumberInput label="Amount (GH₵)" required value={editing.amount} onChange={v => setEditing({ ...editing, amount: v })} />
          <Input label="Date" type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} />
          <TextArea label="Notes" hint="(optional)" rows={2} value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
        </Modal>
      )}
    </div>
  )
}
