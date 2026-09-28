'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { api } from '@/api/api'
import { getUserId } from '@/auth/auth'
import StripeCheckoutWrapper from '@/components/StripeCheckoutForm'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ADDED: State to hold the address from the Stripe Address Element
  const [shippingAddress, setShippingAddress] = useState<any>(null)

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

        const currentUserId = getUserId()
        const hasOwnProduct = cart.some(
          (item) =>
            item.sellerId && currentUserId && item.sellerId === currentUserId,
        )
        if (hasOwnProduct) {
          setError(
            'Your cart contains items from your own roaster store. Sellers cannot purchase their own products. Please remove them to proceed.',
          )
          setLoading(false)
          return
        }


        const roasterProfileId =
          cart.find(
            (i) =>
              typeof i.roasterProfileId === 'number' && i.roasterProfileId > 0,
          )?.roasterProfileId ?? cart[0]?.roasterProfileId

        if (!roasterProfileId) {
          setError(
            'Unable to identify the roaster for this order. Please return to the shop and add the item again.',
          )
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

  const handlePaymentSuccess = async (paymentIntentId?: string) => {
    try {
      const resolvedPaymentIntentId =
        paymentIntentId ||
        (clientSecret ? clientSecret.split('_secret_')[0] : null)

      // Pass the paymentIntentId and shipping address alongside the items
      await api.post('/Order/place', {
        items: cart.map((i) => ({
          variantId: i.variant.variantId,
          quantity: i.quantity,
        })),
        paymentIntentId: resolvedPaymentIntentId,
        shippingAddressLine1: shippingAddress?.line1 || '',
        shippingAddressLine2: shippingAddress?.line2 || null,
        shippingCity: shippingAddress?.city || '',
        shippingStateOrProvince: shippingAddress?.state || null,
        postalCode: shippingAddress?.postal_code || '',
        shippingCountry: shippingAddress?.country || 'GB',
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

      {/* Order Summary Box */}
      <div className="p-4 sm:p-5 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 mb-6 space-y-4">
        <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3">
          <h2 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
            Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)}{' '}
            {cart.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'items'})
          </h2>
          <span className="font-bold text-base text-stone-900 dark:text-stone-100">
            £{totalPrice.toFixed(2)}
          </span>
        </div>

        <div className="divide-y divide-black/5 dark:divide-white/5 space-y-3">
          {cart.map((item) => (
            <div
              key={item.variant.variantId}
              className="flex justify-between items-start pt-3 first:pt-0 text-sm"
            >
              <div className="flex flex-col pr-4 min-w-0">
                <span className="font-medium text-stone-900 dark:text-stone-100 truncate">
                  {item.productName}
                </span>

                <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                  {item.roasterName && (
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {item.roasterName}
                    </span>
                  )}
                  {item.roasterName && <span>•</span>}
                  {item.variant.size && <span>{item.variant.size}</span>}
                  {item.variant.size && <span>•</span>}
                  <span>Qty: {item.quantity}</span>
                </div>
              </div>

              <span className="font-medium text-stone-900 dark:text-stone-100 whitespace-nowrap text-right">
                £{((item.variant?.price ?? 0) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
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
            // ADDED: Capture the address as the user types it in the Stripe Element
            onAddressChange={(eventValue) =>
              setShippingAddress(eventValue.address)
            }
          />
        </div>
      )}
    </div>
  )
}
