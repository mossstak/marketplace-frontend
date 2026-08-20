'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardPage from '../../../components/DashboardPage'
import { isLoggedIn } from '@/auth/auth'

export default function BuyerDashboard() {
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login')
    }
  }, [router])

  return (
    <DashboardPage
      sidebar={
        <div className="space-y-1">
          <p className="text-white/70">Buyer Navigation</p>
        </div>
      }
    >
      <h1 className="text-2xl font-bold">Welcome to your Buyer Dashboard!</h1>
      <p className="mt-2">This is where you can manage your orders and profile.</p>
    </DashboardPage>
  )
}
