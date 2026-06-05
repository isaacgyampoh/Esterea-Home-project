import { supabase } from '../lib/supabase'
import { ghs, today, dayKey, monthKey, sum, greeting, fmtDate } from '../lib/format'
import { cdn } from '../lib/cloudinary'
import { useAsync } from '../lib/hooks'
import { Spinner, Empty } from '../ui'
import { StatCard, SubCard, Panel, AlertBanner } from '../ui/Layout'

async function loadDashboard() {
  const t = today()
  const now = new Date()
  const weekStart = (() => { const d = new Date(now); d.setDate(now.getDate() - 6); return dayKey(d) })()
  const mKey = monthKey(now)

  const [{ data: prods }, { data: sales }, { data: expenses }] = await Promise.all([
    supabase.from('products').select('name,quantity,price,cost_price,category,image'),
    supabase.from('sales').select('total,profit,payment,date,receipt_no,customer_name').eq('voided', false).order('date', { ascending: false }),
    supabase.from('expenses').select('amount,date'),
  ])
  const pr = prods || [], s = sales || [], e = expenses || []

  const inDay = x => x.date?.startsWith(t)
  const inWeek = x => x.date >= weekStart
  const inMonth = x => x.date?.startsWith(mKey)

  const todaySales = s.filter(inDay), weekSales = s.filter(inWeek), monthSales = s.filter(inMonth)

  // 7-day chart
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i)
    const key = dayKey(d)
    days.push({ key, label: d.toLocaleDateString('en-GH', { weekday: 'short' }), val: sum(s.filter(x => x.date?.startsWith(key))), today: i === 0 })
  }

  // payment split
  const pays = { Cash: 0, MoMo: 0, Paystack: 0, Split: 0 }
  monthSales.forEach(x => { const p = x.payment || 'Cash'; pays[p] = (pays[p] || 0) + Number(x.total || 0) })
  const payTotal = Object.values(pays).reduce((a, b) => a + b, 0) || 1

  const monthRev = sum(monthSales)
  const monthExp = sum(e.filter(inMonth), 'amount')

  return {
    today: sum(todaySales), todayCount: todaySales.length,
    week: sum(weekSales), weekCount: weekSales.length,
    month: monthRev, monthCount: monthSales.length,
    allTime: sum(s), allCount: s.length,
    todayProfit: sum(todaySales, 'profit'),
    profitMargin: monthRev > 0 ? (sum(monthSales, 'profit') / monthRev * 100) : 0,
    stockVal: pr.reduce((a, x) => a + Number(x.cost_price || x.price || 0) * Number(x.quantity || 0), 0),
    outCount: pr.filter(x => (x.quantity || 0) === 0).length,
    days, pays, payTotal, monthExp,
    netProfit: sum(monthSales, 'profit') - monthExp,
    recent: s.slice(0, 6),
    lowStock: pr.filter(x => (x.quantity || 0) <= 10).sort((a, b) => (a.quantity || 0) - (b.quantity || 0)).slice(0, 6),
    lowCount: pr.filter(x => (x.quantity || 0) <= 10).length,
  }
}

export default function Dashboard({ onNav }) {
  const { data: d, loading } = useAsync(loadDashboard)
  if (loading || !d) return <Spinner />

  const maxBar = Math.max(...d.days.map(x => x.val), 1)
  const PAYS = [['Cash', d.pays.Cash], ['MoMo', d.pays.MoMo], ['Paystack', d.pays.Paystack], ['Split', d.pays.Split]]

  return (
    <div>
      <div className="mb18">
        <h1 className="pagehead__title">{greeting()}, Admin</h1>
        <p className="pagehead__sub">{fmtDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {d.outCount > 0 && <div className="mb18"><AlertBanner count={d.outCount} label="Products out of stock" onClick={() => onNav('products')} /></div>}

      <div className="statcards mb18">
        <StatCard index={0} label="Today" value={ghs(d.today)} sub={`${d.todayCount} sales`} />
        <StatCard index={1} label="This Week" value={ghs(d.week)} sub={`${d.weekCount} sales`} />
        <StatCard index={2} label="This Month" value={ghs(d.month)} sub={`${d.monthCount} sales`} />
        <StatCard index={3} label="All Time" value={ghs(d.allTime)} sub={`${d.allCount} total`} />
      </div>

      <div className="subcards mb22">
        <SubCard label="Today's Profit" value={ghs(d.todayProfit)} />
        <SubCard label="Net Today" value={ghs(d.todayProfit)} />
        <SubCard label="Profit Margin" value={`${d.profitMargin.toFixed(1)}%`} tone={d.profitMargin > 0 ? 'good' : 'bad'} />
        <SubCard label="Stock Value" value={ghs(d.stockVal)} />
      </div>

      <div className="grid2-wide mb22">
        <Panel title="Last 7 Days Revenue" pad>
          <div className="chart">
            {d.days.map((day, i) => (
              <div key={i} className="chart__col">
                <div className="chart__barwrap">
                  <div className="chart__bar" style={{ height: `${Math.max(day.val / maxBar * 100, 1)}%` }}>
                    {day.val > 0 && <span className="chart__val">{day.val.toFixed(0)}</span>}
                  </div>
                </div>
                <div className={`chart__label${day.today ? ' chart__label--on' : ''}`}>{day.label}</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Payment Split (This Month)" pad>
          {PAYS.map(([name, val]) => (
            <div key={name} className="split">
              <div className="split__top"><span className="split__name">{name}</span><span className="split__val">{ghs(val)} ({(val / d.payTotal * 100).toFixed(0)}%)</span></div>
              <div className="split__bar"><div className="split__fill" style={{ width: `${val / d.payTotal * 100}%` }} /></div>
            </div>
          ))}
          <div className="split__foot">
            <div className="split__footrow"><span className="cell-dim">Month Expenses</span><span style={{ color: 'var(--bad)', fontWeight: 600 }}>{ghs(d.monthExp)}</span></div>
            <div className="split__footrow"><span className="cell-dim">Net Profit</span><span style={{ color: 'var(--good)', fontWeight: 600 }}>{ghs(d.netProfit)}</span></div>
          </div>
        </Panel>
      </div>

      <Panel title="Quick Actions" pad>
        <div className="qa">
          {[['New Sale', 'pos'], ['Products', 'products'], ['Reports', 'reports'], ['Expenses', 'expenses'], ['Stock Take', 'stock'], ['Receipts', 'receipts']].map(([l, t]) => (
            <button key={l} className="qa__btn" onClick={() => onNav(t)}>{l}</button>
          ))}
        </div>
      </Panel>

      <div className="grid2" style={{ marginTop: 22 }}>
        <Panel title="Recent Sales" link={{ label: 'View all →', onClick: () => onNav('receipts') }}>
          {d.recent.length === 0 ? <Empty icon="receipt" title="No sales yet" /> : d.recent.map((s, i) => (
            <div key={i} className="lrow">
              <div className="lrow__thumb">E</div>
              <div className="lrow__main"><div className="lrow__title">{s.receipt_no || 'Sale'}</div><div className="lrow__sub">{s.customer_name || 'Walk-in'}</div></div>
              <div className="lrow__val">{ghs(s.total)}</div>
            </div>
          ))}
        </Panel>
        <Panel title="Low Stock" count={d.lowCount}>
          {d.lowStock.length === 0 ? <Empty icon="box" title="All stock healthy" /> : d.lowStock.map((p, i) => (
            <div key={i} className="lrow">
              {p.image ? <img src={cdn(p.image, 80)} className="lrow__thumb" alt="" /> : <div className="lrow__thumb">E</div>}
              <div className="lrow__main"><div className="lrow__title">{p.name}</div><div className="lrow__sub">{p.category || '—'}</div></div>
              {(p.quantity || 0) === 0 ? <span className="lrow__out">OUT</span> : <span className="lrow__qty">{p.quantity}</span>}
            </div>
          ))}
        </Panel>
      </div>
    </div>
  )
}
