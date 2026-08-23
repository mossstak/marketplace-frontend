import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ProductDetailClient from '@/components/ProductDetailClient'
import type { CartProduct } from '@/context/CartContext'
import { Card, CardHeader } from '@/components/ui/card'
import type { ProductDetails } from '@/types/product' // <-- change path to wherever product.ts lives

type ApiRoaster = {
  userId: string
  companyName?: string | null
}

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')

const formatList = (value?: string | string[] | null) => {
  if (!value) return 'N/A'
  return Array.isArray(value) ? (value.length ? value.join(', ') : 'N/A') : value
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

  const product = await getJson<ProductDetails>(`${baseUrl}/Product/${productId}`)
  if (!product) notFound()

  const sellerId = product.seller?.sellerId
  const roaster = sellerId
    ? await getJson<ApiRoaster>(`${baseUrl}/RoasterProfile/${sellerId}`)
    : null

  const roasterHref = sellerId
    ? `/roaster/${sellerId}__${slugify(roaster?.companyName ?? 'unknown-roaster')}`
    : null

  const images =
    (product.images ?? [])
      .map((img, i) => ({
        key: img.imageUrl ?? `img-${i}`,
        url: img.imageUrl ?? '',
        isPrimary: Boolean(img.isPrimary),
      }))
      .filter((img) => img.url)
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))

  const primaryImage = images[0]

  const variantOptions = (product.variants ?? []).map((v, i) => ({
    id: i,
    size: v.size ? String(v.size) : `Size ${i + 1}`,
    price: typeof v.price === 'number' ? v.price : undefined,
  }))

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
  }

  return (
    <Card className="my-6 mx-auto max-w-sm w-[calc(100%-2rem)] sm:w-full bg-[#cac8be] p-4 sm:p-5 shadow-lg">
      <div className="flex flex-col gap-3">
        <div>
          <Link href="/shop" className="mb-4 inline-block text-black underline font-medium text-sm">
            &larr; Back to Products
          </Link>

          <CardHeader className="text-2xl sm:text-3xl px-0 pt-2 pb-1 font-bold text-zinc-900">{cartProduct.productName}</CardHeader>

          {roasterHref && (
            <Link href={roasterHref} className="text-black underline text-sm font-medium">
              {roaster?.companyName}
            </Link>
          )}

          {primaryImage ? (
            <div className="my-4">
              <Image
                src={primaryImage.url}
                alt={cartProduct.productName}
                width={626}
                height={470}
                className="w-full max-w-xl rounded border drop-shadow object-cover"
              />

              {images.length > 1 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {images.map((img, index) => (
                    <Image
                      key={img.key}
                      src={img.url}
                      width={626}
                      height={470}
                      alt={`${cartProduct.productName} ${index + 1}`}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded border object-cover p-1.5 bg-white/20"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">No images available.</p>
          )}
        </div>

        <div className="flex flex-col justify-center p-2 ">
          <p> <strong>Roast Level:</strong> {product.roastLevel ?? 'N/A'} </p>
          <p>
            <strong>Description:</strong> {product.productDescription ?? 'N/A'}
          </p>
          <p>
            <strong>Coffee Process:</strong> {product.coffeeProcess ?? 'N/A'}
          </p>
          <p>
            <strong>Origin:</strong> {product.origin ?? 'N/A'}
          </p>
          <p>
            <strong>Region:</strong> {product.region ?? 'N/A'}
          </p>
          <p>
            <strong>Altitude:</strong>{' '}
            {product.altitude ?? 'N/A'}
          </p>
          <p>
            <strong>Producer:</strong> {product.producer ?? 'N/A'}
          </p>
          <p>
            <strong>Varietal:</strong> {product.varietal ?? 'N/A'}
          </p>
          <p>
            <strong>Roast Date:</strong> {formatDate(product.roastDate)}
          </p>
          <p>
            <strong>Tasting Notes:</strong> {formatList(product.tastingNotes)}
          </p>

          <ProductDetailClient product={cartProduct} variants={variantOptions} />
        </div>
      </div>
    </Card>
  )
}