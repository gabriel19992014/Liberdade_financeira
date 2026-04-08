'use client'

import { monthLabelPtBR } from '@/lib/utils/formatters'
import { getCategoryLabel } from '@/lib/utils/transaction-labels'

type FilterType = 'all' | 'income' | 'expense' | 'savings'
type FilterPeriod = 'all' | 'annual' | 'monthly'

type TransactionsFiltersCardProps = {
  filterType: FilterType
  setFilterType: (value: FilterType) => void
  filterPeriod: FilterPeriod
  setFilterPeriod: (value: FilterPeriod) => void
  filterYear: string
  setFilterYear: (value: string) => void
  filterMonth: string
  setFilterMonth: (value: string) => void
  filterCategory: string
  setFilterCategory: (value: string) => void
  yearOptions: string[]
  monthOptions: string[]
  genreOptions: string[]
  clearFilters: () => void
}

export function TransactionsFiltersCard({
  filterType,
  setFilterType,
  filterPeriod,
  setFilterPeriod,
  filterYear,
  setFilterYear,
  filterMonth,
  setFilterMonth,
  filterCategory,
  setFilterCategory,
  yearOptions,
  monthOptions,
  genreOptions,
  clearFilters
}: TransactionsFiltersCardProps) {
  return (
    <div className="panel-card mb-6 p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Filtros da Lista</h3>
        <p className="mt-1 text-sm text-slate-600">Filtre por período, ano, mês e gênero no mesmo padrão do dashboard.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700">Tipo</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="select-field"
          >
            <option value="all">Todos</option>
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
            <option value="savings">Poupança</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">Período</label>
          <select
            value={filterPeriod}
            onChange={(e) => {
              const nextPeriod = e.target.value as FilterPeriod
              setFilterPeriod(nextPeriod)
              if (nextPeriod === 'all') {
                setFilterYear('all')
                setFilterMonth('all')
              }
              if (nextPeriod === 'annual') {
                setFilterMonth('all')
              }
            }}
            className="select-field"
          >
            <option value="all">Todo Período</option>
            <option value="annual">Anual</option>
            <option value="monthly">Mensal</option>
          </select>
        </div>

        {filterPeriod !== 'all' && (
          <div>
            <label className="block text-sm font-semibold text-slate-700">Ano</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="select-field"
            >
              <option value="all">Todos os anos</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}

        {filterPeriod === 'monthly' && (
          <div>
            <label className="block text-sm font-semibold text-slate-700">Mês</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="select-field"
            >
              <option value="all">Todos os meses</option>
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {monthLabelPtBR(month)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700">Gênero</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="select-field"
          >
            <option value="all">Todos os gêneros</option>
            {genreOptions.map((genre) => (
              <option key={genre} value={genre}>{getCategoryLabel(genre)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={clearFilters}
            className="btn-secondary w-full"
          >
            Limpar filtros
          </button>
        </div>
      </div>
    </div>
  )
}
