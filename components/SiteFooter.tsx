export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-slate-200/80 bg-white/70 px-4 py-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/70">
      <p className="mx-auto w-full max-w-7xl text-xs text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} Liberdadade Financeira. Clareza para decidir melhor seu dinheiro.
      </p>
    </footer>
  )
}
