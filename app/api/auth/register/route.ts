import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, createUser, hashPassword, normalizeSecurityAnswer } from '@/lib/auth'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { registerPayloadSchema } from '@/lib/schemas/auth'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const limit = rateLimit(`auth:register:${ip}`, { windowMs: 60_000, maxRequests: 3 })

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas de cadastro. Tente novamente em instantes.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limit.retryAfterSeconds)
          }
        }
      )
    }

    const body = await request.json()
    const { name, email, password, securityQuestion, securityAnswer } = registerPayloadSchema.parse(body)

    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
    }

    const hashedPassword = hashPassword(password)
    const hashedSecurityAnswer = hashPassword(normalizeSecurityAnswer(securityAnswer))
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      securityQuestion,
      securityAnswerHash: hashedSecurityAnswer
    })

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Payload inválido' }, { status: 400 })
    }

    console.error('Register error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}