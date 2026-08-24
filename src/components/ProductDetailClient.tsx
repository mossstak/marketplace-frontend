'use client'

import { useMemo, useState } from 'react'
import { useCart, type CartProduct } from '@/context/CartContext'

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
  const selectedVariant = useMemo(
    () => (variants.length > 0 ? variants[selectedIndex] : undefined),
    [selectedIndex, variants],
  )

  return (
    <div className="mt-4 space-y-3">
      {variants.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="variant" className="text-sm font-medium">
            Variant:
          </label>
          <select
            id="variant"
            className="rounded border border-black/30 bg-white/80 dark:bg-zinc-800 px-2.5 py-1.5 text-sm"
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
          >
            {variants.map((variant, index) => (
              <option
                key={variant.id ?? `${variant.size}-${index}`}
                value={index}
              >
                {variant.size}
              </option>
            ))}
          </select>
          <div className="text-sm font-semibold">
            Price:{' '}
            {selectedVariant?.price !== undefined
              ? `£${selectedVariant.price}`
              : 'N/A'}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <div className="flex items-center gap-2">
          <label htmlFor="quantity" className="text-sm font-medium">
            Quantity:
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-16 border border-black/30 bg-white/80 dark:bg-zinc-800 rounded px-2 py-1.5 text-sm"
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
