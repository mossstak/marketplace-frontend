import React from 'react'
import { api } from '@/api/api'
import { type RoasterDetails } from '@/types/roaster'
import Link from 'next/link'

const getRoasters = async () => {
  try {
    const res = await api.get<RoasterDetails[]>('/RoasterProfile/all')
    console.log(res)
    return { roasters: res.data, error: '' }
  } catch (error) {
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
    <div className="container mx-auto p-25">
      <h1 className="text-3xl font-bold text-center">Roaster</h1>
      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      {!error && roasters.length === 0 && (
        <p className="mt-4 text-center">No Roasters Yet.</p>
      )}
      <div className="lg:grid lg:grid-cols-3 gap-6 space-y-3">
        {roasters.map((roaster) => {
          const roasterId = roaster.userId
          const name = roaster.companyName
          return (
            <div
              className="w-full max-w-sm rounded border border-gray-300 p-2 space-y-10"
              key={roasterId ?? name}
            >
              <h2 className="font-bold text-center">{name}</h2>
              <Link
                href={`/roaster/${roasterId}__${slugify(name ?? 'Unknown-Roaster')}`}
                className=""
              >
                <p className="text-center">View details</p>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
