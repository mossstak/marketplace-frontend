'use client'

import DashboardPage from '@/components/DashboardPage'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { getRole, isLoggedIn } from '@/auth/auth'
import { roleRedirect } from '@/auth/roleredirect'
import Link from 'next/link'

const layout = ({ children }: { children: React.ReactNode }) => {
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
              href="/admin/dashboard/add-user"
              className={`block rounded px-2 py-1 ${pathname === '/admin/dashboard/add-user' ? 'bg-white/20 font-bold' : 'bg-white/5'}`}
            >
              Add User
            </Link>
            <Link
              href="/admin/dashboard/view-users"
              className={`block rounded px-2 py-1 ${pathname === '/admin/dashboard/view-users' ? 'bg-white/20 font-bold' : 'bg-white/5'}`}
            >
              View Users
            </Link>
          </div>
        }
      >
        {children}
      </DashboardPage>
    </div>
  )
}

export default layout
