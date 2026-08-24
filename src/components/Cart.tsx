import React from 'react'
import Link from 'next/link'
import { LucideShoppingCart, Trash2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'

const Cart: React.FC = () => {
  const { cart, removeFromCart, clearCart } = useCart()

  if (cart.length === 0) {
    return (
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 p-8 text-center shadow-sm">
        <LucideShoppingCart className="mx-auto h-12 w-12 text-stone-400 mb-3" />
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-sm text-stone-500 mb-6">
          Looks like you haven't added any coffees to your cart yet.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-semibold transition hover:bg-zinc-800 dark:bg-white dark:text-black"
        >
          Explore Shop
        </Link>
      </div>
    )
  }

  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.variant?.price ?? 0) * item.quantity,
    0,
  )

  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <LucideShoppingCart className="h-6 w-6" /> Shopping Cart
        </h2>
        <span className="text-xs sm:text-sm text-stone-500 font-medium">
          {cart.reduce((sum, i) => sum + i.quantity, 0)} items
        </span>
      </div>

      <ul className="divide-y divide-black/10 dark:divide-white/10">
        {cart.map((item) => {
          const variantKey = item.variant?.variantId ?? item.productId
          const price = item.variant?.price ?? 0

          return (
            <li
              key={variantKey}
              className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-semibold text-sm sm:text-base truncate">
                  {item.productName}
                </p>
                <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                  {item.variant?.size && <span>Size: {item.variant.size}</span>}
                  <span>Qty: {item.quantity}</span>
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    £{(price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg transition"
                  onClick={() =>
                    removeFromCart(item.variant?.variantId ?? item.productId)
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex flex-col gap-4">
        <div className="flex justify-between items-center text-base font-bold">
          <span>Total</span>
          <span>£{totalPrice.toFixed(2)}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            className="px-4 py-2 text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-stone-300 dark:border-stone-700 rounded-lg transition"
            onClick={clearCart}
          >
            Clear Cart
          </button>

          <Link
            href="/checkout"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold hover:bg-blue-700 transition"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Cart
