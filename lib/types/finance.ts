export type TransactionType = 'income' | 'expense' | 'savings'

export interface Transaction {
  id: string
  type: TransactionType
  classification?: string
  category: string
  amount: number | string
  description: string
  date: string
}

export interface ClassificationTotals {
  ativo: number
  passivo: number
  cartaoCredito: number
  outros: number
  poupanca: number
}

export interface ReportPayload {
  period: string
  income: number
  expenses: number
  savings: number
  balance: number
  transactionCount: number
  transactions: Transaction[]
  classificationTotals: ClassificationTotals
  genreTotals: Record<string, number>
  availableGenres: string[]
}
