import type { ClassificationTotals, Transaction } from '@/lib/types/finance'

export function normalizeClassification(input: unknown): 'ativo' | 'passivo' | 'cartaoCredito' | 'outros' {
  const value = String(input || '').toLowerCase()

  if (value === 'ativo') return 'ativo'
  if (value === 'passivo') return 'passivo'
  if (value === 'cartao-credito' || value === 'cartaocredito' || value === 'cartão de crédito') return 'cartaoCredito'
  return 'outros'
}

export function toNumberAmount(value: unknown): number {
  const parsed = Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : 0
}

export function buildClassificationTotals(transactions: Transaction[]): ClassificationTotals {
  return transactions.reduce<ClassificationTotals>(
    (totals, transaction) => {
      const amount = toNumberAmount(transaction.amount)

      if (transaction.type === 'savings') {
        totals.poupanca += amount
        return totals
      }

      const normalized = normalizeClassification(transaction.classification)
      totals[normalized] += amount
      return totals
    },
    {
      ativo: 0,
      passivo: 0,
      cartaoCredito: 0,
      outros: 0,
      poupanca: 0
    }
  )
}
