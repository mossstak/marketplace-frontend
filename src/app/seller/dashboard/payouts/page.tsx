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
      <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Stripe Connect & Payouts
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your bank account via Stripe Express to receive customer payments for your coffee.
            </p>
          </div>
          <button
            onClick={loadStatus}
            disabled={fetchingStatus}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${fetchingStatus ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>

        {fetchingStatus ? (
          <p className="text-sm text-muted-foreground py-4">Checking Stripe account status...</p>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/30 border border-border p-5 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Account Status
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    isReady
                      ? 'bg-green-500/15 text-green-800 dark:text-green-300 border-green-500/30'
                      : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
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
                <p className="text-xs text-muted-foreground">
                  Connected Account ID: <span className="font-mono text-foreground font-semibold">{status.stripeAccountId}</span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No Stripe Express account has been initialized yet.
                </p>
              )}
            </div>

            {error && (
              <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="pt-2">
              {isReady ? (
                <button
                  onClick={handleOpenDashboard}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer text-sm shadow-xs"
                >
                  <ExternalLink className="h-4 w-4" />
                  {loading ? 'Opening...' : 'Open Stripe Express Dashboard'}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleStartOnboarding}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer text-sm shadow-xs"
                  >
                    {loading
                      ? 'Redirecting to Stripe...'
                      : status?.stripeAccountId
                        ? 'Complete Stripe Onboarding'
                        : 'Start Stripe Onboarding'}
                  </button>
                  <p className="text-xs text-muted-foreground">
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
