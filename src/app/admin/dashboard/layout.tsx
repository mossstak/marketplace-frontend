'use client'

import DashboardPage from '@/components/DashboardPage'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { getRole, isLoggedIn } from '@/auth/auth'
import { roleRedirect } from '@/auth/roleredirect'
import Link from 'next/link'

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const authSnapshot = useMemo(() => {
    const loggedIn = isLoggedIn()
    return {
      loggedIn,
      role: loggedIn ? getRole() : null,
    }
  }, [])
  const isAdmin = authSnapshot.loggedIn && authSnapshot.role === 'Admin'
  useEffect(() => {
    if (!authSnapshot.loggedIn) {
      router.push('/login')
      return
    }

    if (!authSnapshot.role) {
      router.push('/login')
      return
    }
    if (authSnapshot.role !== 'Admin') {
      router.push(roleRedirect(authSnapshot.role))
      return
    }
  }, [router, authSnapshot])

  if (!isAdmin) return <div className="p-6">Loading dashboard...</div>
  return (
    <div>
      <DashboardPage
        sidebar={
          <div className="space-y-1">
            <Link
              href="/admin/dashboard/view-users"
              className={`block rounded-lg px-3 py-2 text-sm transition ${pathname === '/admin/dashboard/view-users' ? 'bg-amber-500/15 text-amber-950 dark:text-amber-200 font-bold border border-amber-500/30 shadow-xs' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              View Users
            </Link>
            <Link
              href="/admin/dashboard/verify-roasters"
              className={`block rounded-lg px-3 py-2 text-sm transition ${pathname === '/admin/dashboard/verify-roasters' ? 'bg-amber-500/15 text-amber-950 dark:text-amber-200 font-bold border border-amber-500/30 shadow-xs' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              Verify Roasters
            </Link>
            <Link
              href="/admin/dashboard/orders"
              className={`block rounded-lg px-3 py-2 text-sm transition ${pathname.startsWith('/admin/dashboard/orders') ? 'bg-amber-500/15 text-amber-950 dark:text-amber-200 font-bold border border-amber-500/30 shadow-xs' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              Orders & Refunds
            </Link>
          </div>
        }
      >
        {children}
      </DashboardPage>
    </div>
  )
}

