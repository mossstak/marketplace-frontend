'use client'

import axios from 'axios'
import Link from 'next/link'
import { type FormEvent, useState } from 'react'
import { api } from '@/api/api'

interface RegisterForm {
  Email: string
  Password: string
  ConfirmPassword: string
  FirstName: string
  LastName: string
}

const initialForm: RegisterForm = {
  Email: '',
  Password: '',
  ConfirmPassword: '',
  FirstName: '',
  LastName: '',
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const updateField = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!form.Email.trim() || !form.Password || !form.ConfirmPassword) {
      return 'Email and password are required.'
    }
    if (!form.FirstName.trim() || !form.LastName.trim()) {
      return 'First name and last name are required.'
    }
    if (form.Password.length < 8) {
      return 'Password must be at least 8 characters long.'
    }
    if (form.Password !== form.ConfirmPassword) {
      return 'Passwords do not match.'
    }
    return ''
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setIsSuccess(false)

    const validationMessage = validateForm()
    if (validationMessage) {
      setMessage(validationMessage)
      return
    }

    try {
      setSubmitting(true)
      // Assign default Buyer role on submission
      await api.post('/User/register', {
        ...form,
        Role: 'Buyer',
      })
      setIsSuccess(true)
      setMessage('Registration successful! You can log in to your account now.')
      setForm(initialForm)
    } catch (error: unknown) {
      setIsSuccess(false)
      if (axios.isAxiosError(error)) {
        const data = error.response?.data
        if (typeof data === 'string') {
          setMessage(data)
        } else if (data && typeof data === 'object' && 'message' in data) {
          setMessage(String(data.message))
        } else {
          setMessage('Registration failed. Please check your information.')
        }
      } else {
        setMessage('Registration failed.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:px-6 sm:py-16">
      <div className="bg-white/80 dark:bg-zinc-900/80 shadow-md rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 sm:p-10">
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            Create your account
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mt-2 text-sm sm:text-base">
            Join Roaster&apos;s Market to discover artisan single-origin coffees.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 text-stone-900 dark:text-stone-100"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="FirstName"
                className="block text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                First name
              </label>
              <input
                id="FirstName"
                className="mt-1.5 w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800 px-3.5 py-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                name="FirstName"
                value={form.FirstName}
                onChange={updateField}
                placeholder="Jane"
                required
              />
            </div>
            <div>
              <label
                htmlFor="LastName"
                className="block text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                Last name
              </label>
              <input
                id="LastName"
                className="mt-1.5 w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800 px-3.5 py-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                name="LastName"
                value={form.LastName}
                onChange={updateField}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="Email"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Email address
            </label>
            <input
              id="Email"
              type="email"
              className="mt-1.5 w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800 px-3.5 py-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              name="Email"
              value={form.Email}
              onChange={updateField}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="Password"
                className="block text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                Password
              </label>
              <input
                id="Password"
                type="password"
                className="mt-1.5 w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800 px-3.5 py-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                name="Password"
                value={form.Password}
                onChange={updateField}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label
                htmlFor="ConfirmPassword"
                className="block text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                Confirm password
              </label>
              <input
                id="ConfirmPassword"
                type="password"
                className="mt-1.5 w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800 px-3.5 py-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                name="ConfirmPassword"
                value={form.ConfirmPassword}
                onChange={updateField}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {message && (
            <div
              className={`rounded-xl px-4 py-3 text-sm border ${
                isSuccess
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
              }`}
            >
              <p>{message}</p>
              {isSuccess && (
                <div className="mt-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center text-xs font-semibold px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition"
                  >
                    Go to Login
                  </Link>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 font-semibold py-3 px-6 rounded-xl shadow transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-xs sm:text-sm text-stone-500 dark:text-stone-400 pt-2">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-amber-600 dark:text-amber-400 hover:underline"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
