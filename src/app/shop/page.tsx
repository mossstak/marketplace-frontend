import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/api/api'
import { type ProductDetails } from '@/types/product'
import { type RoasterDetails } from '@/types/roaster'
import { Card, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

interface ShopPageProps {
  searchParams: Promise<{ q?: string }>
}

const getShopData = async () => {
  try {
    const [productsRes, roastersRes] = await Promise.all([
      api.get<ProductDetails[]>('/Product/all'),
      api.get<RoasterDetails[]>('/RoasterProfile/all'),
    ])

    return {
      products: productsRes.data ?? [],
      roasters: roastersRes.data ?? [],
      error: '',
    }
  } catch {
    return { products: [], roasters: [], error: 'Failed to load data.' }
  }
}

export default async function Page({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams
  const query = resolvedParams.q?.toLowerCase().trim() || ''

  const { products, roasters, error } = await getShopData()

  // Create a quick lookup map of sellerId -> companyName
  const roasterMap = new Map<string, string>()
  roasters.forEach((r) => {
    if (r.userId && r.companyName) {
      roasterMap.set(r.userId, r.companyName)
    }
  })

  // Filter products by Product Name OR Roaster Name
  const filteredProducts = products.filter((product) => {
    if (!query) return true

    const sellerId =
      (product as any)?.seller?.sellerId || (product as any)?.sellerId || ''
    const roasterName = roasterMap.get(sellerId) ?? ''

    const nameMatch = String(product.productName ?? '')
      .toLowerCase()
      .includes(query)
    const roasterMatch = roasterName.toLowerCase().includes(query)

    return nameMatch || roasterMatch
  })

  return (
    <div className="container mx-auto px-4 py-8 sm:p-12">
      <h1 className="text-3xl font-bold text-center">Products</h1>

      {query && (
        <p className="mt-2 text-center text-sm text-stone-600 dark:text-stone-300">
          Showing results for <span className="font-semibold">"{query}"</span>
        </p>
      )}

      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

      {!error && filteredProducts.length === 0 && (
        <p className="mt-6 text-center text-stone-500">
          {query
            ? `No roasts or roasters match "${query}".`
            : 'No products yet.'}
        </p>
      )}

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center mt-8">
        {filteredProducts.map((product) => {
          const productId = product.id
          const name = product.productName ?? 'Untitled'
          const variants = product.variants ?? []
          const prices = variants
            .map((v) => v.price)
            .filter((p): p is number => typeof p === 'number')
          const minPrice = prices.length ? Math.min(...prices) : null

          const sellerId =
            (product as any)?.seller?.sellerId ||
            (product as any)?.sellerId ||
            ''
          const roasterName = roasterMap.get(sellerId)

          // 1. Resolve primary or first available image
          const primaryImage =
            (product.images ?? []).find((img) => img.isPrimary && img.imageUrl)
              ?.imageUrl ||
            (product.images ?? [])[0]?.imageUrl ||
            null

          return (
            <Card
              className="w-full max-w-sm rounded-xl border p-0 border-gray-300 dark:border-zinc-700 flex flex-col justify-between overflow-hidden hover:shadow-sm/50 hover:shadow-black/50 hover:duration-300"
              key={productId ?? name}
            >
              {productId !== undefined ? (
                <Link href={`/shop/${productId}`}>
                  <div>
                    {/* 2. Product Image Preview */}
                    <div className="relative aspect-square w-full mb-4 overflow-hidden bg-stone-100 dark:bg-zinc-800 dark:border-zinc-700">
                      {primaryImage ? (
                        <Image
                          src={primaryImage}
                          alt={name}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        />
                      ) : (
                        <Image
                          src="https://placehold.co/400/png"
                          alt={name}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        />
                      )}
                    </div>

                    <div className="p-4">
                      <CardTitle className="font-bold mb-1 line-clamp-1">
                        {name}
                      </CardTitle>

                      {roasterName && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
                          Roasted by{' '}
                          <span className="font-medium">{roasterName}</span>
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm mt-2">
                        <span>{product.category ?? 'Uncategorized'}</span>
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
                <p className="mt-4 text-sm text-gray-500">
                  Missing product id.
                </p>
              )}
            </Card>
          )
        })}
      </ul>
    </div>
  )
}
