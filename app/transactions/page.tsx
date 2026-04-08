'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/theme-provider'
import { AppNav } from '@/components/AppNav'
import { TransactionsFiltersCard } from '@/app/transactions/components/TransactionsFiltersCard'
import { TransactionsTableCard } from '@/app/transactions/components/TransactionsTableCard'
import type { Transaction, TransactionType } from '@/lib/types/finance'
import {
  transactionTypes,
  expenseClassifications,
  baseCategories as categories,
  baseCategoryValues as BASE_CATEGORY_VALUES,
  categoriesByType as CATEGORIES_BY_TYPE,
  defaultClassificationByType as DEFAULT_CLASSIFICATION,
  CUSTOM_CATEGORY_VALUE
} from '@/lib/constants/finance'
import { authFetch } from '@/services/api-client'
import { formatDateInput, getDateMonth, getDateSortValue, getDateYear } from '@/lib/utils/dates'
import { getCategoryLabel } from '@/lib/utils/transaction-labels'

type DeleteDialogState = {
  open: boolean
  mode: 'transaction' | 'genre' | null
  transaction: Transaction | null
  genre: string | null
}


export default function TransactionsPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'savings'>('all')
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'annual' | 'monthly'>('all')
  const [filterYear, setFilterYear] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type' | 'category'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    mode: null,
    transaction: null,
    genre: null
  })
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense' | 'savings',
    classification: 'passivo',
    category: 'alimentacao',
    amount: '',
    description: '',
    date: formatDateInput(new Date()),
    savingsOperation: 'deposit' as 'deposit' | 'withdraw'
  })
  const [customCategory, setCustomCategory] = useState('')
  const [showGenreManager, setShowGenreManager] = useState(false)
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setLoadingSaving] = useState(false)

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await authFetch('/api/transactions', {
        cache: 'no-store'
      })

      if (res.ok) {
        const data = await res.json()
        setTransactions(data)
      } else if (res.status === 401) {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.push('/auth/login')
      return
    }

    void fetchTransactions()
  }, [fetchTransactions, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const normalizedCustomCategory = customCategory
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

    const categoryToSave = formData.category === CUSTOM_CATEGORY_VALUE
      ? normalizedCustomCategory
      : formData.category

    if (!categoryToSave) {
      setFormError('Informe um gênero válido para continuar.')
      return
    }

    setLoadingSaving(true)

    try {
      const token = localStorage.getItem('token')
      const url = editingTransaction ? `/api/transactions/${editingTransaction.id}` : '/api/transactions'
      const method = editingTransaction ? 'PUT' : 'POST'

      const parsedAmount = parseFloat(formData.amount)
      const finalAmount =
        formData.type === 'savings' && formData.savingsOperation === 'withdraw'
          ? -Math.abs(parsedAmount)
          : Math.abs(parsedAmount)

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          amount: finalAmount,
          category: categoryToSave
        })
      })

      if (res.ok) {
        setShowForm(false)
        setEditingTransaction(null)
        resetForm()
        fetchTransactions()
      } else {
        const data = await res.json()
        setFormError(data.error || 'Não foi possível salvar a transação.')
      }
    } catch (error) {
      console.error('Erro ao salvar transação:', error)
      setFormError('Erro de conexão ao salvar transação.')
    } finally {
      setLoadingSaving(false)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    const hasKnownCategory = categories.some((category) => category.value === transaction.category)
    const classification = transaction.classification || DEFAULT_CLASSIFICATION[transaction.type] || ''
    setEditingTransaction(transaction)
    setFormData({
      type: transaction.type,
      classification,
      category: hasKnownCategory ? transaction.category : CUSTOM_CATEGORY_VALUE,
      amount: String(Math.abs(Number(transaction.amount))),
      description: transaction.description,
      date: transaction.date,
      savingsOperation: transaction.type === 'savings' && Number(transaction.amount) < 0 ? 'withdraw' : 'deposit'
    })
    setCustomCategory(hasKnownCategory ? '' : transaction.category)
    setFormError('')
    setShowForm(true)
  }

  const handleDelete = (transaction: Transaction) => {
    setDeleteDialog({
      open: true,
      mode: 'transaction',
      transaction,
      genre: null
    })
  }

  const confirmDeleteTransaction = async (id: string) => {
    setDeleteDialog({ open: false, mode: null, transaction: null, genre: null })

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        fetchTransactions()
      }
    } catch (error) {
      console.error('Erro ao excluir transação:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'expense',
      classification: 'passivo',
      category: 'alimentacao',
      amount: '',
      description: '',
      date: formatDateInput(new Date()),
      savingsOperation: 'deposit'
    })
    setCustomCategory('')
    setFormError('')
  }

  // Savings is always locked to poupanca. Custom genres are isolated by transaction type.
  const getVisibleCategories = (type: TransactionType) => {
    if (type === 'savings') return [{ value: 'poupanca', label: 'Poupança' }]
    const allowed = CATEGORIES_BY_TYPE[type] ?? []
    const filtered = categories.filter((cat) => allowed.includes(cat.value))
    const custom = customGenresByType[type].map((genre) => ({ value: genre, label: getCategoryLabel(genre) }))
    return [...filtered, ...custom]
  }

  const handleTypeChange = (newType: TransactionType) => {
    const newClassification = DEFAULT_CLASSIFICATION[newType]
    const visibleCats = getVisibleCategories(newType)
    const newCategory = visibleCats[0]?.value ?? 'outros'
    setFormData({ ...formData, type: newType, classification: newClassification, category: newCategory })
  }

  const getTypeOrder = (type: Transaction['type']) => {
    if (type === 'income') return 0
    if (type === 'expense') return 1
    return 2
  }

  const getSortIndicator = (column: 'date' | 'amount' | 'type' | 'category') => {
    if (sortBy !== column) return '↕'
    return sortDirection === 'asc' ? '↑' : '↓'
  }


  const handleSort = (column: 'date' | 'amount' | 'type' | 'category') => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortBy(column)
    setSortDirection(column === 'date' ? 'desc' : 'asc')
  }

  const customGenres = Array.from(
    new Set(
      transactions
        .map((transaction) => transaction.category)
        .filter((category) => category && !BASE_CATEGORY_VALUES.has(category))
    )
  ).sort((a, b) => getCategoryLabel(a).localeCompare(getCategoryLabel(b), 'pt-BR'))

  const customGenresByType = {
    income: Array.from(
      new Set(
        transactions
          .filter((transaction) => transaction.type === 'income')
          .map((transaction) => transaction.category)
          .filter((category) => category && !BASE_CATEGORY_VALUES.has(category))
      )
    ).sort((a, b) => getCategoryLabel(a).localeCompare(getCategoryLabel(b), 'pt-BR')),
    expense: Array.from(
      new Set(
        transactions
          .filter((transaction) => transaction.type === 'expense')
          .map((transaction) => transaction.category)
          .filter((category) => category && !BASE_CATEGORY_VALUES.has(category))
      )
    ).sort((a, b) => getCategoryLabel(a).localeCompare(getCategoryLabel(b), 'pt-BR')),
    savings: [] as string[]
  }

  const yearOptions = Array.from(
    new Set(
      transactions.map((transaction) => getDateYear(transaction.date))
    )
  ).sort((a, b) => (a > b ? -1 : 1))

  const monthOptions = Array.from(
    new Set(
      transactions
        .filter((transaction) => {
          if (filterYear === 'all') return true
          return getDateYear(transaction.date) === filterYear
        })
        .map((transaction) => getDateMonth(transaction.date))
    )
  ).sort((a, b) => Number(a) - Number(b))

  const genreOptions = Array.from(
    new Set(
      transactions
        .filter((t) => filterType === 'all' || t.type === filterType)
        .map((t) => t.category)
    )
  ).sort((a, b) =>
    getCategoryLabel(a).localeCompare(getCategoryLabel(b), 'pt-BR')
  )

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterType !== 'all' && transaction.type !== filterType) return false
    if (filterCategory !== 'all' && transaction.category !== filterCategory) return false

    const transactionYear = getDateYear(transaction.date)
    const transactionMonth = getDateMonth(transaction.date)

    if (filterPeriod === 'annual') {
      if (filterYear !== 'all' && transactionYear !== filterYear) return false
    }

    if (filterPeriod === 'monthly') {
      if (filterYear !== 'all' && transactionYear !== filterYear) return false
      if (filterMonth !== 'all' && transactionMonth !== filterMonth) return false
    }

    return true
  })

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let result = 0

    if (sortBy === 'date') {
      result = getDateSortValue(a.date) - getDateSortValue(b.date)
    } else if (sortBy === 'amount') {
      result = Number(a.amount) - Number(b.amount)
    } else if (sortBy === 'type') {
      result = getTypeOrder(a.type) - getTypeOrder(b.type)
    } else {
      result = getCategoryLabel(a.category).localeCompare(getCategoryLabel(b.category), 'pt-BR')
    }

    return sortDirection === 'asc' ? result : -result
  })

  const clearFilters = () => {
    setFilterType('all')
    setFilterPeriod('all')
    setFilterYear('all')
    setFilterMonth('all')
    setFilterCategory('all')
  }

  const handleDeleteGenre = (genreValue: string) => {
    setDeleteDialog({
      open: true,
      mode: 'genre',
      transaction: null,
      genre: genreValue
    })
  }

  const confirmDeleteGenre = async (genreValue: string) => {
    setDeleteDialog({ open: false, mode: null, transaction: null, genre: null })

    setFormError('')
    setLoadingSaving(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/transactions?category=${encodeURIComponent(genreValue)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        if (formData.category === genreValue) {
          setFormData((prev) => ({ ...prev, category: 'outros' }))
        }

        if (customCategory === genreValue) {
          setCustomCategory('')
        }

        await fetchTransactions()
      } else {
        const data = await res.json()
        setFormError(data.error || 'Não foi possível excluir o gênero.')
      }
    } catch (error) {
      console.error('Erro ao excluir gênero:', error)
      setFormError('Erro de conexão ao excluir gênero.')
    } finally {
      setLoadingSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900'}`}>
      <AppNav />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Transações</h2>
            <button
              onClick={() => {
                setShowForm(true)
                setEditingTransaction(null)
                resetForm()
              }}
              className="btn-primary"
            >
              Nova Transação
            </button>
          </div>

          {showForm && (
            <div className="panel-card mb-6 p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                    {formError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Tipo</label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleTypeChange(e.target.value as 'income' | 'expense' | 'savings')}
                      className="select-field"
                      required
                    >
                      {transactionTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {formData.type === 'expense' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">Classificação</label>
                      <select
                        value={formData.classification}
                        onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                        className="select-field"
                      >
                        {expenseClassifications.map((classification) => (
                          <option key={classification.value} value={classification.value}>{classification.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.type === 'savings' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">Operação</label>
                      <select
                        value={formData.savingsOperation}
                        onChange={(e) => setFormData({ ...formData, savingsOperation: e.target.value as 'deposit' | 'withdraw' })}
                        className="select-field"
                      >
                        <option value="deposit">Adicionar saldo</option>
                        <option value="withdraw">Retirada</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Gênero</label>
                    {formData.type === 'savings' ? (
                      <input
                        type="text"
                        value="Poupança"
                        readOnly
                        className="field cursor-not-allowed opacity-80"
                      />
                    ) : (
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="select-field"
                        required
                      >
                        {getVisibleCategories(formData.type).map((category) => (
                          <option key={category.value} value={category.value}>{category.label}</option>
                        ))}
                        <option value={CUSTOM_CATEGORY_VALUE}>+ Adicionar novo gênero</option>
                      </select>
                    )}
                  </div>

                  {formData.category === CUSTOM_CATEGORY_VALUE && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">Novo gênero</label>
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="field"
                        placeholder="Ex: Academia"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Valor</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="field"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700">Descrição (opcional)</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Data</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="field"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingTransaction(null)
                    }}
                    className="btn-secondary px-4 py-2"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary px-4 py-2"
                  >
                    {saving ? 'Salvando...' : (editingTransaction ? 'Atualizar' : 'Salvar')}
                  </button>
                </div>

                {customGenres.length > 0 && (
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">Gêneros personalizados</h4>
                        <p className="mt-1 text-xs text-slate-500">Gerencie ou remova gêneros criados por você.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGenreManager((prev) => !prev)}
                        className="btn-secondary rounded-full px-3 py-1.5 text-xs"
                      >
                        {showGenreManager ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>

                    {showGenreManager && (
                      <div className="mt-3 rounded-xl border border-red-200 bg-red-50/60 p-3">
                        <p className="text-xs text-red-700">
                          Ao excluir um gênero, as transações dele são movidas automaticamente para &quot;Outros&quot;.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {customGenres.map((genre) => (
                            <button
                              key={genre}
                              type="button"
                              onClick={() => handleDeleteGenre(genre)}
                              disabled={saving}
                              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Excluir {getCategoryLabel(genre)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
          )}

          <TransactionsFiltersCard
            filterType={filterType}
            setFilterType={setFilterType}
            filterPeriod={filterPeriod}
            setFilterPeriod={setFilterPeriod}
            filterYear={filterYear}
            setFilterYear={setFilterYear}
            filterMonth={filterMonth}
            setFilterMonth={setFilterMonth}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            yearOptions={yearOptions}
            monthOptions={monthOptions}
            genreOptions={genreOptions}
            clearFilters={clearFilters}
          />

          <TransactionsTableCard
            theme={theme}
            sortedTransactions={sortedTransactions}
            getSortIndicator={getSortIndicator}
            handleSort={handleSort}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            setShowForm={setShowForm}
          />

          {deleteDialog.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
              <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} w-full max-w-md rounded-xl border p-5 shadow-2xl`}>
                <h3 className="text-lg font-semibold">
                  {deleteDialog.mode === 'transaction' ? 'Excluir transação' : 'Excluir gênero'}
                </h3>
                <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {deleteDialog.mode === 'transaction'
                    ? `Deseja realmente excluir "${deleteDialog.transaction?.description}"?`
                    : `Deseja excluir o gênero "${getCategoryLabel(deleteDialog.genre || '')}"? As transações dele irão para "Outros".`}
                </p>

                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteDialog({ open: false, mode: null, transaction: null, genre: null })}
                    className={`${theme === 'dark' ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} rounded-md px-3 py-2 text-sm font-medium`}
                  >
                    Cancelar
                  </button>

                  {deleteDialog.mode === 'transaction' && deleteDialog.transaction && (
                    <button
                      type="button"
                      onClick={() => {
                        handleEdit(deleteDialog.transaction as Transaction)
                        setDeleteDialog({ open: false, mode: null, transaction: null, genre: null })
                      }}
                      className="rounded-md bg-cyan-700 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-800"
                    >
                      Editar transação
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (deleteDialog.mode === 'transaction' && deleteDialog.transaction) {
                        void confirmDeleteTransaction(deleteDialog.transaction.id)
                        return
                      }
                      if (deleteDialog.mode === 'genre' && deleteDialog.genre) {
                        void confirmDeleteGenre(deleteDialog.genre)
                      }
                    }}
                    className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}