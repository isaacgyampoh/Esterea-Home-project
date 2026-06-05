import Icon from './Icon'

/* ─── Button ─── */
export function Button({ variant = 'dark', size, icon, children, className = '', ...rest }) {
  const cls = ['btn', `btn--${variant}`, size && `btn--${size}`, className].filter(Boolean).join(' ')
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} />}
      {children}
    </button>
  )
}

/* ─── Field wrapper ─── */
export function Field({ label, required, hint, children }) {
  return (
    <label className="field">
      {label && <span className="field__label">{label}{required && <i className="field__req">*</i>}{hint && <em className="field__hint">{hint}</em>}</span>}
      {children}
    </label>
  )
}

/* ─── Text input ─── */
export function Input({ label, required, hint, ...rest }) {
  return <Field label={label} required={required} hint={hint}><input className="input" {...rest} /></Field>
}

/* ─── Number input (always numeric, tabular) ─── */
export function NumberInput({ label, required, hint, value, onChange, step = '0.01', ...rest }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <input className="input input--num" type="number" min="0" step={step}
        value={value === 0 ? '' : value ?? ''} placeholder="0"
        onChange={e => onChange(e.target.value === '' ? 0 : Number(e.target.value))} {...rest} />
    </Field>
  )
}

/* ─── Textarea ─── */
export function TextArea({ label, required, hint, rows = 3, ...rest }) {
  return <Field label={label} required={required} hint={hint}><textarea className="input input--area" rows={rows} {...rest} /></Field>
}

/* ─── Select ─── */
export function Select({ label, required, hint, options = [], value, onChange, placeholder, ...rest }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <select className="input input--select" value={value} onChange={e => onChange(e.target.value)} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  )
}

/* ─── Datalist combo (type or pick) ─── */
export function Combo({ label, required, hint, options = [], value, onChange, placeholder, listId }) {
  const id = listId || `dl-${label?.replace(/\s/g, '')}`
  return (
    <Field label={label} required={required} hint={hint}>
      <input className="input" list={id} value={value || ''} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} />
      <datalist id={id}>{options.map(o => <option key={o} value={o} />)}</datalist>
    </Field>
  )
}

/* ─── Toggle ─── */
export function Toggle({ on, onToggle, label, sub }) {
  return (
    <div className="toggle-row">
      <div>
        <div className="toggle-row__label">{label}</div>
        {sub && <div className="toggle-row__sub">{sub}</div>}
      </div>
      <button type="button" className={`toggle${on ? ' toggle--on' : ''}`} onClick={onToggle} role="switch" aria-checked={on}>
        <span className="toggle__knob" />
      </button>
    </div>
  )
}

/* ─── Badge ─── */
export function Badge({ tone = 'dim', children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

/* ─── Search bar ─── */
export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="search">
      <Icon name="search" size={15} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

/* ─── Tabs (pill style) ─── */
export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs">
      {tabs.map(t => {
        const id = typeof t === 'string' ? t : t.value
        const label = typeof t === 'string' ? t : t.label
        return <button key={id} className={`tab${value === id ? ' tab--on' : ''}`} onClick={() => onChange(id)}>{label}</button>
      })}
    </div>
  )
}

/* ─── States ─── */
export const Spinner = ({ label = 'Loading…' }) => <div className="state state--spin">{label}</div>
export const Empty = ({ icon = 'box', title = 'Nothing here yet', sub }) => (
  <div className="state state--empty">
    <Icon name={icon} size={30} />
    <div className="state__title">{title}</div>
    {sub && <div className="state__sub">{sub}</div>}
  </div>
)
