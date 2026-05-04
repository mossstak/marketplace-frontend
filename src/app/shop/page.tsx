import Link from 'next/link'
import { api } from '@/api/api'
import { type ProductDetails } from '@/types/product'
import { Card, CardTitle } from '@/components/ui/card'

const getProducts = async () => {
  try {
    const res = await api.get<ProductDetails[]>('/Product/all')
    return { products: res.data, error: '' }
  } catch (error) {
    return { products: [], error: 'Failed to load products.' }
  }
}

export default async function Page() {
  const { products, error } = await getProducts()

  return (
    <div className="container mx-auto p-25">
      <h1 className="text-3xl font-bold text-center">Products</h1>
      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      {!error && products.length === 0 && (
        <p className="mt-4 text-center">No products yet.</p>
      )}
      <ul className="lg:grid lg:grid-cols-3 gap-6 flex flex-col justify-center items-center mt-6">
        {products.map((product) => {
          const productId = product.id
          const name = product.productName ?? 'Untitled'
          const description = product.productDescription ?? ''
          const variants = product.variants ?? []
          const prices = variants
            .map((v) => v.price)
            .filter((p): p is number => typeof p === 'number')
          const minPrice = prices.length ? Math.min(...prices) : null

          return (
            <Card
              className="w-full max-w-sm rounded border border-gray-300 p-4"
              key={productId ?? name}
            >
              <CardTitle className="font-bold mb-2">{name}</CardTitle>
              <div className="flex items-center justify-between text-sm">
                <span>{product.category ?? 'Uncategorized'}</span>
                {minPrice !== null && <span>A${minPrice}</span>}
              </div>
              {productId !== undefined ? (
                <Link
                  href={`/shop/${productId}`}
                  className="mt-4 inline-block text-blue-600 underline"
                >
                  View details
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
