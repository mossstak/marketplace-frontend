import { api } from '@/api/api'
import { notFound } from 'next/navigation'

export default async function Page({
  params,
}: {
  params: Promise<{ roasterId: string }>
}) {
  const { roasterId } = await params
  const userId = roasterId.split('__')[0]
  try {
    const res = await api.get(`RoasterProfile/${userId}`)
    const roaster = res.data
    console.log(res.data)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">
          {roaster.companyName ?? 'Unnamed Roaster'}
        </h1>
        <p className="mt-2 opacity-80">
          {[roaster.city, roaster.country].filter(Boolean).join(', ') || '—'}
        </p>
        <p>{roaster.bio}</p>
      </div>
    )
  } catch {
    notFound()
  }
}
