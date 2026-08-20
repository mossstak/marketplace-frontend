'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Loader2, ShoppingBag, Sparkles, Store } from 'lucide-react'
import { api } from '@/api/api'
import { useCart, type CartProduct } from '@/context/CartContext'
import type { RoasterDetails } from '@/types/roaster'
import { getWeeklyProductIndex } from '@/lib/utils'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

type FeaturedProductData = CartProduct & {
  roaster?: RoasterDetails | null
  sellerName?: string
  roasterName?: string
}

const Hero = () => {
  const [featuredProduct, setFeaturedProduct] =
    useState<FeaturedProductData | null>(null)
  const [roasterInfo, setRoasterInfo] = useState<RoasterDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const { addToCart } = useCart()

  useEffect(() => {
    const fetchFeaturedCoffeeAndRoaster = async () => {
      try {
        setLoading(true)
        setError('')

        const productRes = await api.get<CartProduct[]>('Product/all')
        const products = productRes.data || []

        if (products.length > 0) {
          // Automatically picks a consistent coffee for this week
          const weeklyIndex = getWeeklyProductIndex(products.length)
          const product = products[weeklyIndex]
          setFeaturedProduct(product)

          const sellerId = (product as any).sellerId || (product as any).userId
          if (sellerId) {
            try {
              const roasterRes = await api.get<RoasterDetails>(
                `RoasterProfile/${sellerId}`,
              )
              setRoasterInfo(roasterRes.data)
            } catch {
              // Fallback if roaster profile request fails
            }
          }
        }
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          (typeof e?.response?.data === 'string' ? e.response.data : '') ||
          e?.message ||
          'Failed to load featured coffee.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedCoffeeAndRoaster()
  }, [])

  const roasterName =
    roasterInfo?.companyName ||
    (featuredProduct as any)?.roasterName ||
    (featuredProduct as any)?.sellerName ||
    'Artisan Roaster'

  const roasterLink = roasterInfo?.userId
    ? `/roaster/${roasterInfo.userId}__${slugify(roasterName)}`
    : '/roaster'

  return (
    <section className="bg-[#582424] text-white shadow-[inset_0_4px_8px_rgba(0,0,0,0.25)]">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-24">
        {/* Left Column: Heading & CTAs */}
        <div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            Find your next favourite coffee.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
            Browse roasters, discover artisan roasts, and order directly from
            roasters who take coffee seriously.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <Link
              href="/roaster"
              className="inline-flex items-center justify-center rounded-lg bg-white text-sm font-semibold text-black! shadow-sm transition hover:bg-zinc-100"
            >
              Explore roasters
            </Link>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View all products
            </Link>
          </div>
        </div>

        {/* Right Column: Featured Coffee Showcase Card */}
        <div className="w-full">
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-black/25 p-5 shadow-2xl backdrop-blur-md sm:p-6">
            {/* Top Bar / Badging */}
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-300 uppercase">
                ☕ Coffee of the Week
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/80">
                Staff Pick
              </span>
            </div>

            {/* Showcase Content */}
            {loading ? (
              <div className="flex h-56 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/70" />
              </div>
            ) : error ? (
              <div className="flex h-56 items-center justify-center text-sm text-red-300">
                {error}
              </div>
            ) : featuredProduct ? (
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {/* Coffee Thumbnail */}
                <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-white/10 sm:w-44">
                  <Image
                    src={
                      typeof featuredProduct.imageUrl === 'string' &&
                      featuredProduct.imageUrl
                        ? featuredProduct.imageUrl
                        : 'https://placehold.co/600x600/png?text=Coffee+Beans'
                    }
                    alt={featuredProduct.productName || 'Featured Coffee'}
                    fill
                    priority
                    className="object-cover"
                    sizes="(min-width: 640px) 176px, 100vw"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between space-y-3">
                  <div>
                    {/* Roaster Tag & Link */}
                    <Link
                      href={roasterLink}
                      className="group inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 transition hover:underline"
                    >
                      <Store className="h-3.5 w-3.5" />
                      <span>Roasted by {roasterName}</span>
                    </Link>

                    {/* Product Name */}
                    <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                      {featuredProduct.productName}
                    </h2>

                    {/* Description */}
                    <p className="mt-1 line-clamp-2 text-xs text-white/80 sm:text-sm">
                      {featuredProduct.description ||
                        'Single-origin roast with balanced acidity and deep tasting notes.'}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-300">
                      £{Number((featuredProduct as any)?.price || 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-white/60">/ bag</span>
                  </div>

                  {/* CTA Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => addToCart(featuredProduct, 1)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-sm transition hover:bg-amber-300"
                    >
                      <ShoppingBag className="h-4 w-4" /> Quick Add
                    </button>

                    <Link
                      href={`/shop/${featuredProduct.id}`}
                      className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center text-sm text-white/60">
                No featured coffee currently available.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
