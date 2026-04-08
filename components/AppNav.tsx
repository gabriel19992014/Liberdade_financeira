'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BrandLogo } from '@/components/BrandLogo'

export function AppNav() {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    localStorage.removeItem('token')
    router.push('/')
  }

  function linkClass(href: string) {
    const active = pathname === href
    return active
      ? 'font-semibold text-cyan-600 dark:text-cyan-400'
      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
  }

  return (
    <nav className="border-b border-slate-200/80 bg-white/85 backdrop-blur-sm dark:bg-slate-900/90 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <BrandLogo href="/dashboard" compact />
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className={linkClass('/dashboard')}>
              Dashboard
            </Link>
            <Link href="/transactions" className={linkClass('/transactions')}>
              Transações
            </Link>
            <Link href="/curso" className={linkClass('/curso')}>
              Curso
            </Link>
            <button
              onClick={handleLogout}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
