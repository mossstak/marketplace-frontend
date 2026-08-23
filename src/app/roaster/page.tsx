import React from 'react'
import { api } from '@/api/api'
import { type RoasterDetails } from '@/types/roaster'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const getRoasters = async () => {
  try {
    const res = await api.get<RoasterDetails[]>('/RoasterProfile/all')
    return { roasters: res.data ?? [], error: '' }
  } catch {
    return {
      roasters: [],
      error: 'Failed to load roasters',
    }
  }
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default async function Page() {
  const { roasters, error } = await getRoasters()
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h1 className="text-3xl font-bold text-center">Roasters</h1>
      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      {!error && roasters.length === 0 && (
        <p className="mt-4 text-center text-stone-500">No Roasters Yet.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center mt-8">
        {roasters.map((roaster) => {
          const roasterId = roaster.userId
          const name = roaster.companyName || 'Unnamed Roaster'
          return (
            <div
              className="w-full max-w-sm rounded-xl border border-gray-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 p-6 flex flex-col justify-between shadow-sm transition hover:shadow-md"
              key={roasterId ?? name}
            >
              <div>
                <h2 className="font-bold text-lg text-center text-zinc-900 dark:text-zinc-100">{name}</h2>
                {(roaster.city || roaster.country) && (
                  <p className="text-xs text-center text-stone-500 dark:text-stone-400 mt-1">
                    {[roaster.city, roaster.country].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
              <div className="mt-6 text-center">
                <Link
                  href={`/roaster/${roasterId}__${slugify(name)}`}
                  className="inline-block text-sm font-medium text-blue-600 dark:text-amber-300 underline hover:no-underline"
                >
                  View details
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
