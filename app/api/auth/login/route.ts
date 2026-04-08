import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, verifyPassword, generateToken } from '@/lib/auth'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { loginPayloadSchema } from '@/lib/schemas/auth'
import { ZodError } from 'zod'

const DUMMY_PASSWORD_HASH = '$2a$10$7EqJtq98hPqEX7fNZaFWoOeE6uQ6nT6riw37ht4H59sj2CCOrZvXS'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const limit = rateLimit(`auth:login:${ip}`, { windowMs: 60_000, maxRequests: 5 })

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limit.retryAfterSeconds)
          }
        }
      )
    }

    const body = await request.json()
    const { email, password } = loginPayloadSchema.parse(body)

    const user = getUserByEmail(email)
    const isValidPassword = user
      ? verifyPassword(password, user.password)
      : verifyPassword(password, DUMMY_PASSWORD_HASH)

    if (!user || !isValidPassword) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    const token = generateToken(user.id)

    return NextResponse.json({
      token,
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

    console.error('Login error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}