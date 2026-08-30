'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import DashboardPage from '../../../components/DashboardPage'
import { getRole, isLoggedIn } from '@/auth/auth'
import { roleRedirect } from '@/auth/roleredirect'
import { SellerProfileGate } from '@/components/SellerProfileGate'

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
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
        {children}
      </DashboardPage>
    </div>
  )
}
