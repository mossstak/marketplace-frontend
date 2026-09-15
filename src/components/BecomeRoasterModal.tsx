'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { api } from '@/api/api'
import { saveAuth } from '@/auth/auth'
import { X, Sparkles, Store, Building2, Globe, MapPin, Loader2, ArrowRight } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  initialAddress?: {
    addressOne?: string | null
    addressTwo?: string | null
    city?: string | null
    country?: string | null
    postalCode?: string | null
  }
}

export default function BecomeRoasterModal({
  isOpen,
  onClose,
  initialAddress,
}: Props) {
  const [form, setForm] = useState({
    companyName: '',
    websiteUrl: '',
    addressOne: initialAddress?.addressOne || '',
    addressTwo: initialAddress?.addressTwo || '',
    city: initialAddress?.city || '',
    country: initialAddress?.country || 'United Kingdom',
    postalCode: initialAddress?.postalCode || '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusStep, setStatusStep] = useState<string | null>(null)

  if (!isOpen) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.companyName.trim()) {
      setError('Company name is required.')
      return
    }

    if (!form.addressOne.trim() || !form.city.trim() || !form.country.trim() || !form.postalCode.trim()) {
      setError('Please provide complete address details for your roastery.')
      return
    }

    try {
      setLoading(true)
      setStatusStep('Creating your roaster profile...')

      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

      const payload = {
        companyName: form.companyName.trim(),
        websiteUrl: form.websiteUrl.trim() || undefined,
        addressOne: form.addressOne.trim(),
        addressTwo: form.addressTwo.trim() || undefined,
        city: form.city.trim(),
        country: form.country.trim(),
        postalCode: form.postalCode.trim(),
        refreshUrl: `${origin}/seller/dashboard/payouts`,
        returnUrl: `${origin}/seller/dashboard/payouts`,
      }

      const res = await api.post('/api/RoasterProfiles/become-roaster', payload)

      // Update auth storage with new Seller role and token
      if (res.data?.token) {
        saveAuth(res.data.token, 'Seller')
      } else {
        localStorage.setItem('role', 'Seller')
      }

      setStatusStep('Redirecting to Stripe Express onboarding...')

      // If onboardingUrl was returned directly from become-roaster
      if (res.data?.onboardingUrl) {
        window.location.href = res.data.onboardingUrl
        return
      }

      // Otherwise, call the Stripe onboarding link endpoint explicitly
      try {
        const linkRes = await api.post<{ onboardingUrl: string }>(
          '/api/StripeConnect/onboarding-link',
          {
            refreshUrl: `${origin}/seller/dashboard/payouts`,
            returnUrl: `${origin}/seller/dashboard/payouts`,
          },
        )
        if (linkRes.data?.onboardingUrl) {
          window.location.href = linkRes.data.onboardingUrl
          return
        }
      } catch (stripeErr) {
        console.warn('Could not generate Stripe onboarding link immediately:', stripeErr)
      }

      // Fallback: navigate to seller dashboard
      window.location.href = '/seller/dashboard'
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data
        if (typeof data === 'string') {
          setError(data)
        } else if (data && typeof data === 'object' && 'message' in data) {
          setError(String(data.message))
        } else {
          setError('Failed to setup roaster profile. Please verify your details.')
        }
      } else {
        setError('An unexpected error occurred.')
      }
      setLoading(false)
      setStatusStep(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="become-roaster-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="become-roaster-title"
                className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"
              >
                Become a Roaster <Sparkles className="h-4 w-4 text-amber-400" />
              </h2>
              <p className="text-xs text-gray-400">
                Setup your coffee roastery profile and configure Stripe Connect payouts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {statusStep && (
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/40 text-amber-300 text-xs sm:text-sm flex items-center gap-2.5 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{statusStep}</span>
            </div>
          )}

          {/* Roastery Details */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Roastery Info
            </p>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Company / Roastery Name *
              </label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="e.g. Origin Roast Co."
                required
                disabled={loading}
                className="w-full rounded-xl border border-gray-700 bg-gray-800/80 px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                <Globe className="h-3 w-3" /> Website URL (Optional)
              </label>
              <input
                name="websiteUrl"
                type="url"
                value={form.websiteUrl}
                onChange={handleChange}
                placeholder="https://examplecoffee.com"
                disabled={loading}
                className="w-full rounded-xl border border-gray-700 bg-gray-800/80 px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Address Details */}
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Business Address
            </p>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Address Line 1 *
              </label>
              <input
                name="addressOne"
                value={form.addressOne}
                onChange={handleChange}
                placeholder="123 Roastery Way"
                required
                disabled={loading}
                className="w-full rounded-xl border border-gray-700 bg-gray-800/80 px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Address Line 2 (Optional)
              </label>
              <input
                name="addressTwo"
                value={form.addressTwo}
                onChange={handleChange}
                placeholder="Unit 4B"
                disabled={loading}
                className="w-full rounded-xl border border-gray-700 bg-gray-800/80 px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  City *
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="London"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800/80 px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Postal Code *
                </label>
                <input
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="EC1A 1BB"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800/80 px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Country *
                </label>
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="United Kingdom"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800/80 px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-xl text-xs text-amber-200">
            After registering your roastery, you will be redirected to Stripe&apos;s secure onboarding portal to connect your bank account and receive customer payouts.
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  Continue to Stripe Onboarding <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
