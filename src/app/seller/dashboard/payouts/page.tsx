'use client'

import { useEffect, useState } from 'react'
import { api } from '@/api/api'
import { CheckCircle2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react'

type AccountStatus = {
  stripeAccountId: string
  detailsSubmitted: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
}

export default function SellerDashboardPayoutsPage() {
  const [loading, setLoading] = useState(false)
  const [fetchingStatus, setFetchingStatus] = useState(true)
  const [status, setStatus] = useState<AccountStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadStatus = async () => {
    try {
      setFetchingStatus(true)
      setError(null)
      const res = await api.get<AccountStatus>('/api/StripeConnect/account-status')
      setStatus(res.data)
    } catch {
      // Profile or stripe account not ready yet
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
          refreshUrl: `${origin}/seller/dashboard/payouts`,
          returnUrl: `${origin}/seller/dashboard/payouts`,
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
    <div className="max-w-3xl w-full mx-auto space-y-6">
      <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-700">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Stripe Connect & Payouts
            </h1>
            <p className="text-sm text-gray-300 mt-1">
              Connect your bank account via Stripe Express to receive customer payments for your coffee.
            </p>
          </div>
          <button
            onClick={loadStatus}
            disabled={fetchingStatus}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-600 bg-gray-900 text-xs font-medium text-gray-200 hover:text-white hover:bg-gray-800 transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${fetchingStatus ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>

        {fetchingStatus ? (
          <p className="text-sm text-gray-300 py-4">Checking Stripe account status...</p>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-900/60 border border-gray-700/60 p-5 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Account Status
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isReady
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isReady ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Payouts & Charges Active
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5" /> Onboarding Incomplete
                    </>
                  )}
                </span>
              </div>

              {status?.stripeAccountId ? (
                <p className="text-xs text-gray-300">
                  Connected Account ID: <span className="font-mono text-amber-300">{status.stripeAccountId}</span>
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  No Stripe Express account has been initialized yet.
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="pt-2">
              {isReady ? (
                <button
                  onClick={handleOpenDashboard}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer text-sm shadow-md"
                >
                  <ExternalLink className="h-4 w-4" />
                  {loading ? 'Opening...' : 'Open Stripe Express Dashboard'}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleStartOnboarding}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-400 text-zinc-950 font-bold rounded-xl hover:bg-amber-300 transition disabled:opacity-50 cursor-pointer text-sm shadow-md"
                  >
                    {loading
                      ? 'Redirecting to Stripe...'
                      : status?.stripeAccountId
                        ? 'Complete Stripe Onboarding'
                        : 'Start Stripe Onboarding'}
                  </button>
                  <p className="text-xs text-gray-400">
                    You will be redirected to Stripe&apos;s secure onboarding portal to configure your payout bank details.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
