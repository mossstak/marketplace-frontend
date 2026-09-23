"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { api } from '../../api/api'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      // Calls POST /User/forgot-password
      const res = await api.post('/User/forgot-password', { email })
      setStatus('success')
      setMessage(
        res.data?.message ||
          'If an account exists for this email, a reset link has been dispatched.'
      )
    } catch (err: any) {
      setStatus('error')
      setMessage(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to send reset link. Please check the email address and try again.'
      )
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:px-6 sm:py-16">
      <div className="bg-white/80 dark:bg-zinc-900/80 shadow-md rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 sm:p-10">
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Enter your email address and we will send you a link to reset your password.
          </p>
        </header>

        {status === 'success' ? (
          <div className="space-y-6 text-center">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-sm">
              {message}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Check your inbox (or backend terminal logs during testing) for the reset URL.
            </p>
            <Link
              href="/login"
              className="inline-block font-semibold text-sm text-amber-600 dark:text-amber-400 hover:underline"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="space-y-5 text-stone-900 dark:text-stone-100"
          >
            {status === 'error' && (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 p-3 rounded-lg">
                {message}
              </div>
            )}

            <div className="flex flex-col space-y-1.5">
              <label className="font-semibold text-sm">Email Address</label>
              <input
                className="w-full border rounded-lg p-2.5 border-black/40 dark:border-white/30 bg-white/80 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                required
                disabled={status === 'loading'}
              />
            </div>

            <button
              className="w-full border rounded-lg p-2.5 cursor-pointer border-black bg-black text-white dark:bg-white dark:text-black font-semibold text-sm transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
              type="submit"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <p className="text-center text-xs sm:text-sm text-stone-500 dark:text-stone-400 pt-2">
              Remembered your password?{' '}
              <Link
                href="/login"
                className="font-medium text-amber-600 dark:text-amber-400 hover:underline"
              >
                Sign in here.
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage