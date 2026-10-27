'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getAdminToken } from '@/lib/admin-auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Loader2, LayoutGrid } from 'lucide-react'
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
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    // Check authentication
    const token = getAdminToken()
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

      // how many products use each category
      const { data: prods, error: prodErr } = await supabase
        .from('products')
        .select('category')
      if (!prodErr && prods) {
        const tally: Record<string, number> = {}
        for (const p of prods as { category?: string | null }[]) {
          const key = (p.category ?? '').trim().toLowerCase()
          if (key) tally[key] = (tally[key] ?? 0) + 1
        }
        setCounts(tally)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-7">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Categories
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Organize products across the storefront.
        </p>
      </div>

      <main className="pb-8 space-y-6">
        {/* Add category */}
        <Card className="glass rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Plus className="w-4.5 h-4.5" />
            </span>
            <div>
              <h2 className="text-[15px] font-bold leading-none">Add new category</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Slug is generated automatically from the name.
              </p>
            </div>
          </div>
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Label htmlFor="categoryName" className="sr-only">
                Category Name
              </Label>
              <Input
                id="categoryName"
                placeholder="e.g. Smart Home"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="h-11 rounded-xl bg-background/80"
              />
              {newCategory.trim() && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                  {newCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}
                </span>
              )}
            </div>
            <Button
              type="submit"
              disabled={!newCategory.trim()}
              className="h-11 rounded-xl font-bold shadow-md shadow-primary/20 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </form>
        </Card>

        {loading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="p-6 text-center text-destructive">{error}</Card>
        ) : categories.length === 0 ? (
          <Card className="p-10 text-center rounded-2xl">
            <span className="inline-flex w-14 h-14 rounded-2xl bg-primary/10 text-primary items-center justify-center mb-4">
              <LayoutGrid className="w-6 h-6" />
            </span>
            <p className="font-bold mb-1">No categories yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first category above to organize products.
            </p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {categories.map((category) => {
              const used = counts[category.slug.toLowerCase()] ?? 0;
              return (
                <Card
                  key={category.id}
                  className="group p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-[15px] capitalize">{category.name}</h3>
                      {used > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {used} {used === 1 ? "product" : "products"}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-600">
                          unused
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                      /products?category={category.slug}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${category.name}`}
                    className="shrink-0 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
