import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/api/api'
import type { RoasterDetails } from '@/types/roaster'
import type { ProductDetails } from '@/types/product'
import { Card, CardTitle } from '@/components/ui/card'
import { Globe, Instagram, MapPin, ArrowLeft, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function getRoaster(
  roasterIdParam: string,
): Promise<RoasterDetails | null> {
  const decoded = decodeURIComponent(roasterIdParam)
  const candidate = decoded.split('__')[0]

  try {
    const res = await api.get<RoasterDetails>(`/RoasterProfile/${candidate}`)
    if (res.data) return res.data
  } catch {
    // Continue to fallback
  }

  try {
    const resAll = await api.get<RoasterDetails[]>('/RoasterProfile/all')
    const all = resAll.data ?? []
    const match = all.find(
      (r) =>
        r.userId === candidate ||
        String(r.id) === candidate ||
        slugify(r.companyName ?? '') === slugify(decoded) ||
        (r.companyName ?? '').toLowerCase() === decoded.toLowerCase(),
    )
    if (match) return match
  } catch {
    // Network or server error
  }

  return null
}

async function getRoasterProducts(
  roasterUserId: string,
): Promise<ProductDetails[]> {
  try {
    const res = await api.get<ProductDetails[]>('/Product/all')
    const allProducts = res.data ?? []

    return allProducts.filter((product: any) => {
      const sellerId = product?.seller?.sellerId || product?.sellerId || ''
      return sellerId === roasterUserId
    })
  } catch (err) {
    console.error('Failed to fetch roaster products:', err)
    return []
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ roasterId: string }>
}) {
  const { roasterId } = await params
  const roaster = await getRoaster(roasterId)

  if (!roaster) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Roaster Not Found</h1>
        <p className="mt-2 text-sm text-gray-500">
          We couldn&apos;t find the roaster profile you were looking for.
        </p>
        <Link
          href="/roaster"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Roasters
        </Link>
      </div>
    )
  }

  const location = [roaster.city, roaster.country].filter(Boolean).join(', ')
  const products = roaster.userId
    ? await getRoasterProducts(roaster.userId)
    : []

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/roaster"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all roasters
      </Link>

      {/* Roaster Profile Header */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                {roaster.companyName ?? 'Unnamed Roaster'}
              </h1>
              {roaster.isVerified && (
                <span title="Verified Roaster" className="text-blue-500">
                  <CheckCircle2 className="h-5 w-5 fill-blue-500 text-white" />
                </span>
              )}
            </div>

            {location && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                <MapPin className="h-4 w-4" />
                {location}
              </p>
            )}
          </div>
        </div>

        {roaster.bio && (
          <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              About
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {roaster.bio}
            </p>
          </div>
        )}

        {(roaster.websiteUrl || roaster.instagramUrl) && (
          <div className="mt-6 flex flex-wrap gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            {roaster.websiteUrl && (
              <a
                href={
                  roaster.websiteUrl.startsWith('http')
                    ? roaster.websiteUrl
                    : `https://${roaster.websiteUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}

            {roaster.instagramUrl && (
              <a
                href={
                  roaster.instagramUrl.startsWith('http')
                    ? roaster.instagramUrl
                    : `https://${roaster.instagramUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
            )}
          </div>
        )}
      </div>

      {/* Available Coffees / Products Section */}
      <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
          Our Coffee
        </h2>

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 text-center text-sm text-zinc-500">
            No coffees listed by this roaster yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {products.map((item) => {
              const primaryImage =
                (item.images ?? []).find((img) => img.isPrimary && img.imageUrl)
                  ?.imageUrl ||
                (item.images ?? [])[0]?.imageUrl ||
                null

              const prices = (item.variants ?? [])
                .map((v) => v.price)
                .filter((p): p is number => typeof p === 'number')

              const minPrice = prices.length ? Math.min(...prices) : null
              const name = item.productName ?? 'Untitled'
              const productId = item.id

              return (
                <Card
                  className="w-full max-w-sm rounded-xl border p-0 border-gray-300 dark:border-zinc-700 flex flex-col justify-between overflow-hidden hover:shadow-sm/50 hover:shadow-black/50 hover:duration-300"
                  key={productId ?? name}
                >
                  {productId !== undefined ? (
                    <Link href={`/shop/${productId}`}>
                      <div>
                        {/* Product Image Preview */}
                        <div className="relative aspect-square w-full mb-4 overflow-hidden bg-stone-100 dark:bg-zinc-800 dark:border-zinc-700">
                          <Image
                            src={primaryImage ?? 'https://placehold.co/400/png'}
                            alt={name}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <CardTitle className="font-bold mb-1 line-clamp-1">
                            {name}
                          </CardTitle>

                          {roaster.companyName && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
                              Roasted by{' '}
                              <span className="font-medium">
                                {roaster.companyName}
                              </span>
                            </p>
                          )}

                          <div className="flex items-center justify-between text-sm mt-2">
                            <span>{item.category ?? 'Uncategorized'}</span>
                            {minPrice !== null && (
                              <span className="font-semibold">
                                £{minPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <p className="mt-4 text-sm text-gray-500 p-4">
                      Missing product id.
                    </p>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
