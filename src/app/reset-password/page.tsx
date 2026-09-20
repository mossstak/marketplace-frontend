"use client"

import React, { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '../../api/api'

const ResetPasswordContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (!token || !email) {
      setStatus('error')
      setMessage('Invalid or missing password reset token. Please request a new link.')
      return
    }

    if (newPassword !== confirmPassword) {
      setStatus('error')
      setMessage('Passwords do not match.')
      return
    }

    setStatus('loading')

    try {
      // Calls POST /user/reset-password with ResetPasswordDto
      const res = await api.post('/user/reset-password', {
        email,
        token,
        newPassword
      })

      setStatus('success')
      setMessage(res.data?.message || 'Password updated successfully.')
      setTimeout(() => {
        router.push('/login')
      }, 2500)
    } catch (err: any) {
      setStatus('error')
      setMessage(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to reset password. The link may have expired.'
      )
    }
  }

  if (!email || !token) {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-sm">
          Missing reset token or email. Please check the URL in your email or request a new reset link.
        </div>
        <Link
          href="/forgot-password"
          className="inline-block font-semibold text-sm text-amber-600 dark:text-amber-400 hover:underline"
        >
          Request new reset link
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 text-stone-900 dark:text-stone-100">
      {status === 'error' && (
        <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 p-3 rounded-lg">
          {message}
        </div>
      )}

      {status === 'success' && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-sm">
          {message} Redirecting to login...
        </div>
      )}

      <div className="flex flex-col space-y-1.5">
        <label className="font-semibold text-sm">New Password</label>
        <input
          className="w-full border rounded-lg p-2.5 border-black/40 dark:border-white/30 bg-white/80 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          type="password"
          placeholder="••••••••"
          required
          disabled={status === 'loading' || status === 'success'}
        />
      </div>

      <div className="flex flex-col space-y-1.5">
        <label className="font-semibold text-sm">Confirm New Password</label>
        <input
          className="w-full border rounded-lg p-2.5 border-black/40 dark:border-white/30 bg-white/80 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          placeholder="••••••••"
          required
          disabled={status === 'loading' || status === 'success'}
        />
      </div>

      <button
        className="w-full border rounded-lg p-2.5 cursor-pointer border-black bg-black text-white dark:bg-white dark:text-black font-semibold text-sm transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
        type="submit"
        disabled={status === 'loading' || status === 'success'}
      >
        {status === 'loading' ? 'Saving Password...' : 'Save New Password'}
      </button>
    </form>
  )
}

const ResetPasswordPage = () => {
  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:px-6 sm:py-16">
      <div className="bg-white/80 dark:bg-zinc-900/80 shadow-md rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 sm:p-10">
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            Create New Password
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Choose a secure password with at least 8 characters.
          </p>
        </header>
        <Suspense fallback={<div className="text-center py-4">Loading reset form...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  )
}

export default ResetPasswordPage