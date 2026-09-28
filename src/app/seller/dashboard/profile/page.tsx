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

  if (loading) return <div className="p-6 text-muted-foreground">Loading profile…</div>

  return (
    <div className="p-4 sm:p-6 max-w-3xl w-full mx-auto bg-card text-card-foreground border border-border rounded-2xl shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Roaster Profile</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your roastery public storefront information.
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-xl bg-primary hover:bg-primary/90 px-4 py-2 text-sm font-semibold text-primary-foreground transition cursor-pointer shadow-xs"
          >
            Edit Profile
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-xl border border-border bg-muted hover:bg-muted/80 px-4 py-2 text-sm font-semibold text-foreground transition cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium">
          {success}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1 text-foreground">
            Company name *
          </label>
          <input
            className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition disabled:opacity-60 disabled:bg-muted/50"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Blue Fox Coffee"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-foreground">Bio</label>
          <textarea
            className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-27.5 transition disabled:opacity-60 disabled:bg-muted/50"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell customers about your roastery…"
            disabled={!isEditing}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">City</label>
            <input
              className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition disabled:opacity-60 disabled:bg-muted/50"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="London"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">Country</label>
            <input
              className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition disabled:opacity-60 disabled:bg-muted/50"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="UK"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-foreground">Website</label>
          <input
            className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition disabled:opacity-60 disabled:bg-muted/50"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourroastery.com"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-foreground">Instagram</label>
          <input
            className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition disabled:opacity-60 disabled:bg-muted/50"
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
            className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary/90 px-6 py-2.5 text-sm font-bold text-primary-foreground transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        )}
      </form>
    </div>
  )
}

