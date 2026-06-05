import { useState, useEffect, useCallback, useRef } from 'react'

/* ─── Toast (module-level pub/sub so any component can fire one) ─── */
let toastListeners = []
let toastId = 0
export function toast(message, kind = 'default') {
  const t = { id: ++toastId, message, kind }
  toastListeners.forEach(fn => fn(t))
}
export function useToastHost() {
  const [items, setItems] = useState([])
  useEffect(() => {
    const fn = t => {
      setItems(prev => [...prev, t])
      setTimeout(() => setItems(prev => prev.filter(x => x.id !== t.id)), 2600)
    }
    toastListeners.push(fn)
    return () => { toastListeners = toastListeners.filter(f => f !== fn) }
  }, [])
  return items
}

/* ─── useAsync: run a loader, expose { data, loading, error, reload } ─── */
export function useAsync(loader, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const reload = useCallback(async () => {
    setLoading(true); setError(null)
    try { setData(await loaderRef.current()) }
    catch (e) { setError(e); console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { reload() }, deps) // eslint-disable-line
  return { data, loading, error, reload, setData }
}

/* ─── useEscape: call handler on Esc keypress ─── */
export function useEscape(handler) {
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') handler() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [handler])
}

/* ─── useDebounced: debounce a fast-changing value (e.g. search) ─── */
export function useDebounced(value, ms = 250) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return v
}
