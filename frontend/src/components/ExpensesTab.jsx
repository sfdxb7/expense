import { useState } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Plus, Trash2, Edit, Upload, Paperclip, X } from 'lucide-react'
import { formatCurrency, formatDate, formatDateInput } from '@/lib/utils'

export default function ExpensesTab({ propertyId, expenses, categories, refetchExpenses, refetchCategories }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editExpense, setEditExpense] = useState(null)
  const [formData, setFormData] = useState({
    date: formatDateInput(new Date()),
    amount: '',
    description: '',
    categoryId: '',
    receipt: null
  })
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [creatingCategory, setCreatingCategory] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('date', formData.date)
      formDataToSend.append('amount', formData.amount)
      formDataToSend.append('description', formData.description || '')
      formDataToSend.append('categoryId', formData.categoryId)

      if (formData.receipt) {
        formDataToSend.append('receipt', formData.receipt)
      }

      if (editExpense) {
        await api.put(`/expenses/property/${propertyId}/${editExpense.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast({ title: "Success", description: "Expense updated successfully" })
      } else {
        await api.post(`/expenses/property/${propertyId}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast({ title: "Success", description: "Expense added successfully" })
      }

      setDialogOpen(false)
      resetForm()
      refetchExpenses()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "Operation failed",
      })
    }
  }

  const handleDelete = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    try {
      await api.delete(`/expenses/property/${propertyId}/${expenseId}`)
      toast({ title: "Success", description: "Expense deleted successfully" })
      refetchExpenses()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete expense",
      })
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    setCreatingCategory(true)
    try {
      const { data } = await api.post(`/categories/property/${propertyId}`, {
        name: newCategoryName.trim()
      })
      toast({ title: "Success", description: "Category created successfully" })
      setFormData({ ...formData, categoryId: data.id })
      setNewCategoryName('')
      setShowNewCategory(false)
      refetchCategories()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "Failed to create category",
      })
    } finally {
      setCreatingCategory(false)
    }
  }

  const openEditDialog = (expense) => {
    setEditExpense(expense)
    setFormData({
      date: formatDateInput(expense.date),
      amount: expense.amount,
      description: expense.description || '',
      categoryId: expense.categoryId,
      receipt: null
    })
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditExpense(null)
    setFormData({
      date: formatDateInput(new Date()),
      amount: '',
      description: '',
      categoryId: categories[0]?.id || '',
      receipt: null
    })
    setNewCategoryName('')
    setShowNewCategory(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-semibold">Expenses</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
                <DialogDescription>
                  {editExpense ? 'Update expense details' : 'Record a new expense'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (AED)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  {!showNewCategory ? (
                    <div className="flex gap-2">
                      <select
                        id="category"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.categoryId}
                        onChange={(e) => {
                          if (e.target.value === '__new__') {
                            setShowNewCategory(true)
                          } else {
                            setFormData({ ...formData, categoryId: e.target.value })
                          }
                        }}
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                        <option value="__new__">+ Add New Category</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="New category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleCreateCategory()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={creatingCategory || !newCategoryName.trim()}
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowNewCategory(false)
                          setNewCategoryName('')
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Monthly maintenance fee"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receipt">Receipt (optional)</Label>
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setFormData({ ...formData, receipt: e.target.files[0] })}
                  />
                  {editExpense?.receiptPath && !formData.receipt && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      Current receipt attached
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editExpense ? 'Update' : 'Add'} Expense</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-2">No expenses recorded yet</p>
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add First Expense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {Object.entries(
            expenses.reduce((groups, expense) => {
              const date = formatDate(expense.date)
              if (!groups[date]) groups[date] = []
              groups[date].push(expense)
              return groups
            }, {})
          ).map(([date, dateExpenses]) => (
            <div key={date} className="space-y-1">
              <div className="text-[10px] font-semibold text-foreground/60 px-1 uppercase tracking-wide">
                {date}
              </div>
              <div className="space-y-1">
                {dateExpenses.map((expense) => (
                  <Card key={expense.id} className="group hover:shadow-sm transition-shadow">
                    <CardContent className="p-2.5">
                      <div className="flex items-start gap-3">
                        <span className="font-semibold text-sm whitespace-nowrap w-20 text-right shrink-0">{formatCurrency(expense.amount)}</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap shrink-0">
                          {expense.category.name}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {expense.receiptPath && (
                              <a
                                href={expense.receiptPath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline inline-flex items-center gap-1 whitespace-nowrap"
                              >
                                <Paperclip className="h-3 w-3" />
                                Receipt
                              </a>
                            )}
                          </div>
                          {expense.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {expense.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditDialog(expense)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(expense.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
