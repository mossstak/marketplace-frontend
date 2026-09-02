'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Loader2, ShoppingBag, Store } from 'lucide-react'
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
    <section className="bg-background text-foreground transition-colors duration-200">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-24">
        {/* Left Column: Heading & CTAs */}
        <div>
          {/* #582424 for headline in light mode, soft warm linen in dark mode */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-[#582424] dark:text-[#FAF7F2] leading-[1.08]">
            Find your next <br className="hidden sm:inline" />
            favourite coffee.
          </h1>

          <p className="mt-5 max-w-lg text-base sm:text-lg leading-relaxed text-[#5c4d46] dark:text-muted-foreground font-normal">
            Browse independent roasters, discover artisan micro-lots, and order
            beans freshly roasted to order.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <Link
              href="/roaster"
              className="inline-flex items-center justify-center rounded-xl bg-[#582424] px-6 py-3.5 text-sm font-medium tracking-wide shadow-sm transition-all hover:bg-[#441a1a] hover:shadow-md"
            >
              Explore roasters
            </Link>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-xl bg-[#582424] px-6 py-3.5 text-sm font-medium tracking-wide shadow-sm transition-all hover:bg-[#441a1a] hover:shadow-md"
            >
              View All Products
            </Link>
          </div>
        </div>

        {/* Right Column: Featured Coffee Showcase Card */}
        <div className="w-full">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-lg dark:shadow-2xl sm:p-6 transition-colors">
            {/* Top Bar / Badging */}
            <div className="mb-4 flex items-center justify-between border-b border-border/80 pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#b05d33] dark:text-amber-300 uppercase">
                ☕ Coffee of the Week
              </span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                Staff Pick
              </span>
            </div>

            {/* Showcase Content */}
            {loading ? (
              <div className="flex h-56 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex h-56 items-center justify-center text-sm text-destructive">
                {error}
              </div>
            ) : featuredProduct ? (
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {/* Coffee Thumbnail */}
                <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-muted sm:w-44 border border-border/50">
                  <Image
                    src={
                      (featuredProduct as any)?.images?.[0]?.imageUrl ||
                      (featuredProduct as any)?.imageUrl ||
                      'https://placehold.co/600x600/png?text=Coffee+Beans'
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
                      className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#8b4513] dark:text-amber-300 transition hover:underline"
                    >
                      <Store className="h-3.5 w-3.5" />
                      <span>Roasted by {roasterName}</span>
                    </Link>

                    {/* Product Name */}
                    <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
                      {featuredProduct.productName}
                    </h2>

                    {/* Description */}
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                      {(featuredProduct as any)?.productDescription ||
                        featuredProduct.description ||
                        'Single-origin roast with balanced acidity and deep tasting notes.'}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#582424] dark:text-amber-300">
                      £
                      {Number(
                        (featuredProduct as any)?.variants?.[0]?.price ??
                          (featuredProduct as any)?.price ??
                          0,
                      ).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ bag</span>
                  </div>

                  {/* CTA Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const firstVariant = (featuredProduct as any)
                          ?.variants?.[0]
                        addToCart(
                          {
                            productId: Number(featuredProduct.id),
                            productName: String(featuredProduct.productName),
                            sellerId:
                              (featuredProduct as any)?.sellerId ||
                              (featuredProduct as any)?.userId ||
                              roasterInfo?.userId,
                            roasterProfileId: roasterInfo?.id
                              ? Number(roasterInfo.id)
                              : undefined,
                            variant: {
                              variantId: firstVariant?.id ?? 0,
                              size: firstVariant?.size
                                ? String(firstVariant.size)
                                : 'Standard',
                              price: Number(
                                firstVariant?.price ??
                                  (featuredProduct as any)?.price ??
                                  0,
                              ),
                            },
                          },
                          1,
                        )
                      }}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#582424] dark:bg-amber-400 px-4 py-2.5 text-xs font-bold text-white dark:text-zinc-950 shadow-sm transition hover:bg-[#441a1a] dark:hover:bg-amber-300 cursor-pointer"
                    >
                      <ShoppingBag className="h-4 w-4" /> Quick Add
                    </button>

                    <Link
                      href={`/shop/${featuredProduct.id}`}
                      className="inline-flex items-center justify-center rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold text-foreground transition hover:bg-muted"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
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
