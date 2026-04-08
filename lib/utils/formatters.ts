export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function slugToTitle(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function monthLabelPtBR(monthValue: string): string {
  const monthName = new Date(2000, Number(monthValue) - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })
  return monthName.charAt(0).toUpperCase() + monthName.slice(1)
}
