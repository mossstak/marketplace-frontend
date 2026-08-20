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
    <div className="font-sans  dark:bg-gray-800 h-full dark:text-white">
      <Hero/>
      <div className="h-75 w-4xl flex flex-col m-auto relative top-17">
        <RoasterCarousel  roasters={roasters}/>
      </div>
    </div>
  )
}
