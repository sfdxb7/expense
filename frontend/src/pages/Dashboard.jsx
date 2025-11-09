import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { ThemeToggle } from '@/components/ThemeToggle'
import { DashboardSkeleton } from '@/components/Skeleton'
import { Plus, Building2, LogOut, Trash2, Edit } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editProperty, setEditProperty] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [stats, setStats] = useState({ totalProperties: 0, totalExpenses: 0, totalCategories: 0, totalDebtors: 0 })

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const { data } = await api.get('/properties')
      setProperties(data)

      // Calculate overall stats
      const totalExpenses = data.reduce((sum, p) => sum + (p._count?.expenses || 0), 0)
      const totalCategories = data.reduce((sum, p) => sum + (p._count?.categories || 0), 0)
      const totalDebtors = data.reduce((sum, p) => sum + (p._count?.debtors || 0), 0)

      setStats({
        totalProperties: data.length,
        totalExpenses,
        totalCategories,
        totalDebtors
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch properties",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editProperty) {
        await api.put(`/properties/${editProperty.id}`, formData)
        toast({ title: "Success", description: "Property updated successfully" })
      } else {
        await api.post('/properties', formData)
        toast({ title: "Success", description: "Property created successfully" })
      }

      setDialogOpen(false)
      setFormData({ name: '', description: '' })
      setEditProperty(null)
      fetchProperties()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "Operation failed",
      })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this property? All associated data will be lost.')) {
      return
    }

    try {
      await api.delete(`/properties/${id}`)
      toast({ title: "Success", description: "Property deleted successfully" })
      fetchProperties()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete property",
      })
    }
  }

  const openEditDialog = (property) => {
    setEditProperty(property)
    setFormData({ name: property.name, description: property.description || '' })
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditProperty(null)
    setFormData({ name: '', description: '' })
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">Expense Tracker</h1>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <DashboardSkeleton />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <header className="sticky top-0 z-50 border-b border-border backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Expense Tracker
              </h1>
              <p className="text-xs text-muted-foreground">Welcome back, {user?.username}</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Properties Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">My Properties</h2>
              <p className="text-xs text-muted-foreground">
                Manage your properties and track expenses
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editProperty ? 'Edit Property' : 'Create New Property'}
                    </DialogTitle>
                    <DialogDescription>
                      {editProperty ? 'Update property details' : 'Add a new property to track expenses'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Property Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Shared Building, Mother's House"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Input
                        id="description"
                        placeholder="Additional details"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editProperty ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {properties.length === 0 ? (
            <Card className="text-center py-8 border-dashed">
              <CardContent className="pt-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-1">No properties yet</h3>
                <p className="text-xs text-muted-foreground mb-3">Get started by creating your first property</p>
                <Button onClick={openCreateDialog} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Property
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onNavigate={() => navigate(`/property/${property.id}`)}
                  onEdit={() => openEditDialog(property)}
                  onDelete={() => handleDelete(property.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function PropertyCard({ property, onNavigate, onEdit, onDelete }) {
  return (
    <Card
      className="relative group hover:shadow-lg transition-all duration-200 cursor-pointer border-border/50 hover:border-primary/50 overflow-hidden"
      onClick={onNavigate}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base group-hover:text-primary transition-colors truncate">
              {property.name}
            </CardTitle>
            {property.description && (
              <CardDescription className="text-xs line-clamp-1">{property.description}</CardDescription>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-3">
          <StatItem label="Expenses" value={property._count?.expenses || 0} />
          <StatItem label="Categories" value={property._count?.categories || 0} />
          <StatItem label="Debtors" value={property._count?.debtors || 0} />
        </div>
      </CardContent>
    </Card>
  )
}

function StatItem({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
