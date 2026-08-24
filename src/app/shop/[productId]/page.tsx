import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ProductDetailClient from '@/components/ProductDetailClient'
import type { CartProduct } from '@/context/CartContext'
import type { ProductDetails } from '@/types/product'

type ApiRoaster = {
  id?: number
  userId: string
  companyName?: string | null
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')

const formatList = (value?: string | string[] | null) => {
  if (!value) return 'N/A'
  return Array.isArray(value)
    ? value.length
      ? value.join(', ')
      : 'N/A'
    : value
}

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export const dynamic = 'force-dynamic'

interface ProductPageProps {
  params: Promise<{ productId: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params

  const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const baseUrl = rawBaseUrl.replace(/\/+$/, '')

  const product = await getJson<ProductDetails>(
    `${baseUrl}/Product/${productId}`,
  )
  if (!product) notFound()

  const sellerId = product.seller?.sellerId
  const roaster = sellerId
    ? await getJson<ApiRoaster>(`${baseUrl}/RoasterProfile/${sellerId}`)
    : null

  const roasterHref = sellerId
    ? `/roaster/${sellerId}__${slugify(roaster?.companyName ?? 'unknown-roaster')}`
    : null

  const images = (product.images ?? [])
    .map((img, i) => ({
      key: img.imageUrl ?? `img-${i}`,
      url: img.imageUrl ?? '',
      isPrimary: Boolean(img.isPrimary),
    }))
    .filter((img) => img.url)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))

  const primaryImage = images[0]

  const variantOptions = (product.variants ?? []).map(
    (v: any, index: number) => ({
      id: typeof v?.id === 'number' ? v.id : index + 1,
      size: v.size ? String(v.size) : `Size ${index + 1}`,
      price: typeof v.price === 'number' ? v.price : 0,
    }),
  )

  // Tiny inline “cart product” (no big normalize function)
  const cartProduct: CartProduct = {
    id: product.id,
    productName: product.productName ?? 'Untitled',
    productType: product.category ? String(product.category) : 'N/A',
    roastLevel: product.roastLevel ? String(product.roastLevel) : 'N/A',
    description: product.productDescription ?? 'N/A',
    weight: (product.variants ?? [])
      .map((v) => (v.size ? String(v.size) : null))
      .filter((x): x is string => Boolean(x)),
    price: (product.variants ?? [])
      .map((v) => (typeof v.price === 'number' ? String(v.price) : null))
      .filter((x): x is string => Boolean(x)),
    sellerId: sellerId,
    roasterProfileId: roaster?.id ? Number(roaster.id) : undefined,
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition"
      >
        &larr; Back to Products
      </Link>

      <div className="rounded-2xl border border-stone-300 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-6 sm:p-8 shadow-sm backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Images Section */}
          <div className="space-y-4">
            {primaryImage ? (
              <div className="space-y-3">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700">
                  <Image
                    src={primaryImage.url}
                    alt={cartProduct.productName}
                    fill
                    priority
                    className="object-cover"
                    sizes="(min-width: 768px) 450px, 100vw"
                  />
                </div>

                {images.length > 1 && (
                  <div className="flex flex-wrap gap-2.5">
                    {images.map((img, index) => (
                      <div
                        key={img.key}
                        className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800"
                      >
                        <Image
                          src={img.url}
                          fill
                          alt={`${cartProduct.productName} ${index + 1}`}
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-stone-100 dark:bg-zinc-800 text-sm text-stone-400">
                No images available
              </div>
            )}
          </div>

          {/* Product Details & Actions */}
          <div className="flex flex-col space-y-6">
            <div>
              {roasterHref && roaster?.companyName && (
                <Link
                  href={roasterHref}
                  className="inline-block text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 hover:underline mb-1"
                >
                  Roasted by {roaster.companyName}
                </Link>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                {cartProduct.productName}
              </h1>
              {product.productDescription && (
                <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  {product.productDescription}
                </p>
              )}
            </div>

            {/* Coffee Attributes Grid */}
            <div className="rounded-xl bg-stone-100/70 dark:bg-zinc-800/50 p-4 border border-stone-200 dark:border-zinc-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
                Coffee Profile
              </h2>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs sm:text-sm">
                <div>
                  <span className="text-stone-500 dark:text-stone-400">Roast Level:</span>{' '}
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {product.roastLevel ?? 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 dark:text-stone-400">Process:</span>{' '}
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {product.coffeeProcess ?? 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 dark:text-stone-400">Origin:</span>{' '}
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {product.origin ?? 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 dark:text-stone-400">Region:</span>{' '}
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {product.region ?? 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 dark:text-stone-400">Altitude:</span>{' '}
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {product.altitude ? `${product.altitude} MASL` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 dark:text-stone-400">Producer:</span>{' '}
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {product.producer ?? 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 dark:text-stone-400">Varietal:</span>{' '}
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {product.varietal ?? 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 dark:text-stone-400">Roast Date:</span>{' '}
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {formatDate(product.roastDate)}
                  </span>
                </div>
              </div>

              {product.tastingNotes && (
                <div className="mt-3 pt-3 border-t border-stone-200 dark:border-zinc-700/60 text-xs sm:text-sm">
                  <span className="text-stone-500 dark:text-stone-400">Tasting Notes:</span>{' '}
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {formatList(product.tastingNotes)}
                  </span>
                </div>
              )}
            </div>

            {/* Purchase / Variants Selector */}
            <div className="pt-2 border-t border-stone-200 dark:border-zinc-800">
              <ProductDetailClient
                product={cartProduct}
                variants={variantOptions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
