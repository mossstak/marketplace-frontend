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

  if (loading) return <div className="p-4">Loading products...</div>
  if (error) return <div className="p-4 text-red-300">{error}</div>
  if (products.length === 0) return <div className="p-4">No products yet.</div>

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold">Your Products</h1>
        <Link href="/seller/dashboard" className="text-sm text-blue-400 hover:text-blue-300 underline">
          Back to Dashboard
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-800/50 shadow-sm">
        <table className="min-w-[600px] w-full divide-y divide-gray-700 text-sm">
          <thead className="bg-gray-800 text-left">
            <tr>
              <th className="px-4 py-3 border-b border-gray-700">Image</th>
              <th className="px-4 py-3 border-b border-gray-700">Name</th>
              <th className="px-4 py-3 border-b border-gray-700">Category</th>
              <th className="px-4 py-3 border-b border-gray-700">Variants</th>
              <th className="px-4 py-3 border-b border-gray-700">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-800">
                <td className="px-4 py-2 border border-gray-700">
                  {product.images?.[0]?.imageUrl ? (
                    <Image
                      src={product.images[0].imageUrl}
                      width={60}
                      height={60}
                      alt={product.productName || 'Product'}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="w-15 h-15 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </td>

                <td className="px-4 py-2 border border-gray-700">
                  {product.productName}
                </td>

                <td className="px-4 py-2 border border-gray-700">
                  {product.category ?? '—'}
                </td>

                <td className="px-4 py-2 border border-gray-700">
                  <div className="flex flex-col gap-1">
                    {(product.variants ?? []).map((variant, index) => (
                      <div
                        key={index}
                        className="text-xs bg-gray-800 px-2 py-1 rounded hover:bg-gray-100 hover:text-black"
                      >
                        Size: {variant.size ?? '—'} | Qty:{' '}
                        {variant.quantity ?? 0}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2 border border-gray-700">
                  <button
                    className="text-red-400 hover:underline cursor-pointer"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
