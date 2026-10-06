'use client'

import {
  SlidersHorizontal,
  RotateCcw,
  ArrowUpDown,
  Globe,
  Store,
  Flame,
  Sparkles,
  X,
} from 'lucide-react'
import type { RoasterDetails } from '@/types/roaster'

export type SortOption =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc'
  | 'newest'

const PROCESSES = ['Washed', 'Natural', 'Honey', 'Anaerobic'] as const

interface CatalogFiltersProps {
  roasters: RoasterDetails[]
  roasterMap: Map<string, string>
  availableOrigins: string[]
  availableRoastLevels: string[]
  selectedRoaster: string
  setSelectedRoaster: (val: string) => void
  selectedRoastLevel: string
  setSelectedRoastLevel: (val: string) => void
  selectedProcess: string
  setSelectedProcess: (val: string) => void
  selectedOrigin: string
  setSelectedOrigin: (val: string) => void
  minPriceInput: string
  setMinPriceInput: (val: string) => void
  maxPriceInput: string
  setMaxPriceInput: (val: string) => void
  sortBy: SortOption
  setSortBy: (val: SortOption) => void
  showFiltersMobile: boolean
  setShowFiltersMobile: React.Dispatch<React.SetStateAction<boolean>>
  activeFilterCount: number
  resetFilters: () => void
}

export default function CatalogFilters({
  roasters,
  roasterMap,
  availableOrigins,
  availableRoastLevels,
  selectedRoaster,
  setSelectedRoaster,
  selectedRoastLevel,
  setSelectedRoastLevel,
  selectedProcess,
  setSelectedProcess,
  selectedOrigin,
  setSelectedOrigin,
  minPriceInput,
  setMinPriceInput,
  maxPriceInput,
  setMaxPriceInput,
  sortBy,
  setSortBy,
  showFiltersMobile,
  setShowFiltersMobile,
  activeFilterCount,
  resetFilters,
}: CatalogFiltersProps) {
  return (
    <div className="mb-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-4 shadow-xs backdrop-blur-xs">
      {/* Mobile Toggle */}
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
        {/* Roast Level */}
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

        {/* Roaster */}
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

        {/* Coffee Process */}
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

        {/* Origin */}
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

        {/* Price Inputs */}
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

        {/* Sort By */}
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

      {/* Active Filter Pills */}
      {activeFilterCount > 0 && (
        <div className="mt-4 pt-3 border-t border-stone-200 dark:border-zinc-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500 dark:text-stone-400 font-medium">Active Filters:</span>

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
              Price: <strong>{minPriceInput ? `£${minPriceInput}` : '£0'} - {maxPriceInput ? `£${maxPriceInput}` : 'Any'}</strong>
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
  )
}