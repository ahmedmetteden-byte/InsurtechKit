/**
 * Card — Auto Layout component
 *
 * Vertical auto layout container. Height is always driven by content +
 * padding. Never set a fixed height on this component — use minHeight only
 * if you need a floor.
 *
 * Usage:
 *   <Card>
 *     <CardHeader title="Motor Insurance" />
 *     <CardBody>...</CardBody>
 *     <CardFooter>...</CardFooter>
 *   </Card>
 */

import React from 'react'

interface CardProps {
  children: React.ReactNode
  padding?: number | string
  gap?: number | string
  radius?: number | string
  border?: string
  background?: string
  shadow?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  hover?: boolean
}

export function Card({
  children,
  padding = 24,
  gap = 16,
  radius = 16,
  border,
  background,
  shadow = false,
  className = '',
  style,
  onClick,
  hover = false,
}: CardProps) {
  return (
    <div
      className={['al-card', className].filter(Boolean).join(' ')}
      onClick={onClick}
      style={{
        padding,
        gap,
        borderRadius: radius,
        border: border ?? '1px solid var(--border)',
        background: background ?? 'var(--card)',
        boxShadow: shadow ? '0 4px 24px rgba(0,0,0,0.07)' : undefined,
        cursor: onClick ? 'pointer' : undefined,
        transition: hover ? 'transform 0.2s, box-shadow 0.2s' : undefined,
        ...style,
      }}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  action?: React.ReactNode
  titleStyle?: React.CSSProperties
}

export function CardHeader({ title, subtitle, eyebrow, action, titleStyle }: CardHeaderProps) {
  return (
    <div className="al-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <div className="al-stack al-stack-xs" style={{ minWidth: 0 }}>
        {eyebrow && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {eyebrow}
          </span>
        )}
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--card-foreground)', letterSpacing: '-0.01em', ...titleStyle }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

export function CardBody({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="al-stack al-stack-md" style={style}>{children}</div>
}

export function CardFooter({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="al-row" style={{ paddingTop: 16, borderTop: '1px solid var(--border)', ...style }}>
      {children}
    </div>
  )
}

export default Card
