'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [, startTransition] = useTransition()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()

    startTransition(() => {
      if (trimmed) {
        router.push(`/shop?q=${encodeURIComponent(trimmed)}`)
      } else {
        router.push('/shop')
      }
    })
  }

  const handleClear = () => {
    setQuery('')
    router.push('/shop')
  }

  return (
    <form
      onSubmit={handleSearch}
      className="relative w-full max-w-xs sm:max-w-sm"
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/50" />

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Origins, Roaster..."
        className="w-full h-10 rounded-full bg-background border border-foreground/15 pl-9 pr-8 py-1.5 text-xs sm:text-sm text-black placeholder-black/50 dark:placeholder-white/75 focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
      />

      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </form>
  )
}
