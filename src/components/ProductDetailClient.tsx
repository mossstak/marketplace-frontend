'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useCart, type CartProduct } from '@/context/CartContext'
import { CustomSelect } from '@/components/CustomSelect'
import { getUserId } from '@/auth/auth'

type ProductDetailClientProps = {
  product: CartProduct
  variants?: {
    id?: number
    size: string
    price?: number
  }[]
}

export default function ProductDetailClient({
  product,
  variants = [],
}: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const currentUserId = getUserId()
    if (
      currentUserId &&
      product.sellerId &&
      currentUserId === product.sellerId
    ) {
      setIsOwner(true)
    }
  }, [product.sellerId])

  const selectedVariant = useMemo(
    () => (variants.length > 0 ? variants[selectedIndex] : undefined),
    [selectedIndex, variants],
  )

  if (isOwner) {
    return (
      <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/30 p-4 space-y-3">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
          <span>☕ You are the seller of this product</span>
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-300">
          You cannot purchase your own listing. You can manage inventory,
          pricing, and details in your seller dashboard.
        </p>
        <Link
          href={`/seller/dashboard/edit-products/${product.id}`}
          className="inline-flex items-center justify-center rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 text-sm transition"
        >
          Edit Product in Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-3">
      {variants.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="variant" className="text-sm font-medium">
            Size:
          </label>

          <CustomSelect
            id="variant"
            value={selectedIndex}
            onChange={(val) => setSelectedIndex(val)}
            options={variants.map((variant, index) => ({
              value: index,
              label: variant.size,
            }))}
          />

          <div className="text-sm font-semibold">
            Price:{' '}
            {selectedVariant?.price !== undefined
              ? `£${Number(selectedVariant.price).toFixed(2)}`
              : 'N/A'}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <div className="flex items-center gap-2 rounded-full border border-black/30 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800 px-3.5 py-1.5 text-sm font-medium text-foreground shadow-2xs transition hover:border-black/50 dark:hover:border-zinc-500 cursor-pointer">
          <label htmlFor="quantity" className="text-sm font-medium">
            Quantity:
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-16 text-right border-none border-black/30 bg-white/80 dark:bg-zinc-800 px-2 py-1.5 text-sm"
          />
        </div>
        <button
          className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded transition text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedVariant}
          onClick={() => {
            if (!selectedVariant) return

            addToCart(
              {
                productId: Number(product.id),
                productName: String(product.productName),
                sellerId: product.sellerId,
                roasterProfileId: product.roasterProfileId,
                variant: {
                  variantId: selectedVariant.id ?? 0,
                  size: selectedVariant.size,
                  price: selectedVariant.price ?? 0,
                },
              },
              quantity,
            )
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}
