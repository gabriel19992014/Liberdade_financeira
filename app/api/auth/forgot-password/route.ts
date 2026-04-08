import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, hashPassword, updateUserPassword, verifySecurityAnswer } from '@/lib/auth'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { forgotPasswordQuestionPayloadSchema, forgotPasswordResetPayloadSchema } from '@/lib/schemas/auth'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const limit = rateLimit(`auth:forgot-password:${ip}`, { windowMs: 60_000, maxRequests: 3 })

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Muitas solicitações. Tente novamente em instantes.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limit.retryAfterSeconds)
          }
        }
      )
    }

    const body = await request.json()

    if (typeof body?.securityAnswer === 'string' && typeof body?.password === 'string') {
      const { email, securityAnswer, password } = forgotPasswordResetPayloadSchema.parse(body)
      const user = getUserByEmail(email)

      if (!user || !user.securityQuestion || !user.securityAnswerHash) {
        return NextResponse.json(
          { error: 'Não foi possível recuperar a senha sem pergunta de segurança cadastrada.' },
          { status: 400 }
        )
      }

      if (!verifySecurityAnswer(user, securityAnswer)) {
        return NextResponse.json({ error: 'Resposta da pergunta de segurança inválida.' }, { status: 400 })
      }

      const updated = updateUserPassword(user.id, hashPassword(password))

      if (!updated) {
        return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
      }

      return NextResponse.json({ message: 'Senha redefinida com sucesso.' })
    }

    const { email } = forgotPasswordQuestionPayloadSchema.parse(body)
    const user = getUserByEmail(email)

    if (!user || !user.securityQuestion || !user.securityAnswerHash) {
      return NextResponse.json(
        { error: 'Não foi possível recuperar a senha sem pergunta de segurança cadastrada.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      securityQuestion: user.securityQuestion,
      message: 'Pergunta de segurança carregada. Responda corretamente para recuperar a senha.'
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Payload inválido' }, { status: 400 })
    }

    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
