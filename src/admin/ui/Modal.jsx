import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'
import { useEscape } from '../lib/hooks'

/**
 * Modal — rock-solid, cannot clip.
 * Rendered in a portal at <body> so no parent transform/overflow can trap it.
 * Centering is block-flow (overflow-y:auto overlay + inline-block modal):
 *   - short modal → centered
 *   - tall modal  → overlay scrolls, header & footer stay reachable (sticky)
 * No max-height / vh / dvh / flexbox height resolution anywhere.
 */
export default function Modal({ title, onClose, children, footer, size = 'md' }) {
  useEscape(onClose)

  // lock background scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return createPortal(
    <div className="ovl" onMouseDown={e => { if (e.target.classList.contains('ovl')) onClose() }}>
      <div className={`modal modal--${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal__head">
          <h2 className="modal__title">{title}</h2>
          <button className="modal__x" onClick={onClose} aria-label="Close"><Icon name="x" size={15} /></button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>,
    document.body
  )
}
