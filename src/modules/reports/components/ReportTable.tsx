/**
 * Simple report data table matching admin card typography.
 */
import type { CSSProperties, ReactNode } from 'react'

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '10px 14px',
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight: 600,
  background: '#FAFAF8',
  borderBottom: '1px solid #E4E2DC',
}

const tdStyle: CSSProperties = {
  padding: '12px 14px',
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#0F172A',
  borderBottom: '1px solid #E4E2DC',
}

export type ReportColumn<T> = {
  key: string
  header: string
  align?: 'left' | 'right'
  render: (row: T) => ReactNode
}

type ReportTableProps<T> = {
  columns: ReportColumn<T>[]
  rows: T[]
  emptyMessage?: string
  rowKey: (row: T) => string
}

export default function ReportTable<T>({
  columns,
  rows,
  emptyMessage = 'No data available.',
  rowKey,
}: ReportTableProps<T>) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                style={{ ...thStyle, textAlign: col.align ?? 'left' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={rowKey(row)}>
              {columns.map(col => (
                <td
                  key={col.key}
                  style={{
                    ...tdStyle,
                    textAlign: col.align ?? 'left',
                    fontFamily: col.align === 'right' ? 'var(--font-mono)' : 'var(--font-body)',
                    fontSize: col.align === 'right' ? 12 : 13,
                  }}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: 28, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: '#64748B' }}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
