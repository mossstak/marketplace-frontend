'use client'
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

      setSuccess('Profile saved successfully!')
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

  if (loading) return <div className="p-6 text-gray-200">Loading profile…</div>

  return (
    <div className="p-4 sm:p-6 max-w-3xl w-full mx-auto mt-25 bg-gray-800/80 border border-gray-700/80 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Roaster Profile</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
            Manage your roastery public storefront information.
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-100 transition cursor-pointer shadow-sm"
          >
            Edit Profile
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="my-4 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="my-4 rounded-xl border border-green-500/40 bg-green-950/40 p-3 text-green-300 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">
            Company name *
          </label>
          <input
            className="w-full rounded-lg border border-gray-600 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-75 disabled:bg-gray-900/50"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Blue Fox Coffee"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Bio</label>
          <textarea
            className="w-full rounded-lg border border-gray-600 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-27.5 disabled:opacity-75 disabled:bg-gray-900/50"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell customers about your roastery…"
            disabled={!isEditing}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">City</label>
            <input
              className="w-full rounded-lg border border-gray-600 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-75 disabled:bg-gray-900/50"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="London"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">Country</label>
            <input
              className="w-full rounded-lg border border-gray-600 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-75 disabled:bg-gray-900/50"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="UK"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Website</label>
          <input
            className="w-full rounded-lg border border-gray-600 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-75 disabled:bg-gray-900/50"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourroastery.com"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Instagram</label>
          <input
            className="w-full rounded-lg border border-gray-600 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-75 disabled:bg-gray-900/50"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/yourroastery"
            disabled={!isEditing}
          />
        </div>

        {isEditing && (
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-300 transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        )}
      </form>
    </div>
  )
}

