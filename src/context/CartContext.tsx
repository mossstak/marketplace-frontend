'use client'

import React, { createContext, ReactNode, useContext, useState } from 'react'

type Product = {
  id: number
  productName: string
  productType: string
  roastLevel: string
  description: string
  farmName: string
  farmRegion: string
  farmCountry: string
  farmAltitude: string
  producer: string
  varietal: string
  harvestSeason: string
  farmingPractice?: string[]
  farmStory: string
  processingMethod: string
  roastDate: string
  roastProfile: string
  tastingNotes?: string[]
  brewingRecommendation?: string[]
  weight?: string[]
  price?: string[]
}

type CartItem = {
  product: Product
  quantity: number
}

type CartContextType = {
  cart: CartItem[]
  addToCart: (product: Product, quantity: number) => void
  removeFromCart: (productId: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

type CartProviderProps = {
  children: ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      )
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prevCart, { product, quantity }]
    })
  }

  const removeFromCart = (productId: number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId)
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const contextValue = React.useMemo(
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
