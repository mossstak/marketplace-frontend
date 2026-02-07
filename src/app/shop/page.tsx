import Link from 'next/link'

type ApiProduct = {
  id?: number
  Id?: number
  Product_Name?: string
  product_Name?: string
  Product_Description?: string | null
  product_Description?: string | null
  category?: string | null
  Variants?: { price?: number | null }[]
  variants?: { price?: number | null }[]
}

const getProducts = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    return { products: [], error: 'NEXT_PUBLIC_API_URL is not set.' }
  }

  const res = await fetch(`${baseUrl}/Product/all`, { cache: 'no-store' })
  if (!res.ok) {
    return { products: [], error: 'Failed to load products.' }
  }

  const products = (await res.json()) as ApiProduct[]
  return { products, error: '' }
}

export default async function Page() {
  const { products, error } = await getProducts()

  return (
    <div className="container mx-auto p-[100px]">
      <h1 className="text-3xl font-bold text-center">Products</h1>
      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      {!error && products.length === 0 && (
        <p className="mt-4 text-center">No products yet.</p>
      )}
      <ul className="lg:grid lg:grid-cols-3 gap-6 flex flex-col justify-center items-center mt-6">
        {products.map((product) => {
          const productId = product.id ?? product.Id
          const name = product.Product_Name ?? product.product_Name ?? 'Untitled'
          const description =
            product.Product_Description ?? product.product_Description ?? ''
          const variants = product.Variants ?? product.variants ?? []
          const prices = variants
            .map((v) => v.price)
            .filter((p): p is number => typeof p === 'number')
          const minPrice = prices.length ? Math.min(...prices) : null

          return (
            <li
              className="w-full max-w-sm rounded border border-gray-300 p-4"
              key={productId ?? name}
            >
              <h2 className="font-bold mb-2">{name}</h2>
              {description && <p className="text-sm mb-3">{description}</p>}
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
            </li>
          )
        })}
      </ul>
    </div>
  )
}
