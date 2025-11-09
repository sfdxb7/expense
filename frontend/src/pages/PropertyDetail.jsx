import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { ArrowLeft, TrendingUp, Users, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import ExpensesTab from '@/components/ExpensesTab'
import DebtorsTab from '@/components/DebtorsTab'
import ReportsTab from '@/components/ReportsTab'

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [debtors, setDebtors] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('expenses')

  useEffect(() => {
    fetchPropertyData()
  }, [id])

  const fetchPropertyData = async () => {
    try {
      const [propRes, expensesRes, categoriesRes, debtorsRes] = await Promise.all([
        api.get(`/properties/${id}`),
        api.get(`/expenses/property/${id}`),
        api.get(`/categories/property/${id}`),
        api.get(`/debtors/property/${id}`)
      ])

      setProperty(propRes.data)
      setExpenses(expensesRes.data)
      setCategories(categoriesRes.data)
      setDebtors(debtorsRes.data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch property data",
      })
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const refetchExpenses = async () => {
    try {
      const { data } = await api.get(`/expenses/property/${id}`)
      setExpenses(data)
    } catch (error) {
      console.error('Failed to refetch expenses:', error)
    }
  }

  const refetchCategories = async () => {
    try {
      const { data } = await api.get(`/categories/property/${id}`)
      setCategories(data)
    } catch (error) {
      console.error('Failed to refetch categories:', error)
    }
  }

  const refetchDebtors = async () => {
    try {
      const { data } = await api.get(`/debtors/property/${id}`)
      setDebtors(data)
    } catch (error) {
      console.error('Failed to refetch debtors:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
  const totalPayments = debtors.reduce((sum, debtor) => sum + (debtor.totalPaid || 0), 0)
  const balance = totalExpenses - totalPayments

  const tabs = [
    { id: 'expenses', label: 'Expenses', icon: TrendingUp },
    { id: 'debtors', label: 'Reimbursements', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{property?.name}</h1>
              {property?.description && (
                <p className="text-xs text-muted-foreground">{property.description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Summary Cards - Compact Single Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <Card className="mb-4">
          <CardContent className="py-3 px-4">
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center">
                <div className="text-[10px] text-muted-foreground mb-1 whitespace-nowrap">Total Expenses</div>
                <div className="text-sm font-bold text-red-600 dark:text-red-500 whitespace-nowrap">{formatCurrency(totalExpenses)}</div>
              </div>
              <div className="flex flex-col items-center justify-center border-l border-r border-border">
                <div className="text-[10px] text-muted-foreground mb-1 whitespace-nowrap">Total Reimbursed</div>
                <div className="text-sm font-bold text-green-600 dark:text-green-500 whitespace-nowrap">{formatCurrency(totalPayments)}</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-[10px] text-muted-foreground mb-1 whitespace-nowrap">Balance</div>
                <div className={`text-sm font-bold whitespace-nowrap ${balance >= 0 ? 'text-orange-600 dark:text-orange-500' : 'text-green-600 dark:text-green-500'}`}>
                  {formatCurrency(balance)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-3">
          <div className="flex border-b border-border overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'expenses' && (
            <ExpensesTab
              propertyId={id}
              expenses={expenses}
              categories={categories}
              refetchExpenses={refetchExpenses}
              refetchCategories={refetchCategories}
            />
          )}
          {activeTab === 'debtors' && (
            <DebtorsTab
              propertyId={id}
              debtors={debtors}
              refetchDebtors={refetchDebtors}
            />
          )}
          {activeTab === 'reports' && (
            <ReportsTab propertyId={id} propertyName={property?.name} />
          )}
        </div>
      </div>
    </div>
  )
}
