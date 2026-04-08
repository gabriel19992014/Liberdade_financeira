'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandLogo } from '@/components/BrandLogo'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, securityQuestion, securityAnswer })
      })

      if (res.ok) {
        router.push('/auth/login?message=Conta criada com sucesso')
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Erro ao criar conta')
      }
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
            <BrandLogo href="/" subtitle="Nova conta" />
          </div>
          <h2 className="text-center text-3xl font-black text-slate-900">Criar nova conta</h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Ou{' '}
            <Link href="/auth/login" className="font-semibold text-cyan-700 transition hover:text-cyan-800">
              entrar com uma conta existente
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
            A recuperação da senha só será possível com a resposta da pergunta de segurança cadastrada.
            Cada acesso é individual e o controle é pessoal.
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="name" className="sr-only">
                Nome
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="field"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
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
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="field"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="field"
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="securityQuestion" className="sr-only">
                Pergunta de segurança
              </label>
              <input
                id="securityQuestion"
                name="securityQuestion"
                type="text"
                required
                className="field"
                placeholder="Pergunta de segurança (ex.: Qual o nome do seu primeiro pet?)"
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="securityAnswer" className="sr-only">
                Resposta de segurança
              </label>
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
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <div className="text-sm font-medium text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">Comece a acompanhar suas financas em poucos segundos.</p>
      </section>
    </main>
  )
}