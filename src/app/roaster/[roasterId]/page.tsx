import Link from 'next/link'
import { api } from '@/api/api'
import type { RoasterDetails } from '@/types/roaster'
import { Globe, Instagram, MapPin, ArrowLeft, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function getRoaster(roasterIdParam: string): Promise<RoasterDetails | null> {
  const decoded = decodeURIComponent(roasterIdParam)
  const candidate = decoded.split('__')[0]

  // 1. Direct fetch by candidate (userId or ID)
  try {
    const res = await api.get<RoasterDetails>(`/RoasterProfile/${candidate}`)
    if (res.data) return res.data
  } catch {
    // Continue to fallback
  }

  // 2. Fallback: Search in all roaster profiles (by userId, id, slug, or companyName)
  try {
    const resAll = await api.get<RoasterDetails[]>('/RoasterProfile/all')
    const all = resAll.data ?? []
    const match = all.find(
      (r) =>
        r.userId === candidate ||
        String(r.id) === candidate ||
        slugify(r.companyName ?? '') === slugify(decoded) ||
        (r.companyName ?? '').toLowerCase() === decoded.toLowerCase(),
    )
    if (match) return match
  } catch {
    // Network or server error
  }

  return null
}

export default async function Page({
  params,
}: {
  params: Promise<{ roasterId: string }>
}) {
  const { roasterId } = await params
  const roaster = await getRoaster(roasterId)

  if (!roaster) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Roaster Not Found</h1>
        <p className="mt-2 text-sm text-gray-500">
          We couldn&apos;t find the roaster profile you were looking for.
        </p>
        <Link
          href="/roaster"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Roasters
        </Link>
      </div>
    )
  }

  const location = [roaster.city, roaster.country].filter(Boolean).join(', ')

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/roaster"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all roasters
      </Link>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                {roaster.companyName ?? 'Unnamed Roaster'}
              </h1>
              {roaster.isVerified && (
                <span title="Verified Roaster" className="text-blue-500">
                  <CheckCircle2 className="h-5 w-5 fill-blue-500 text-white" />
                </span>
              )}
            </div>

            {location && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                <MapPin className="h-4 w-4" />
                {location}
              </p>
            )}
          </div>
        </div>

        {roaster.bio && (
          <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider dark:text-zinc-300">
              About
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {roaster.bio}
            </p>
          </div>
        )}

        {(roaster.websiteUrl || roaster.instagramUrl) && (
          <div className="mt-6 flex flex-wrap gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            {roaster.websiteUrl && (
              <a
                href={
                  roaster.websiteUrl.startsWith('http')
                    ? roaster.websiteUrl
                    : `https://${roaster.websiteUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}

            {roaster.instagramUrl && (
              <a
                href={
                  roaster.instagramUrl.startsWith('http')
                    ? roaster.instagramUrl
                    : `https://${roaster.instagramUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
