import Icon from './Icon'

/* ─── Page header (title + optional action) ─── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="pagehead">
      <div>
        <h1 className="pagehead__title">{title}</h1>
        {subtitle && <p className="pagehead__sub">{subtitle}</p>}
      </div>
      {action && <div className="pagehead__action">{action}</div>}
    </div>
  )
}

/* ─── Panel (white card) ─── */
export function Panel({ title, link, count, children, pad }) {
  return (
    <section className="panel">
      {(title || link || count != null) && (
        <header className="panel__head">
          {title && <h3 className="panel__title">{title}</h3>}
          {link && <button className="panel__link" onClick={link.onClick}>{link.label}</button>}
          {count != null && <span className="panel__count">{count}</span>}
        </header>
      )}
      <div className={pad ? 'panel__pad' : ''}>{children}</div>
    </section>
  )
}

/* ─── Responsive table (always horizontally scrollable on small screens) ─── */
export function Table({ columns, rows, renderRow, empty }) {
  if (!rows?.length) return empty || null
  return (
    <div className="tblwrap">
      <table className="tbl">
        <thead>
          <tr>{columns.map((c, i) => <th key={i} style={c.align ? { textAlign: c.align } : undefined}>{c.label}</th>)}</tr>
        </thead>
        <tbody>{rows.map((r, i) => renderRow(r, i))}</tbody>
      </table>
    </div>
  )
}

/* ─── Dashboard stat card (dark) ─── */
export function StatCard({ label, value, sub, index = 0 }) {
  return (
    <div className="statcard" data-i={index}>
      <div className="statcard__label">{label}</div>
      <div className="statcard__value">{value}</div>
      {sub && <div className="statcard__sub">{sub}</div>}
    </div>
  )
}

/* ─── Dashboard sub card (white) ─── */
export function SubCard({ label, value, tone }) {
  return (
    <div className="subcard">
      <div className="subcard__label">{label}</div>
      <div className={`subcard__value${tone ? ' subcard__value--' + tone : ''}`}>{value}</div>
    </div>
  )
}

/* ─── Alert banner ─── */
export function AlertBanner({ count, label, onClick }) {
  return (
    <button className="alert" onClick={onClick}>
      <span className="alert__num">{count}</span>
      <span className="alert__txt">{label}</span>
      <Icon name="chev" size={18} className="alert__chev" />
    </button>
  )
}
