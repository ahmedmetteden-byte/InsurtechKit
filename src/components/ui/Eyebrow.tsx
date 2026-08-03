/**
 * Eyebrow — Auto Layout label pill
 *
 * Section label that hugs its content. Always inline-flex — content drives
 * width. Safe to change text at any time without breaking layout.
 */

interface EyebrowProps {
  children: string
  light?: boolean
  className?: string
}

export function Eyebrow({ children, light = false, className = '' }: EyebrowProps) {
  return (
    <span
      className={['al-eyebrow', light ? 'al-eyebrow-light' : '', className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}

export default Eyebrow
