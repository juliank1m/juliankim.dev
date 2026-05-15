import { type ReactNode } from 'react'
import './WindowDock.css'

export type DockItem = {
  /** Must match the FloatingWindow id. */
  id: string
  /** Short label shown under the icon. */
  label: string
}

type Props = {
  items: DockItem[]
  openMap: Record<string, boolean>
  onToggle: (id: string) => void
}

const DOCK_ICONS: Record<string, ReactNode> = {
  clock: (
    <svg className="icon" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="2" y="2" width="8" height="8" fill="white" stroke="#5c5478" strokeWidth="1" />
      <rect x="5" y="3" width="1" height="3" fill="#5c5478" />
      <rect x="6" y="6" width="2" height="1" fill="#5c5478" />
      <rect x="5" y="5" width="2" height="2" fill="#9bb5f7" />
    </svg>
  ),
  sticky: (
    <svg className="icon" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="2" y="2" width="8" height="8" fill="#ffe8a1" stroke="#c79f3a" strokeWidth="1" />
      <rect x="3" y="4" width="6" height="1" fill="#c79f3a" />
      <rect x="3" y="6" width="5" height="1" fill="#c79f3a" />
      <rect x="3" y="8" width="4" height="1" fill="#c79f3a" />
    </svg>
  ),
  music: (
    <svg className="icon" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="6" y="2" width="1" height="6" fill="#4a3878" />
      <rect x="7" y="2" width="2" height="1" fill="#4a3878" />
      <rect x="4" y="7" width="3" height="2" fill="#b399e8" />
      <rect x="4" y="7" width="3" height="1" fill="#4a3878" />
      <rect x="3" y="8" width="1" height="1" fill="#4a3878" />
    </svg>
  ),
  term: (
    <svg className="icon" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="1" y="2" width="10" height="8" fill="#1a1830" stroke="#5c5478" strokeWidth="1" />
      <rect x="3" y="4" width="1" height="1" fill="#cdf4be" />
      <rect x="4" y="5" width="1" height="1" fill="#cdf4be" />
      <rect x="3" y="6" width="1" height="1" fill="#cdf4be" />
      <rect x="6" y="6" width="3" height="1" fill="#cdf4be" />
    </svg>
  ),
  snake: (
    <svg className="icon" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="1" y="2" width="10" height="8" fill="#1a1830" stroke="#56b39a" strokeWidth="1" />
      <rect x="3" y="4" width="2" height="1" fill="#8adfce" />
      <rect x="5" y="4" width="1" height="2" fill="#8adfce" />
      <rect x="6" y="5" width="2" height="1" fill="#8adfce" />
      <rect x="8" y="7" width="1" height="1" fill="#ffc1ba" />
    </svg>
  ),
}

/**
 * A small pixel "desktop" sidebar — fixed to the bottom-left of the
 * viewport. Each item toggles its FloatingWindow open/minimized.
 * Hidden under 1240px viewport (same breakpoint as the windows).
 */
export default function WindowDock({ items, openMap, onToggle }: Props) {
  return (
    <aside className="win-dock" aria-label="Desktop sidebar">
      <div className="win-dock-head">DESKTOP</div>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          className={`win-dock-item${openMap[it.id] ? ' active' : ''}`}
          onClick={() => onToggle(it.id)}
          aria-pressed={openMap[it.id] ? 'true' : 'false'}
          title={openMap[it.id] ? `Minimize ${it.label}` : `Open ${it.label}`}
        >
          {DOCK_ICONS[it.id] ?? null}
          <span>{it.label}</span>
        </button>
      ))}
    </aside>
  )
}
