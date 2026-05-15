import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import './FloatingWindow.css'

type Props = {
  /** Stable id — used as the localStorage key for position. */
  id: string
  /** Title-bar label. */
  title: string
  defaultX: number
  defaultY: number
  /** Sticky-note styling (yellow) instead of default window chrome. */
  sticky?: boolean
  /** Variant class for self-styled bodies (music | term | snake). */
  variant?: string
  /** Controlled open/minimized state. */
  open?: boolean
  /** Called when the minimize button is clicked. */
  onMinimize?: () => void
  children: ReactNode
}

type Pos = { x: number; y: number }

/**
 * Small draggable desktop-style window. Position persists per id.
 * Hidden under 1240px viewport (see CSS). Pair with <WindowDock />
 * to provide a way back when minimized.
 */
export default function FloatingWindow({
  id,
  title,
  defaultX,
  defaultY,
  sticky,
  variant,
  open = true,
  onMinimize,
  children,
}: Props) {
  const STORE_KEY = `fw-pos-${id}`
  const [pos, setPos] = useState<Pos>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null')
      if (saved && typeof saved.x === 'number') return saved
    } catch {
      /* ignore */
    }
    return { x: defaultX, y: defaultY }
  })
  const winRef = useRef<HTMLDivElement | null>(null)
  const drag = useRef({ active: false, sx: 0, sy: 0, ox: 0, oy: 0 })

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(pos))
    } catch {
      /* ignore */
    }
  }, [pos, STORE_KEY])

  // First-paint clamp: if the saved (or default) position would render
  // the window off-screen for the current viewport, pull it back in.
  // useLayoutEffect so the correction happens before the user sees it.
  useLayoutEffect(() => {
    if (!open) return
    const el = winRef.current
    if (!el) return
    const w = el.offsetWidth
    const h = el.offsetHeight
    const maxX = Math.max(4, window.innerWidth - w - 4)
    const maxY = Math.max(4, window.innerHeight - h - 4)
    if (pos.x > maxX || pos.y > maxY || pos.x < 4 || pos.y < 4) {
      setPos((p) => ({
        x: Math.max(4, Math.min(maxX, p.x)),
        y: Math.max(4, Math.min(maxY, p.y)),
      }))
    }
    // Run only on mount + when the window opens; dragging handles the
    // bounds itself, so we don't want this firing on every move.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!drag.current.active) return
      const nx = drag.current.ox + (e.clientX - drag.current.sx)
      const ny = drag.current.oy + (e.clientY - drag.current.sy)
      const w = winRef.current?.offsetWidth ?? 220
      const h = winRef.current?.offsetHeight ?? 120
      setPos({
        x: Math.max(4, Math.min(window.innerWidth - w - 4, nx)),
        y: Math.max(4, Math.min(window.innerHeight - h - 4, ny)),
      })
    }
    const onUp = () => {
      drag.current.active = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const startDrag = (e: React.MouseEvent) => {
    drag.current.active = true
    drag.current.sx = e.clientX
    drag.current.sy = e.clientY
    drag.current.ox = pos.x
    drag.current.oy = pos.y
    e.preventDefault()
  }

  return (
    <div
      ref={winRef}
      className={`float-win${sticky ? ' sticky' : ''}${variant ? ' ' + variant : ''}`}
      style={{ left: pos.x + 'px', top: pos.y + 'px', display: open ? undefined : 'none' }}
      aria-hidden={!open}
    >
      <div className="fw-bar" onMouseDown={startDrag}>
        <span>{title}</span>
        {onMinimize ? (
          <button
            className="fw-min"
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onMinimize}
            aria-label={`Minimize ${title}`}
            title="Minimize"
          >
            _
          </button>
        ) : null}
      </div>
      {sticky ? (
        <div className="fw-sticky-body">{children}</div>
      ) : variant ? (
        children
      ) : (
        <div className="fw-body">{children}</div>
      )}
    </div>
  )
}
