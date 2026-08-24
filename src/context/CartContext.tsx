'use client'

import React, { createContext, ReactNode, useContext, useState, useMemo } from 'react'

export type CartProduct = {
  id: string | number
  productName: string
  productType?: string
  roastLevel?: string
  description?: string
  weight?: string[]
  price?: string[]
  roasterProfileId?: number
  sellerId?: string
}

export type SelectedVariant = {
  variantId: number
  size: string
  price: number
}

export type CartItem = {
  productId: number
  productName: string
  roasterProfileId?: number // Needed for Stripe destination charge
  sellerId?: string
  variant: SelectedVariant
  quantity: number
}

type CartContextType = {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void
  removeFromCart: (variantId: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (i) => i.variant.variantId === item.variant.variantId
      )

      if (existingIndex > -1) {
        return prevCart.map((i, idx) =>
          idx === existingIndex ? { ...i, quantity: i.quantity + quantity } : i
        )
      }

      return [...prevCart, { ...item, quantity }]
    })
  }

  const removeFromCart = (variantId: number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.variant.variantId !== variantId)
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const contextValue = useMemo(
    () => ({ cart, addToCart, removeFromCart, clearCart }),
    [cart]
  )

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}