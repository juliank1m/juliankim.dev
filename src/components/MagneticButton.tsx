import { type AnchorHTMLAttributes, type ReactNode } from 'react'
import { useMagnetic } from '../hooks/useMagnetic'
import { cn } from '../lib/cn'

type Variant = 'default' | 'secondary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const baseStyle = { transition: 'transform 180ms ease-out, box-shadow 180ms ease-out' }

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode
  href: string
  variant?: Variant
  size?: Size
  className?: string
}

/** Drop-in magnetic replacement for ButtonLink. */
export function MagneticButtonLink({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...rest
}: LinkProps) {
  const { ref, onMouseMove, onMouseLeave } = useMagnetic<HTMLAnchorElement>({
    strength: 12,
    lift: 8,
  })
  return (
    <a
      ref={ref}
      className={cn('ui-button', `ui-button-${variant}`, `ui-button-${size}`, className)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={baseStyle}
      {...rest}
    >
      {children}
    </a>
  )
}
