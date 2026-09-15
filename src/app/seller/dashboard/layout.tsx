'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import DashboardPage from '../../../components/DashboardPage'
import { getRole, isLoggedIn } from '@/auth/auth'
import { roleRedirect } from '@/auth/roleredirect'
import { SellerProfileGate } from '@/components/SellerProfileGate'
import { api } from '@/api/api'
import { type RoasterDetails } from '@/types/roaster'
import { AlertCircle } from 'lucide-react'

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [profileStatus, setProfileStatus] = useState<string | number | null>(null)
  const authSnapshot = useMemo(() => {
    const loggedIn = isLoggedIn()
    return {
      loggedIn,
      role: loggedIn ? getRole() : null,
    }
  }, [])
  const isSeller = authSnapshot.loggedIn && authSnapshot.role === 'Seller'

  useEffect(() => {
    if (!authSnapshot.loggedIn) {
      router.push('/login')
      return
    }

    if (!authSnapshot.role) {
      router.push('/login')
      return
    }

    if (authSnapshot.role !== 'Seller') {
      router.push(roleRedirect(authSnapshot.role))
      return
    }
  }, [router, authSnapshot])

  useEffect(() => {
    if (!isSeller) return
    api.get<RoasterDetails>('/RoasterProfile/me')
      .then((res) => {
        if (res.data?.approvalStatus !== undefined) {
          setProfileStatus(res.data.approvalStatus)
        }
      })
      .catch(() => {})
  }, [isSeller, pathname])

  const isPending = profileStatus === 'Pending' || profileStatus === 0 || profileStatus === 'pending'

  if (!isSeller) return <div className="p-6">Loading dashboard...</div>

  return (
    <div>
      <SellerProfileGate mode="redirect" />

      <DashboardPage
        sidebar={
          <div className="space-y-1.5">
            <Link
              href="/seller/dashboard"
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                pathname === '/seller/dashboard'
                  ? 'bg-white/20 font-bold text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-200'
              }`}
            >
              Dashboard Overview
            </Link>
            <Link
              href="/seller/dashboard/create-products"
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                pathname === '/seller/dashboard/create-products'
                  ? 'bg-white/20 font-bold text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-200'
              }`}
            >
              Create Products
            </Link>
            <Link
              href="/seller/dashboard/view-products"
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                pathname === '/seller/dashboard/view-products'
                  ? 'bg-white/20 font-bold text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-200'
              }`}
            >
              View Products
            </Link>

            <Link
              href="/seller/dashboard/order"
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                pathname === '/seller/dashboard/order'
                  ? 'bg-white/20 font-bold text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-200'
              }`}
            >
              Check Orders
            </Link>

            <Link
              href="/seller/dashboard/profile"
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                pathname === '/seller/dashboard/profile'
                  ? 'bg-white/20 font-bold text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-200'
              }`}
            >
              Edit Profile
            </Link>

            <Link
              href="/seller/dashboard/payouts"
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                pathname === '/seller/dashboard/payouts'
                  ? 'bg-white/20 font-bold text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-200'
              }`}
            >
              Payouts & Stripe
            </Link>
          </div>
        }
      >
        {isPending && (
          <div className="mb-6 flex items-start sm:items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm animate-in fade-in-50 duration-200">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5 sm:mt-0" />
            <div className="flex-1">
              <p className="font-semibold text-amber-300">
                Your roaster profile is pending admin approval.
              </p>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Your storefront and listings remain private until reviewed and approved by an administrator.
              </p>
            </div>
          </div>
        )}
        {children}
      </DashboardPage>
    </div>
  )
}
