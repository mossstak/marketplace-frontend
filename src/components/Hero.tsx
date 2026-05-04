'use client'
import Image from "next/image";
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { api } from '@/api/api'
import type { RoasterDetails } from '@/types/roaster'

const Hero = ({}) => {
  const ITEMS_PER_PAGE = 1

  const [roasters, setRoasters] = useState<RoasterDetails[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [displayPage, setDisplayPage] = useState(1)
  const [dir, setDir] = useState<1 | -1>(1)
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchRoasters = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get<RoasterDetails[]>('RoasterProfile/all')
        setRoasters(res.data)
        console.log(res.data)
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          (typeof e?.response?.data === 'string' ? e.response.data : '') ||
          e?.message ||
          'Failed to load roasters.'

        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    fetchRoasters()
  }, [])

  const totalPages = Math.max(1, Math.ceil(roasters.length / ITEMS_PER_PAGE))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
      setDisplayPage(1)
    }
  }, [totalPages])

  const visibleRoasters = useMemo(() => {
    const startIndex = (displayPage - 1) * ITEMS_PER_PAGE
    return roasters.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [roasters, displayPage])

  const goToPage = (page: number) => {
    if (page === currentPage) return
    if (phase !== 'idle') return
    if (page < 1 || page > totalPages) return

    setDir(page > currentPage ? 1 : -1)
    setCurrentPage(page)

    setPhase('out')

    window.setTimeout(() => {
      setDisplayPage(page)
      setPhase('in')

      window.setTimeout(() => {
        setPhase('idle')
      }, 220)
    }, 220)
  }

  return (
    <section className="bg-[#7c0808] text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find your next favourite coffee.
          </h1>

          <p className="mt-4 max-w-xl text-base/7 opacity-90">
            Browse roasters, discover featured beans, and order from people who
            take coffee a little too seriously (the best kind of people).
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/roaster"
              className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black"
            >
              Explore roasters
            </Link>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white"
            >
              View products
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white/10">
          {/* Replace with your actual hero image */}
          <Image
            src="https://placehold.co/1024"
            alt="Coffee beans and brewing tools"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  )
}

export default Hero
