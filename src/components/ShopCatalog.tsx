'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  ArrowUpDown,
  Coffee,
  Globe,
  Store,
  Flame,
  Sparkles,
} from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import { getUserId, getRole } from '@/auth/auth'
import type { ProductDetails } from '@/types/product'
import type { RoasterDetails } from '@/types/roaster'

interface ShopCatalogProps {
  products: ProductDetails[]
  roasters: RoasterDetails[]
  query: string
  error: string
}

type SortOption =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc'
  | 'newest'

const ROAST_LEVELS = ['Light', 'Medium', 'Medium-Dark', 'Dark'] as const
const PROCESSES = ['Washed', 'Natural', 'Honey', 'Anaerobic'] as const

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
    const uid = getUserId()
    const role = getRole()
    setCurrentUserId(uid)
    setIsSeller(role === 'Seller')
  }, [])

  // Create a quick lookup map of sellerId -> companyName
  const roasterMap = useMemo(() => {
    const map = new Map<string, string>()
    roasters.forEach((r) => {
      if (r.userId && r.companyName) {
        map.set(r.userId, r.companyName)
      }
    })
    return map
  }, [roasters])

  // Extract unique origins from products
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

  // Extract unique roast levels from products + standard defaults
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

  // 1. Initial filter: Coffee beans only, query search, and hide seller's own products
  const baseCoffeeProducts = useMemo(() => {
    return products.filter((product) => {
      // Keep only Coffee Beans
      if (!isCoffeeBeanProduct(product.category)) {
        return false
      }

      const sellerId =
        (product as any)?.seller?.sellerId || (product as any)?.sellerId || ''

      // If seller is logged in, hide their own products from the buyer view
      if (isSeller && currentUserId && sellerId === currentUserId) {
        return false
      }

      if (!query) return true

      const roasterName = roasterMap.get(sellerId) ?? ''
      const nameMatch = String(product.productName ?? '')
        .toLowerCase()
        .includes(query)
      const roasterMatch = roasterName.toLowerCase().includes(query)

      return nameMatch || roasterMatch
    })
  }, [products, query, roasterMap, isSeller, currentUserId])

  // Count how many of seller's products are hidden
  const hiddenCount = useMemo(() => {
    if (!isSeller || !currentUserId) return 0
    return products.filter((p) => {
      if (!isCoffeeBeanProduct(p.category)) return false
      const sellerId = (p as any)?.seller?.sellerId || (p as any)?.sellerId || ''
      return sellerId === currentUserId
    }).length
  }, [products, isSeller, currentUserId])

  // 2. Apply all active filters
  const filteredProducts = useMemo(() => {
    return baseCoffeeProducts.filter((product) => {
      // Roaster Filter
      if (selectedRoaster !== 'All') {
        const sellerId =
          (product as any)?.seller?.sellerId || (product as any)?.sellerId || ''
        if (sellerId !== selectedRoaster) return false
      }

      // Roast Level Filter
      if (selectedRoastLevel !== 'All') {
        const roastLevel = (product as any).roastLevel || (product as any).RoastLevel
        if (!roastLevel || String(roastLevel).toLowerCase() !== selectedRoastLevel.toLowerCase()) {
          return false
        }
      }

      // Coffee Process Filter
      if (selectedProcess !== 'All') {
        const process = (product as any).coffeeProcess || (product as any).CoffeeProcess
        if (!process || String(process).toLowerCase() !== selectedProcess.toLowerCase()) {
          return false
        }
      }

      // Origin Filter
      if (selectedOrigin !== 'All') {
        const origin = (product as any).origin || (product as any).Origin
        if (!origin || String(origin).toLowerCase() !== selectedOrigin.toLowerCase()) {
          return false
        }
      }

      // Price Filters
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

  // 3. Apply sorting
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

  // Reset all filters
  const resetFilters = () => {
    setSelectedRoaster('All')
    setSelectedRoastLevel('All')
    setSelectedProcess('All')
    setSelectedOrigin('All')
    setMinPriceInput('')
    setMaxPriceInput('')
    setSortBy('default')
  }

  // Count active filters
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
      {/* Search Result Banner */}
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

      {/* Seller Notification Banner */}
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

      {/* Filter & Sort Toolbar */}
      <div className="mb-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-4 shadow-xs backdrop-blur-xs">
        {/* Mobile Filter Toggle Button */}
        <div className="flex sm:hidden items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => setShowFiltersMobile((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 text-xs font-semibold bg-stone-50 dark:bg-zinc-800 text-foreground"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters & Sort</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-amber-500 text-zinc-950 text-[10px] w-4 h-4 font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}
        </div>

        {/* Dropdown Filters Toolbar */}
        <div
          className={`${
            showFiltersMobile ? 'flex' : 'hidden'
          } sm:flex flex-wrap items-center gap-3`}
        >
          {/* Roast Level Dropdown */}
          <div className="flex-1 min-w-[140px] max-w-[180px]">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
              Roast Level
            </label>
            <div className="relative">
              <select
                value={selectedRoastLevel}
                onChange={(e) => setSelectedRoastLevel(e.target.value)}
                className="w-full appearance-none rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-3 py-2 pr-8 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="All">All Roast Levels</option>
                {availableRoastLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <Flame className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
            </div>
          </div>

          {/* Roaster Dropdown */}
          <div className="flex-1 min-w-[150px] max-w-[220px]">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
              Roaster
            </label>
            <div className="relative">
              <select
                value={selectedRoaster}
                onChange={(e) => setSelectedRoaster(e.target.value)}
                className="w-full appearance-none rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-3 py-2 pr-8 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="All">All Roasters</option>
                {roasters
                  .filter((r) => r.userId && r.companyName)
                  .map((r) => (
                    <option key={r.userId} value={r.userId}>
                      {r.companyName}
                    </option>
                  ))}
              </select>
              <Store className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
            </div>
          </div>

          {/* Coffee Process Dropdown */}
          <div className="flex-1 min-w-[140px] max-w-[180px]">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
              Process
            </label>
            <div className="relative">
              <select
                value={selectedProcess}
                onChange={(e) => setSelectedProcess(e.target.value)}
                className="w-full appearance-none rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-3 py-2 pr-8 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="All">All Processes</option>
                {PROCESSES.map((proc) => (
                  <option key={proc} value={proc}>
                    {proc}
                  </option>
                ))}
              </select>
              <Sparkles className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
            </div>
          </div>

          {/* Origin Dropdown */}
          {availableOrigins.length > 0 && (
            <div className="flex-1 min-w-[140px] max-w-[180px]">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                Origin
              </label>
              <div className="relative">
                <select
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-3 py-2 pr-8 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="All">All Origins</option>
                  {availableOrigins.map((orig) => (
                    <option key={orig} value={orig}>
                      {orig}
                    </option>
                  ))}
                </select>
                <Globe className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Price Range Inputs */}
          <div className="flex-1 min-w-[170px] max-w-[210px]">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
              Price Range (£)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-full rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-2.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-stone-400 text-xs">-</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-full rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-2.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex-1 min-w-[150px] max-w-[200px] ml-auto">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
              Sort By
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full appearance-none rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-3 py-2 pr-8 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="default">Featured (Default)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="newest">Newest Roast</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filter Pills Bar */}
        {activeFilterCount > 0 && (
          <div className="mt-4 pt-3 border-t border-stone-200 dark:border-zinc-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-500 dark:text-stone-400 font-medium">
              Active Filters:
            </span>

            {selectedRoastLevel !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 text-stone-800 dark:text-stone-200">
                Roast Level: <strong>{selectedRoastLevel}</strong>
                <button
                  type="button"
                  onClick={() => setSelectedRoastLevel('All')}
                  className="hover:text-red-500 ml-0.5"
                  aria-label="Remove roast level filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedRoaster !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 text-stone-800 dark:text-stone-200">
                Roaster: <strong>{roasterMap.get(selectedRoaster) ?? selectedRoaster}</strong>
                <button
                  type="button"
                  onClick={() => setSelectedRoaster('All')}
                  className="hover:text-red-500 ml-0.5"
                  aria-label="Remove roaster filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedProcess !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 text-stone-800 dark:text-stone-200">
                Process: <strong>{selectedProcess}</strong>
                <button
                  type="button"
                  onClick={() => setSelectedProcess('All')}
                  className="hover:text-red-500 ml-0.5"
                  aria-label="Remove process filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedOrigin !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 text-stone-800 dark:text-stone-200">
                Origin: <strong>{selectedOrigin}</strong>
                <button
                  type="button"
                  onClick={() => setSelectedOrigin('All')}
                  className="hover:text-red-500 ml-0.5"
                  aria-label="Remove origin filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {(minPriceInput || maxPriceInput) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 text-stone-800 dark:text-stone-200">
                Price:{' '}
                <strong>
                  {minPriceInput ? `£${minPriceInput}` : '£0'} -{' '}
                  {maxPriceInput ? `£${maxPriceInput}` : 'Any'}
                </strong>
                <button
                  type="button"
                  onClick={() => {
                    setMinPriceInput('')
                    setMaxPriceInput('')
                  }}
                  className="hover:text-red-500 ml-0.5"
                  aria-label="Remove price filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {sortBy !== 'default' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 text-stone-800 dark:text-stone-200">
                Sorted
                <button
                  type="button"
                  onClick={() => setSortBy('default')}
                  className="hover:text-red-500 ml-0.5"
                  aria-label="Reset sort"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
            >
              <RotateCcw className="h-3 w-3" /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Catalog Results Header (Counter) */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-stone-500 dark:text-stone-400 mb-4 px-1">
        <span>
          Showing <strong className="text-foreground">{sortedProducts.length}</strong>{' '}
          {sortedProducts.length === 1 ? 'coffee roast' : 'coffee roasts'}
        </span>
      </div>

      {/* Empty State */}
      {!error && sortedProducts.length === 0 && (
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
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-lg bg-[#582424] dark:bg-amber-400 text-white dark:text-zinc-950 font-semibold px-4 py-2 text-xs transition hover:opacity-90 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset All Filters
          </button>
        </div>
      )}

      {/* Coffee Products Grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {sortedProducts.map((product) => {
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

          const origin = (product as any).origin || (product as any).Origin
          const roastLevel = (product as any).roastLevel || (product as any).RoastLevel

          return (
            <Card
              className="w-full max-w-sm rounded-xl border p-0 border-gray-300 dark:border-zinc-700 flex flex-col justify-between overflow-hidden hover:shadow-md hover:duration-300 transition-all bg-card text-card-foreground"
              key={productId ?? name}
            >
              {productId !== undefined ? (
                <Link href={`/shop/${productId}`}>
                  <div>
                    {/* 2. Product Image Preview */}
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
                        <Image
                          src="https://placehold.co/400/png"
                          alt={name}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        />
                      )}

                      {/* Prominent Roast Level Badge Overlay on Image */}
                      {origin ? (
                        <span className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 border border-white/10">
                          {origin}
                        </span>
                      ) : (
                        <span className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-stone-200 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 border border-white/10">
                          <Flame className="h-3 w-3 text-stone-400" />
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
                            Roasted by <span className="font-medium text-foreground">{roasterName}</span>
                          </span>
                        ) : (
                          <span>Artisan Roast</span>
                        )}
                      </div>

                      {/* Bottom Footer: Roast Level & Starting Price */}
                      <div className="flex items-center justify-between text-sm mt-3 pt-2.5 border-t border-stone-100 dark:border-zinc-800">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                          <Flame className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="text-stone-600 dark:text-stone-400 font-normal">Roast Level:</span>
                          <strong className="font-semibold text-stone-900 dark:text-stone-100">
                            {roastLevel || 'Unspecified'}
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
    </div>
  )
}
