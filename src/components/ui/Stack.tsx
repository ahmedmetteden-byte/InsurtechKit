/**
 * Stack / Row — Auto Layout containers
 *
 * Stack  = vertical auto layout   (column direction, gap drives spacing)
 * Row    = horizontal auto layout (row direction, wraps by default)
 *
 * These match Figma's Auto Layout frame behaviour:
 *   - Stack: direction = vertical, alignment = top/left
 *   - Row:   direction = horizontal, wrapping = wrap
 *
 * Neither sets any width or height — they are always content-driven.
 */

import React from 'react'

type GapSize = 4 | 6 | 8 | 10 | 12 | 14 | 16 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 60

interface StackProps {
  children: React.ReactNode
  gap?: GapSize | number
  align?: React.CSSProperties['alignItems']
  justify?: React.CSSProperties['justifyContent']
  style?: React.CSSProperties
  className?: string
  as?: React.ElementType
}

export function Stack({
  children,
  gap = 16,
  align = 'stretch',
  justify = 'flex-start',
  style,
  className = '',
  as: Tag = 'div',
}: StackProps) {
  return (
    <Tag
      className={['al-stack', className].filter(Boolean).join(' ')}
      style={{ gap, alignItems: align, justifyContent: justify, ...style }}>
      {children}
    </Tag>
  )
}

interface RowProps {
  children: React.ReactNode
  gap?: GapSize | number
  align?: React.CSSProperties['alignItems']
  justify?: React.CSSProperties['justifyContent']
  wrap?: boolean
  style?: React.CSSProperties
  className?: string
  as?: React.ElementType
}

export function Row({
  children,
  gap = 10,
  align = 'center',
  justify = 'flex-start',
  wrap = true,
  style,
  className = '',
  as: Tag = 'div',
}: RowProps) {
  return (
    <Tag
      className={['al-row', className].filter(Boolean).join(' ')}
      style={{
        gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        ...style,
      }}>
      {children}
    </Tag>
  )
}
