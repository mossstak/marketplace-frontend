'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { api } from '../api/api'
import { getRole } from '../auth/auth'
import router from 'next/router'

type DropdownAccountProps = {
  logout: () => void
}

type MyDetails = {
  id: string
  first_Name: string
  last_Name: string
}

const DropdownAccount = ({ logout }: DropdownAccountProps) => {
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
  }, [])

  if (loading) return <div className="p-6">Loading dashboard...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!details) return <div className="p-6">No user data.</div>

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full p-2 hover:bg-gray-500/30"
      >
        <Image
          src="https://placehold.co/40/png"
          width={40}
          height={40}
          className="rounded-full"
          alt="profile-img"
        />
        <p className="hidden sm:block">
          {details.first_Name} {details.last_Name}
        </p>
        <ChevronDown
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 rounded-md border border-white/10 bg-zinc-900 p-2 shadow-lg"
        >
          <Link
            href={dashboardHref}
            role="menuitem"
            className="block rounded-lg px-3 py-2 hover:bg-white/10 text-white"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            href="/settings"
            role="menuitem"
            className="block rounded-lg px-3 py-2 hover:bg-white/10 text-white"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>

          <Link
            href="/orders"
            role="menuitem"
            className="block rounded-lg px-3 py-2 hover:bg-white/10 text-white"
            onClick={() => setOpen(false)}
          >
            Orders
          </Link>

          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-lg px-3 py-2 text-left hover:bg-white/10 text-white"
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
