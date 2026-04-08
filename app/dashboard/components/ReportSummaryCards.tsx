import type { ReportPayload } from '@/lib/types/finance'
import { formatCurrencyBRL } from '@/lib/utils/formatters'

type ReportSummaryCardsProps = {
  report: ReportPayload | null
}

export function ReportSummaryCards({ report }: ReportSummaryCardsProps) {
  const savingsValue = Math.abs(report?.savings ?? 0)

  return (
    <div className="mt-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Resumo do período selecionado</p>
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="panel-card overflow-hidden p-5">
        <p className="text-sm font-medium text-slate-500">Receitas</p>
        <p className="mt-2 text-lg font-semibold text-green-600">{report ? formatCurrencyBRL(report.income) : '0'}</p>
        </div>
        <div className="panel-card overflow-hidden p-5">
        <p className="text-sm font-medium text-slate-500">Despesas</p>
        <p className="mt-2 text-lg font-semibold text-red-600">{report ? formatCurrencyBRL(-report.expenses) : '0'}</p>
        </div>
        <div className="panel-card overflow-hidden p-5">
        <p className="text-sm font-medium text-slate-500">Poupança</p>
        <p className="mt-2 text-lg font-semibold text-yellow-600">{formatCurrencyBRL(savingsValue)}</p>
        </div>
        <div className="panel-card overflow-hidden p-5">
        <p className="text-sm font-medium text-slate-500">Saldo</p>
        <p className={`mt-2 text-lg font-semibold ${report && report.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
          {report ? formatCurrencyBRL(report.balance) : '0'}
        </p>
        </div>
      </div>
    </div>
  )
}
