import { NextRequest, NextResponse } from 'next/server'
import { getUserById, verifyToken } from './auth'

export function requireAuth(handler: (request: NextRequest, userId: string, context?: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context?: any) => {
    try {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Token de autenticação não fornecido' }, { status: 401 })
      }

      const token = authHeader.substring(7)
      const decoded = verifyToken(token)

      if (!decoded) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      }

      const user = await getUserById(decoded.userId)
      if (!user) {
        return NextResponse.json({ error: 'Sessão inválida. Faça login novamente.' }, { status: 401 })
      }

      return handler(request, decoded.userId, context)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
  }
}