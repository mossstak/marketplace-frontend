'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
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

  if (loading) return <div className="p-6 text-muted-foreground">Loading dashboard...</div>
  if (error && !details) return <div className="p-6 text-red-700 dark:text-red-400 font-medium">{error}</div>
  if (!details) return <div className="p-6 text-muted-foreground">No user data.</div>

  const isPending = profile?.approvalStatus === 'Pending' || profile?.approvalStatus === 0 || profile?.approvalStatus === 'pending'
  const isApproved = profile?.approvalStatus === 'Approved' || profile?.approvalStatus === 1 || profile?.approvalStatus === 'approved'

  return (
    <div className="bg-card text-card-foreground border border-border w-full p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="shrink-0">
          <Image
            src="https://placehold.co/300/png"
            width={300}
            height={300}
            alt="Profile Picture"
            className="rounded-xl object-cover max-w-45 sm:max-w-55 w-full shadow-xs border border-border"
          />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back, {details.firstName}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">{details.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Roaster Profile Card */}
        <div className="bg-muted/30 border border-border p-5 rounded-2xl space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground uppercase tracking-wider">Roaster Profile</h2>
            {profile?.approvalStatus !== undefined && profile?.approvalStatus !== null && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isPending
                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
                    : isApproved
                      ? 'bg-green-500/15 text-green-800 dark:text-green-300 border-green-500/30'
                      : 'bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30'
                }`}
              >
                {isPending
                  ? 'Pending Approval'
                  : isApproved
                    ? 'Approved'
                    : 'Rejected'}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-lg text-foreground">
              {profile?.companyName || 'Profile Incomplete'}
            </p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {profile?.bio || 'No bio entered yet. Complete your profile to attract coffee lovers.'}
            </p>
            {(profile?.city || profile?.country) && (
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                {[profile?.city, profile?.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-muted/30 border border-border p-5 rounded-2xl space-y-3 shadow-2xs">
          <h2 className="text-base font-bold text-foreground uppercase tracking-wider">Address</h2>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="text-foreground font-medium">{details.addressOne ?? 'N/A'}</p>
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
