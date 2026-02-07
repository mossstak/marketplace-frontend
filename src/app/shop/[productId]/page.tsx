import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProductDetailClient from '@/components/ProductDetailClient'
import type { CartProduct } from '@/context/CartContext'

type ApiNamedEntity = {
  id?: number
  Name?: string
  name?: string
}

type ApiAltitude = {
  id?: number
  ValueInMasl?: number
  valueInMasl?: number
}

type ApiVariant = {
  id?: number
  Id?: number
  Size?: string
  size?: string
  Price?: number | null
  price?: number | null
  Quantity?: number | null
  quantity?: number | null
}

type ApiImage = {
  id?: number
  Id?: number
  ImageUrl?: string
  imageUrl?: string
  IsPrimary?: boolean
  isPrimary?: boolean
}

type ApiProduct = {
  id: number
  Product_Name?: string
  product_Name?: string
  Product_Description?: string | null
  product_Description?: string | null
  Category?: number | string | null
  category?: number | string | null
  RoastLevel?: ApiNamedEntity | null
  RoastLevelName?: string | null
  roastLevel?: string | null
  CoffeeProcess?: ApiNamedEntity | null
  CoffeeProcessName?: string | null
  coffeeprocess?: string | null
  Origin?: ApiNamedEntity | null
  OriginName?: string | null
  origin?: string | null
  Region?: ApiNamedEntity | null
  RegionName?: string | null
  region?: string | null
  Producer?: ApiNamedEntity | null
  ProducerName?: string | null
  producer?: string | null
  Varietal?: ApiNamedEntity | null
  VarietalName?: string | null
  varietal?: string | null
  Altitude?: ApiAltitude | null
  AltitudeValue?: number | string | null
  altitude?: number | string | null
  TastingNotes?: string | null
  RoastDate?: string | null
  tastingNotes?: string | null
  roastDate?: string | null
  Variants?: ApiVariant[]
  variants?: ApiVariant[]
  Images?: ApiImage[]
  images?: ApiImage[]
}

const getName = (entity?: ApiNamedEntity | null, fallback = 'N/A') =>
  entity?.Name ?? entity?.name ?? fallback

const formatList = (value?: string | string[] | null) => {
  if (!value) return 'N/A'
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'N/A'
  return value
}

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

const formatCategory = (value?: number | string | null) => {
  if (typeof value === 'number') {
    const labels: Record<number, string> = {
      1: 'CoffeeBeans',
      2: 'Grinder',
      3: 'EspressoMachine',
      4: 'BaristaTools',
      5: 'Misc',
    }
    return labels[value] ?? `#${value}`
  }
  if (typeof value === 'string' && value.trim()) return value
  return 'N/A'
}

const normalizeProduct = (data: ApiProduct): CartProduct => {
  const variants = data.Variants ?? data.variants ?? []
  const name = data.Product_Name ?? data.product_Name ?? 'Untitled'
  const description = data.Product_Description ?? data.product_Description ?? 'N/A'
  const roastLevel =
    data.RoastLevelName ?? data.roastLevel ?? getName(data.RoastLevel)
  const productType = formatCategory(data.Category ?? data.category)
  const price = variants
    .map((variant) => variant.Price ?? variant.price)
    .filter((value): value is number => typeof value === 'number')
    .map((value) => String(value))
  const weight = variants
    .map((variant) => variant.Size ?? variant.size)
    .filter((value): value is string => typeof value === 'string')

  return {
    id: data.id,
    productName: name,
    productType,
    roastLevel,
    description,
    weight,
    price,
  }
}

const getProduct = async (productId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) return null

  try {
    const res = await fetch(`${baseUrl}/Product/${productId}`, {
      cache: 'no-store',
    })

    if (!res.ok) return null
    return (await res.json()) as ApiProduct
  } catch (error) {
    console.error('Failed to fetch product details', error)
    return null
  }
}

interface ProductPageProps {
  params: Promise<{ productId: string }>
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { productId } = await params
  const product = await getProduct(productId)
  if (!product) notFound()

  const cartProduct = normalizeProduct(product)
  const variants = product.Variants ?? product.variants ?? []
  const coffeeProcess =
    product.CoffeeProcessName ??
    product.coffeeprocess ??
    getName(product.CoffeeProcess)
  const origin = product.OriginName ?? product.origin ?? getName(product.Origin)
  const region = product.RegionName ?? product.region ?? getName(product.Region)
  const producer =
    product.ProducerName ?? product.producer ?? getName(product.Producer)
  const varietal =
    product.VarietalName ?? product.varietal ?? getName(product.Varietal)
  const altitude =
    product.AltitudeValue ??
    product.altitude ??
    product.Altitude?.ValueInMasl ??
    product.Altitude?.valueInMasl
  const tastingNotes = product.TastingNotes ?? product.tastingNotes
  const roastDate = product.RoastDate ?? product.roastDate
  const images = product.Images ?? product.images ?? []
  const normalizedImages = images
    .map((img) => ({
      id: img.id ?? img.Id ?? undefined,
      url: img.ImageUrl ?? img.imageUrl ?? '',
      isPrimary: img.IsPrimary ?? img.isPrimary ?? false,
    }))
    .filter((img) => img.url)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
  const primaryImage = normalizedImages[0]

  const variantOptions = variants.map((variant, index) => {
    const size = variant.Size ?? variant.size ?? `Size ${index + 1}`
    const rawPrice = variant.Price ?? variant.price
    const price = typeof rawPrice === 'number' ? rawPrice : undefined
    return {
      id: variant.id ?? variant.Id ?? index,
      size,
      price,
    }
  })

  return (
    <div className="mt-[100px]">
      <Link href="/shop" className="text-blue-500 underline mb-4">
        Back to Products
      </Link>
      <h1>{cartProduct.productName}</h1>
      {primaryImage ? (
        <div className="mt-4">
          <img
            src={primaryImage.url}
            alt={cartProduct.productName}
            className="w-full max-w-xl rounded border"
          />
          {normalizedImages.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {normalizedImages.map((img, index) => (
                <img
                  key={img.id ?? `${img.url}-${index}`}
                  src={img.url}
                  alt={`${cartProduct.productName} ${index + 1}`}
                  className="h-20 w-20 rounded border object-cover"
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-500">No images available.</p>
      )}
      <p>
        <strong>Roast Level:</strong> {cartProduct.roastLevel}
      </p>
      <p>
        <strong>Description:</strong> {cartProduct.description}
      </p>
      <p>
        <strong>Coffee Process:</strong> {coffeeProcess}
      </p>
      <p>
        <strong>Origin:</strong> {origin}
      </p>
      <p>
        <strong>Region:</strong> {region}
      </p>
      <p>
        <strong>Altitude:</strong>{' '}
        {altitude !== undefined && altitude !== null ? String(altitude) : 'N/A'}
      </p>
      <p>
        <strong>Producer:</strong> {producer}
      </p>
      <p>
        <strong>Varietal:</strong> {varietal}
      </p>
      <p>
        <strong>Roast Date:</strong> {formatDate(roastDate)}
      </p>
      <p>
        <strong>Tasting Notes:</strong> {formatList(tastingNotes)}
      </p>
      <ProductDetailClient product={cartProduct} variants={variantOptions} />
    </div>
  )
}

export default ProductPage
