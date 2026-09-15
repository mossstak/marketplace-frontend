'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import { api } from '@/api/api'
import { isLoggedIn, saveAuth } from '@/auth/auth'
import { type UserDetails } from '@/types/user'
import { Store, Building2, Globe, MapPin, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'

export default function BecomeRoasterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    companyName: '',
    websiteUrl: '',
    addressOne: '',
    addressTwo: '',
    city: '',
    country: 'United Kingdom',
    postalCode: '',
  })

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusStep, setStatusStep] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login')
      return
    }

    const loadUserData = async () => {
      try {
        setInitialLoading(true)
        const res = await api.get<UserDetails>('/User/me')
        if (res.data) {
          setForm((prev) => ({
            ...prev,
            addressOne: res.data.addressOne || '',
            addressTwo: res.data.addressTwo || '',
            city: res.data.city || '',
            country: res.data.country || 'United Kingdom',
            postalCode: res.data.postalCode || '',
          }))
        }
      } catch (err) {
        console.warn('Could not pre-fill address:', err)
      } finally {
        setInitialLoading(false)
      }
    }

    loadUserData()
  }, [router])

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
      setError('Please provide complete business address details.')
      return
    }

    try {
      setLoading(true)
      setStatusStep('Creating roaster profile & assigning seller role...')

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

      if (res.data?.token) {
        saveAuth(res.data.token, 'Seller')
      } else {
        localStorage.setItem('role', 'Seller')
      }

      setStatusStep('Redirecting to Stripe Express onboarding...')

      if (res.data?.onboardingUrl) {
        window.location.href = res.data.onboardingUrl
        return
      }

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
        console.warn('Could not generate Stripe link immediately:', stripeErr)
      }

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

  if (initialLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading roaster setup...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14">
      <Link
        href="/buyer/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Buyer Dashboard
      </Link>

      <div className="bg-gray-800/90 border border-gray-700/90 rounded-2xl p-6 sm:p-10 shadow-xl space-y-6">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <Store className="h-3.5 w-3.5" /> Roaster Onboarding
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Become a Roaster
          </h1>
          <p className="text-sm text-gray-300">
            Set up your roastery profile to showcase single-origin beans, manage coffee listings, and receive direct customer payouts through Stripe Express.
          </p>
        </header>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/40 text-red-300 text-sm">
            {error}
          </div>
        )}

        {statusStep && (
          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/40 text-amber-300 text-sm flex items-center gap-2.5 animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{statusStep}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-gray-700 pb-2">
              <Building2 className="h-4 w-4" /> Roastery Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Company / Brand Name *
              </label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="e.g. Origin Roast Co."
                required
                disabled={loading}
                className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" /> Website URL (Optional)
              </label>
              <input
                name="websiteUrl"
                type="url"
                value={form.websiteUrl}
                onChange={handleChange}
                placeholder="https://originroast.com"
                disabled={loading}
                className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-gray-700 pb-2">
              <MapPin className="h-4 w-4" /> Business Location & Address
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Address Line 1 *
              </label>
              <input
                name="addressOne"
                value={form.addressOne}
                onChange={handleChange}
                placeholder="123 Roastery Lane"
                required
                disabled={loading}
                className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Address Line 2 (Optional)
              </label>
              <input
                name="addressTwo"
                value={form.addressTwo}
                onChange={handleChange}
                placeholder="Unit 2B"
                disabled={loading}
                className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  City *
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="London"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Postal Code *
                </label>
                <input
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="EC1A 1BB"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Country *
                </label>
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="United Kingdom"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-xs text-amber-200 leading-relaxed">
            After clicking continue, your roaster profile will be created and you will be redirected to Stripe Express to connect your bank account.
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
            <Link
              href="/buyer/dashboard"
              className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-medium transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Setting Up...
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
