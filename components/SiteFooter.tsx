"use client"

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { authFetch } from '@/services/api-client'

export function SiteFooter() {
  const router = useRouter()
  const pathname = usePathname()
  const [hasToken, setHasToken] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    setHasToken(Boolean(localStorage.getItem('token')))
  }, [pathname])

  const handleDeleteAccount = async () => {
    setFeedback('')

    const confirmed = window.confirm(
      'Tem certeza que deseja excluir sua conta? Essa acao remove suas transacoes e nao pode ser desfeita.'
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)

    try {
      const res = await authFetch('/api/auth/account', {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setFeedback(data?.error || 'Nao foi possivel excluir a conta agora.')
        return
      }

      localStorage.removeItem('token')
      router.push('/auth/register?message=Conta excluida com sucesso')
    } catch (error) {
      setFeedback('Erro de conexao. Tente novamente em instantes.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <footer className="mt-10 border-t border-slate-200/80 bg-white/70 px-4 py-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p className="text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Liberdade Financeira. Clareza para decidir melhor seu dinheiro.
        </p>

        {hasToken && (
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
            >
              {isDeleting ? 'Excluindo conta...' : 'Excluir usuario'}
            </button>
            {feedback && <p className="text-[11px] text-red-600 dark:text-red-300">{feedback}</p>}
          </div>
        )}
      </div>
    </footer>
  )
}
