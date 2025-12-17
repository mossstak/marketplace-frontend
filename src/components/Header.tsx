'use client'

import {
  LucideHome,
  LucideMenu,
  LucideShoppingCart,
  LucideX,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { aboutpath, homepath, shoppath } from '@/paths'
import { ThemeSwticher } from './theme/theme-switcher'
import { buttonVariants } from './ui/button'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { cart } = useCart()
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-black">
      <div className="flex items-center justify-between p-4">
        {/* Logo */}
        <Link
          href={homepath()}
          className={ buttonVariants({ variant: 'ghost' })}
        >
          <h1 className="text-lg font-semibold">Ecommerce Shop</h1>
        </Link>
        {/* Desktop Menu - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-x-2">
          <Link
            href={aboutpath()}
            className={buttonVariants({ variant: 'ghost' })}
          >
            <h1 className="text-lg font-semibold">About</h1>
          </Link>
          <Link
            href={shoppath()}
            className={buttonVariants({ variant: 'ghost' })}
          >
            <h1 className="text-lg font-semibold">Shop</h1>
          </Link>
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
              <Link
                href={aboutpath()}
                className={buttonVariants({
                  variant: 'ghost',
                  className: 'justify-start',
                })}
                onClick={() => setIsOpen(false)}
              >
                <h1 className="text-lg font-semibold w-full text-center">
                  About
                </h1>
              </Link>
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
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Header
