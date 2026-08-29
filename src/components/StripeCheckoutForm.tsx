'use client'

import {
  AddressElement,
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { useMemo, useState } from 'react'
import { stripePromise } from '@/lib/stripe'

interface CheckoutInnerFormProps {
  onSuccess: (paymentIntentId: string) => void
  onAddressChange?: (address: any) => void
}

function CheckoutInnerForm({
  onSuccess,
  onAddressChange,
}: CheckoutInnerFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setErrorMessage(null)

    const addressElement = elements.getElement('address')
    if (addressElement) {
      const addressResult = await addressElement.getValue()
      if (!addressResult.complete) {
        setErrorMessage(
          'Please complete all required address fields for tax calculation.',
        )
        setProcessing(false)
        return
      }
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message ?? 'An unexpected error occurred.')
      setProcessing(false)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Stripe Address Element (Calculates Tax Jurisdiction) */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Shipping Address
        </h3>
        <AddressElement
          options={{
            mode: 'shipping',
            allowedCountries: ['GB', 'US', 'CA', 'IE', 'DE', 'FR'],
          }}
          onChange={(event) => {
            if (event.complete && onAddressChange) {
              onAddressChange(event.value)
            }
          }}
        />
      </div>

      {/* 2. Stripe Payment Element (Cards, Apple Pay, Google Pay) */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Payment Details
        </h3>
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded border border-red-200 dark:border-red-900/40">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
      >
        {processing ? 'Processing Payment...' : 'Pay Now'}
      </button>
    </form>
  )
}

export default function StripeCheckoutWrapper({
  clientSecret,
  onSuccess,
  onAddressChange,
}: {
  clientSecret: string
  onSuccess: (paymentIntentId: string) => void
  onAddressChange?: (address: any) => void
}) {
  const options = useMemo(() => ({ clientSecret }), [clientSecret])

  return (
    <Elements key={clientSecret} stripe={stripePromise} options={options}>
      <CheckoutInnerForm onSuccess={onSuccess} onAddressChange={onAddressChange}/>
    </Elements>
  )
}
