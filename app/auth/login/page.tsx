'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { BrandLogo } from '@/components/BrandLogo'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const message = searchParams.get('message') || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('token', data.token)
        router.push('/dashboard')
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Erro ao fazer login')
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
            <BrandLogo href="/" subtitle="Acesso seguro" />
          </div>
          <h2 className="text-center text-3xl font-black text-slate-900">Entrar na sua conta</h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Ou{' '}
            <Link href="/auth/register" className="font-semibold text-cyan-700 transition hover:text-cyan-800">
              criar uma nova conta
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-3">
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
                autoComplete="current-password"
                required
                className="field"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <div className="text-sm font-medium text-red-700">{error}</div>
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <div className="text-sm font-medium text-emerald-700">{message}</div>
            </div>
          )}

          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-800">
              Esqueci a senha
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">Seu acesso e protegido por token JWT.</p>
      </section>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center px-4 py-12"><div className="glass-card w-full max-w-md px-6 py-8 text-center text-sm text-slate-600">Carregando...</div></main>}>
      <LoginPageContent />
    </Suspense>
  )
}