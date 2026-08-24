'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/api/api'
import { getRole, isLoggedIn } from '@/auth/auth'
import { type UserDetails } from '@/types/user'
import { type RoasterDetails } from '@/types/roaster'

export default function SellerDashboardPage() {
  const router = useRouter()
  const [details, setDetails] = useState<UserDetails | null>(null)
  const [profile, setProfile] = useState<RoasterDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login')
      return
    }

    const currentRole = getRole()
    if (!currentRole) {
      router.push('/login')
      return
    }

    const loadSellerData = async () => {
      try {
        setLoading(true)
        setError('')

        const [userRes, profileRes] = await Promise.allSettled([
          api.get<UserDetails>('/User/me'),
          api.get<RoasterDetails>('/RoasterProfile/me'),
        ])

        if (userRes.status === 'fulfilled') {
          setDetails(userRes.value.data)
        } else {
          const err = userRes.reason
          if (err?.response?.status === 401) {
            router.push('/login')
            return
          }
          setError('Failed to load user profile.')
        }

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data)
        }
      } catch {
        setError('Failed to load dashboard.')
      } finally {
        setLoading(false)
      }
    }

    loadSellerData()
  }, [router])

  if (loading) return <div className="p-6 text-gray-200">Loading dashboard...</div>
  if (error && !details) return <div className="p-6 text-red-400">{error}</div>
  if (!details) return <div className="p-6 text-gray-200">No user data.</div>

  return (
    <div className="bg-gray-800/80 border border-gray-700/80 w-full p-6 sm:p-8 rounded-2xl shadow-lg space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-700">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {details.firstName}!
          </h1>
          <p className="text-sm sm:text-base text-gray-300 mt-1">{details.email}</p>
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 self-start sm:self-center">
          Role: Seller
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Roaster Profile Card */}
        <div className="bg-gray-900/60 border border-gray-700/60 p-5 rounded-xl space-y-3">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider text-xs">Roaster Profile</h2>
          <div>
            <p className="font-semibold text-lg text-amber-300">
              {profile?.companyName || 'Profile Incomplete'}
            </p>
            <p className="text-sm text-gray-300 mt-1 leading-relaxed">
              {profile?.bio || 'No bio entered yet. Complete your profile to attract coffee lovers.'}
            </p>
            {(profile?.city || profile?.country) && (
              <p className="text-xs text-gray-400 mt-2 font-medium">
                📍 {[profile?.city, profile?.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-gray-900/60 border border-gray-700/60 p-5 rounded-xl space-y-3">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider text-xs">Address</h2>
          <div className="space-y-1 text-sm text-gray-300">
            <p>{details.addressOne ?? 'N/A'}</p>
            {details.addressTwo && <p>{details.addressTwo}</p>}
            <p>
              {details.city ?? ''} {details.postalCode ?? ''}
            </p>
            <p>{details.country ?? ''}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
