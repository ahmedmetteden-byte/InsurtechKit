/**
 * Placeholder export actions — real PDF/Excel/Print ships with the backend phase.
 */
import { useState } from 'react'
import { Button, Row } from '../../../components/ui'

const MESSAGE = 'Coming in Backend Phase'

type ExportActionsProps = {
  compact?: boolean
}

export default function ExportActions({ compact }: ExportActionsProps) {
  const [notice, setNotice] = useState<string | null>(null)

  const show = () => {
    setNotice(MESSAGE)
    window.setTimeout(() => setNotice(null), 2800)
  }

  return (
    <div>
      <Row gap={8} wrap align="center">
        <Button variant="outline" size={compact ? 'sm' : 'md'} onClick={show}>Export PDF</Button>
        <Button variant="outline" size={compact ? 'sm' : 'md'} onClick={show}>Export Excel</Button>
        <Button variant="ghost" size={compact ? 'sm' : 'md'} onClick={show}>Print</Button>
      </Row>
      {notice && (
        <p style={{
          marginTop: 10,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: '#92400E',
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: 8,
          padding: '8px 12px',
        }}>
          {notice}
        </p>
      )}
    </div>
  )
}
