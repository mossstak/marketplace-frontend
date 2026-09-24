'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Store,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { api } from '@/api/api'
import type { UserDetails } from '@/types/user'

interface PersonalInfoFormProps {
  initialUser: UserDetails | null
  onUserUpdated?: (updated: UserDetails) => void
}

export default function PersonalInfoForm({
  initialUser,
  onUserUpdated,
}: PersonalInfoFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialUser?.firstName ?? '',
    lastName: initialUser?.lastName ?? '',
    email: initialUser?.email ?? '',
    phoneNumber: initialUser?.phoneNumber ?? '',
    addressOne: initialUser?.addressOne ?? '',
    addressTwo: initialUser?.addressTwo ?? '',
    city: initialUser?.city ?? '',
    country: initialUser?.country ?? '',
    postalCode: initialUser?.postalCode ?? '',
    companyName: initialUser?.companyName ?? '',
  })

  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Sync if initialUser changes
  useEffect(() => {
    if (initialUser) {
      setFormData({
        firstName: initialUser.firstName ?? '',
        lastName: initialUser.lastName ?? '',
        email: initialUser.email ?? '',
        phoneNumber: initialUser.phoneNumber ?? '',
        addressOne: initialUser.addressOne ?? '',
        addressTwo: initialUser.addressTwo ?? '',
        city: initialUser.city ?? '',
        country: initialUser.country ?? '',
        postalCode: initialUser.postalCode ?? '',
        companyName: initialUser.companyName ?? '',
      })
    }
  }, [initialUser])

  const isSeller = Boolean(
    initialUser?.hasRoasterProfile || initialUser?.roles?.includes('Seller')
  )

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleReset = () => {
    if (initialUser) {
      setFormData({
        firstName: initialUser.firstName ?? '',
        lastName: initialUser.lastName ?? '',
        email: initialUser.email ?? '',
        phoneNumber: initialUser.phoneNumber ?? '',
        addressOne: initialUser.addressOne ?? '',
        addressTwo: initialUser.addressTwo ?? '',
        city: initialUser.city ?? '',
        country: initialUser.country ?? '',
        postalCode: initialUser.postalCode ?? '',
        companyName: initialUser.companyName ?? '',
      })
    }
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!formData.firstName.trim()) {
      setErrorMessage('First name is required.')
      setSaving(false)
      return
    }

    if (!formData.lastName.trim()) {
      setErrorMessage('Last name is required.')
      setSaving(false)
      return
    }

    if (!formData.email.trim()) {
      setErrorMessage('Email address is required.')
      setSaving(false)
      return
    }

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
        addressOne: formData.addressOne.trim() || null,
        addressTwo: formData.addressTwo.trim() || null,
        city: formData.city.trim() || null,
        country: formData.country.trim() || null,
        postalCode: formData.postalCode.trim() || null,
        company_Name: isSeller ? formData.companyName.trim() || null : null,
      }

      await api.patch('/User/me', payload)

      const updatedUser: UserDetails = {
        ...(initialUser as UserDetails),
        ...formData,
      }

      setSuccessMessage('Your personal information has been updated successfully!')
      onUserUpdated?.(updatedUser)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data
        const msg =
          typeof errorData === 'string'
            ? errorData
            : errorData?.message || 'Failed to save changes.'
        setErrorMessage(msg)
      } else if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('An unexpected error occurred.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Basic Personal Information */}
      <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <h3 className="text-base font-bold text-foreground">Basic Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. Sarah"
              required
              className="w-full rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Jenkins"
              required
              className="w-full rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 pl-9 pr-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
              <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+44 7123 456789"
                className="w-full rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 pl-9 pr-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
              <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Seller Business Name (Only if Seller / Roaster) */}
        {isSeller && (
          <div className="mt-4 pt-4 border-t border-stone-100 dark:border-zinc-800">
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
              Roaster / Brand Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Peak Roast Co."
                className="w-full rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 pl-9 pr-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
              <Store className="absolute left-3 top-2.5 h-3.5 w-3.5 text-amber-500 pointer-events-none" />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              This name is shown to customers on coffee listings and roaster directory pages.
            </p>
          </div>
        )}
      </div>

      {/* 2. Address & Delivery Information */}
      <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <h3 className="text-base font-bold text-foreground">Delivery & Location Address</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
              Street Address (Line 1)
            </label>
            <input
              type="text"
              name="addressOne"
              value={formData.addressOne}
              onChange={handleChange}
              placeholder="e.g. 74 High Street"
              className="w-full rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
              Apartment, Suite, Unit, etc. (Line 2)
            </label>
            <input
              type="text"
              name="addressTwo"
              value={formData.addressTwo}
              onChange={handleChange}
              placeholder="e.g. Flat 3B"
              className="w-full rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
                City / Town
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Bristol"
                className="w-full rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
                Postal / ZIP Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="e.g. BS1 4DJ"
                className="w-full rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g. United Kingdom"
                className="w-full rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs text-emerald-700 dark:text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-xs text-red-700 dark:text-red-400 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit Controls */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 text-foreground text-xs font-semibold transition cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#582424] hover:bg-[#441a1a] dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-zinc-950 text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  )
}
