import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { getTransactionsByUserId, saveTransactionsByUserId } from '@/lib/auth'
import { reservedCategories } from '@/lib/constants/finance'
import { toNumberAmount } from '@/lib/utils/finance'
import type { Transaction } from '@/lib/types/finance'
import { parseTransactionPayload } from '@/lib/schemas/finance'
import { ZodError } from 'zod'

// GET /api/transactions - Get all transactions for the authenticated user
export const GET = requireAuth(async (request: NextRequest, userId: string) => {
  try {
    const transactions = await getTransactionsByUserId(userId)
    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})

// POST /api/transactions - Create a new transaction
export const POST = requireAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json()
    const { type, classification, category, amount, description, date } = parseTransactionPayload(body)
    const parsedAmount = amount

    if (type === 'savings') {
      const transactions = await getTransactionsByUserId(userId)
      const currentSavings = transactions
        .filter((t) => t.type === 'savings')
        .reduce((sum, t) => sum + toNumberAmount(t.amount), 0)
      if (currentSavings + parsedAmount < 0) {
        return NextResponse.json(
          { error: `Saldo insuficiente na poupança. Saldo atual: R$ ${currentSavings.toFixed(2).replace('.', ',')}` },
          { status: 422 }
        )
      }
    }

    const transactions = await getTransactionsByUserId(userId)
    const newTransaction = {
      id: Date.now().toString(),
      type,
      classification,
      category,
      amount: parsedAmount,
      description: (description || '').toString(),
      date
    }

    transactions.push(newTransaction)
    await saveTransactionsByUserId(userId, transactions)

    return NextResponse.json(newTransaction, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Payload inválido' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})

// DELETE /api/transactions?category={slug} - Remove a custom genre by moving transactions to 'outros'
export const DELETE = requireAuth(async (request: NextRequest, userId: string) => {
  try {
    const { searchParams } = new URL(request.url)
    const category = (searchParams.get('category') || '').trim().toLowerCase()

    if (!category) {
      return NextResponse.json({ error: 'Categoria é obrigatória' }, { status: 400 })
    }

    if (reservedCategories.has(category)) {
      return NextResponse.json({ error: 'Não é possível excluir categorias padrão' }, { status: 400 })
    }

    const transactions = await getTransactionsByUserId(userId)
    let updatedCount = 0

    const updatedTransactions = transactions.map((transaction) => {
      if (String(transaction.category || '').toLowerCase() === category) {
        updatedCount += 1
        return {
          ...transaction,
          category: 'outros'
        }
      }
      return transaction
    })

    if (updatedCount === 0) {
      return NextResponse.json({ error: 'Gênero não encontrado' }, { status: 404 })
    }

    await saveTransactionsByUserId(userId, updatedTransactions)

    return NextResponse.json({
      message: 'Gênero removido com sucesso',
      updatedCount
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})