'use client'

import React, { useState } from 'react'
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { api } from '../api/api'
import axios from 'axios'

interface ChangePasswordFormProps {
  className?: string
  onSuccess?: () => void
}

export default function ChangePasswordForm({ className = '', onSuccess }: ChangePasswordFormProps) {
  // Local UI state for form inputs and visibility toggles
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // API loading and message states
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all password fields.')
      return
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.')
      return
    }

    if (currentPassword === newPassword) {
      setErrorMessage('Your new password must be different from your current password.')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/User/change-password', {
        currentPassword,
        newPassword,
      })

      setSuccessMessage(
        typeof response.data === 'string'
          ? response.data
          : 'Password changed successfully!'
      )

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data
        if (typeof errorData === 'string') {
          setErrorMessage(errorData)
        } else if (errorData?.message) {
          setErrorMessage(errorData.message)
        } else {
          setErrorMessage('Failed to change password. Please check your credentials.')
        }
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  return (
    <div className={`bg-card m-25 text-card-foreground rounded-xl border border-border shadow-sm dark:bg-zinc-900 ${className}`}>
      {/* Header */}
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Change Password</h2>
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              Update your password to keep your account secure.
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        {/* Success Alert */}
        {successMessage && (
          <div className="flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 p-3.5 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-950/40 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Current Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Current Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 bg-background py-2.5 pr-10 pl-10 text-sm text-foreground placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-white dark:focus:ring-white"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* New Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            New Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 bg-background py-2.5 pr-10 pl-10 text-sm text-foreground placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-white dark:focus:ring-white"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 bg-background py-2.5 pr-10 pl-10 text-sm text-foreground placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-white dark:focus:ring-white"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Password Requirements Guidance Box */}
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-zinc-800/60">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
            Password requirements:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              Minimum 6 characters long
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              At least one uppercase and one lowercase letter
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              At least one number or special character
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  )
}