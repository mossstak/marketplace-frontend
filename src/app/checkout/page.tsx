'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { api } from '@/api/api'
import StripeCheckoutWrapper from '@/components/StripeCheckoutForm'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.variant?.price ?? 0) * item.quantity,
    0,
  )

  useEffect(() => {
    if (cart.length === 0) return

    const initPaymentIntent = async () => {
      try {
        setLoading(true)
        setError(null)

        if (totalPrice < 0.3) {
          setError('Minimum order amount for checkout is £0.30.')
          setLoading(false)
          return
        }

        // Grab roasterProfileId from cart items
        const roasterProfileId =
          cart.find((i) => typeof i.roasterProfileId === 'number' && i.roasterProfileId > 0)
            ?.roasterProfileId ?? cart[0]?.roasterProfileId

        if (!roasterProfileId) {
          setError('Unable to identify the roaster for this order. Please return to the shop and add the item again.')
          setLoading(false)
          return
        }

        const amountInMinorUnit = Math.round(totalPrice * 100)

        let customerEmail: string | undefined = undefined
        try {
          const userRes = await api.get('/User/me')
          if (userRes.data?.email) {
            customerEmail = userRes.data.email
          }
        } catch {
          // Guest or unauthenticated
        }

        const res = await api.post('/api/StripeConnect/create-payment-intent', {
          amountInMinorUnit,
          currency: 'gbp',
          roasterProfileId,
          feePercentage: 5.0,
          customerEmail: customerEmail || undefined,
        })

        if (res.data?.clientSecret) {
          setClientSecret(res.data.clientSecret)
        }
      } catch (err: any) {
        const backendError =
          err.response?.data?.message ||
          err.response?.data?.title ||
          (typeof err.response?.data === 'string' ? err.response.data : null) ||
          err.message ||
          'Failed to initialize payment.'
        console.error('Payment intent error:', err.response?.data || err)
        setError(backendError)
      } finally {
        setLoading(false)
      }
    }

    initPaymentIntent()
  }, [cart, totalPrice])

  const handlePaymentSuccess = async () => {
    try {
      // Record the order on your backend database
      await api.post('/Order/place', {
        items: cart.map((i) => ({
          variantId: i.variant.variantId,
          quantity: i.quantity,
        })),
      })

      clearCart()
      router.push('/buyer/dashboard')
    } catch {
      setError(
        'Payment was received, but we encountered an issue creating your order record.',
      )
    }
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="text-stone-500 mt-2 text-sm">
          Add items before checking out.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Complete Checkout</h1>

      <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 mb-6">
        <div className="flex justify-between items-center text-sm font-medium">
          <span>Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
          <span>£{totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 p-3 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-stone-500">Preparing payment form...</p>
      )}

      {clientSecret && (
        <div className="p-6 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
          <StripeCheckoutWrapper
            clientSecret={clientSecret}
            onSuccess={handlePaymentSuccess}
          />
        </div>
      )}
    </div>
  )
}
