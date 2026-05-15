import { useRef, type MouseEvent, type ReactNode } from 'react'
import { cn } from '../lib/cn'
import './TiltCard.css'

type Props = {
  children: ReactNode
  className?: string
  /** Max rotation in degrees on each axis. */
  maxTilt?: number
  /** Accent color tone for the corner chip. */
  accentTone?: 'teal' | 'coral' | 'gold' | 'lime'
}

/**
 * Wraps a card with cursor-following 3D tilt + a small corner accent
 * that pops out on the Z axis. Perspective lives inside each card's
 * transform so every card has its own perspective origin — content
 * stays centered at rest even in the leftmost / rightmost cards.
 */
export default function TiltCard({
  children,
  className,
  maxTilt = 12,
  accentTone = 'teal',
}: Props) {
  const ref = useRef<HTMLElement | null>(null)

  const onMouseMove = (e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg)`
    el.classList.add('tilt-active')
  }

  const onMouseLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
    el.classList.remove('tilt-active')
  }

  return (
    <article
      ref={ref}
      className={cn('ui-card', 'tilt-card', `tilt-accent-${accentTone}`, className)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <span className="tilt-accent" aria-hidden="true" />
      {children}
    </article>
  )
}
