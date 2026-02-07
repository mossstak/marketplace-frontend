'use client'

import React from 'react'
import { useCart } from '@/context/CartContext'

const Cart: React.FC = () => {
  const { cart, removeFromCart, clearCart } = useCart()

  if (cart.length === 0) {
    return <div className="p-4 mt-[100px]">
      <h2 className="text-center">Your cart is empty.</h2>
    </div>
  }

  return (
    <div className="p-4 mt-[100px]">
      <h2 className="text-xl font-bold mb-2">Shopping Cart</h2>
      <ul>
        {cart.map(item => (
          <li key={item.product.id} className="mb-2 flex items-center justify-between">
            <span>
              {item.product.productName} (x{item.quantity})
            </span>
            <button
              className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
              onClick={() => removeFromCart(item.product.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button
        className="mt-4 px-4 py-2 bg-gray-700 text-white rounded"
        onClick={clearCart}
      >
        Clear Cart
      </button>
    </div>
  )
}

export default Cart