import Link from 'next/link'

type BrandLogoProps = {
  href?: string
  subtitle?: string
  compact?: boolean
  className?: string
}

function LogoMark() {
  return (
    <svg viewBox="0 0 64 64" className="h-10 w-10" aria-hidden="true">
      <defs>
        <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#0f172a" stroke="#334155" strokeWidth="2" />
      <rect x="16" y="34" width="6" height="12" rx="2" fill="url(#brandGrad)" />
      <rect x="27" y="28" width="6" height="18" rx="2" fill="url(#brandGrad)" />
      <rect x="38" y="22" width="6" height="24" rx="2" fill="url(#brandGrad)" />
      <path d="M14 25c7-10 16-12 26-11" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
      <path d="M36 10l8 2-5 6" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BrandText({ compact, subtitle }: { compact: boolean; subtitle?: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-base font-black tracking-tight text-slate-900 dark:text-slate-100">Liberdadade Financeira</p>
      {!compact && (
        <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700/90 dark:text-cyan-400/90">
          {subtitle || 'Gestão Inteligente'}
        </p>
      )}
    </div>
  )
}

export function BrandLogo({ href = '/', subtitle, compact = false, className = '' }: BrandLogoProps) {
  const content = (
    <>
      <LogoMark />
      <BrandText compact={compact} subtitle={subtitle} />
    </>
  )

  if (!href) {
    return <div className={`inline-flex items-center gap-3 ${className}`.trim()}>{content}</div>
  }

  return (
    <Link href={href} className={`inline-flex items-center gap-3 ${className}`.trim()}>
      {content}
    </Link>
  )
}
