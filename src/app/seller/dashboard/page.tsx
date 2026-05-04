'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
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
      router.push('/logout')
      return
    }

    const currentRole = getRole()
    setRole(currentRole)

    if (!currentRole) {
      router.push('/logout')
      return
    }

    const myDashboard = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get<UserDetails>('/User/me')
        setDetails(res.data)
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          (typeof e?.response?.data === 'string' ? e.response.data : '') ||
          e?.message ||
          'Failed to load profile.'

        setError(msg)

        // If token is invalid/expired, kick back to login
        if (e?.response?.status === 401) router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    const myProfile = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get<RoasterDetails>('/RoasterProfile/me')
        setProfile(res.data)
        console.log(res.data)
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          (typeof e?.response?.data === 'string' ? e.response.data : '') ||
          e?.message ||
          'Failed to load profile.'

        setError(msg)

        // If token is invalid/expired, kick back to login
        if (e?.response?.status === 401) router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    myDashboard()
    myProfile()
  }, [router])

  if (loading) return <div className="p-6">Loading dashboard...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!details) return <div className="p-6">No user data.</div>

  return (
    <div className="bg-gray-500 w-full h-100 p-5">
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
      <div className="">
        <div>
          <h2 className="text-xl">Profile</h2>
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
