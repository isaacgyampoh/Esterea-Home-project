// ─── money / numbers ───
export const ghs = n => `GH₵ ${Number(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const num = n => Number(n || 0).toLocaleString('en-GH')

// ─── dates ───
export const today     = () => new Date().toISOString().slice(0, 10)
export const isoNow    = () => new Date().toISOString()
export const dayKey    = d => new Date(d).toISOString().slice(0, 10)
export const monthKey  = d => new Date(d).toISOString().slice(0, 7)

export const fmtDate = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-GH', opts) : '—'

export const fmtDateTime = d =>
  d ? new Date(d).toLocaleString('en-GH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

export const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening'
}

// ─── phone (Ghana) ───
export const fmtPhone = p => {
  if (!p) return ''
  const d = String(p).replace(/\D/g, '')
  if (d.startsWith('233')) return '0' + d.slice(3)
  return d
}

// ─── arrays ───
export const sum = (arr, key = 'total') => (arr || []).reduce((a, x) => a + Number(x[key] || 0), 0)
export const uniq = arr => [...new Set(arr)]

// ─── id ───
export const shortId = (prefix = 'ID') =>
  `${prefix}-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.random().toString(36).toUpperCase().slice(2, 4)}`
