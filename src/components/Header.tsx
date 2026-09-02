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
import Cart from './Cart'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // 1. Destructure openCart along with cart
  const { cart, openCart } = useCart()
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
    <nav className="sticky top-0 left-0 right-0 z-50 bg-background border-b-[5px] border-[#441a1a]/75 dark:border-stone-400 shadow-sm transition-colors duration-200">
      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between px-2.5 py-2.5 sm:p-4 max-w-7xl mx-auto">
        <Link
          href={homepath()}
          className="shrink min-w-0 flex items-center gap-1.5 sm:gap-2 px-1.5 py-1 rounded-md hover:bg-muted/60 transition"
        >
          <h1 className="sm:text-lg font-bold tracking-tight text-foreground truncate">
            Roaster's Market
          </h1>
        </Link>

        <div className="hidden md:block flex-1 max-w-sm mx-6">
          <Suspense
            fallback={
              <div className="w-full h-10 rounded-full bg-muted/40 animate-pulse" />
            }
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
            <span className="text-base font-medium text-foreground/90 hover:text-foreground">
              Shop
            </span>
          </Link>
          <Link
            href="/roaster"
            className={buttonVariants({ variant: 'ghost' })}
          >
            <span className="text-base font-medium text-foreground/90 hover:text-foreground">
              Roasters
            </span>
          </Link>
          {mounted && loggedIn ? (
            <DropdownAccount logout={handleLogout} />
          ) : (
            <>
              <Link
                href={registerpath()}
                className={buttonVariants({ variant: 'ghost' })}
              >
                <span className="text-base font-medium text-foreground/90 hover:text-foreground">
                  Register
                </span>
              </Link>
              <Link
                href={loginpath()}
                className={buttonVariants({ variant: 'ghost' })}
              >
                <span className="text-base font-medium text-foreground/90 hover:text-foreground">
                  Login
                </span>
              </Link>
            </>
          )}
          <ThemeSwticher />

          {/* Desktop Cart Button */}
          <button
            type="button"
            onClick={openCart}
            className="relative p-2 text-foreground/90 hover:text-foreground hover:bg-muted/60 rounded-md transition"
            aria-label="Shopping Cart"
          >
            <LucideShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c27d38] text-[10px] font-bold text-white shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex md:hidden items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            type="button"
            onClick={toggleSearch}
            className="p-1.5 sm:p-2 rounded-lg text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Toggle search bar"
            aria-expanded={searchOpen}
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <div className="scale-75 sm:scale-90 origin-center">
            <ThemeSwticher />
          </div>

          {/* Mobile Cart Button */}
          <button
            type="button"
            onClick={openCart}
            className="relative p-1.5 sm:p-2 rounded-lg text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Shopping Cart"
          >
            <LucideShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-primary text-[9px] sm:text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={toggleMenu}
            className="p-1.5 sm:p-2 rounded-lg text-foreground hover:bg-muted/60 transition-colors"
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
        <div className="md:hidden px-4 py-2.5 bg-card border-t border-border animate-in slide-in-from-top-2 duration-200">
          <Suspense
            fallback={
              <div className="w-full h-9 rounded-full bg-muted/50 animate-pulse" />
            }
          >
            <SearchBar />
          </Suspense>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-card border-t border-border max-h-[calc(100vh-60px)] overflow-y-auto transform transition-all duration-300 shadow-xl">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <Link
                href={homepath()}
                className={`${buttonVariants({ variant: 'outline', size: 'sm' })} flex items-center gap-1.5 border-border`}
                onClick={() => setIsOpen(false)}
              >
                <LucideHome className="h-4 w-4" />
                <span>Home</span>
              </Link>
              {mounted && loggedIn && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20">
                  {role ?? 'User'}
                </span>
              )}
            </div>

            <div className="flex flex-col space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 pb-1">
                Explore
              </p>
              <Link
                href={shoppath()}
                className={`${buttonVariants({ variant: 'ghost' })} justify-start text-sm sm:text-base font-semibold py-2.5 px-3 rounded-lg hover:bg-muted flex items-center gap-2.5 text-foreground`}
                onClick={() => setIsOpen(false)}
              >
                <Coffee className="h-4 w-4 text-primary" />
                <span>Shop All Products</span>
              </Link>
              <Link
                href="/roaster"
                className={`${buttonVariants({ variant: 'ghost' })} justify-start text-sm sm:text-base font-semibold py-2.5 px-3 rounded-lg hover:bg-muted flex items-center gap-2.5 text-foreground`}
                onClick={() => setIsOpen(false)}
              >
                <Store className="h-4 w-4 text-primary" />
                <span>Explore Roasters</span>
              </Link>

              {mounted && loggedIn && (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 pt-3 pb-1">
                    Account
                  </p>
                  <Link
                    href={dashboardHref}
                    className={`${buttonVariants({ variant: 'ghost' })} justify-start text-sm sm:text-base font-semibold py-2.5 px-3 rounded-lg hover:bg-muted flex items-center gap-2.5 text-foreground`}
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/settings"
                    className={`${buttonVariants({ variant: 'ghost' })} justify-start text-sm sm:text-base font-semibold py-2.5 px-3 rounded-lg hover:bg-muted flex items-center gap-2.5 text-foreground`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    href={dashboardHref}
                    className={`${buttonVariants({ variant: 'ghost' })} justify-start text-sm sm:text-base font-semibold py-2.5 px-3 rounded-lg hover:bg-muted flex items-center gap-2.5 text-foreground`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Package className="h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                </>
              )}

              <div className="pt-3 mt-2 border-t border-border">
                {!loggedIn ? (
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <Link
                      href={loginpath()}
                      className={`${buttonVariants({ variant: 'outline' })} justify-center text-sm font-semibold py-2 rounded-lg border-border`}
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href={registerpath()}
                      className={`${buttonVariants({ variant: 'default' })} justify-center text-sm font-semibold py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90`}
                      onClick={() => setIsOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 text-center px-4 py-2.5 text-sm font-semibold text-destructive bg-destructive/10 hover:bg-destructive/15 rounded-lg transition"
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

      <Cart />
    </nav>
  )
}

export default Header
