import { useState, useRef } from 'react'
import { uploadImage, cdn } from '../lib/cloudinary'
import { Button } from './index'

export default function ImageUpload({ value, onChange, label = 'Product Image' }) {
  const [busy, setBusy] = useState(false)
  const [prog, setProg] = useState(0)
  const [err, setErr] = useState('')
  const ref = useRef()

  async function handle(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) return setErr('Please choose an image file')
    if (file.size > 5 * 1024 * 1024) return setErr('Image must be under 5MB')
    setErr(''); setBusy(true); setProg(0)
    try { onChange(await uploadImage(file, setProg)) }
    catch (e) { setErr(e.message) }
    finally { setBusy(false); setProg(0) }
  }

  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <div className="imgup">
        <button type="button" className="imgup__preview" onClick={() => !busy && ref.current?.click()}>
          {busy
            ? <span className="imgup__prog">{prog}%</span>
            : value
              ? <img src={cdn(value, 160)} alt="" />
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>}
        </button>
        <div className="imgup__side">
          <div className="imgup__row">
            <Button type="button" variant="line" size="sm" onClick={() => ref.current?.click()} disabled={busy}>Choose File</Button>
            {value && !busy
              ? <button type="button" className="imgup__remove" onClick={() => onChange('')}>Remove</button>
              : <span className="imgup__none">No file chosen</span>}
          </div>
          <div className="imgup__hint">JPG, PNG up to 5MB</div>
        </div>
      </div>
      {err && <p className="field__error">{err}</p>}
      <input ref={ref} type="file" accept="image/*" hidden onChange={e => { handle(e.target.files[0]); e.target.value = '' }} />
    </div>
  )
}
