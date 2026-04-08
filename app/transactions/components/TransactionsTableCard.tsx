'use client'

import type { Transaction } from '@/lib/types/finance'
import { formatCurrencyBRL } from '@/lib/utils/formatters'
import { formatDateBR } from '@/lib/utils/dates'
import { getCategoryLabel, getClassificationLabel, getTransactionTypeLabel } from '@/lib/utils/transaction-labels'

type ThemeMode = 'light' | 'dark'
type SortColumn = 'date' | 'amount' | 'type' | 'category'

type TransactionsTableCardProps = {
  theme: ThemeMode
  sortedTransactions: Transaction[]
  getSortIndicator: (column: SortColumn) => string
  handleSort: (column: SortColumn) => void
  handleEdit: (transaction: Transaction) => void
  handleDelete: (transaction: Transaction) => void
  setShowForm: (value: boolean) => void
}

export function TransactionsTableCard({
  theme,
  sortedTransactions,
  getSortIndicator,
  handleSort,
  handleEdit,
  handleDelete,
  setShowForm
}: TransactionsTableCardProps) {
  return (
    <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow overflow-hidden rounded-md border`}>
      {sortedTransactions.length === 0 ? (
        <div className={`px-6 py-8 text-center ${theme === 'dark' ? 'text-slate-300' : 'text-gray-500'}`}>
          Nenhuma transação encontrada para os filtros atuais.{' '}
          <button onClick={() => setShowForm(true)} className="text-cyan-600 hover:text-cyan-500">Adicione a primeira</button>.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className={theme === 'dark' ? 'bg-slate-950/60' : 'bg-slate-50'}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  <button type="button" onClick={() => handleSort('date')} className="inline-flex items-center gap-1">
                    Data <span>{getSortIndicator('date')}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  <button type="button" onClick={() => handleSort('type')} className="inline-flex items-center gap-1">
                    Tipo <span>{getSortIndicator('type')}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  <button type="button" onClick={() => handleSort('category')} className="inline-flex items-center gap-1">
                    Gênero <span>{getSortIndicator('category')}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Classificação
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                  <button type="button" onClick={() => handleSort('amount')} className="inline-flex items-center gap-1">
                    Valor <span>{getSortIndicator('amount')}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'}`}>
              {sortedTransactions.map((transaction) => {
                const classificationLabel = transaction.type === 'savings' ? 'Passivo' : getClassificationLabel(transaction.classification)
                return (
                  <tr key={transaction.id} className={theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                    <td className={`whitespace-nowrap px-4 py-3 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      {formatDateBR(transaction.date)}
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                      {transaction.description}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        transaction.type === 'income'
                          ? 'bg-emerald-100 text-emerald-800'
                          : transaction.type === 'expense'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {getTransactionTypeLabel(transaction.type)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                      {getCategoryLabel(transaction.category)}
                    </td>
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      {classificationLabel}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3 text-right text-sm font-semibold ${
                      transaction.type === 'income'
                        ? 'text-emerald-600'
                        : transaction.type === 'expense'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                    }`}>
                      {Number(transaction.amount) > 0 && transaction.type !== 'savings' ? (transaction.type === 'income' ? '+' : '-') : ''}
                      {formatCurrencyBRL(Number(transaction.amount))}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="mr-3 text-cyan-600 hover:text-cyan-500"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(transaction)}
                        className="text-rose-600 hover:text-rose-500"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
