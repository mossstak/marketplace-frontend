'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { LucideShoppingCart, Trash2, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'

const Cart: React.FC = () => {
  const { cart, removeFromCart, clearCart, isCartOpen, closeCart } = useCart()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    if (isCartOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isCartOpen, closeCart])

  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.variant?.price ?? 0) * item.quantity,
    0,
  )

  return (
    <div
      className={`fixed inset-0 z-50 transition-visibility duration-300 ${
        isCartOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
      }`}
      aria-hidden={!isCartOpen}
    >
      {/* Dimmed Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isCartOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Slide-over Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white dark:bg-zinc-900 shadow-2xl border-l border-black/10 dark:border-white/10 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 p-4">
          <div className="flex items-center gap-2">
            <LucideShoppingCart className="h-5 w-5" />
            <h2 className="text-lg font-bold">Shopping Cart</h2>
            <span className="text-xs text-stone-500 font-medium">
              ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-black/5 dark:hover:bg-white/5 transition"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <LucideShoppingCart className="h-12 w-12 text-stone-400 mb-3" />
            <h3 className="text-lg font-bold mb-1">Your cart is empty</h3>
            <p className="text-sm text-stone-500 mb-6">
              Looks like you haven't added any coffees to your cart yet.
            </p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-black/10 dark:divide-white/10 px-4">
              {cart.map((item) => {
                const variantKey = item.variant?.variantId ?? item.productId
                const price = item.variant?.price ?? 0

                return (
                  <li
                    key={variantKey}
                    className="py-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {item.productName}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                        {item.variant?.size && (
                          <span>Size: {item.variant.size}</span>
                        )}
                        <span>Qty: {item.quantity}</span>
                        <span className="font-medium text-stone-800 dark:text-stone-200">
                          £{(price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      onClick={() =>
                        removeFromCart(item.variant?.variantId ?? item.productId)
                      }
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                )
              })}
            </ul>

            {/* Drawer Footer */}
            <div className="border-t border-black/10 dark:border-white/10 p-4 space-y-4">
              <div className="flex justify-between items-center text-base font-bold">
                <span>Total</span>
                <span>£{totalPrice.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex-1 px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg transition"
                  onClick={clearCart}
                >
                  Clear Cart
                </button>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex-1 text-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Cart