import { z } from 'zod'
import type { TransactionType } from '@/lib/types/finance'
import { parseDateInput } from '@/lib/utils/dates'

const transactionTypeSchema = z.enum(['income', 'expense', 'savings'])

const amountSchema = z.preprocess(
  (value) => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') return Number.parseFloat(value.trim())
    return Number.NaN
  },
  z
    .number({ invalid_type_error: 'Valor inválido' })
    .finite('Valor inválido')
    .refine((value) => value !== 0, 'Valor deve ser diferente de zero')
)

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
  .refine((value) => Number.isFinite(parseDateInput(value).getTime()), 'Data inválida')

const categorySchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Gênero é obrigatório')
  .max(60, 'Gênero muito longo')
  .regex(/^[a-z0-9-]+$/, 'Gênero deve conter apenas letras, números e hífen')

const classificationSchema = z
  .string()
  .trim()
  .toLowerCase()
  .optional()

export const transactionPayloadSchema = z.object({
  type: transactionTypeSchema,
  classification: classificationSchema,
  category: categorySchema,
  amount: amountSchema,
  description: z.string().trim().max(300, 'Descrição muito longa').optional().default(''),
  date: dateSchema
})

type ParsedTransactionPayload = {
  type: TransactionType
  classification: string
  category: string
  amount: number
  description: string
  date: string
}

export function parseTransactionPayload(input: unknown): ParsedTransactionPayload {
  const payload = transactionPayloadSchema.parse(input)

  let classification = payload.classification || ''

  if (payload.type === 'income') {
    classification = 'ativo'
  }

  if (payload.type === 'expense') {
    classification = classification || 'passivo'
    if (classification !== 'passivo' && classification !== 'cartao-credito') {
      throw new z.ZodError([
        {
          code: 'custom',
          message: 'Classificação inválida para despesa',
          path: ['classification']
        }
      ])
    }
  }

  if (payload.type === 'savings') {
    classification = ''
  }

  return {
    ...payload,
    classification
  }
}
