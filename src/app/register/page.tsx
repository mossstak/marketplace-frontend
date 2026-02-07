'use client'

import axios from 'axios'
import { type FormEvent, useMemo, useState } from 'react'

type Role = 'Buyer' | 'Seller' | 'Admin'

interface RegisterForm {
  Email: string
  Password: string
  ConfirmPassword: string
  First_Name: string
  Last_Name: string
  Role: Role
  Company_Name: string
  Address_One: string
  Address_Two: string
  City: string
  Country: string
  Postal_Code: string
}

const initialForm: RegisterForm = {
  Email: '',
  Password: '',
  ConfirmPassword: '',
  First_Name: '',
  Last_Name: '',
  Role: 'Buyer',
  Company_Name: '',
  Address_One: '',
  Address_Two: '',
  City: '',
  Country: '',
  Postal_Code: '',
}

const Page = () => {
  const [form, setForm] = useState<RegisterForm>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL ?? '', [])

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
        Company_Name: value === 'Seller' ? prev.Company_Name : '',
        Address_One: value === 'Admin' ? '' : prev.Address_One,
        Address_Two: value === 'Admin' ? '' : prev.Address_Two,
        City: value === 'Admin' ? '' : prev.City,
        Country: value === 'Admin' ? '' : prev.Country,
        Postal_Code: value === 'Admin' ? '' : prev.Postal_Code,
      }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!apiBaseUrl) return 'API base URL is missing.'
    if (!form.Email || !form.Password || !form.ConfirmPassword) {
      return 'Email and password are required.'
    }
    if (!form.First_Name || !form.Last_Name) {
      return 'First name and last name are required.'
    }
    if (form.Password !== form.ConfirmPassword) {
      return 'Passwords do not match.'
    }
    if (isSeller && !form.Company_Name) {
      return 'Company name is required for sellers.'
    }
    if (
      needsAddress &&
      (!form.Address_One || !form.City || !form.Country || !form.Postal_Code)
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
      await axios.post(`${apiBaseUrl}/User/register`, form)
      setMessage('Registration successful. You can log in now.')
      setForm(initialForm)
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data || 'Registration failed.')
      } else {
        setMessage('Registration failed.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 fixed top-10 bottom-0 left-0 right-0">
      <div className="bg-white shadow rounded-xl border border-gray-200 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mt-2 text-center">
            Register your account
          </h1>
          <p className="text-gray-600 mt-2 text-center">
            Choose a role and share the details we need to get you started.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First name
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="First_Name"
                value={form.First_Name}
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
                name="Last_Name"
                value={form.Last_Name}
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
                Role
              </label>
              <select
                name="Role"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {isSeller && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company name
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="Company_Name"
                value={form.Company_Name}
                onChange={updateField}
                placeholder="Your company LLC"
                required={isSeller}
              />
            </div>
          )}

          {needsAddress && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address line 1
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="Address_One"
                  value={form.Address_One}
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
                  name="Address_Two"
                  value={form.Address_Two}
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
                  name="Postal_Code"
                  value={form.Postal_Code}
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

export default Page
