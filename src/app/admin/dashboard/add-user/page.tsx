'use client'

import axios from 'axios'
import { type FormEvent, useState } from 'react'
import { api } from '@/api/api'

type Role = 'Buyer' | 'Seller'

interface AddUserForm {
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

const initialForm: AddUserForm = {
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

const Page = () => {
  const [form, setForm] = useState<AddUserForm>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const updateField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
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
    if (!form.AddressOne || !form.City || !form.Country || !form.PostalCode) {
      return 'Address fields are required for buyers and sellers.'
    }
    return ''
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setSuccess(false)

    const validationMessage = validateForm()
    if (validationMessage) {
      setMessage(validationMessage)
      return
    }

    try {
      setSubmitting(true)
      await api.post('/User/register', form)
      setMessage('User created successfully.')
      setSuccess(true)
      setForm(initialForm)
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data
        setMessage(typeof data === 'string' ? data : 'Failed to create user.')
      } else {
        setMessage('Failed to create user.')
      }
      setSuccess(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl w-full">
      <h1 className="text-xl sm:text-2xl font-semibold mb-4">Add User</h1>

      {message && (
        <div
          className={`mb-4 rounded border p-3 ${
            success
              ? 'border-green-300 bg-green-50 text-green-700'
              : 'border-red-300 bg-red-50 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              First name
            </label>
            <input
              className="w-full rounded border p-2"
              name="FirstName"
              value={form.FirstName}
              onChange={updateField}
              placeholder="Jane"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Last name
            </label>
            <input
              className="w-full rounded border p-2"
              name="LastName"
              value={form.LastName}
              onChange={updateField}
              placeholder="Doe"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded border p-2"
              name="Email"
              value={form.Email}
              onChange={updateField}
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="Role"
              className="w-full rounded border p-2"
              value={form.Role}
              onChange={updateField}
            >
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded border p-2"
              name="Password"
              value={form.Password}
              onChange={updateField}
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm password
            </label>
            <input
              type="password"
              className="w-full rounded border p-2"
              name="ConfirmPassword"
              value={form.ConfirmPassword}
              onChange={updateField}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Address line 1
          </label>
          <input
            className="w-full rounded border p-2"
            name="AddressOne"
            value={form.AddressOne}
            onChange={updateField}
            placeholder="123 Main St"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Address line 2 (optional)
          </label>
          <input
            className="w-full rounded border p-2"
            name="AddressTwo"
            value={form.AddressTwo}
            onChange={updateField}
            placeholder="Suite, unit, etc."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              className="w-full rounded border p-2"
              name="City"
              value={form.City}
              onChange={updateField}
              placeholder="City"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input
              className="w-full rounded border p-2"
              name="Country"
              value={form.Country}
              onChange={updateField}
              placeholder="Country"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Postal code
            </label>
            <input
              className="w-full rounded border p-2"
              name="PostalCode"
              value={form.PostalCode}
              onChange={updateField}
              placeholder="ZIP / Postal"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          {submitting ? 'Creating…' : 'Create user'}
        </button>
      </form>
    </div>
  )
}

export default Page
