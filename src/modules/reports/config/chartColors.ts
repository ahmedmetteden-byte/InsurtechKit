/** Shared palette for report pie/bar charts — matches Admin Overview accents. */
export const REPORT_CHART_COLORS = [
  '#1D4ED8',
  '#16A34A',
  '#7C3AED',
  '#0EA5E9',
  '#F59E0B',
  '#DC2626',
  '#64748B',
  '#0D9488',
  '#C026D3',
  '#EA580C',
] as const

export function colorAt(index: number): string {
  return REPORT_CHART_COLORS[index % REPORT_CHART_COLORS.length]
}
