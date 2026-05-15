import { useCallback, useRef, type MouseEvent } from 'react'

type Options = {
  /** How far (px) the element pulls horizontally toward the cursor edge */
  strength?: number
  /** How far (px) it pulls vertically */
  lift?: number
}

/**
 * Gently pulls an element toward the cursor while hovered.
 * Returns a ref + the two mouse handlers to spread onto your element.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>({
  strength = 14,
  lift = 10,
}: Options = {}) {
  const ref = useRef<T | null>(null)

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - r.left - r.width / 2) / r.width
      const dy = (e.clientY - r.top - r.height / 2) / r.height
      el.style.transform = `translate(${dx * strength}px, ${dy * lift}px)`
      el.style.boxShadow = `${4 - dx * strength * 0.4}px ${4 - dy * lift * 0.4}px 0 #d8d2f0`
    },
    [strength, lift],
  )

  const onMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
    el.style.boxShadow = ''
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}
