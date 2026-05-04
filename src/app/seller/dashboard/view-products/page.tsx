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
        console.log(res.data)
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
    try {
      await api.delete<ProductDetails[]>(`/Product/delete/${id}`)
      setProducts((prev) => prev.filter((product) => product.id !== id))
      console.log("Deleting:", `/Product/delete/${id}`)
    } catch (error: any) {
      console.log(error)
    }
  }

  if (loading) return <div className="p-4">Loading products...</div>
  if (error) return <div className="p-4 text-red-300">{error}</div>
  if (products.length === 0) return <div className="p-4">No products yet.</div>

  return (
    <div className="flex flex-col">
      <Link href="/seller/dashboard" className="text-blue-500 underline mb-4">
        Back to Dashboard
      </Link>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700 text-sm">
          <thead className="bg-gray-800 text-left">
            <tr>
              <th className="px-4 py-2 border border-gray-700">Image</th>
              <th className="px-4 py-2 border border-gray-700">Name</th>
              <th className="px-4 py-2 border border-gray-700">Category</th>
              <th className="px-4 py-2 border border-gray-700">Variants</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-800">
                <td className="px-4 py-2 border border-gray-700">
                  {product.images[0]?.imageUrl && (
                    <Image
                      src={product.images[0].imageUrl}
                      width={60}
                      height={60}
                      alt={product.productName}
                      className="rounded"
                    />
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
                    {product.variants.map((variant, index) => (
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
                <td>
                  <button onClick={() => handleDelete(product.id)}>
                    <span className="hover:bg-gray-300">Delete</span>
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
