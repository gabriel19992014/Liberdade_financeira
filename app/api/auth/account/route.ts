import { NextRequest, NextResponse } from 'next/server'
import { deleteUserAccount } from '@/lib/auth'
import { requireAuth } from '@/lib/middleware'

export const DELETE = requireAuth(async (_request: NextRequest, userId: string) => {
  try {
    const deleted = await deleteUserAccount(userId)

    if (!deleted) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Conta excluida com sucesso' })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})
