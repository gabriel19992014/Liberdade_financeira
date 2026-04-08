'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BrandLogo } from '@/components/BrandLogo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (!securityQuestion) {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Não foi possível processar a solicitação.')
          return
        }

        setSecurityQuestion(data.securityQuestion || '')
        setMessage(data.message || 'Pergunta de segurança carregada.')
        return
      }

      if (password !== confirmPassword) {
        setError('As senhas não coincidem.')
        return
      }

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, securityAnswer, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Não foi possível processar a solicitação.')
        return
      }

      setMessage(data.message || 'Senha redefinida com sucesso.')
      setSecurityAnswer('')
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="glass-card w-full max-w-md px-6 py-8 sm:px-8 sm:py-10">
        <div>
          <div className="mb-5 flex justify-center">
            <BrandLogo href="/" subtitle="Recuperação protegida" />
          </div>
          <h2 className="text-center text-3xl font-black text-slate-900">Recuperar senha</h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            A recuperação só é possível com a resposta correta da sua pergunta de segurança.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="field"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {securityQuestion && (
              <>
                <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-800">
                  <p className="font-semibold">Pergunta de segurança</p>
                  <p className="mt-1">{securityQuestion}</p>
                </div>

                <input
                  id="securityAnswer"
                  name="securityAnswer"
                  type="text"
                  required
                  className="field"
                  placeholder="Resposta da pergunta de segurança"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                />

                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="field"
                  placeholder="Nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="field"
                  placeholder="Confirmar nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <div className="text-sm font-medium text-red-700">{error}</div>
            </div>
          )}

          {message && (
            <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <div className="text-sm font-medium text-emerald-700">{message}</div>
            </div>
          )}

          <div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Processando...' : securityQuestion ? 'Validar resposta e redefinir senha' : 'Continuar'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link href="/auth/login" className="font-semibold text-cyan-700 transition hover:text-cyan-800">
            Voltar para o login
          </Link>
        </p>
      </section>
    </main>
  )
}
