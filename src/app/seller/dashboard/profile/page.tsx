'use client'
import axios from 'axios'
import { type FormEvent, useState, useEffect } from 'react'
import { api } from '@/api/api'
import { type RoasterForm } from '@/types/roaster'

export default function SellerProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const [companyName, setCompanyName] = useState('')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')

  useEffect(() => {
    const myProfile = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get<RoasterForm>('/RoasterProfile/me')
        const data = res.data

        setCompanyName(data.companyName ?? '')
        setBio(data.bio ?? '')
        setCity(data.city ?? '')
        setCountry(data.country ?? '')
        setWebsiteUrl(data.websiteUrl ?? '')
        setInstagramUrl(data.instagramUrl ?? '')
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          (typeof e?.response?.data === 'string' ? e.response.data : '') ||
          e?.message ||
          'Failed to load profile.'

        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    myProfile()
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    

    if (!companyName.trim()) {
      setError('Company name is required.')
      return
    }

    try {
      setSaving(true)

      await api.put('/RoasterProfile/me', {
        companyName: companyName.trim(),
        bio: bio.trim() || null,
        city: city.trim(),
        country: country.trim(),
        websiteUrl: websiteUrl.trim(),
        instagramUrl: instagramUrl.trim(),
      } satisfies Omit<RoasterForm, 'id'>)

      setSuccess('Profile saved! ')
      setIsEditing(false)
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        (typeof e?.response?.data === 'string' ? e.response.data : '') ||
        e?.message ||
        'Failed to save profile.'

      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading profile…</div>

  return (
    <div className="p-6 max-w-3xl m-auto">
      <h1 className="text-2xl text-center font-semibold mb-4">Profile</h1>
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="rounded border px-3 py-2"
        >
          Edit
        </button>
      )}
      {error && (
        <div className="my-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="my-4 rounded border border-green-300 bg-green-50 p-3 text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">
            Company name *
          </label>
          <input
            className="w-full rounded border p-2"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Blue Fox Coffee"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            className="w-full rounded border p-2 min-h-[120px]"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell customers about your roastery…"
            disabled={!isEditing}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              className="w-full rounded border p-2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="London"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input
              className="w-full rounded border p-2"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="UK"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Website</label>
          <input
            className="w-full rounded border p-2"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourroastery.com"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Instagram</label>
          <input
            className="w-full rounded border p-2"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/yourroastery"
            disabled={!isEditing}
          />
        </div>

        <button
          type="submit"
          disabled={!isEditing || saving}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  )
}

