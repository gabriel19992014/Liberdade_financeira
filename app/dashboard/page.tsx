'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { baseCategories } from '@/lib/constants/finance'
import { AppNav } from '@/components/AppNav'
import { ReportSummaryCards } from '@/app/dashboard/components/ReportSummaryCards'
import type { ReportPayload as Report } from '@/lib/types/finance'
import { authFetch } from '@/services/api-client'
import { formatCurrencyBRL, monthLabelPtBR } from '@/lib/utils/formatters'
import { formatDateBR } from '@/lib/utils/dates'
import { getCategoryLabel, getClassificationLabel, getTransactionTypeLabel } from '@/lib/utils/transaction-labels'

const baseGenreOptions = [
  { value: '', label: 'Todos os gêneros' },
  ...baseCategories
]

const reportTypes = [
  { value: 'withChart', label: 'Com gráfico' },
  { value: 'withoutChart', label: 'Sem gráfico' }
]

const chartViews = [
  { value: 'classification', label: 'Classificação' },
  { value: 'genre', label: 'Gênero' }
]

export default function DashboardPage() {
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [reportError, setReportError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [period, setPeriod] = useState('monthly')
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'))
  const [genre, setGenre] = useState('')
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie')
  const [chartView, setChartView] = useState<'classification' | 'genre'>('genre')
  const [reportType, setReportType] = useState<'withChart' | 'withoutChart'>('withChart')
  const [showSavings, setShowSavings] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingReport, setLoadingReport] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    setIsAuthenticated(true)
  }, [router])

  useEffect(() => {
    if (!report || !genre) return
    if (report.availableGenres.includes(genre)) return
    setGenre('')
  }, [report, genre])

  const fetchReport = useCallback(async (): Promise<Report | null> => {
    setReportError('')
    setLoadingReport(true)

    try {
      const query = new URLSearchParams({
        period,
        genre: genre || 'all'
      })

      if (period !== 'all') {
        query.set('year', year)
      }

      if (period === 'monthly') {
        query.set('month', month)
      }

      const res = await authFetch(`/api/reports?${query.toString()}`, {
        cache: 'no-store'
      })

      if (res.ok) {
        const data = await res.json()
        setReport(data)
        return data as Report
      } else if (res.status === 401) {
        router.push('/auth/login')
        return null
      } else {
        throw new Error('Erro ao carregar relatório')
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
      setReportError('Não foi possível carregar o relatório no momento.')
      return null
    } finally {
      setLoading(false)
      setLoadingReport(false)
    }
  }, [genre, month, period, router, year])

  const handleGeneratePdfReport = useCallback(async () => {
    setReportError('')
    setGeneratingPdf(true)

    try {
      const latestReport = await fetchReport()

      if (!latestReport) {
        return
      }

      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ])

      const doc = new jsPDF({ unit: 'mm', format: 'a4' })

      const hexToRgb = (hex: string): [number, number, number] => {
        const value = hex.replace('#', '')
        const parsed = Number.parseInt(value, 16)
        return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255]
      }

      const drawBarChart = (
        title: string,
        items: Array<{ label: string; value: number; color: string }>,
        startY: number
      ): number => {
        const chartLeft = 14
        const labelWidth = 44
        const valueWidth = 34
        const barWidth = 95
        const rowHeight = 8

        doc.setFontSize(12)
        doc.text(title, chartLeft, startY)

        const maxValue = Math.max(1, ...items.map((item) => Math.abs(item.value)))
        let currentY = startY + 7

        items.forEach((item) => {
          const width = (Math.abs(item.value) / maxValue) * barWidth
          const [r, g, b] = hexToRgb(item.color)

          doc.setFontSize(9)
          doc.setTextColor(31, 41, 55)
          doc.text(item.label, chartLeft, currentY + 5)

          doc.setFillColor(241, 245, 249)
          doc.roundedRect(chartLeft + labelWidth, currentY + 1, barWidth, 4.5, 1, 1, 'F')

          if (width > 0) {
            doc.setFillColor(r, g, b)
            doc.roundedRect(chartLeft + labelWidth, currentY + 1, width, 4.5, 1, 1, 'F')
          }

          doc.setTextColor(17, 24, 39)
          doc.text(formatCurrencyBRL(item.value), chartLeft + labelWidth + barWidth + 4, currentY + 5)

          currentY += rowHeight
        })

        return currentY + 2
      }

      const drawPdfBrand = () => {
        doc.setFillColor(15, 23, 42)
        doc.roundedRect(14, 9, 14, 14, 2.5, 2.5, 'F')

        doc.setFillColor(6, 182, 212)
        doc.roundedRect(18, 17, 1.8, 4.5, 0.8, 0.8, 'F')
        doc.roundedRect(21.2, 15, 1.8, 6.5, 0.8, 0.8, 'F')
        doc.roundedRect(24.4, 13, 1.8, 8.5, 0.8, 0.8, 'F')

        doc.setDrawColor(34, 197, 94)
        doc.setLineWidth(0.8)
        doc.line(16.7, 16, 22.3, 12.7)
        doc.line(22.3, 12.7, 25.8, 12.9)

        doc.setFontSize(11)
        doc.setTextColor(14, 116, 144)
        doc.text('Liberdadade Financeira', 31, 15)
        doc.setFontSize(9)
        doc.setTextColor(100, 116, 139)
        doc.text('Relatório gerencial', 31, 20)
      }

      const periodLabel =
        period === 'monthly'
          ? `Mensal - ${monthLabelPtBR(month)}/${year}`
          : period === 'annual'
            ? `Anual - ${year}`
            : 'Todo período'

      const genreLabel = genre ? getCategoryLabel(genre) : 'Todos os gêneros'

      drawPdfBrand()

      doc.setFontSize(18)
      doc.setTextColor(15, 23, 42)
      doc.text('Relatório Financeiro', 14, 31)

      doc.setFontSize(11)
      doc.text(`Período: ${periodLabel}`, 14, 39)
      doc.text(`Gênero: ${genreLabel}`, 14, 45)
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 51)

      autoTable(doc, {
        startY: 57,
        head: [['Resumo', 'Valor']],
        body: [
          ['Receitas', formatCurrencyBRL(latestReport.income)],
          ['Despesas', formatCurrencyBRL(-latestReport.expenses)],
          ['Poupança', formatCurrencyBRL(Math.abs(latestReport.savings))],
          ['Saldo', formatCurrencyBRL(latestReport.balance)],
          ['Total de transações', String(latestReport.transactionCount)]
        ],
        styles: { fontSize: 10 }
      })

      const summaryEndY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 57

      const allClassificationItems = [
        { key: 'ativo', label: 'Ativo', value: latestReport.classificationTotals.ativo, color: '#22c55e' },
        { key: 'passivo', label: 'Passivo', value: latestReport.classificationTotals.passivo, color: '#ef4444' },
        { key: 'cartaoCredito', label: 'Cartão de Crédito', value: latestReport.classificationTotals.cartaoCredito, color: '#3b82f6' },
        { key: 'outros', label: 'Outros', value: latestReport.classificationTotals.outros, color: '#8b5cf6' },
        { key: 'poupanca', label: 'Poupança', value: latestReport.classificationTotals.poupanca, color: '#f59e0b' }
      ]

      const classificationItems = showSavings
        ? allClassificationItems
        : allClassificationItems.filter((item) => item.key !== 'poupanca')

      const genreEntries = Object.entries(latestReport.genreTotals).sort((a, b) => b[1] - a[1])
      const genreItems = genreEntries.reduce((acc: Array<{ label: string; value: number; color: string }>, [genreKey, amount], index) => {
        const colors = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#0ea5e9', '#14b8a6', '#f97316']
        if (index < 5) {
          acc.push({
            label: getCategoryLabel(genreKey),
            value: amount,
            color: colors[index % colors.length]
          })
          return acc
        }

        const otherItem = acc.find((item) => item.label === 'Outros gêneros')
        if (otherItem) {
          otherItem.value += amount
        } else {
          acc.push({ label: 'Outros gêneros', value: amount, color: '#a855f7' })
        }
        return acc
      }, [])

      let chartEndY = summaryEndY + 8

      if (reportType === 'withChart') {
        chartEndY = drawBarChart('Gráfico de Classificação', classificationItems, summaryEndY + 8)
        chartEndY = drawBarChart('Gráfico de Gênero', genreItems, chartEndY + 2)
      }

      const transactionsStartY = reportType === 'withChart' ? chartEndY + 2 : summaryEndY + 8

      autoTable(doc, {
        startY: transactionsStartY,
        head: [['Data', 'Tipo', 'Classificação', 'Gênero', 'Descrição', 'Valor']],
        body: latestReport.transactions.map((transaction) => [
          formatDateBR(transaction.date),
          getTransactionTypeLabel(transaction.type),
          transaction.type === 'savings' ? 'Passivo' : getClassificationLabel(transaction.classification),
          getCategoryLabel(transaction.category),
          transaction.description || '-',
          formatCurrencyBRL(Number(transaction.amount))
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [14, 116, 144] },
        columnStyles: {
          4: { cellWidth: 48 },
          5: { halign: 'right' }
        }
      })

      const filePeriod = period === 'monthly' ? `${year}-${month}` : period === 'annual' ? year : 'geral'
      doc.save(`relatorio-financeiro-${filePeriod}.pdf`)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      setReportError('Não foi possível gerar o PDF do relatório.')
    } finally {
      setGeneratingPdf(false)
    }
  }, [fetchReport, genre, month, period, reportType, showSavings, year])

  useEffect(() => {
    if (!isAuthenticated) return
    void fetchReport()
  }, [isAuthenticated, fetchReport])

  const genreOptions = [
    ...baseGenreOptions,
    ...(report?.availableGenres || [])
      .filter((key) => key && !baseGenreOptions.some((option) => option.value === key))
      .map((key) => ({ value: key, label: getCategoryLabel(key) }))
  ]

  const genreLabelMap = genreOptions.reduce((map, option) => {
    map[option.value] = option.label
    return map
  }, {} as Record<string, string>)

  const renderChart = () => {
    if (!report) return null

    const allClassificationItems = [
      { key: 'ativo', label: 'Ativo', value: report.classificationTotals.ativo, color: '#22c55e' },
      { key: 'passivo', label: 'Passivo', value: report.classificationTotals.passivo, color: '#ef4444' },
      { key: 'cartaoCredito', label: 'Cartão de Crédito', value: report.classificationTotals.cartaoCredito, color: '#3b82f6' },
      { key: 'outros', label: 'Outros', value: report.classificationTotals.outros, color: '#8b5cf6' },
      { key: 'poupanca', label: 'Poupança', value: report.classificationTotals.poupanca, color: '#f59e0b' }
    ]

    const classificationItems = showSavings
      ? allClassificationItems
      : allClassificationItems.filter((item) => item.key !== 'poupanca')
    const classificationBaseTotal = classificationItems.reduce((sum, item) => sum + item.value, 0)

    const genreEntries = Object.entries(report.genreTotals)
      .sort((a, b) => b[1] - a[1])

    const genreItems = genreEntries.reduce((acc: Array<{ key: string; label: string; value: number; color: string }>, [genreKey, amount], index) => {
      const colors = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#0ea5e9', '#14b8a6', '#f97316']
      if (index < 5) {
        acc.push({
          key: `genre-${index}`,
          label: genreLabelMap[genreKey] || getCategoryLabel(genreKey),
          value: amount,
          color: colors[index % colors.length]
        })
      } else {
        const otherItem = acc.find((item) => item.key === 'genre-other')
        if (otherItem) {
          otherItem.value += amount
        } else {
          acc.push({
            key: 'genre-other',
            label: 'Outros gêneros',
            value: amount,
            color: '#a855f7'
          })
        }
      }
      return acc
    }, [])

    const chartItems = chartView === 'classification' ? classificationItems : genreItems
    const totalValue = chartView === 'classification'
      ? classificationBaseTotal
      : genreItems.reduce((sum, item) => sum + item.value, 0)
    const hasValues = totalValue > 0

    if (chartType === 'pie') {
      const radius = 70
      const circumference = 2 * Math.PI * radius
      let offset = 0

      return (
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
          <div className="flex items-center justify-center bg-white shadow rounded-xl p-6 w-full max-w-[360px]">
            <svg viewBox="0 0 220 220" className="w-full h-full max-w-[240px] max-h-[240px]">
              <circle cx="110" cy="110" r={radius} fill="#f3f4f6" />
              {chartItems.map((item) => {
                const dash = hasValues ? (item.value / totalValue) * circumference : 0
                const strokeDasharray = `${dash} ${circumference}`
                const circle = (
                  <circle
                    key={item.key}
                    cx="110"
                    cy="110"
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="30"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 110 110)"
                  />
                )
                offset -= dash
                return circle
              })}
              <circle cx="110" cy="110" r={radius - 22} fill="#ffffff" />
              <text x="110" y="110" textAnchor="middle" dominantBaseline="middle" className="text-sm font-semibold fill-slate-700">
                {hasValues ? (chartView === 'classification' ? 'Classificação' : 'Gênero') : 'Sem dados'}
              </text>
            </svg>
          </div>

          <div className="grid grid-cols-1 gap-3 w-full max-w-[360px]">
            {chartItems.map((item) => {
              const percent = hasValues ? ((item.value / totalValue) * 100).toFixed(1) : '0.0'
              return (
                <div key={item.key} className="p-4 rounded-lg bg-white shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div className="text-sm text-slate-700">
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-xs text-slate-500">{hasValues ? `${percent}% do total` : '0%'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">{hasValues ? formatCurrencyBRL(item.value) : '0'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {chartItems.map((item) => {
          const widthPercent = !hasValues || item.value <= 0
            ? 0
            : Math.max((item.value / totalValue) * 100, 4)
          const percent = hasValues ? ((item.value / totalValue) * 100).toFixed(1) : '0.0'
          return (
            <div key={item.key} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                </div>
                <span className="text-sm text-slate-600">{percent}%</span>
              </div>
              <div className="mb-2 text-right text-sm text-slate-600">
                {formatCurrencyBRL(item.value)}
              </div>
              <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${widthPercent}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass-card w-full max-w-sm p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-700"></div>
          <p className="mt-4 text-sm font-medium text-slate-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AppNav />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Relatório Financeiro</h2>
                <p className="mt-1 text-sm text-slate-600">Gere relatórios mensais ou anuais com ou sem gráfico e filtre por gênero.</p>
              </div>
              <button
                onClick={handleGeneratePdfReport}
                disabled={loadingReport || generatingPdf}
                className="btn-primary"
              >
                {loadingReport || generatingPdf ? 'Gerando PDF...' : 'Gerar Relatório (PDF)'}
              </button>
            </div>

            <div className="panel-card mt-6 p-5">
              <div className="grid gap-4 lg:grid-cols-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Período</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="select-field"
                  >
                    <option value="monthly">Mensal</option>
                    <option value="annual">Anual</option>
                    <option value="all">Todo Período</option>
                  </select>
                </div>

                {period !== 'all' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Ano</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="select-field"
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {period === 'monthly' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Mês</label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="select-field"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={String(m).padStart(2, '0')}>
                          {monthLabelPtBR(String(m).padStart(2, '0'))}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Gênero</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="select-field"
                >
                  {genreOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Relatório</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as 'withChart' | 'withoutChart')}
                    className="select-field"
                  >
                    {reportTypes.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {reportType === 'withChart' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">Tipo de gráfico</label>
                      <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value as 'pie' | 'bar')}
                        className="select-field"
                      >
                        <option value="pie">Pizza</option>
                        <option value="bar">Barra</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700">Visualização</label>
                      <select
                        value={chartView}
                        onChange={(e) => setChartView(e.target.value as 'classification' | 'genre')}
                        className="select-field"
                      >
                        {chartViews.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            {reportError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {reportError}
              </div>
            )}

            <ReportSummaryCards report={report} />

            {reportType === 'withChart' && (
              <div className="panel-card mt-6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{chartView === 'classification' ? 'Gráfico de Classificação' : 'Gráfico de Gênero'}</h3>
                    <p className="text-sm text-slate-500">
                      {chartView === 'classification'
                        ? 'Mostra a distribuição de Ativo, Passivo, Cartão de Crédito e Poupança.'
                        : 'Mostra a distribuição dos valores por gênero/categoria.'}
                    </p>
                  </div>
                  {chartView === 'classification' && (
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                      <input
                        type="checkbox"
                        checked={showSavings}
                        onChange={(e) => setShowSavings(e.target.checked)}
                        className="h-4 w-4 rounded accent-amber-500"
                      />
                      Mostrar Poupança no gráfico
                    </label>
                  )}
                </div>
                {renderChart()}
              </div>
            )}

            <div className="panel-card mt-6 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Transações do relatório</h3>
                  <p className="text-sm text-slate-500">Todas as transações selecionadas para o período escolhido.</p>
                </div>
                <span className="text-sm text-slate-600">{report ? report.transactionCount : 0} transações</span>
              </div>

              {(!report || report.transactions.length === 0) ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                  Nenhuma transação encontrada para os filtros atuais. Ajuste os filtros ou cadastre transações para gerar resultados.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Data</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Classificação</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Gênero</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Descrição</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {report.transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 text-sm text-slate-700">{formatDateBR(transaction.date)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-900">{getTransactionTypeLabel(transaction.type)}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{transaction.type === 'savings' ? 'Passivo' : getClassificationLabel(transaction.classification)}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{getCategoryLabel(transaction.category)}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{transaction.description}</td>
                          <td className={`px-4 py-3 text-right text-sm font-semibold ${
                            transaction.type === 'income' ? 'text-emerald-600' :
                            transaction.type === 'expense' ? 'text-rose-600' : 'text-amber-600'
                          }`}>
                            {Number(transaction.amount) > 0 && transaction.type !== 'savings' ? (transaction.type === 'income' ? '+' : '-') : ''}{formatCurrencyBRL(Number(transaction.amount))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
