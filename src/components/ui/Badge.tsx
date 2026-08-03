/**
 * Badge / Pill — Auto Layout component
 *
 * Inline pill that hugs its text content. Width is never set explicitly —
 * padding alone determines spacing. Content can be as long or short as needed
 * and the pill resizes accordingly.
 *
 * Usage:
 *   <Badge color="blue">Under Review</Badge>
 *   <Badge color="green" dot>Active</Badge>
 *   <Badge color="red" uppercase>Critical</Badge>
 */

import React from 'react'

type BadgeColor = 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'sky' | 'slate' | 'pink'

const colorMap: Record<BadgeColor, { bg: string; text: string; border: string; dot: string }> = {
  blue:   { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', dot: '#1D4ED8' },
  green:  { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0', dot: '#16A34A' },
  red:    { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', dot: '#DC2626' },
  amber:  { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', dot: '#F59E0B' },
  purple: { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE', dot: '#7C3AED' },
  sky:    { bg: '#F0F9FF', text: '#0EA5E9', border: '#BAE6FD', dot: '#0EA5E9' },
  slate:  { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0', dot: '#94A3B8' },
  pink:   { bg: '#FDF2F8', text: '#9D174D', border: '#FBCFE8', dot: '#EC4899' },
}

interface BadgeProps {
  color?: BadgeColor
  dot?: boolean
  uppercase?: boolean
  children: React.ReactNode
  className?: string
}

export function Badge({ color = 'blue', dot = false, uppercase = false, children, className = '' }: BadgeProps) {
  const c = colorMap[color]
  return (
    <span
      className={['al-badge', dot ? 'al-badge-dot' : '', className].filter(Boolean).join(' ')}
      style={{
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        textTransform: uppercase ? 'uppercase' : undefined,
        letterSpacing: uppercase ? '0.07em' : undefined,
        fontSize: uppercase ? 10 : 11,
      }}>
      {children}
    </span>
  )
}

export default Badge
