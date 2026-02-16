'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, LogOut, Trash2, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: number
  name: string
  slug: string
  created_at: string
}

export default function CategoriesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    setAuthenticated(true)
    fetchCategories()
  }, [router])

  const fetchCategories = async () => {
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (err) throw err
      setCategories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('categories').delete().eq('id', id)

      if (err) throw err
      setCategories(categories.filter((c) => c.id !== id))
      toast({
        title: "Category deleted",
        description: "The category has been successfully deleted.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete category',
        variant: "destructive",
      })
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return

    try {
      const supabase = createClient()
      const slug = newCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      
      const { data, error: err } = await supabase
        .from('categories')
        .insert([{ name: newCategory, slug }])
        .select()
        .single()

      if (err) throw err

      setCategories([...categories, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewCategory('')
      toast({
        title: "Category added",
        description: "The category has been successfully added.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to add category',
        variant: "destructive",
      })
    }
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
               <ArrowLeft className="w-5 h-5" />
             </Link>
            <div>
              <Link href="/" className="text-2xl font-bold text-primary">
                AffiliatePro
              </Link>
              <p className="text-sm text-muted-foreground">Manage Categories</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-secondary/50 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
          <form onSubmit={handleAddCategory} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="categoryName" className="sr-only">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="e.g. Smart Home"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={!newCategory.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </form>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">{error}</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No categories found. Add one to get started.
          </div>
        ) : (
          <div className="grid gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">Slug: {category.slug}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
