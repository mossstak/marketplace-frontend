'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Coffee, Flame, RotateCcw } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import type { ProductDetails } from '@/types/product'

interface ProductGridProps {
  products: ProductDetails[]
  roasterMap: Map<string, string>
  error?: string
  onResetFilters: () => void
}

export default function ProductGrid({
  products,
  roasterMap,
  error,
  onResetFilters,
}: ProductGridProps) {
  if (!error && products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 dark:border-zinc-800 p-12 text-center max-w-md mx-auto my-8">
        <Coffee className="h-10 w-10 text-stone-400 mx-auto mb-3" />
        <h3 className="font-bold text-base text-foreground mb-1">
          No matching coffees found
        </h3>
        <p className="text-xs sm:text-sm text-stone-500 mb-6">
          Try adjusting or resetting your filters to see more coffee roasts.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 text-xs transition cursor-pointer shadow-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset All Filters
        </button>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
      {products.map((product) => {
        const productId = product.id
        const name = product.productName ?? 'Untitled'
        const variants = product.variants ?? []
        const prices = variants
          .map((v) => v.price)
          .filter((p): p is number => typeof p === 'number')
        const minPrice = prices.length ? Math.min(...prices) : null

        const sellerId =
          (product as any)?.seller?.sellerId || (product as any)?.sellerId || ''
        const roasterName = roasterMap.get(sellerId)

        const primaryImage =
          (product.images ?? []).find((img) => img.isPrimary && img.imageUrl)
            ?.imageUrl ||
          (product.images ?? [])[0]?.imageUrl ||
          null

        const origin = (product as any).origin || (product as any).Origin
        const roastLevel =
          (product as any).roastLevel || (product as any).RoastLevel

        return (
          <Card
            className="w-full max-w-sm rounded-xl border p-0 border-gray-300 dark:border-zinc-700 flex flex-col justify-between overflow-hidden hover:shadow-md hover:duration-300 transition-all bg-card text-card-foreground"
            key={productId ?? name}
          >
            {productId !== undefined ? (
              <Link href={`/shop/${productId}`}>
                <div>
                  <div className="relative aspect-square w-full mb-3 overflow-hidden bg-stone-100 dark:bg-zinc-800 dark:border-zinc-700">
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center select-none">
                        <span className="text-lg font-semibold text-stone-600 dark:text-stone-300 line-clamp-2 max-w-[85%]">
                          {name}
                        </span>
                      </div>
                    )}

                    {origin ? (
                      <span className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 border border-white/10">
                        {origin}
                      </span>
                    ) : (
                      <span className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-stone-200 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 border border-white/10">
                        Artisan Roast
                      </span>
                    )}
                  </div>

                  <div className="p-4 pt-1">
                    <CardTitle className="font-bold mb-1 text-base line-clamp-1">
                      {name}
                    </CardTitle>

                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
                      {roasterName ? (
                        <span className="truncate">
                          Roasted by{' '}
                          <span className="font-medium text-foreground">
                            {roasterName}
                          </span>
                        </span>
                      ) : (
                        <span>Artisan Roast</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm mt-3 pt-2.5 border-t border-stone-100 dark:border-zinc-800">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                        <strong className="font-semibold text-stone-900 dark:text-stone-100">
                          {roastLevel || 'Unspecified'}
                          <span className="text-stone-600 dark:text-stone-400 font-normal">
                            {' '}
                            Roast
                          </span>
                        </strong>
                      </span>
                      {minPrice !== null && (
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          from £{minPrice.toFixed(2)}
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
    </ul>
  )
}
