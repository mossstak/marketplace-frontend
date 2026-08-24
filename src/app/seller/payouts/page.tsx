'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PayoutsRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/seller/dashboard/payouts')
  }, [router])

  return (
    <div className="p-8 text-center text-sm text-stone-500">
      Redirecting to Payouts dashboard...
    </div>
  )
}