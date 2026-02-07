'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import DashboardPage from '../../../components/DashboardPage'
import { getRole, isLoggedIn } from '@/auth/auth'
import { roleRedirect } from '@/auth/roleredirect'

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
    <DashboardPage
      sidebar={
        <div className="space-y-2">
          <Link
            href="/seller/dashboard/create-products"
            className={`block rounded px-2 py-1 ${
              pathname === '/seller/dashboard/create-products'
                ? 'bg-white/20 font-bold'
                : 'bg-white/5'
            }`}
          >
            Create Product
          </Link>
          <Link
            href="/seller/dashboard/view-products"
            className={`block rounded px-2 py-1 ${
              pathname === '/seller/dashboard/view-products'
                ? 'bg-white/20 font-bold'
                : 'bg-white/5'
            }`}
          >
            View Products
          </Link>
        </div>
      }
    >
      {children}
    </DashboardPage>
  )
}
