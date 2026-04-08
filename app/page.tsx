'use client'

import Link from 'next/link'
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated'
import { BrandLogo } from '@/components/BrandLogo'

export default function HomePage() {
  useRedirectIfAuthenticated('/dashboard', 100)

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-20 top-12 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
      </div>

      <section className="glass-card mx-auto w-full max-w-xl px-6 py-10 sm:px-10">
        <BrandLogo href="/" subtitle="Planejamento Financeiro" />
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700/90">Finance Hub</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
          Controle Financeiro
          <span className="block text-cyan-700">claro, rapido e inteligente.</span>
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
          Organize receitas, despesas e metas com uma experiencia profissional, fluida e pensada para
          tomada de decisao no dia a dia.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/auth/register" className="btn-primary">
            Comecar agora
          </Link>
          <Link href="/auth/login" className="btn-secondary">
            Ja tenho conta
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-slate-900/[0.04] px-3 py-3">
            <p className="text-lg font-bold text-slate-900">100%</p>
            <p className="text-xs text-slate-500">online</p>
          </div>
          <div className="rounded-xl bg-slate-900/[0.04] px-3 py-3">
            <p className="text-lg font-bold text-slate-900">24h</p>
            <p className="text-xs text-slate-500">acesso</p>
          </div>
          <div className="rounded-xl bg-slate-900/[0.04] px-3 py-3">
            <p className="text-lg font-bold text-slate-900">seguro</p>
            <p className="text-xs text-slate-500">seus dados</p>
          </div>
        </div>
      </section>
    </main>
  )
}