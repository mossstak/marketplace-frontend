import Hero from '@/components/Hero'
import RoasterCarousel from '@/components/RoasterCarousel'
import { api } from '@/api/api'
import type { RoasterDetails } from '@/types/roaster'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let roasters: RoasterDetails[] = []

  try {
    const res = await api.get<RoasterDetails[]>('/RoasterProfile/all')
    roasters = res.data ?? []
  } catch {
    return <div className="p-6 text-center">Failed to load roasters.</div>
  }
  return (
    <div className="min-h-screen font-sans bg-background/25 dark:bg-background text-foreground/50 dark:text-stone-100 antialiased transition-colors duration-200">
      {/* Hero Section */}
      <section className="w-full">
        <Hero />
      </section>

      {/* Featured Roasters Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Featured Roasters
              </h2>
              <p className="text-sm opacity-80 mt-1">
                Explore handcrafted beans from independent partners
              </p>
            </div>
          </div>

          <div className="w-full">
            <RoasterCarousel roasters={roasters} />
          </div>
        </div>
      </section>
    </div>
  )
}
