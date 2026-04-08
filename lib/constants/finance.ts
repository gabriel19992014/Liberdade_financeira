import type { TransactionType } from '@/lib/types/finance'

export const transactionTypes = [
  { value: 'income', label: 'Receita' },
  { value: 'expense', label: 'Despesa' },
  { value: 'savings', label: 'Poupança' }
] as const

export const expenseClassifications = [
  { value: 'passivo', label: 'Passivo' },
  { value: 'cartao-credito', label: 'Cartão de Crédito' }
] as const

export const allClassifications = [
  { value: 'ativo', label: 'Ativo' },
  ...expenseClassifications
] as const

export const baseCategories = [
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'salario', label: 'Salário' },
  { value: 'investimento', label: 'Investimento' },
  { value: 'lazer', label: 'Lazer' },
  { value: 'outros', label: 'Outros' },
  { value: 'poupanca', label: 'Poupança' }
] as const

export const baseCategoryValues = new Set<string>(baseCategories.map((category) => category.value))

export const reservedCategories = new Set<string>(baseCategories.map((category) => category.value))

export const defaultClassificationByType: Record<TransactionType, string> = {
  income: 'ativo',
  expense: 'passivo',
  savings: ''
}

export const categoriesByType: Record<TransactionType, string[]> = {
  income: ['salario', 'investimento', 'outros'],
  expense: ['alimentacao', 'transporte', 'lazer', 'outros'],
  savings: ['poupanca']
}

export const CUSTOM_CATEGORY_VALUE = '__new__'
