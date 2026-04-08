import type { ReportPayload, Transaction } from '@/lib/types/finance'
import { buildClassificationTotals, toNumberAmount } from '@/lib/utils/finance'

export function buildGenreTotals(transactions: Transaction[]): Record<string, number> {
  return transactions.reduce<Record<string, number>>((totals, transaction) => {
    const genreKey = transaction.category || 'outros'
    totals[genreKey] = (totals[genreKey] || 0) + toNumberAmount(transaction.amount)
    return totals
  }, {})
}

export function listAvailableGenres(transactions: Transaction[]): string[] {
  return Array.from(new Set(transactions.map((transaction) => transaction.category).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  )
}

export function summarizeTransactions(transactions: Transaction[]): Omit<ReportPayload, 'period' | 'transactions' | 'availableGenres'> {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + toNumberAmount(transaction.amount), 0)

  const expenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + toNumberAmount(transaction.amount), 0)

  const savings = transactions
    .filter((transaction) => transaction.type === 'savings')
    .reduce((sum, transaction) => sum + toNumberAmount(transaction.amount), 0)

  return {
    income,
    expenses,
    savings,
    balance: income - expenses - savings,
    transactionCount: transactions.length,
    classificationTotals: buildClassificationTotals(transactions),
    genreTotals: buildGenreTotals(transactions)
  }
}