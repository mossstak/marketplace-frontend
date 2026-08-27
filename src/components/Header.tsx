'use client'

import {
  LucideHome,
  LucideMenu,
  LucideShoppingCart,
  LucideX,
  Store,
  LayoutDashboard,
  Settings,
  Package,
  Search,
  LogOut,
  Coffee,
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
import { clearAuth, getRole, isLoggedIn } from '@/auth/auth'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { cart } = useCart()
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const router = useRouter()
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    if (!isOpen) setSearchOpen(false)
  }

  const toggleSearch = () => {
    setSearchOpen(!searchOpen)
    if (!searchOpen) setIsOpen(false)
  }

  const handleLogout = () => {
    clearAuth()
    setLoggedIn(false)
    setRole(null)
    setIsOpen(false)
    router.push(loginpath())
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const isUserLoggedIn = isLoggedIn()
    setLoggedIn(isUserLoggedIn)
    if (isUserLoggedIn) {
      setRole(getRole())
    } else {
      setRole(null)
    }
    setIsOpen(false)
    setSearchOpen(false)
  }, [mounted, pathname])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const dashboardHref =
    role === 'Admin'
      ? '/admin/dashboard'
      : role === 'Seller'
        ? '/seller/dashboard'
        : '/buyer/dashboard'

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-background dark:bg-background transition-colors duration-200">
      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between px-2.5 py-2.5 sm:p-4 max-w-7xl mx-auto">
        {/* Brand / Logo */}
        <Link
          href={homepath()}
          className="shrink min-w-0 flex items-center gap-1.5 sm:gap-2 px-1 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition"
        >
          <h1 className=" sm:text-lg font-bold tracking-tight text-stone-900 dark:text-white truncate">
            Roaster's Market
          </h1>
        </Link>

        {/* Desktop Search Bar */}
        <div className="hidden md:block flex-1 max-w-sm mx-6">
          <Suspense
            fallback={<div className="w-full h-10 rounded-full bg-white/10" />}
          >
            <SearchBar />
          </Suspense>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-x-2 shrink-0">
          <Link
            href={shoppath()}
            className={buttonVariants({ variant: 'ghost' })}
          >
            <p className="text-lg font-semibold">Shop</p>
          </Link>
          <Link
            href="/roaster"
            className={buttonVariants({ variant: 'ghost' })}
          >
            <p className="text-lg font-semibold">Roasters</p>
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
          <Link
            href="/cart"
            className="relative p-2"
            aria-label="Shopping Cart"
          >
            <LucideShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#b24823] text-[10px] font-bold text-white shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex md:hidden items-center gap-0.5 sm:gap-1 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={toggleSearch}
            className="p-1.5 sm:p-2 rounded-lg text-stone-900 dark:text-stone-100 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle search bar"
            aria-expanded={searchOpen}
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* Mobile Theme Toggle */}
          <div className="scale-75 sm:scale-90 origin-center">
            <ThemeSwticher />
          </div>

          {/* Mobile Cart Button */}
          <Link
            href="/cart"
            className="relative p-1.5 sm:p-2 rounded-lg text-stone-900 dark:text-stone-100 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Shopping Cart"
          >
            <LucideShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            {cartCount > 0 && (
              <span className="absolute 0 top-0.5 right-0.5 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] sm:text-[10px] font-black text-black">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger / Close Button */}
          <button
            type="button"
            onClick={toggleMenu}
            className="p-1.5 sm:p-2 rounded-lg text-stone-900 dark:text-stone-100 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <div
              className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            >
              {isOpen ? (
                <LucideX className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <LucideMenu className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {searchOpen && (
        <div className="md:hidden px-3 py-2 bg-[#c2865d] dark:bg-zinc-900 border-t border-black/10 dark:border-white/10 animate-in slide-in-from-top-2 duration-200">
          <Suspense
            fallback={<div className="w-full h-9 rounded-full bg-white/10" />}
          >
            <SearchBar />
          </Suspense>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden bg-[#c98e67] dark:bg-zinc-950 border-t border-black/10 dark:border-white/10 max-h-[calc(100vh-60px)] overflow-y-auto transform transition-all duration-300 shadow-2xl">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <Link
                href={homepath()}
                className={`${buttonVariants({ variant: 'outline', size: 'sm' })} flex items-center gap-1.5`}
                onClick={() => setIsOpen(false)}
              >
                <LucideHome className="h-4 w-4" />
                <span>Home</span>
              </Link>
              {mounted && loggedIn && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/30 text-amber-950 dark:text-amber-300 border border-amber-500/30">
                  {role ?? 'User'}
                </span>
              )}
            </div>

            <div className="flex flex-col space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-black/60 dark:text-white/50 px-3 pb-1">
                Explore
              </p>

              <Link
                href={shoppath()}
                className={`${buttonVariants({
                  variant: 'ghost',
                })} justify-start text-sm sm:text-base font-semibold py-2.5 px-3 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 flex items-center gap-2.5`}
                onClick={() => setIsOpen(false)}
              >
                <Coffee className="h-4 w-4 text-amber-900 dark:text-amber-300" />
                <span>Shop All Products</span>
              </Link>

              <Link
                href="/roaster"
                className={`${buttonVariants({
                  variant: 'ghost',
                })} justify-start text-sm sm:text-base font-semibold py-2.5 px-3 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 flex items-center gap-2.5`}
                onClick={() => setIsOpen(false)}
              >
                <Store className="h-4 w-4 text-amber-900 dark:text-amber-300" />
                <span>Explore Roasters</span>
              </Link>

              {mounted && loggedIn && (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-black/60 dark:text-white/50 px-3 pt-3 pb-1">
                    Account
                  </p>

                  <Link
                    href={dashboardHref}
                    className={`${buttonVariants({
                      variant: 'ghost',
                    })} justify-start text-sm sm:text-base font-semibold py-2.5 px-3 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 flex items-center gap-2.5`}
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href="/settings"
                    className={`${buttonVariants({
                      variant: 'ghost',
                    })} justify-start text-sm sm:text-base font-semibold py-2.5 px-3 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 flex items-center gap-2.5`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>

                  <Link
                    href={dashboardHref}
                    className={`${buttonVariants({
                      variant: 'ghost',
                    })} justify-start text-sm sm:text-base font-semibold py-2.5 px-3 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 flex items-center gap-2.5`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Package className="h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                </>
              )}

              <div className="pt-3 mt-2 border-t border-black/10 dark:border-white/10">
                {!loggedIn ? (
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <Link
                      href={loginpath()}
                      className={`${buttonVariants({
                        variant: 'outline',
                      })} justify-center text-sm font-semibold py-2 rounded-lg`}
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href={registerpath()}
                      className={`${buttonVariants({
                        variant: 'default',
                      })} justify-center text-sm font-semibold py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black`}
                      onClick={() => setIsOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 text-center px-4 py-2.5 text-sm font-semibold text-red-700 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Header
