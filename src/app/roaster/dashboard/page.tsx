'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RoasterDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/seller/dashboard')
  }, [router])

  return (
    <div className="p-8 text-center text-gray-300 min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      <p className="text-sm font-medium">Navigating to Roaster Dashboard...</p>
    </div>
  )
}
