import { api } from '@/api/api'
import { type ProductDetails } from '@/types/product'
import { type RoasterDetails } from '@/types/roaster'
import ShopCatalog from '@/components/ShopCatalog'

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

  return (
    <ShopCatalog
      products={products}
      roasters={roasters}
      query={query}
      error={error}
    />
  )
}
