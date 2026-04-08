import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { getTransactionsByUserId, saveTransactionsByUserId } from '@/lib/auth'
import { toNumberAmount } from '@/lib/utils/finance'
import type { Transaction } from '@/lib/types/finance'
import { parseTransactionPayload } from '@/lib/schemas/finance'
import { ZodError } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT /api/transactions/[id] - Update a transaction
export const PUT = requireAuth(async (request: NextRequest, userId: string, context: any) => {
  const params = (await context.params) as Awaited<RouteParams['params']>
  try {
    const body = await request.json()
    const { type, classification, category, amount, description, date } = parseTransactionPayload(body)
    const parsedAmount = amount
    const transactions = await getTransactionsByUserId(userId)
    const transactionIndex = transactions.findIndex((t) => t.id === params.id)

    if (transactionIndex === -1) {
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
    }

    if (type === 'savings') {
      const currentSavings = transactions
        .filter((t) => t.type === 'savings' && t.id !== params.id)
        .reduce((sum, t) => sum + toNumberAmount(t.amount), 0)
      if (currentSavings + parsedAmount < 0) {
        return NextResponse.json(
          { error: `Saldo insuficiente na poupança. Saldo atual: R$ ${currentSavings.toFixed(2).replace('.', ',')}` },
          { status: 422 }
        )
      }
    }

    transactions[transactionIndex] = {
      ...transactions[transactionIndex],
      type,
      classification,
      category,
      amount: parsedAmount,
      description: (description || '').toString(),
      date
    }

    await saveTransactionsByUserId(userId, transactions)

    return NextResponse.json(transactions[transactionIndex])
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Payload inválido' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})

// DELETE /api/transactions/[id] - Delete a transaction
export const DELETE = requireAuth(async (request: NextRequest, userId: string, context: any) => {
  const params = (await context.params) as Awaited<RouteParams['params']>
  try {
    const transactions = await getTransactionsByUserId(userId)
    const filteredTransactions = transactions.filter((t) => t.id !== params.id)

    if (filteredTransactions.length === transactions.length) {
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
    }

    await saveTransactionsByUserId(userId, filteredTransactions)

    return NextResponse.json({ message: 'Transação excluída com sucesso' })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})