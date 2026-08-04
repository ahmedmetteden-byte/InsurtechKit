/**
 * Shared chart panel chrome — matches Admin Overview card language.
 */
import type { ReactNode } from 'react'

const T = {
  card: '#FFFFFF',
  border: '#E4E2DC',
  text: '#0F172A',
  muted: '#64748B',
  display: "'Plus Jakarta Sans', sans-serif",
  mono: "'DM Mono', monospace",
}

type ReportChartCardProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function ReportChartCard({ title, subtitle, children }: ReportChartCardProps) {
  return (
    <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 3 }}>{title}</p>
        {subtitle && (
          <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}

export { T as reportTokens }
