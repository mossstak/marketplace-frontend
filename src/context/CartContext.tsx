'use client'

import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react'

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
  roasterProfileId?: number
  sellerId?: string
  variant: SelectedVariant
  quantity: number
}

type CartContextType = {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void
  removeFromCart: (variantId: number) => void
  clearCart: () => void
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), [])

  const addToCart = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity: number) => {
      // 1. Open the drawer outside the state updater
      setIsCartOpen(true)

      // 2. Purely update the cart state
      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex(
          (i) => i.variant.variantId === item.variant.variantId,
        )

        if (existingIndex > -1) {
          return prevCart.map((i, idx) =>
            idx === existingIndex
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          )
        }
        return [...prevCart, { ...item, quantity }]
      })
    },
    [],
  )

  const removeFromCart = useCallback((variantId: number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.variant.variantId !== variantId),
    )
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
    }),
    [
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
