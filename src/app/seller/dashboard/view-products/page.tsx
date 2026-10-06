'use client'
import { useEffect, useState } from 'react'
import { api } from '@/api/api'
import Link from 'next/link'
import Image from 'next/image'
import { type ProductDetails } from '@/types/product'

export default function SellerProducts() {
  const [products, setProducts] = useState<ProductDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get<ProductDetails[]>('/Product/me')
        setProducts(res.data ?? [])
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          (typeof e?.response?.data === 'string' ? e.response.data : '') ||
          e?.message ||
          'Failed to load products.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    try {
      await api.delete(`/Product/delete/${id}`)
      setProducts((prev) => prev.filter((product) => product.id !== id))
    } catch {
      alert('Failed to delete product.')
    }
  }

  if (loading) return <div className="p-4 text-muted-foreground">Loading products...</div>
  if (error) return <div className="p-4 text-red-700 dark:text-red-400 font-medium">{error}</div>
  if (products.length === 0) return <div className="p-4 text-muted-foreground">No products yet.</div>

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Your Products</h1>
        <Link
          href="/seller/dashboard"
          className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card text-card-foreground shadow-xs">
        <table className="min-w-150 w-full divide-y text-justify divide-border text-sm">
          <thead className="bg-muted text-muted-foreground font-semibold text-center">
            <tr>
              <th className="px-4 py-3 border-b border-border text-xs uppercase tracking-wider">Image</th>
              <th className="px-4 py-3 border-b border-border text-xs uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 border-b border-border text-xs uppercase tracking-wider">Variants</th>
              <th className="px-4 py-3 border-b border-border text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-muted/40 transition">
                <td className="px-4 py-3">
                  {product.images?.[0]?.imageUrl ? (
                    <Image
                      src={product.images[0].imageUrl}
                      width={60}
                      height={60}
                      alt={product.productName || 'Product'}
                      className="rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="w-15 h-15 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground border border-border">
                      No image
                    </div>
                  )}
                </td>

                <td className="px-4 py-3 font-medium text-foreground text-center">
                  {product.productName}
                </td>

                <td className="px-4 py-3">
                  <div className="text-xs bg-muted/40 rounded-xl p-2.5 min-w-50 border border-border">
                    {/* Table Header */}
                    <div className="grid grid-cols-3 gap-2 font-semibold text-muted-foreground border-b border-border pb-1 mb-1">
                      <span>Weight</span>
                      <span className="text-center">Qty</span>
                      <span className="text-right">Price</span>
                    </div>

                    {/* Table Rows */}
                    {(product.variants ?? []).map((variant, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-3 gap-2 py-0.5 text-foreground"
                      >
                        <span>{variant.size ?? '—'}</span>
                        <span className="text-center">
                          {variant.quantity ?? 0}
                        </span>
                        <span className="text-right font-medium">
                          £{variant.price ?? '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-center justify-center w-full gap-2">
                    <Link
                      href={`/seller/dashboard/edit-products/${product.id}`}
                      className="w-full text-center text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      Edit
                    </Link>
                    <button
                      className="w-full text-center text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
