import { describe, expect, it } from 'vitest'
import {
  createUser,
  generateToken,
  hashPassword,
  normalizeEmail,
  normalizeSecurityAnswer,
  verifySecurityAnswer,
  verifyToken
} from '@/lib/auth'

describe('auth utils', () => {
  it('normaliza email com trim e lowercase', () => {
    expect(normalizeEmail('  USER@Example.COM  ')).toBe('user@example.com')
  })

  it('gera e valida token JWT quando JWT_SECRET existe', () => {
    process.env.JWT_SECRET = 'test-secret'

    const token = generateToken('123')
    const decoded = verifyToken(token)

    expect(decoded).not.toBeNull()
    expect(decoded?.userId).toBe('123')
  })

  it('retorna null para token inválido', () => {
    process.env.JWT_SECRET = 'test-secret'
    expect(verifyToken('token-invalido')).toBeNull()
  })

  it('valida resposta de segurança ignorando acentos e caixa', () => {
    const email = `reset-auth-${Date.now()}@example.com`
    const user = createUser({
      name: 'Reset Auth Test',
      email,
      password: hashPassword('12345678'),
      securityQuestion: 'Qual seu filme favorito?',
      securityAnswerHash: hashPassword(normalizeSecurityAnswer('São Paulo'))
    })

    expect(verifySecurityAnswer(user, 'sao paulo')).toBe(true)
    expect(verifySecurityAnswer(user, 'Rio de Janeiro')).toBe(false)
  })
})
