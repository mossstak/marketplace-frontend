'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/api/api'
import { getRole, isLoggedIn, type Role } from '@/auth/auth'
import { type UserDetails } from '@/types/user'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role | null>(null)
  const [details, setDetails] = useState<UserDetails | null>(null)
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

    myDashboard()
  }, [router])

  if (loading) return <div className="p-6">Loading dashboard...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!details) return <div className="p-6">No user data.</div>

  return (
    <div className="bg-gray-500 w-full p-4 sm:p-6 lg:py-20 rounded-lg shadow-sm">
      {/* Shared user info */}
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <div className="shrink-0">
          <Image
            src="https://placehold.co/300/png"
            width={300}
            height={300}
            alt="Profile Picture"
            className="rounded-xl object-cover max-w-[200px] sm:max-w-[300px] w-full shadow-md"
          />
        </div>

        <div className="space-y-3 text-center sm:text-left">
          <div className="flex justify-center sm:justify-start">
            <h2 className="text-xl sm:text-2xl font-bold">Welcome back {details.firstName}!</h2>
          </div>

          <p className="text-sm sm:text-base text-gray-200">{details.email}</p>

          {(role === 'Admin' || role === 'Buyer') && (
            <div className="space-y-1 text-sm bg-gray-600/50 p-3 rounded-lg">
              <h3 className="font-semibold text-base">Address</h3>
              <p>{details.addressOne ?? 'N/A'}</p>
              {details.addressTwo && <p>{details.addressTwo}</p>}
              <p>
                {details.city ?? ''} {details.postalCode ?? ''}
              </p>
              <p>{details.country ?? ''}</p>
            </div>
          )}

          <p className="text-sm font-medium bg-black/20 inline-block px-2.5 py-1 rounded">Role: {role ?? 'Unknown'}</p>
        </div>
      </div>
    </div>
  )
}
