'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { getUserId, getRole } from '@/auth/auth'
import type { ProductDetails } from '@/types/product'
import type { RoasterDetails } from '@/types/roaster'
import CatalogFilters, { type SortOption } from '../components/CatalogFilters'
import ProductGrid from '../components/ProductGrid'

interface ShopCatalogProps {
  products: ProductDetails[]
  roasters: RoasterDetails[]
  query: string
  error: string
}

function isCoffeeBeanProduct(category: unknown): boolean {
  if (category === null || category === undefined) return true
  const catStr = String(category).toLowerCase().trim()
  return (
    catStr === 'coffee beans' ||
    catStr === 'coffeebeans' ||
    catStr === '1' ||
    catStr === 'coffee'
  )
}

export default function ShopCatalog({
  products,
  roasters,
  query,
  error,
}: ShopCatalogProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isSeller, setIsSeller] = useState(false)

  // Filter States
  const [selectedRoaster, setSelectedRoaster] = useState<string>('All')
  const [selectedRoastLevel, setSelectedRoastLevel] = useState<string>('All')
  const [selectedProcess, setSelectedProcess] = useState<string>('All')
  const [selectedOrigin, setSelectedOrigin] = useState<string>('All')
  const [minPriceInput, setMinPriceInput] = useState<string>('')
  const [maxPriceInput, setMaxPriceInput] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [showFiltersMobile, setShowFiltersMobile] = useState(false)

  useEffect(() => {
    setCurrentUserId(getUserId())
    setIsSeller(getRole() === 'Seller')
  }, [])

  const roasterMap = useMemo(() => {
    const map = new Map<string, string>()
    roasters.forEach((r) => {
      if (r.userId && r.companyName) {
        map.set(r.userId, r.companyName)
      }
    })
    return map
  }, [roasters])

  const availableOrigins = useMemo(() => {
    const origins = new Set<string>()
    products.forEach((p) => {
      const origin = (p as any).origin || (p as any).Origin
      if (origin && typeof origin === 'string' && origin.trim()) {
        origins.add(origin.trim())
      }
    })
    return Array.from(origins).sort()
  }, [products])

  const availableRoastLevels = useMemo(() => {
    const levels = new Set<string>(['Light', 'Medium', 'Medium-Dark', 'Dark'])
    products.forEach((p) => {
      const rl = (p as any).roastLevel || (p as any).RoastLevel
      if (rl && typeof rl === 'string' && rl.trim()) {
        levels.add(rl.trim())
      }
    })
    return Array.from(levels)
  }, [products])

  const baseCoffeeProducts = useMemo(() => {
    return products.filter((product) => {
      if (!isCoffeeBeanProduct(product.category)) return false

      const sellerId =
        (product as any)?.seller?.sellerId || (product as any)?.sellerId || ''

      if (isSeller && currentUserId && sellerId === currentUserId) return false
      if (!query) return true

      const roasterName = roasterMap.get(sellerId) ?? ''
      const nameMatch = String(product.productName ?? '').toLowerCase().includes(query)
      const roasterMatch = roasterName.toLowerCase().includes(query)

      return nameMatch || roasterMatch
    })
  }, [products, query, roasterMap, isSeller, currentUserId])

  const hiddenCount = useMemo(() => {
    if (!isSeller || !currentUserId) return 0
    return products.filter((p) => {
      if (!isCoffeeBeanProduct(p.category)) return false
      const sellerId = (p as any)?.seller?.sellerId || (p as any)?.sellerId || ''
      return sellerId === currentUserId
    }).length
  }, [products, isSeller, currentUserId])

  const filteredProducts = useMemo(() => {
    return baseCoffeeProducts.filter((product) => {
      if (selectedRoaster !== 'All') {
        const sellerId =
          (product as any)?.seller?.sellerId || (product as any)?.sellerId || ''
        if (sellerId !== selectedRoaster) return false
      }

      if (selectedRoastLevel !== 'All') {
        const roastLevel = (product as any).roastLevel || (product as any).RoastLevel
        if (!roastLevel || String(roastLevel).toLowerCase() !== selectedRoastLevel.toLowerCase()) {
          return false
        }
      }

      if (selectedProcess !== 'All') {
        const process = (product as any).coffeeProcess || (product as any).CoffeeProcess
        if (!process || String(process).toLowerCase() !== selectedProcess.toLowerCase()) {
          return false
        }
      }

      if (selectedOrigin !== 'All') {
        const origin = (product as any).origin || (product as any).Origin
        if (!origin || String(origin).toLowerCase() !== selectedOrigin.toLowerCase()) {
          return false
        }
      }

      const prices = (product.variants ?? [])
        .map((v) => v.price)
        .filter((p): p is number => typeof p === 'number')
      const minProductPrice = prices.length ? Math.min(...prices) : 0

      if (minPriceInput) {
        const minVal = parseFloat(minPriceInput)
        if (!isNaN(minVal) && minProductPrice < minVal) return false
      }

      if (maxPriceInput) {
        const maxVal = parseFloat(maxPriceInput)
        if (!isNaN(maxVal) && minProductPrice > maxVal) return false
      }

      return true
    })
  }, [
    baseCoffeeProducts,
    selectedRoaster,
    selectedRoastLevel,
    selectedProcess,
    selectedOrigin,
    minPriceInput,
    maxPriceInput,
  ])

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts]
    const getMinPrice = (p: ProductDetails): number => {
      const prices = (p.variants ?? [])
        .map((v) => v.price)
        .filter((val): val is number => typeof val === 'number')
      return prices.length ? Math.min(...prices) : 0
    }

    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => getMinPrice(a) - getMinPrice(b))
      case 'price-desc':
        return list.sort((a, b) => getMinPrice(b) - getMinPrice(a))
      case 'name-asc':
        return list.sort((a, b) =>
          String(a.productName ?? '').localeCompare(String(b.productName ?? ''))
        )
      case 'name-desc':
        return list.sort((a, b) =>
          String(b.productName ?? '').localeCompare(String(a.productName ?? ''))
        )
      case 'newest':
        return list.sort((a, b) => {
          const dateA = (a as any).roastDate ? new Date((a as any).roastDate).getTime() : 0
          const dateB = (b as any).roastDate ? new Date((b as any).roastDate).getTime() : 0
          return dateB - dateA
        })
      default:
        return list
    }
  }, [filteredProducts, sortBy])

  const resetFilters = () => {
    setSelectedRoaster('All')
    setSelectedRoastLevel('All')
    setSelectedProcess('All')
    setSelectedOrigin('All')
    setMinPriceInput('')
    setMaxPriceInput('')
    setSortBy('default')
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (selectedRoaster !== 'All') count++
    if (selectedRoastLevel !== 'All') count++
    if (selectedProcess !== 'All') count++
    if (selectedOrigin !== 'All') count++
    if (minPriceInput) count++
    if (maxPriceInput) count++
    if (sortBy !== 'default') count++
    return count
  }, [
    selectedRoaster,
    selectedRoastLevel,
    selectedProcess,
    selectedOrigin,
    minPriceInput,
    maxPriceInput,
    sortBy,
  ])

  return (
    <div className="container mx-auto px-4 py-8 sm:p-12 max-w-7xl">
      {query && (
        <div className="mb-6 flex items-center justify-between bg-stone-100 dark:bg-zinc-800/80 p-3.5 rounded-xl border border-stone-200 dark:border-zinc-700">
          <p className="text-sm text-stone-700 dark:text-stone-300">
            Showing results for <span className="font-semibold text-foreground">"{query}"</span>
          </p>
          <Link
            href="/shop"
            className="text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 transition"
          >
            Clear Search <X className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

      {hiddenCount > 0 && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-stone-700 dark:text-stone-300 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">☕</span>
            <span>
              You are signed in as a roaster. <strong>{hiddenCount}</strong> of your own{' '}
              {hiddenCount === 1 ? 'coffee roast is' : 'coffee roasts are'} hidden from this buyer catalog.
            </span>
          </div>
          <Link
            href="/seller/dashboard/view-products"
            className="font-semibold text-amber-700 dark:text-amber-400 hover:underline shrink-0"
          >
            Manage your roasts in Dashboard &rarr;
          </Link>
        </div>
      )}

      {/* Extracted Filter Component */}
      <CatalogFilters
        roasters={roasters}
        roasterMap={roasterMap}
        availableOrigins={availableOrigins}
        availableRoastLevels={availableRoastLevels}
        selectedRoaster={selectedRoaster}
        setSelectedRoaster={setSelectedRoaster}
        selectedRoastLevel={selectedRoastLevel}
        setSelectedRoastLevel={setSelectedRoastLevel}
        selectedProcess={selectedProcess}
        setSelectedProcess={setSelectedProcess}
        selectedOrigin={selectedOrigin}
        setSelectedOrigin={setSelectedOrigin}
        minPriceInput={minPriceInput}
        setMinPriceInput={setMinPriceInput}
        maxPriceInput={maxPriceInput}
        setMaxPriceInput={setMaxPriceInput}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showFiltersMobile={showFiltersMobile}
        setShowFiltersMobile={setShowFiltersMobile}
        activeFilterCount={activeFilterCount}
        resetFilters={resetFilters}
      />

      {/* Catalog Counter */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-stone-500 dark:text-stone-400 mb-4 px-1">
        <span>
          Showing <strong className="text-foreground">{sortedProducts.length}</strong>{' '}
          {sortedProducts.length === 1 ? 'coffee roast' : 'coffee roasts'}
        </span>
      </div>

      {/* Extracted Grid Component */}
      <ProductGrid
        products={sortedProducts}
        roasterMap={roasterMap}
        error={error}
        onResetFilters={resetFilters}
      />
    </div>
  )
}