import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import PixelTrail from './PixelTrail'
import PixelPet from './PixelPet'
import FloatingWindow from './FloatingWindow'
import WindowDock from './WindowDock'
import MusicPlayer from './MusicPlayer'
import Terminal from './Terminal'
import SnakeGame from './SnakeGame'
import './Layout.css'

const labels = ["available for winter '27 internships", 'full-stack | AI', 'software eng @ uwaterloo']
const TRAIL_GRID_SIZE = 160

/* ---------- floating-window content ---------- */

function ClockContent() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  const date = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  return (
    <>
      <div className="fw-clock-time">
        {h}:{m}:{s}
      </div>
      <div className="fw-clock-date">{date.toUpperCase()}</div>
      <div className="fw-clock-tz">~ WATERLOO, ON ~</div>
    </>
  )
}

function StickyContent() {
  return (
    <>
      <strong>★ status</strong>
      Available for <b>winter '27</b> internships. drop me a line if you're hiring.
      <a href="mailto:julian.kim@uwaterloo.ca">→ email me</a>
    </>
  )
}

/* ---------- open/minimized state for windows ---------- */

type OpenMap = Record<string, boolean>
const OPEN_KEY = 'fw-open'

function useWindowOpenState(defaults: OpenMap) {
  const [openMap, setOpenMap] = useState<OpenMap>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(OPEN_KEY) || 'null')
      if (saved && typeof saved === 'object') return { ...defaults, ...saved }
    } catch {
      /* ignore */
    }
    return defaults
  })

  useEffect(() => {
    try {
      localStorage.setItem(OPEN_KEY, JSON.stringify(openMap))
    } catch {
      /* ignore */
    }
  }, [openMap])

  const toggle = (id: string) => setOpenMap((m) => ({ ...m, [id]: !m[id] }))
  return { openMap, toggle }
}

/* ---------- the layout ---------- */

export default function Layout() {
  const location = useLocation()
  const [isFinePointerDevice, setIsFinePointerDevice] = useState(false)
  const eventSource = typeof document !== 'undefined' ? document.body : undefined
  const isProjectsRoute = location.pathname.startsWith('/projects')

  const { openMap, toggle } = useWindowOpenState({
    clock: false,
    sticky: false,
    music: false,
    term: false,
    snake: false,
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const syncPointerMode = () => {
      const finePointer = mediaQuery.matches
      setIsFinePointerDevice(finePointer)
      document.body.classList.toggle('cursor-custom', finePointer)
    }

    syncPointerMode()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncPointerMode)
    } else {
      mediaQuery.addListener(syncPointerMode)
    }

    return () => {
      document.body.classList.remove('cursor-custom')

      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', syncPointerMode)
      } else {
        mediaQuery.removeListener(syncPointerMode)
      }
    }
  }, [])

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280

  return (
    <div className="site-shell">
      <div className="site-noise" aria-hidden="true" />
      <div className="site-pattern" aria-hidden="true" />
      <div className="site-glow site-glow-a" aria-hidden="true" />
      <div className="site-glow site-glow-b" aria-hidden="true" />
      {isFinePointerDevice ? (
        <div className="site-trail-layer" aria-hidden="true">
          <PixelTrail
            gridSize={TRAIL_GRID_SIZE}
            trailSize={0.055}
            maxAge={180}
            interpolate={1.2}
            color="#c4dcff"
            canvasProps={{
              eventSource,
              eventPrefix: 'client',
              style: { pointerEvents: 'none' },
              dpr: [1, 1.5]
            }}
          />
        </div>
      ) : null}

      <header className="topbar">
        <NavLink to="/homepage" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <img src="/icons/favicon-192.png" alt="" />
          </span>
          <span className="brand-copy">
            <strong>Julian Kim</strong>
            <span>Software Engineer</span>
          </span>
        </NavLink>

        <nav className="site-nav" aria-label="Main">
          <NavLink to="/homepage" className={({ isActive }) => (isActive ? 'site-link active' : 'site-link')}>
            Home
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => (isActive ? 'site-link active' : 'site-link')}>
            Projects
          </NavLink>
        </nav>
      </header>

      <div className="pet-strip">
        {isFinePointerDevice ? (
          <>
            <PixelPet />
            <div className="pet-ground" aria-hidden="true" />
          </>
        ) : null}
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...labels, ...labels].map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>
      </div>

      <main className={`site-main${isProjectsRoute ? ' site-main-wide' : ''}`}>
        <div key={location.pathname} className="route-frame">
          <Outlet />
        </div>
      </main>

      {/* Desktop accessories + the sidebar dock that opens them.
          All hidden under 1240px viewport (see component CSS). */}
      {isFinePointerDevice ? (
        <>
          <FloatingWindow
            id="clock"
            title="CLOCK.EXE"
            defaultX={24}
            defaultY={120}
            open={openMap.clock}
            onMinimize={() => toggle('clock')}
          >
            <ClockContent />
          </FloatingWindow>

          <FloatingWindow
            id="sticky"
            title="NOTE.TXT"
            defaultX={viewportWidth - 250}
            defaultY={140}
            sticky
            open={openMap.sticky}
            onMinimize={() => toggle('sticky')}
          >
            <StickyContent />
          </FloatingWindow>

          <FloatingWindow
            id="music"
            title="MUSIC.EXE"
            defaultX={24}
            defaultY={360}
            variant="music"
            open={openMap.music}
            onMinimize={() => toggle('music')}
          >
            <MusicPlayer />
          </FloatingWindow>

          <FloatingWindow
            id="term"
            title="TERM.SH"
            defaultX={viewportWidth - 340}
            defaultY={420}
            variant="term"
            open={openMap.term}
            onMinimize={() => toggle('term')}
          >
            <Terminal />
          </FloatingWindow>

          <FloatingWindow
            id="snake"
            title="SNAKE.EXE"
            defaultX={24}
            defaultY={220}
            variant="snake"
            open={openMap.snake}
            onMinimize={() => toggle('snake')}
          >
            <SnakeGame />
          </FloatingWindow>

          <WindowDock
            items={[
              { id: 'clock', label: 'CLOCK' },
              { id: 'sticky', label: 'NOTE' },
              { id: 'music', label: 'MUSIC' },
              { id: 'term', label: 'TERM' },
              { id: 'snake', label: 'SNAKE' },
            ]}
            openMap={openMap}
            onToggle={toggle}
          />
        </>
      ) : null}
    </div>
  )
}
