import Image from 'next/image'
import Hero from '@/components/Hero'
import RoasterCarousel from '@/components/RoasterCarousel'
import {api} from '@/api/api'
import type { RoasterDetails } from "@/types/roaster"

export default async function Page() {
  let roasters: RoasterDetails[] = []

  try {
    const res = await api.get<RoasterDetails[]>('RoasterProfile/all')
    roasters = res.data
  }catch (e) {
    return <div>Failed to load roasters.</div>
  }
  return (
    <div className="font-sans  dark:bg-black">
      <Hero/>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-center">Roasters</h2>
        <RoasterCarousel  roasters={roasters}/>
        
      </div>
    </div>
  )
}
