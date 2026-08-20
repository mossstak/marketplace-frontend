'use client'

import axios from 'axios'
import { type FormEvent, useState } from 'react'
import { api } from '@/api/api'

type Role = 'Buyer' | 'Seller' | 'Admin'

interface RegisterForm {
  Email: string
  Password: string
  ConfirmPassword: string
  FirstName: string
  LastName: string
  Role: Role
  AddressOne: string
  AddressTwo: string
  City: string
  Country: string
  PostalCode: string
}

const initialForm: RegisterForm = {
  Email: '',
  Password: '',
  ConfirmPassword: '',
  FirstName: '',
  LastName: '',
  Role: 'Buyer',
  AddressOne: '',
  AddressTwo: '',
  City: '',
  Country: '',
  PostalCode: '',
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const isSeller = form.Role === 'Seller'
  const isBuyer = form.Role === 'Buyer'
  const needsAddress = isSeller || isBuyer

  const updateField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target

    if (name === 'Role') {
      setForm((prev) => ({
        ...prev,
        Role: value as Role,
        AddressOne: value === 'Admin' ? '' : prev.AddressOne,
        AddressTwo: value === 'Admin' ? '' : prev.AddressTwo,
        City: value === 'Admin' ? '' : prev.City,
        Country: value === 'Admin' ? '' : prev.Country,
        PostalCode: value === 'Admin' ? '' : prev.PostalCode,
      }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!form.Email || !form.Password || !form.ConfirmPassword) {
      return 'Email and password are required.'
    }
    if (!form.FirstName || !form.LastName) {
      return 'First name and last name are required.'
    }
    if (form.Password !== form.ConfirmPassword) {
      return 'Passwords do not match.'
    }
    if (
      needsAddress &&
      (!form.AddressOne || !form.City || !form.Country || !form.PostalCode)
    ) {
      return 'Address fields are required for buyers and sellers.'
    }
    return ''
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)

    const validationMessage = validateForm()
    if (validationMessage) {
      setMessage(validationMessage)
      return
    }

    try {
      setSubmitting(true)
      await api.post('/User/register', form)
      setMessage('Registration successful. You can log in now.')
      setForm(initialForm)
    } catch (error: unknown) {
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
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white shadow rounded-xl border border-gray-200 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-black mt-2 text-center">
            Register your account
          </h1>
          <p className="text-gray-600 mt-2 text-center">
            Choose a role and share the details we need to get you started.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 text-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First name
              </label>
              <input
                className="mt-1 w-full rounded-lg border  border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="FirstName"
                value={form.FirstName}
                onChange={updateField}
                placeholder="Jane"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last name
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="LastName"
                value={form.LastName}
                onChange={updateField}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="Email"
                value={form.Email}
                onChange={updateField}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Roles
              </label>
              <select
                name="Role"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.Role}
                onChange={updateField}
              >
                <option value="Admin">Admin</option>
                <option value="Buyer">Buyer</option>
                <option value="Seller">Seller</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="Password"
                value={form.Password}
                onChange={updateField}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="ConfirmPassword"
                value={form.ConfirmPassword}
                onChange={updateField}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {needsAddress && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address line 1
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="AddressOne"
                  value={form.AddressOne}
                  onChange={updateField}
                  placeholder="123 Main St"
                  required={needsAddress}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address line 2 (optional)
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="AddressTwo"
                  value={form.AddressTwo}
                  onChange={updateField}
                  placeholder="Suite, unit, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="City"
                  value={form.City}
                  onChange={updateField}
                  placeholder="City"
                  required={needsAddress}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="Country"
                  value={form.Country}
                  onChange={updateField}
                  placeholder="Country"
                  required={needsAddress}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Postal code
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="PostalCode"
                  value={form.PostalCode}
                  onChange={updateField}
                  placeholder="ZIP / Postal"
                  required={needsAddress}
                />
              </div>
            </div>
          )}

          {message && (
            <div className="rounded-lg bg-gray-100 border border-gray-200 px-4 py-3 text-gray-800">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex justify-center w-full md:w-auto bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}

