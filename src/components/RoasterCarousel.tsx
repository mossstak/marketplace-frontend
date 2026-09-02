
'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import type { RoasterDetails } from '@/types/roaster'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function RoasterCarousel({
  roasters,
}: {
  roasters: RoasterDetails[]
}) {
  const ITEMS_PER_PAGE = 6
  const [page, setPage] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle')
  const totalPages = Math.max(1, Math.ceil(roasters.length / ITEMS_PER_PAGE))

  const visible = useMemo(() => {
    const start = page * ITEMS_PER_PAGE
    return roasters.slice(start, start + ITEMS_PER_PAGE)
  }, [page, roasters])

  useEffect(() => {
    setPage(0)
  }, [roasters.length])

  function go(nextPage: number) {
    if (nextPage === page) return
    setPhase('out')
    window.setTimeout(() => {
      setPage(nextPage)
      setPhase('in')
      window.setTimeout(() => setPhase('idle'), 180)
    }, 180)
  }

  if (!roasters.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No roasters found.
      </div>
    )
  }

  return (
    <div>
      <div
        className={[
          'grid gap-5 sm:grid-cols-2 lg:grid-cols-3',
          phase === 'out' ? 'opacity-0 translate-y-1' : '',
          phase === 'in' ? 'opacity-100 translate-y-0' : '',
          'transition-all duration-200 ease-in-out',
        ].join(' ')}
      >
        {visible.map((r) => {
          return (
            <Link
              key={r.userId}
              href={`/roaster/${r.userId}__${slugify(r.companyName ?? 'Unknown-Roaster')}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#582424]/40 dark:hover:border-amber-400/40 hover:shadow-md"
            >
              {/* Subtle warm glow on hover */}
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#582424]/5 dark:bg-amber-400/10 blur-2xl transition-all duration-300 group-hover:scale-150" />

              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Brand Monogram Badge */}
                  <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-[#582424] text-lg font-serif font-bold text-[#FAF7F2] shadow-xs ring-2 ring-[#582424]/10 dark:bg-[#2e2320] dark:text-amber-300 dark:ring-border">
                    {(r.companyName?.[0] ?? 'R').toUpperCase()}
                  </div>

                  {/* Roaster Info */}
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold tracking-tight text-foreground group-hover:text-[#582424] dark:group-hover:text-amber-300 transition-colors">
                      {r.companyName ?? 'Unnamed Roaster'}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>Single Origin</span>
                      <span>&bull;</span>
                      <span className="text-[#8b4513] dark:text-amber-400/90 font-medium">Micro-lot</span>
                    </p>
                  </div>
                </div>

                {/* Corner link arrow on hover */}
                <div className="shrink-0 p-1.5 rounded-full text-muted-foreground/40 group-hover:text-[#582424] dark:group-hover:text-amber-300 group-hover:bg-muted/80 transition-all">
                  <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Pagination Controls */}
      <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-4">
        <button
          onClick={() => go(Math.max(0, page - 1))}
          disabled={page === 0}
          className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-muted transition active:scale-95 shadow-xs"
        >
          &larr; Prev
        </button>

        <div className="text-xs font-medium text-muted-foreground">
          Page {page + 1} of {totalPages}
        </div>

        <button
          onClick={() => go(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-muted transition active:scale-95 shadow-xs"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  )
}