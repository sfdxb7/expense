import { useState } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Plus, Trash2, DollarSign, User } from 'lucide-react'
import { formatCurrency, formatDate, formatDateInput } from '@/lib/utils'

export default function DebtorsTab({ propertyId, debtors, refetchDebtors }) {
  const [debtorDialogOpen, setDebtorDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedDebtor, setSelectedDebtor] = useState(null)
  const [debtorFormData, setDebtorFormData] = useState({ name: '' })
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    date: formatDateInput(new Date()),
    notes: ''
  })

  const handleCreateDebtor = async (e) => {
    e.preventDefault()

    try {
      await api.post(`/debtors/property/${propertyId}`, debtorFormData)
      toast({ title: "Success", description: "Person added successfully" })
      setDebtorDialogOpen(false)
      setDebtorFormData({ name: '' })
      refetchDebtors()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "Failed to add person",
      })
    }
  }

  const handleDeleteDebtor = async (debtorId) => {
    if (!confirm('Are you sure you want to delete this person? All associated reimbursements will be lost.')) return

    try {
      await api.delete(`/debtors/property/${propertyId}/${debtorId}`)
      toast({ title: "Success", description: "Person deleted successfully" })
      refetchDebtors()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete person",
      })
    }
  }

  const handleAddPayment = async (e) => {
    e.preventDefault()

    try {
      await api.post(`/payments/debtor/${selectedDebtor.id}`, paymentFormData)
      toast({ title: "Success", description: "Reimbursement recorded successfully" })
      setPaymentDialogOpen(false)
      setPaymentFormData({
        amount: '',
        date: formatDateInput(new Date()),
        notes: ''
      })
      refetchDebtors()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "Failed to record reimbursement",
      })
    }
  }

  const handleDeletePayment = async (debtorId, paymentId) => {
    if (!confirm('Are you sure you want to delete this reimbursement?')) return

    try {
      await api.delete(`/payments/debtor/${debtorId}/${paymentId}`)
      toast({ title: "Success", description: "Reimbursement deleted successfully" })
      refetchDebtors()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete reimbursement",
      })
    }
  }

  const openPaymentDialog = (debtor) => {
    setSelectedDebtor(debtor)
    setPaymentDialogOpen(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Reimbursements</h3>
        <Dialog open={debtorDialogOpen} onOpenChange={setDebtorDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateDebtor}>
              <DialogHeader>
                <DialogTitle>Add Person</DialogTitle>
                <DialogDescription>Add a person who will reimburse you</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="debtor-name">Name</Label>
                  <Input
                    id="debtor-name"
                    placeholder="e.g., Brother, Mother"
                    value={debtorFormData.name}
                    onChange={(e) => setDebtorFormData({ name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Person</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {debtors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No people added yet</p>
            <Button onClick={() => setDebtorDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Person
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {debtors.map((debtor) => (
            <Card key={debtor.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{debtor.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteDebtor(debtor.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(debtor.totalPaid || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium">Reimbursements</h4>
                    <Button size="sm" onClick={() => openPaymentDialog(debtor)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>

                  {debtor.payments && debtor.payments.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {debtor.payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex justify-between items-center p-2 bg-muted rounded text-sm"
                        >
                          <div>
                            <div className="font-medium">{formatCurrency(payment.amount)}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(payment.date)}
                              {payment.notes && ` • ${payment.notes}`}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePayment(debtor.id, payment.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No reimbursements recorded
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <form onSubmit={handleAddPayment}>
            <DialogHeader>
              <DialogTitle>Record Reimbursement from {selectedDebtor?.name}</DialogTitle>
              <DialogDescription>Add a reimbursement received from this person</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Amount (AED)</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={paymentFormData.amount}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-date">Date</Label>
                <Input
                  id="payment-date"
                  type="date"
                  value={paymentFormData.date}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-notes">Notes (optional)</Label>
                <Input
                  id="payment-notes"
                  placeholder="e.g., Bank transfer, Cash"
                  value={paymentFormData.notes}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Record Reimbursement</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
