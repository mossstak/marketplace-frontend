'use client'

import { useEffect, useState } from 'react'
import { api } from '@/api/api'
import { CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'

type AccountStatus = {
  stripeAccountId: string
  detailsSubmitted: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
}

export default function PayoutsPage() {
  const [loading, setLoading] = useState(false)
  const [fetchingStatus, setFetchingStatus] = useState(true)
  const [status, setStatus] = useState<AccountStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadStatus = async () => {
    try {
      setFetchingStatus(true)
      const res = await api.get<AccountStatus>('/api/StripeConnect/account-status')
      setStatus(res.data)
    } catch {
      // Ignored if not yet created
    } finally {
      setFetchingStatus(false)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  const handleStartOnboarding = async () => {
    try {
      setLoading(true)
      setError(null)

      const origin = window.location.origin

      // Call the backend onboarding endpoint
      const res = await api.post<{ onboardingUrl: string }>(
        '/api/StripeConnect/onboarding-link',
        {
          refreshUrl: `${origin}/seller/payouts`,
          returnUrl: `${origin}/seller/payouts`,
        },
      )

      // Redirect the user to the Stripe URL
      if (res.data.onboardingUrl) {
        window.location.href = res.data.onboardingUrl
      }
    } catch (err: any) {
      console.error(err)
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'Failed to generate onboarding link'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.post<{ loginUrl: string }>('/api/StripeConnect/login-link')
      if (res.data.loginUrl) {
        window.location.href = res.data.loginUrl
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'Failed to open Stripe dashboard'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const isReady = status?.payoutsEnabled && status?.chargesEnabled

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-6">
      <div className="bg-white/80 dark:bg-zinc-900/80 border border-stone-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-6">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Stripe Connect Setup
        </h1>

        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300">
          Complete your Stripe onboarding to receive payouts and allow buyers to purchase your coffee.
        </p>

        {fetchingStatus ? (
          <p className="text-xs text-stone-400">Checking Stripe account status...</p>
        ) : status && status.stripeAccountId ? (
          <div className="space-y-3">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                isReady
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}
            >
              {isReady ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Payouts & Charges Active
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" /> Onboarding Incomplete
                </>
              )}
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400">
              Stripe Account ID: <span className="font-mono">{status.stripeAccountId}</span>
            </p>
          </div>
        ) : null}

        {error && (
          <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900/40 text-left">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          {isReady ? (
            <button
              onClick={handleOpenDashboard}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 cursor-pointer text-sm shadow-sm"
            >
              <ExternalLink className="h-4 w-4" />
              {loading ? 'Opening...' : 'Open Stripe Dashboard'}
            </button>
          ) : (
            <button
              onClick={handleStartOnboarding}
              disabled={loading}
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 cursor-pointer text-sm shadow-sm"
            >
              {loading
                ? 'Redirecting to Stripe...'
                : status?.stripeAccountId
                  ? 'Complete Stripe Onboarding'
                  : 'Start Stripe Onboarding'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}