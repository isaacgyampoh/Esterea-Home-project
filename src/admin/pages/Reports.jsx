import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ghs, today, dayKey, monthKey, sum } from '../lib/format'
import { useAsync } from '../lib/hooks'
import { Tabs, Spinner } from '../ui'
import { PageHeader, Panel, SubCard, Table } from '../ui/Layout'

const PERIODS = [{ value: 'today', label: 'Today' }, { value: 'week', label: 'This Week' }, { value: 'month', label: 'This Month' }, { value: 'all', label: 'All Time' }]

export default function Reports() {
  const { data, loading } = useAsync(async () => {
    const [{ data: sales }, { data: expenses }] = await Promise.all([
      supabase.from('sales').select('total,profit,payment,date,items').eq('voided', false),
      supabase.from('expenses').select('amount,date,category'),
    ])
    return { sales: sales || [], expenses: expenses || [] }
  })
  const [period, setPeriod] = useState('month')
  if (loading || !data) return <Spinner />

  const now = new Date()
  const weekStart = (() => { const d = new Date(now); d.setDate(now.getDate() - 6); return dayKey(d) })()
  const inPeriod = x => {
    if (period === 'all') return true
    if (period === 'today') return x.date?.startsWith(today())
    if (period === 'week') return x.date >= weekStart
    if (period === 'month') return x.date?.startsWith(monthKey(now))
    return true
  }

  const sales = data.sales.filter(inPeriod)
  const expenses = data.expenses.filter(inPeriod)
  const revenue = sum(sales)
  const profit = sum(sales, 'profit')
  const exp = sum(expenses, 'amount')

  // top products
  const prodMap = {}
  sales.forEach(s => (s.items || []).forEach(it => {
    prodMap[it.name] = prodMap[it.name] || { name: it.name, qty: 0, rev: 0 }
    prodMap[it.name].qty += it.qty
    prodMap[it.name].rev += it.price * it.qty
  }))
  const topProducts = Object.values(prodMap).sort((a, b) => b.rev - a.rev).slice(0, 8)

  // expenses by category
  const catMap = {}
  expenses.forEach(e => { catMap[e.category || 'Other'] = (catMap[e.category || 'Other'] || 0) + Number(e.amount || 0) })
  const expCats = Object.entries(catMap).sort((a, b) => b[1] - a[1])

  return (
    <div>
      <PageHeader title="Reports" subtitle="Sales and financial summary" />
      <div className="mb18"><Tabs tabs={PERIODS} value={period} onChange={setPeriod} /></div>

      <div className="subcards mb22">
        <SubCard label="Revenue" value={ghs(revenue)} />
        <SubCard label="Gross Profit" value={ghs(profit)} tone="good" />
        <SubCard label="Expenses" value={ghs(exp)} tone="bad" />
        <SubCard label="Net Profit" value={ghs(profit - exp)} tone={profit - exp >= 0 ? 'good' : 'bad'} />
      </div>

      <div className="grid2">
        <Panel title="Top Products">
          <Table columns={[{ label: 'Product' }, { label: 'Sold' }, { label: 'Revenue' }]} rows={topProducts}
            empty={<div className="state state--spin">No sales in this period</div>}
            renderRow={(p, i) => (<tr key={i}><td style={{ fontWeight: 600 }}>{p.name}</td><td className="cell-num">{p.qty}</td><td className="cell-num">{ghs(p.rev)}</td></tr>)} />
        </Panel>
        <Panel title="Expenses by Category">
          <Table columns={[{ label: 'Category' }, { label: 'Amount' }]} rows={expCats}
            empty={<div className="state state--spin">No expenses in this period</div>}
            renderRow={([c, amt], i) => (<tr key={i}><td style={{ fontWeight: 600 }}>{c}</td><td className="cell-num">{ghs(amt)}</td></tr>)} />
        </Panel>
      </div>
    </div>
  )
}
