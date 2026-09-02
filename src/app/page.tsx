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
    <div className="min-h-screen font-sans bg-background text-foreground antialiased transition-colors duration-200">
      {/* Hero Section */}
      <section className="w-full">
        <Hero />
      </section>

      {/* Featured Roasters Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-8">
          <div className="flex items-end justify-between border-b border-border/70 pb-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
                Featured Roasters
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Explore handcrafted micro-lots directly from independent
                roasters
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
