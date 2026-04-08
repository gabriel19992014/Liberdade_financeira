import { allClassifications, baseCategories } from '@/lib/constants/finance'
import type { TransactionType } from '@/lib/types/finance'
import { slugToTitle } from '@/lib/utils/formatters'

const categoryLabelMap = Object.fromEntries(baseCategories.map((category) => [category.value, category.label]))

const classificationLabelMap: Record<string, string> = {
  ativo: 'Ativo',
  passivo: 'Passivo',
  'cartao-credito': 'Cartão de Crédito',
  cartaoCredito: 'Cartão de Crédito',
  reserva: 'Reserva',
  outros: 'Outros',
  ...Object.fromEntries(allClassifications.map((classification) => [classification.value, classification.label]))
}

const transactionTypeLabelMap: Record<TransactionType, string> = {
  income: 'Receita',
  expense: 'Despesa',
  savings: 'Poupança'
}

export function getTransactionTypeLabel(type: TransactionType): string {
  return transactionTypeLabelMap[type]
}

export function getCategoryLabel(value: string): string {
  return categoryLabelMap[value] || slugToTitle(value)
}

export function getClassificationLabel(value?: string | null): string {
  if (!value) return '-'

  return classificationLabelMap[value] || slugToTitle(value)
}