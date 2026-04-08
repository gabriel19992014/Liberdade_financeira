import { beforeAll, describe, expect, it } from 'vitest'
import { POST as transactionsPost } from '@/app/api/transactions/route'
import { createUser, generateToken, getUserByEmail, hashPassword } from '@/lib/auth'

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret'
})

describe('transactions API validation', () => {
  it('retorna 400 para valor invalido no payload', async () => {
    const email = `tx-${Date.now()}@example.com`
    let user = await getUserByEmail(email)

    if (!user) {
      user = await createUser({
        name: 'Usuario Transacao Teste',
        email,
        password: hashPassword('12345678'),
        securityQuestion: 'Qual seu prato favorito?',
        securityAnswerHash: hashPassword('lasanha')
      })
    }

    const token = generateToken(user.id)

    const req = new Request('http://localhost/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'expense',
        classification: 'passivo',
        category: 'alimentacao',
        amount: 'abc',
        description: 'teste',
        date: '2026-04-08'
      })
    })

    const res = await transactionsPost(req as any)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBeTruthy()
  })
})
