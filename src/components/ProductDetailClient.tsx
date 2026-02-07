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
        <div className="flex items-center gap-3">
          <label htmlFor="variant" className="text-sm">
            Variant
          </label>
          <select
            id="variant"
            className="rounded border px-2 py-1"
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
          >
            {variants.map((variant, index) => (
              <option key={variant.id ?? `${variant.size}-${index}`} value={index}>
                {variant.size}
              </option>
            ))}
          </select>
          <div className="text-sm">
            Price:{' '}
            {selectedVariant?.price !== undefined
              ? `£${selectedVariant.price}`
              : 'N/A'}
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm">
          Quantity
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-20 border rounded px-2 py-1"
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => addToCart(product, quantity)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}
