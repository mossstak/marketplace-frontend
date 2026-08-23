'use client'

import {
  LucideHome,
  LucideMenu,
  LucideShoppingCart,
  LucideX,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { loginpath, registerpath, homepath, shoppath } from '@/paths'
import SearchBar from '@/components/SearchBar'
import { ThemeSwticher } from './theme/theme-switcher'
import { buttonVariants } from './ui/button'
import DropdownAccount from './DropdownAccount'
import { clearAuth, isLoggedIn } from '@/auth/auth'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { cart } = useCart()
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const router = useRouter()
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleLogout = () => {
    clearAuth()
    setLoggedIn(false)
    router.push(loginpath())
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    setLoggedIn(isLoggedIn())
  }, [mounted, pathname])

  return (
    <nav className="grid grid-cols-1 sticky top-0 left-0 right-0 z-50 bg-[#d1966e] dark:bg-gray-800 dark:drop-shadow-[#888888]">
      <div className="flex items-center justify-between p-4">
        {/* Logo */}
        <Link
          href={homepath()}
          className={buttonVariants({ variant: 'ghost' })}
        >
          <h1 className="text-lg font-semibold">Roaster's Market</h1>
        </Link>
        <Suspense
          fallback={<div className="w-48 h-8 rounded-full bg-white/10" />}
        >
          <SearchBar />
        </Suspense>
        {/* Desktop Menu - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-x-2">
          <Link
            href={shoppath()}
            className={buttonVariants({ variant: 'ghost' })}
          >
            <p className="text-lg font-semibold">Shop</p>
          </Link>
          {mounted && loggedIn ? (
            <DropdownAccount logout={handleLogout} />
          ) : (
            <>
              <Link
                href={registerpath()}
                className={buttonVariants({ variant: 'ghost' })}
              >
                <p className="text-lg font-semibold">Register</p>
              </Link>
              <Link
                href={loginpath()}
                className={buttonVariants({ variant: 'ghost' })}
              >
                <p className="text-lg font-semibold">Login</p>
              </Link>
            </>
          )}
          <ThemeSwticher />
          <Link href="/cart" className={buttonVariants({ variant: 'outline' })}>
            <h1 className="text-lg font-semibold">
              <LucideShoppingCart />
              {cartCount > 0 ? ` (${cartCount})` : ''}
            </h1>
          </Link>
        </div>

        {/* Mobile Menu Button - Only visible on mobile */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 transition-transform duration-200"
          aria-label="Toggle menu"
        >
          <div
            className={`transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            {isOpen ? <LucideX size={24} /> : <LucideMenu size={24} />}
          </div>
        </button>
      </div>

      {/* Mobile Menu - Only visible when open and on mobile */}
      {isOpen && (
        <div className="md:hidden dark:bg-black border-t h-screen overflow-y-auto transform transition-transform duration-300">
          <div className="transform translate ease-in-out">
            <div className="flex justify-between items-center p-4">
              <Link
                href={homepath()}
                className={buttonVariants({ variant: 'outline' })}
                onClick={() => setIsOpen(false)}
              >
                <LucideHome />
              </Link>
              <div className="flex justify-between items-center gap-3">
                <ThemeSwticher />
                <Link
                  href="/cart"
                  className={buttonVariants({ variant: 'outline' })}
                  onClick={() => setIsOpen(false)}
                >
                  <h1 className="text-lg font-semibold">
                    <LucideShoppingCart />
                    {cartCount > 0 ? ` (${cartCount})` : ''}
                  </h1>
                </Link>
              </div>
            </div>
            <div className="flex flex-col p-4 space-y-2">
              {!loggedIn && (
                <Link
                  href={registerpath()}
                  className={buttonVariants({
                    variant: 'ghost',
                    className: 'justify-start',
                  })}
                  onClick={() => setIsOpen(false)}
                >
                  <h1 className="text-lg font-semibold w-full text-center">
                    Register
                  </h1>
                </Link>
              )}
              <Link
                href={shoppath()}
                className={buttonVariants({
                  variant: 'ghost',
                  className: 'justify-start',
                })}
                onClick={() => setIsOpen(false)}
              >
                <h1 className="text-lg font-semibold w-full text-center">
                  Shop
                </h1>
              </Link>
              {!loggedIn ? (
                <Link
                  href={loginpath()}
                  className={buttonVariants({
                    variant: 'ghost',
                    className: 'justify-start',
                  })}
                  onClick={() => setIsOpen(false)}
                >
                  <h1 className="text-lg font-semibold w-full text-center">
                    Login
                  </h1>
                </Link>
              ) : (
                <button
                  type="button"
                  className={buttonVariants({
                    variant: 'ghost',
                    className: 'justify-start',
                  })}
                  onClick={() => {
                    setIsOpen(false)
                    handleLogout()
                  }}
                >
                  <h1 className="text-lg font-semibold w-full text-center">
                    Logout
                  </h1>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Header
