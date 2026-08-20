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
    <div className="bg-gray-500 w-full p-5">
      <div className="bg-gray-400 p-3">
        <h1 className="text-center">Welcome back {details.firstName}!</h1>
        {(role === 'Seller' || role == 'Buyer') && (
          <div className="space-y-1">
            <h3 className="font-semibold">Address</h3>
            <p>{details.addressOne ?? 'N/A'}</p>
            {details.addressTwo && <p>{details.addressTwo}</p>}
            <p>
              {details.city ?? ''} {details.postalCode ?? ''}
            </p>
            <p>{details.country ?? ''}</p>
          </div>
        )}
      </div>
      <div className="bg-gray-400 h-90 mt-3 p-3">
        <div>
          <h2 className="text-[32pt]">Profile</h2>
          <p>{profile?.companyName ?? ''}</p>
          <p>{profile?.bio ?? 'enter some detail for bio'}</p>
          <p>
            {profile?.city}, {profile?.country}
          </p>
        </div>
      </div>
    </div>
  )
}
