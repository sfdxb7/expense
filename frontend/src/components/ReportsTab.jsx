import { useState } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { FileText, Download } from 'lucide-react'
import { formatCurrency, formatDate, formatDateInput } from '@/lib/utils'

export default function ReportsTab({ propertyId, propertyName }) {
  const [reportType, setReportType] = useState('yearly')
  const [year, setYear] = useState(new Date().getFullYear())
  const [startDate, setStartDate] = useState(formatDateInput(new Date(new Date().getFullYear(), 0, 1)))
  const [endDate, setEndDate] = useState(formatDateInput(new Date()))
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGenerateReport = async () => {
    setLoading(true)
    try {
      let url
      if (reportType === 'yearly') {
        url = `/reports/property/${propertyId}/year/${year}`
      } else {
        url = `/reports/property/${propertyId}?startDate=${startDate}&endDate=${endDate}`
      }

      const { data } = await api.get(url)
      setReport(data)
      toast({ title: "Success", description: "Report generated successfully" })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    if (!report) return

    const reportText = `
EXPENSE REPORT
Property: ${propertyName}
Period: ${report.period.startDate} to ${report.period.endDate}

SUMMARY
---------
Total Expenses: ${formatCurrency(report.summary.totalExpenses)}
Total Payments: ${formatCurrency(report.summary.totalPayments)}
Net Balance: ${formatCurrency(report.summary.netBalance)}
Number of Expenses: ${report.summary.expenseCount}

EXPENSES BY CATEGORY
--------------------
${report.expensesByCategory.map(cat =>
  `${cat.category}: ${formatCurrency(cat.total)} (${cat.count} expenses)`
).join('\n')}

DEBTOR BALANCES
---------------
${report.debtorBalances.map(d =>
  `${d.debtor}: ${formatCurrency(d.totalPaid)} (${d.paymentCount} payments)`
).join('\n')}

DETAILED EXPENSES
-----------------
${report.expenses.map(exp =>
  `${formatDate(exp.date)} | ${exp.category} | ${formatCurrency(exp.amount)} | ${exp.description || 'N/A'}`
).join('\n')}
    `.trim()

    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expense-report-${propertyName.replace(/\s+/g, '-')}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({ title: "Success", description: "Report exported successfully" })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant={reportType === 'yearly' ? 'default' : 'outline'}
              onClick={() => setReportType('yearly')}
            >
              Yearly Report
            </Button>
            <Button
              variant={reportType === 'custom' ? 'default' : 'outline'}
              onClick={() => setReportType('custom')}
            >
              Custom Date Range
            </Button>
          </div>

          {reportType === 'yearly' ? (
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <Button onClick={handleGenerateReport} disabled={loading} className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Report Summary</CardTitle>
              <Button onClick={handleExportReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div>
              <h4 className="font-semibold mb-3">Period</h4>
              <p className="text-sm text-muted-foreground">
                {report.period.startDate} to {report.period.endDate}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(report.summary.totalExpenses)}</p>
                <p className="text-xs text-muted-foreground">{report.summary.expenseCount} expenses</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Payments</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(report.summary.totalPayments)}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Net Balance</p>
                <p className={`text-2xl font-bold ${report.summary.netBalance >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(report.summary.netBalance)}
                </p>
              </div>
            </div>

            {/* Expenses by Category */}
            {report.expensesByCategory.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Expenses by Category</h4>
                <div className="space-y-2">
                  {report.expensesByCategory.map((cat, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded">
                      <div>
                        <p className="font-medium">{cat.category}</p>
                        <p className="text-xs text-muted-foreground">{cat.count} expenses</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(cat.total)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debtor Balances */}
            {report.debtorBalances.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Payments by Debtor</h4>
                <div className="space-y-2">
                  {report.debtorBalances.map((debtor, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded">
                      <div>
                        <p className="font-medium">{debtor.debtor}</p>
                        <p className="text-xs text-muted-foreground">{debtor.paymentCount} payments</p>
                      </div>
                      <p className="font-semibold text-green-600">{formatCurrency(debtor.totalPaid)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Expenses */}
            {report.expenses.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Detailed Expenses</h4>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {report.expenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between items-start p-3 bg-muted rounded text-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{formatCurrency(expense.amount)}</span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {expense.category}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(expense.date)}
                          {expense.description && ` • ${expense.description}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
