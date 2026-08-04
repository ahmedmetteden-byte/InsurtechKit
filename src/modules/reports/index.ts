/**
 * Reports module public API.
 * UI and future FastAPI adapters should import from this barrel only.
 */

export type {
  ChartSlice,
  NamedAmount,
  TrendPoint,
  TopProductRow,
  TopCustomerRow,
  RecentPolicyRow,
  RecentClaimRow,
  RecentCustomerRow,
  ReportKpis,
  ReportSnapshot,
} from './types/Report'

export { REPORT_CHART_COLORS, colorAt } from './config/chartColors'
export { ReportService } from './services/ReportService'
export { default as ExportActions } from './components/ExportActions'
export { default as ReportTable } from './components/ReportTable'
export { default as ReportChartCard } from './components/ReportChartCard'
export { default as ReportsDashboard } from './pages/ReportsDashboard'
