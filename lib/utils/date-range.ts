export type ReportPeriod = 'monthly' | 'annual' | 'all'

export function resolveDateRange(period: string, year?: string | null, month?: string | null): { startDate: Date; endDate: Date } {
  const now = new Date()
  const normalized = (period || 'monthly') as ReportPeriod
  const selectedYear = year ? Number.parseInt(year, 10) : now.getFullYear()
  const selectedMonth = month ? Number.parseInt(month, 10) - 1 : now.getMonth()

  if (normalized === 'monthly') {
    return {
      startDate: new Date(selectedYear, selectedMonth, 1, 0, 0, 0, 0),
      endDate: new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999)
    }
  }

  if (normalized === 'annual') {
    return {
      startDate: new Date(selectedYear, 0, 1, 0, 0, 0, 0),
      endDate: new Date(selectedYear, 11, 31, 23, 59, 59, 999)
    }
  }

  return {
    startDate: new Date(0),
    endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  }
}
