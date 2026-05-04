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
          'transition-all duration-200',
        ].join(' ')}
      >
        {visible.map((r) => {

          return (
            <Link
              key={r.userId} // ✅ unique key
              href={`/roaster/${r.userId}__${slugify(r.companyName ?? 'Unknown-Roaster')}`}
              className="group rounded-2xl border p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xs font-semibold text-gray-600">
                  {(r.companyName?.[0] ?? 'R').toUpperCase()}
                </div>

                <div>
                  <h3 className="font-semibold leading-tight group-hover:underline">
                    {r.companyName ?? 'Unnamed roaster'}
                  </h3>
                  <p className="text-xs opacity-70">View roaster</p>
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
