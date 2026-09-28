'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { api } from '../api/api'
import { getRole } from '../auth/auth'
import { useRouter, usePathname } from 'next/navigation'

type DropdownAccountProps = {
  logout: () => void
}

type MyDetails = {
  id: string
  firstName: string
  lastName: string
  profileImageUrl?: string | null
}

const DropdownAccount = ({ logout }: DropdownAccountProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [details, setDetails] = useState<MyDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const role = getRole()
  const dashboardHref =
    role === 'Admin'
      ? '/admin/dashboard'
      : role === 'Seller'
        ? '/seller/dashboard'
        : role === 'Buyer'
          ? '/buyer/dashboard'
          : '/login'

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const userName = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get<MyDetails>('/User/me')
        setDetails(res.data)
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          (typeof e?.response?.data === 'string' ? e.response.data : '') ||
          e?.message ||
          'Failed to load profile.'

        setError(msg)

        // If token is invalid/expired, kick back to login
        if (e?.response?.status === 401) router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    userName()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-full p-2 animate-pulse">
        <div className="w-8 h-8 rounded-full bg-gray-400/40" />
        <span className="hidden sm:block text-xs opacity-70">Loading...</span>
      </div>
    )
  }
  if (error || !details) return null

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full p-1.5 hover:bg-stone-200/50 dark:hover:bg-zinc-800/60 transition"
      >
        {details.profileImageUrl ? (
          <Image
            src={details.profileImageUrl}
            width={34}
            height={34}
            className="rounded-full object-cover w-8 h-8 ring-2 ring-amber-500/40"
            alt={`${details.firstName || 'User'}'s avatar`}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-1 ring-white/20">
            {details.firstName?.[0]?.toUpperCase() || 'U'}
            {details.lastName?.[0]?.toUpperCase() || ''}
          </div>
        )}
        <p className="hidden sm:block text-xs font-medium">
          {details.firstName} {details.lastName}
        </p>
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-popover text-popover-foreground p-1.5 shadow-lg space-y-0.5"
        >
          {role === 'Seller' && (
            <Link
              href={pathname.startsWith('/seller') || pathname.startsWith('/roaster/dashboard') ? '/buyer/dashboard' : '/roaster/dashboard'}
              role="menuitem"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 mb-1 transition"
              onClick={() => setOpen(false)}
            >
              <span>
                {pathname.startsWith('/seller') || pathname.startsWith('/roaster/dashboard')
                  ? '🛒 Buyer Dashboard'
                  : '☕ Roaster Dashboard'}
              </span>
            </Link>
          )}

          <Link
            href={dashboardHref}
            role="menuitem"
            className="block rounded-lg px-3 py-2 hover:bg-muted text-foreground transition text-xs font-medium"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            href="/settings"
            role="menuitem"
            className="block rounded-lg px-3 py-2 hover:bg-muted text-foreground transition text-xs font-medium"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>

          <Link
            href={dashboardHref}
            role="menuitem"
            className="block rounded-lg px-3 py-2 hover:bg-muted text-foreground transition text-xs font-medium"
            onClick={() => setOpen(false)}
          >
            Orders
          </Link>

          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-lg px-3 py-2 text-left hover:bg-muted text-destructive hover:text-destructive transition text-xs font-medium cursor-pointer"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default DropdownAccount
