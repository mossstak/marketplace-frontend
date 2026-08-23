'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/api/api'
import { getRole, isLoggedIn, type Role } from '@/auth/auth'
import { type UserDetails } from '@/types/user'
import { type RoasterDetails } from '@/types/roaster'

export default function SellerDashboardPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role | null>(null)
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
    setRole(currentRole)

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

  if (loading) return <div className="p-6">Loading dashboard...</div>
  if (error && !details) return <div className="p-6 text-red-500">{error}</div>
  if (!details) return <div className="p-6">No user data.</div>

  return (
    <div className="bg-gray-500 w-full p-4 sm:p-5 rounded-lg shadow-sm">
      <div className="bg-gray-400 p-4 rounded-lg">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-3">Welcome back {details.firstName}!</h1>
        {(role === 'Seller' || role == 'Buyer') && (
          <div className="space-y-1 text-sm sm:text-base">
            <h3 className="font-semibold text-base">Address</h3>
            <p>{details.addressOne ?? 'N/A'}</p>
            {details.addressTwo && <p>{details.addressTwo}</p>}
            <p>
              {details.city ?? ''} {details.postalCode ?? ''}
            </p>
            <p>{details.country ?? ''}</p>
          </div>
        )}
      </div>
      <div className="bg-gray-400 min-h-[180px] mt-4 p-4 rounded-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Profile</h2>
          <p className="font-semibold">{profile?.companyName ?? ''}</p>
          <p className="text-sm mt-1">{profile?.bio ?? 'Enter some detail for bio'}</p>
          {(profile?.city || profile?.country) && (
            <p className="text-xs text-gray-200 mt-2">
              {profile?.city ? `${profile.city}, ` : ''}{profile?.country ?? ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
