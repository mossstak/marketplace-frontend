'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { api } from '@/api/api'
import { type RoasterDetails } from '@/types/roaster'

type GateMode = 'redirect' | 'render'

type Props = {
  mode: GateMode
  /**
   * In render mode, you can render UI based on readiness (e.g. disable buttons).
   * children is a function so you can do:
   * <SellerProfileGate mode="render">{(ready)=> ... }</SellerProfileGate>
   */
  children?: (ready: boolean, loading: boolean) => React.ReactNode

  /**
   * Optional: where to redirect sellers if profile is incomplete.
   * Default matches your route.
   */
  redirectTo?: string
}

async function fetchMyRoasterProfile(): Promise<RoasterDetails | null> {
  // If your api helper attaches token automatically, this is enough.
  // If it DOESN'T, fix it once inside api.ts (axios interceptor),
  // not here. Keeping this file clean is the whole point.
  const res = await api.get<RoasterDetails>('/RoasterProfile/me')
  return res.data ?? null
}

function isProfileComplete(profile: RoasterDetails | null): boolean {
  const companyName = profile?.companyName ?? ''
  return companyName.trim().length > 0
}

export function SellerProfileGate({
  mode,
  children,
  redirectTo = '/seller/dashboard/profile?missing=companyName',
}: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        setLoading(true)

        const profile = await fetchMyRoasterProfile()
        const ok = isProfileComplete(profile)

        if (cancelled) return

        setReady(ok)

        if (mode === 'redirect') {
          const isOnProfilePage = pathname.startsWith(
            '/seller/dashboard/profile',
          )
          if (!ok && !isOnProfilePage) {
            router.push(redirectTo)
          }
        }
      } catch {
        if (!cancelled) setReady(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
    // NOTE: `ready` is intentionally NOT in deps; we set it inside run().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, pathname, router, redirectTo])

  if (mode === 'render') {
    return <>{children?.(ready, loading)}</>
  }

  return null
}
