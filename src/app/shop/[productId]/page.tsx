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

interface ProductPageProps {
  params: Promise<{ productId: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params

  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) notFound()

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
    id: Number(product.id),
    productName: product.productName ?? 'Untitled',
    productType: product.category ? String(product.category) : 'N/A',
    roastLevel: product.roastLevel?.name ?? 'N/A',
    description: product.productDescription ?? 'N/A',
    weight: (product.variants ?? [])
      .map((v) => (v.size ? String(v.size) : null))
      .filter((x): x is string => Boolean(x)),
    price: (product.variants ?? [])
      .map((v) => (typeof v.price === 'number' ? String(v.price) : null))
      .filter((x): x is string => Boolean(x)),
  }

  return (
    <Card className="my-25 mx-auto w-400 bg-[#cac8be]">
      <div className="flex gap-3">
        <div className="m-5">
          <Link href="/shop" className="mb-4 text-blue-500 underline">
            Back to Products
          </Link>

          <CardHeader className="text-3xl">{cartProduct.productName}</CardHeader>

          {roasterHref && (
            <Link href={roasterHref} className="text-blue-500 underline">
              {roaster?.companyName}
            </Link>
          )}

          {primaryImage ? (
            <div className="m-5">
              <Image
                src={primaryImage.url}
                alt={cartProduct.productName}
                width={626}
                height={470}
                className="w-full max-w-xl rounded border drop-shadow"
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
                      className="h-20 w-20 rounded border object-cover p-3"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">No images available.</p>
          )}
        </div>

        <div className="flex flex-col justify-center">
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