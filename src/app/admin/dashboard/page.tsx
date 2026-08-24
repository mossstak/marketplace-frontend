'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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

  if (loading) return <div className="p-6 text-gray-200">Loading dashboard...</div>
  if (error) return <div className="p-6 text-red-400">{error}</div>
  if (!details) return <div className="p-6 text-gray-200">No user data.</div>

  return (
    <div className="bg-gray-800/80 border border-gray-700/80 w-full p-6 sm:p-8 rounded-2xl shadow-lg">
      {/* Shared user info */}
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <div className="shrink-0">
          <Image
            src="https://placehold.co/300/png"
            width={300}
            height={300}
            alt="Profile Picture"
            className="rounded-xl object-cover max-w-[180px] sm:max-w-[220px] w-full shadow-md border border-gray-700"
          />
        </div>

        <div className="space-y-4 text-center sm:text-left flex-1">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {details.firstName}!
            </h2>
            <p className="text-sm sm:text-base text-gray-300 mt-1">{details.email}</p>
          </div>

          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
            Role: {role ?? 'Admin'}
          </div>

          {(role === 'Admin' || role === 'Buyer') && (
            <div className="space-y-1.5 text-sm bg-gray-900/60 border border-gray-700/60 p-4 rounded-xl max-w-md">
              <h3 className="font-semibold text-sm text-gray-200 uppercase tracking-wider">Address Details</h3>
              <p className="text-gray-300">{details.addressOne ?? 'N/A'}</p>
              {details.addressTwo && <p className="text-gray-300">{details.addressTwo}</p>}
              <p className="text-gray-300">
                {details.city ?? ''} {details.postalCode ?? ''}
              </p>
              <p className="text-gray-300">{details.country ?? ''}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
