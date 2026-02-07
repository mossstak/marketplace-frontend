'use client'
import { useEffect, useState } from 'react'
import { api } from '@/api/api'
import Link from 'next/link'

type SellerVariant = {
  id: number
  size: string | null
  price: number
  quantity: number
}

type SellerImage = {
  id?: number
  imageUrl?: string
  ImageUrl?: string
  isPrimary?: boolean
  IsPrimary?: boolean
}

type SellerProduct = {
  id: number
  product_Name?: string
  Product_Name?: string
  product_Description?: string | null
  Product_Description?: string | null
  category?: string | null
  Variants?: SellerVariant[]
  variants?: SellerVariant[]
  Images?: SellerImage[]
  images?: SellerImage[]
}

export default function SellerProducts() {
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get<SellerProduct[]>('/Product/me')
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

  if (loading) return <div className="p-4">Loading products...</div>
  if (error) return <div className="p-4 text-red-300">{error}</div>
  if (products.length === 0) return <div className="p-4">No products yet.</div>

  return (
    <div className="flex flex-col">
      <Link href="/seller/dashboard" className="text-blue-500 underline mb-4">
        Back to Dashboard
      </Link>
      <div className="grid grid-cols-2 w-full ">
        {products.map((product) => {
          const name =
            product.Product_Name ?? product.product_Name ?? 'Untitled'
          const description =
            product.Product_Description ?? product.product_Description ?? ''
          const variants = product.Variants ?? product.variants ?? []
          const images = product.Images ?? product.images ?? []
          const primaryImage =
            images.find((img) => img.IsPrimary ?? img.isPrimary) ?? images[0]
          const imageUrl = primaryImage?.ImageUrl ?? primaryImage?.imageUrl

          return (
            <div
              key={product.id}
              className="rounded border border-white p-4 w-100"
            >
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={name}
                  className="mb-3 h-40 w-full rounded object-cover"
                />
              )}
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">{name}</h4>
                {product.category && (
                  <span className="rounded bg-white/10 px-2 py-1 text-xs">
                    {product.category}
                  </span>
                )}
              </div>
              {description && (
                <p className="mt-2 text-sm text-white/80">{description}</p>
              )}
              {variants.length > 0 && (
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="rounded bg-white/5 p-2 text-sm"
                    >
                      <div>{variant.size ?? 'Size'}</div>
                      <div>£{variant.price}</div>
                      <div>Qty: {variant.quantity}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
