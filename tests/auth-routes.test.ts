import { beforeAll, describe, expect, it } from 'vitest'
import { POST as forgotPasswordPost } from '@/app/api/auth/forgot-password/route'
import { POST as loginPost } from '@/app/api/auth/login/route'
import { POST as registerPost } from '@/app/api/auth/register/route'
import { getUserByEmail, verifyPassword } from '@/lib/auth'

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret'
})

describe('auth API routes', () => {
  it('retorna mensagem unica para credenciais invalidas', async () => {
    const missingUserReq = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.1' },
      body: JSON.stringify({ email: 'naoexiste@example.com', password: 'senhaqualquer' })
    })

    const missingUserRes = await loginPost(missingUserReq as any)
    const missingUserBody = await missingUserRes.json()

    const uniqueEmail = `teste-${Date.now()}@example.com`
    const registerReq = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.2' },
      body: JSON.stringify({
        name: 'Usuario Teste',
        email: uniqueEmail,
        password: '12345678',
        securityQuestion: 'Qual o nome do seu primeiro pet?',
        securityAnswer: 'Bidu'
      })
    })

    const registerRes = await registerPost(registerReq as any)
    expect([200, 409]).toContain(registerRes.status)

    const wrongPasswordReq = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.3' },
      body: JSON.stringify({ email: uniqueEmail, password: 'senhaerrada' })
    })

    const wrongPasswordRes = await loginPost(wrongPasswordReq as any)
    const wrongPasswordBody = await wrongPasswordRes.json()

    expect(missingUserRes.status).toBe(401)
    expect(wrongPasswordRes.status).toBe(401)
    expect(missingUserBody.error).toBe('Credenciais inválidas')
    expect(wrongPasswordBody.error).toBe('Credenciais inválidas')
  })

  it('bloqueia excesso de tentativas de login por IP', async () => {
    const ip = '20.0.0.1'
    let lastStatus = 0

    for (let i = 0; i < 6; i += 1) {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
        body: JSON.stringify({ email: 'bruteforce@example.com', password: 'invalid' })
      })

      const res = await loginPost(req as any)
      lastStatus = res.status
    }

    expect(lastStatus).toBe(429)
  })

  it('recupera senha com pergunta de segurança', async () => {
    const email = `recovery-${Date.now()}@example.com`
    const initialPassword = '12345678'
    const newPassword = '87654321'
    const securityQuestion = 'Qual o nome da sua rua na infância?'
    const securityAnswer = 'Rua das Flores'

    const registerReq = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.4' },
      body: JSON.stringify({
        name: 'Recovery User',
        email,
        password: initialPassword,
        securityQuestion,
        securityAnswer
      })
    })

    const registerRes = await registerPost(registerReq as any)
    expect(registerRes.status).toBe(200)

    const forgotReq = new Request('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.5' },
      body: JSON.stringify({ email })
    })

    const forgotRes = await forgotPasswordPost(forgotReq as any)
    const forgotBody = await forgotRes.json()

    expect(forgotRes.status).toBe(200)
    expect(forgotBody.securityQuestion).toBe(securityQuestion)

    const resetReq = new Request('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.6' },
      body: JSON.stringify({ email, securityAnswer, password: newPassword })
    })

    const resetRes = await forgotPasswordPost(resetReq as any)
    const resetBody = await resetRes.json()

    expect(resetRes.status).toBe(200)
    expect(resetBody.message).toBe('Senha redefinida com sucesso.')

    const updatedUser = getUserByEmail(email)

    expect(updatedUser).not.toBeNull()
    expect(verifyPassword(newPassword, updatedUser!.password)).toBe(true)
    expect(verifyPassword(initialPassword, updatedUser!.password)).toBe(false)
  })
})
