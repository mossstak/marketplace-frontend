'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
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

    // simple phase-based “out -> in” animation trigger
    setPhase('out')
    window.setTimeout(() => {
      setPage(nextPage)
      setPhase('in')
      window.setTimeout(() => setPhase('idle'), 180)
    }, 180)
  }

  if (!roasters.length) {
    return (
      <div className="rounded-xl border p-6 text-sm opacity-80">
        No roasters found.
      </div>
    )
  }

  return (
    <div>
      <div
        className={[
          'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
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
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-200 hover:border-zinc-400 hover:shadow-xl hover:shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
            >
              {/* Ambient background glow on hover */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl transition-all duration-300 group-hover:scale-150 group-hover:bg-amber-500/20" />

              <div className="relative flex items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-zinc-900 text-lg font-bold text-white shadow-sm ring-4 ring-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-800">
                  {(r.companyName?.[0] ?? 'R').toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {r.companyName ?? 'Unnamed Roaster'}
                    </h3>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                    Single Origin &bull; Micro-lot
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => go(Math.max(0, page - 1))}
          disabled={page === 0}
          className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
        >
          Prev
        </button>

        <div className="text-sm opacity-70">
          Page {page + 1} of {totalPages}
        </div>

        <button
          onClick={() => go(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
