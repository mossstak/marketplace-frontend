'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/api/api'

interface VariantFormItem {
  id?: number
  size: string
  price: string | number
  quantity: string | number
}

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const resolvedParams = use(params)
  const productId = resolvedParams.id
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [category, setCategory] = useState<number>(1)
  const [tastingNotes, setTastingNotes] = useState('')
  const [roastDate, setRoastDate] = useState('')
  const [variants, setVariants] = useState<VariantFormItem[]>([])

  const [attributeIds, setAttributeIds] = useState({
    roastLevelId: 1,
    coffeeProcessId: 1,
    originId: 1,
    regionId: 1,
    producerId: 1,
    varietalId: 1,
    altitudeId: 1,
  })

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get(`/Product/${productId}`)
        const data = res.data

        setProductName(data.productName ?? '')
        setProductDescription(data.productDescription ?? '')
        setTastingNotes(data.tastingNotes ?? '')

        if (data.roastDate) {
          setRoastDate(new Date(data.roastDate).toISOString().split('T')[0])
        }

        setVariants(
          (data.variants ?? []).map((v: any) => ({
            id: v.id,
            size: v.size ?? '',
            price: v.price ?? 0,
            quantity: v.quantity ?? 0,
          })),
        )

        if (data.roastLevelId) {
          setAttributeIds({
            roastLevelId: data.roastLevelId,
            coffeeProcessId: data.coffeeProcessId,
            originId: data.originId,
            regionId: data.regionId,
            producerId: data.producerId,
            varietalId: data.varietalId,
            altitudeId: data.altitudeId,
          })
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message || 'Failed to fetch product details.',
        )
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [productId])

  const updateVariantField = (
    index: number,
    field: keyof VariantFormItem,
    value: string,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    )
  }

  const addVariant = () => {
    if (variants.length >= 6) return
    setVariants((prev) => [...prev, { size: '', price: '', quantity: '' }])
  }

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const payload = {
      productName: productName.trim(),
      productDescription: productDescription.trim(),
      category: category,
      roastLevelId: attributeIds.roastLevelId,
      coffeeProcessId: attributeIds.coffeeProcessId,
      originId: attributeIds.originId,
      regionId: attributeIds.regionId,
      producerId: attributeIds.producerId,
      varietalId: attributeIds.varietalId,
      altitudeId: attributeIds.altitudeId,
      tastingNotes: tastingNotes.trim(),
      roastDate: roastDate
        ? new Date(roastDate).toISOString()
        : new Date().toISOString(),
      variants: variants.map((v) => ({
        id: v.id,
        size: v.size.trim(),
        price: Number(v.price),
        quantity: Number(v.quantity),
      })),
    }

    try {
      await api.put(`/Product/updateproduct/${productId}`, payload)
      setSuccess('Product and variants successfully updated!')
      setTimeout(() => {
        router.push('/seller/dashboard/view-products')
      }, 1000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update product.')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return <div className="p-6 text-gray-200">Loading product...</div>

  return (
    <div className="max-w-4xl w-full mx-auto bg-gray-800/80 border border-gray-700/80 p-6 rounded-2xl shadow-lg space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Product</h1>
          <p className="text-xs text-gray-400">
            Update product specifications and inventory variants.
          </p>
        </div>
        <Link
          href="/seller/dashboard/view-products"
          className="text-sm text-gray-400 hover:text-white underline"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-lg text-emerald-300 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Product Name *
          </label>
          <input
            className="w-full rounded-lg bg-gray-900 border border-gray-700 p-2.5 text-white text-sm focus:ring-2 focus:ring-amber-400 outline-none"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Description
          </label>
          <textarea
            className="w-full rounded-lg bg-gray-900 border border-gray-700 p-2.5 text-white text-sm focus:ring-2 focus:ring-amber-400 outline-none"
            rows={3}
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Tasting Notes
            </label>
            <input
              className="w-full rounded-lg bg-gray-900 border border-gray-700 p-2.5 text-white text-sm focus:ring-2 focus:ring-amber-400 outline-none"
              value={tastingNotes}
              onChange={(e) => setTastingNotes(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Roast Date
            </label>
            <input
              type="date"
              className="w-full rounded-lg bg-gray-900 border border-gray-700 p-2.5 text-white text-sm focus:ring-2 focus:ring-amber-400 outline-none"
              value={roastDate}
              onChange={(e) => setRoastDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Product Variants
            </h2>
            <button
              type="button"
              onClick={addVariant}
              disabled={variants.length >= 6}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg text-white font-medium disabled:opacity-50 cursor-pointer"
            >
              + Add Variant
            </button>
          </div>

          <div className="space-y-2">
            {variants.map((v, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-center bg-gray-900/60 p-3 rounded-lg border border-gray-700"
              >
                <div className="col-span-4">
                  <label className="text-[10px] text-gray-400 uppercase">
                    Size
                  </label>
                  <input
                    className="w-full rounded bg-gray-800 border border-gray-700 p-2 text-sm text-white focus:outline-none"
                    placeholder="250g"
                    value={v.size}
                    onChange={(e) =>
                      updateVariantField(index, 'size', e.target.value)
                    }
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-[10px] text-gray-400 uppercase">
                    Price (£)
                  </label>
                  <input
                    className="w-full rounded bg-gray-800 border border-gray-700 p-2 text-sm text-white focus:outline-none"
                    type="number"
                    step="0.01"
                    placeholder="9.50"
                    value={v.price}
                    onChange={(e) =>
                      updateVariantField(index, 'price', e.target.value)
                    }
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-[10px] text-gray-400 uppercase">
                    Quantity
                  </label>
                  <input
                    className="w-full rounded bg-gray-800 border border-gray-700 p-2 text-sm text-white focus:outline-none"
                    type="number"
                    placeholder="50"
                    value={v.quantity}
                    onChange={(e) =>
                      updateVariantField(index, 'quantity', e.target.value)
                    }
                    required
                  />
                </div>
                <div className="col-span-2 flex items-end justify-center pt-4">
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    disabled={variants.length === 1}
                    className="text-xs text-red-400 hover:text-red-300 disabled:opacity-30 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-6 py-2.5 bg-amber-400 text-zinc-950 font-bold rounded-lg hover:bg-amber-300 transition disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving Changes...' : 'Save Product'}
        </button>
      </form>
    </div>
  )
}
