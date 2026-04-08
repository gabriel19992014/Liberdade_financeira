import { NextRequest, NextResponse } from 'next/server'
import { getTransactionsByUserId } from '@/lib/auth'
import { requireAuth } from '@/lib/middleware'
import { resolveDateRange } from '@/lib/utils/date-range'
import { parseDateInput } from '@/lib/utils/dates'
import { listAvailableGenres, summarizeTransactions } from '@/lib/utils/reporting'
import type { Transaction } from '@/lib/types/finance'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/reports - Generate financial reports
export const GET = requireAuth(async (request: NextRequest, userId: string) => {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'monthly'
    const genre = searchParams.get('genre') || 'all'
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    const transactions = getTransactionsByUserId(userId) as Transaction[]
    const { startDate, endDate } = resolveDateRange(period, year, month)

    const periodTransactions = transactions.filter((t) => {
      const transactionDate = parseDateInput(t.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })

    const availableGenres = listAvailableGenres(periodTransactions)

    let filteredTransactions = periodTransactions

    if (genre && genre !== 'all') {
      filteredTransactions = filteredTransactions.filter((t) => t.category === genre)
    }
    const summary = summarizeTransactions(filteredTransactions)

    return NextResponse.json(
      {
        period,
        ...summary,
        availableGenres,
        transactions: filteredTransactions
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})