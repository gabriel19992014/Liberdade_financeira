'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppNav } from '@/components/AppNav'

const setupSteps = [
  {
    title: '1. Configure sua base',
    points: [
      'Cadastre primeiro suas entradas fixas (salário, renda extra).',
      'Depois adicione despesas recorrentes para não esquecer contas mensais.',
      'Defina uma categoria clara para cada movimentação.'
    ]
  },
  {
    title: '2. Registre no mesmo dia',
    points: [
      'Lançou gasto? Registre no app na hora para não perder controle.',
      'Use descrições curtas e úteis (ex.: Mercado semana 2).',
      'Revise semanalmente para corrigir categorias inconsistentes.'
    ]
  },
  {
    title: '3. Use o dashboard para decidir',
    points: [
      'Compare receitas x despesas antes de aumentar padrão de vida.',
      'Observe os gêneros com maior impacto no mês.',
      'Gere relatório em PDF para acompanhamento mensal.'
    ]
  }
]

const financialTips = [
  'Monte uma reserva de emergência com meta de 6 meses de custo fixo.',
  'Pague dívidas caras primeiro (cartão e cheque especial).',
  'Use a regra 50/30/20 como referência inicial e adapte para sua realidade.',
  'Automatize transferências para poupança/investimentos no dia do recebimento.',
  'Reavalie assinaturas e gastos invisíveis a cada 30 dias.'
]

const lifeImprovements = [
  'Planeje refeições da semana para reduzir desperdício e delivery por impulso.',
  'Durma melhor: energia alta evita decisões financeiras ruins por cansaço.',
  'Crie metas trimestrais simples (quitar dívida, aumentar reserva, reduzir gasto).',
  'Tenha um dia fixo de revisão financeira pessoal: 20 minutos por semana.',
  'Invista em aprendizado contínuo para aumentar renda no médio prazo.'
]

export default function CursoPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
    }
  }, [router])

  return (
    <main className="min-h-screen">
      <AppNav />

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="panel-card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-400">Curso</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100 sm:text-4xl">
            Guia Prático de Organização Financeira
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
            Estrutura rápida para você aprender a usar o projeto no dia a dia, tomar decisões melhores com seu dinheiro
            e criar hábitos que melhoram sua qualidade de vida.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <article className="panel-card p-5 sm:p-6 lg:col-span-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Como usar o projeto</h2>
            <div className="mt-4 space-y-5">
              {setupSteps.map((step) => (
                <div key={step.title} className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{step.title}</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                    {step.points.map((point) => (
                      <li key={point}>• {point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>

          <article className="panel-card p-5 sm:p-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Atalhos úteis</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>• Dashboard: visão geral do mês e relatório.</li>
              <li>• Transações: cadastro, edição e filtros por período.</li>
              <li>• Relatório PDF: histórico para revisão mensal.</li>
              <li>• Curso: plano de melhoria contínua.</li>
            </ul>
          </article>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="panel-card p-5 sm:p-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Dicas Financeiras</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {financialTips.map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          </article>

          <article className="panel-card p-5 sm:p-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Melhorias de Vida</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {lifeImprovements.map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  )
}
