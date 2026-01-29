'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, LogOut, Edit2, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  created_at: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    setAuthenticated(true)
    fetchProducts()
  }, [router])

  const fetchProducts = async () => {
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      setProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('products').delete().eq('id', id)

      if (err) throw err
      setProducts(products.filter((p) => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
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
          <div>
            <Link href="/" className="text-2xl font-bold text-primary">
              AffiliatePro
            </Link>
            <p className="text-sm text-muted-foreground">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-secondary/50 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Products Table */}
        {!loading && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-4 font-semibold text-muted-foreground">Product Name</th>
                    <th className="text-left px-6 py-4 font-semibold text-muted-foreground">Category</th>
                    <th className="text-left px-6 py-4 font-semibold text-muted-foreground">Price</th>
                    <th className="text-left px-6 py-4 font-semibold text-muted-foreground">Created</th>
                    <th className="text-left px-6 py-4 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id} className="border-b border-border hover:bg-secondary/50 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium line-clamp-1">{product.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full">
                            {product.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(product.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/dashboard/edit/${product.id}`}>
                              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <p className="text-muted-foreground">No products yet. Create your first product to get started.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
