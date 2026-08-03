/**
 * Button — Auto Layout component
 *
 * Sizing is driven entirely by padding + content. Never pass a `width` prop
 * unless you want full-width (`full`). The container grows automatically
 * when text changes — exactly like Figma's Auto Layout fill/hug behaviour.
 *
 * Usage:
 *   <Button variant="primary" size="md">Get Instant Quote</Button>
 *   <Button variant="outline" size="sm" icon={<ArrowIcon />} iconPos="right">Learn More</Button>
 *   <Button variant="primary" size="lg" full>Calculate My Auto Premium</Button>
 */

import React from 'react'

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'subtle' | 'danger' | 'dark'
type Size = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: React.ReactNode
  iconPos?: 'left' | 'right'
  full?: boolean
  as?: 'button' | 'a'
  href?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPos = 'left',
  full = false,
  children,
  className = '',
  as: Tag = 'button',
  href,
  ...rest
}: ButtonProps) {
  const classes = [
    'al-btn',
    `al-btn-${size}`,
    `al-btn-${variant}`,
    full ? 'al-btn-full' : '',
    className,
  ].filter(Boolean).join(' ')

  const iconEl = icon ? (
    <span style={{ width: size === 'sm' ? 14 : size === 'xl' ? 18 : 16, height: size === 'sm' ? 14 : size === 'xl' ? 18 : 16, display: 'flex', flexShrink: 0 }}>
      {icon}
    </span>
  ) : null

  const content = (
    <>
      {iconEl && iconPos === 'left' && iconEl}
      {children}
      {iconEl && iconPos === 'right' && iconEl}
    </>
  )

  if (Tag === 'a' && href) {
    return <a href={href} className={classes} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>{content}</a>
  }

  return <button className={classes} {...rest}>{content}</button>
}

export default Button
