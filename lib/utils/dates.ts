export function parseDateInput(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) {
    return new Date(Number.NaN)
  }

  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

export function formatDateInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function formatDateBR(value: string): string {
  const [year, month, day] = value.split('-')

  if (!year || !month || !day) {
    return value
  }

  return `${day}/${month}/${year}`
}

export function getDateYear(value: string): string {
  return value.split('-')[0] || ''
}

export function getDateMonth(value: string): string {
  return value.split('-')[1] || ''
}

export function getDateSortValue(value: string): number {
  return parseDateInput(value).getTime()
}