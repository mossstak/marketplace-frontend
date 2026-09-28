'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/api/api'
import { useSellerImagePicker } from '@/hooks/useSellerImagePicker'
import { UploadedImageGallery } from '@/components/images/UploadedImageGallery'
import { NewUploadPicker } from '@/components/images/NewUploadPicker'
import { PrimaryImageSelector } from '@/components/images/PrimaryImageSelector'

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

  const {
    uploadedImages,
    selectedUploadedImageIds,
    imageFiles,
    loadingUploaded,
    uploadedLoadError,
    imageUploading,
    imageError,
    primaryImageChoice,
    setPrimaryImageChoice,
    setNewImageFiles,
    toggleUploadedImageSelection,
    prepareSubmissionImages,
    resetImagePicker,
  } = useSellerImagePicker()

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

        if (data.primaryImageId && setPrimaryImageChoice) {
          setPrimaryImageChoice(`existing:${data.primaryImageId}`)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  useEffect(() => {
    return () => {
      resetImagePicker()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

    let imageIds: number[] = []
    let primaryImageId: number | null = null

    try {
      const prepared = await prepareSubmissionImages()
      imageIds = prepared.imageIds
      primaryImageId = prepared.primaryImageId
    } catch (imagePrepareError: unknown) {
      const msg =
        imagePrepareError instanceof Error
          ? imagePrepareError.message
          : 'Image upload failed.'
      setError(msg)
      setSaving(false)
      return
    }

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
      imageIds: imageIds,
      primaryImageId: primaryImageId,
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
    return <div className="p-6 text-muted-foreground">Loading product...</div>

  return (
    <div className="max-w-4xl w-full mx-auto bg-card text-card-foreground border border-border p-4 sm:p-6 rounded-2xl shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Edit Product</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Update product specifications and inventory variants.
          </p>
        </div>
        <Link
          href="/seller/dashboard/view-products"
          className="text-sm text-muted-foreground hover:text-foreground underline transition"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Product Name *
          </label>
          <input
            className="w-full rounded-lg bg-background border border-input p-2.5 text-foreground text-sm focus:ring-2 focus:ring-amber-500 outline-none transition placeholder:text-muted-foreground/60"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Description
          </label>
          <textarea
            className="w-full rounded-lg bg-background border border-input p-2.5 text-foreground text-sm focus:ring-2 focus:ring-amber-500 outline-none transition placeholder:text-muted-foreground/60"
            rows={3}
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Tasting Notes
            </label>
            <input
              className="w-full rounded-lg bg-background border border-input p-2.5 text-foreground text-sm focus:ring-2 focus:ring-amber-500 outline-none transition placeholder:text-muted-foreground/60"
              value={tastingNotes}
              onChange={(e) => setTastingNotes(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Roast Date
            </label>
            <input
              type="date"
              className="w-full rounded-lg bg-background border border-input p-2.5 text-foreground text-sm focus:ring-2 focus:ring-amber-500 outline-none transition placeholder:text-muted-foreground/60"
              value={roastDate}
              onChange={(e) => setRoastDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Product Variants
            </h2>
            <button
              type="button"
              onClick={addVariant}
              disabled={variants.length >= 6}
              className="text-xs bg-muted hover:bg-muted/80 border border-border px-3.5 py-1.5 rounded-lg text-foreground font-semibold disabled:opacity-50 cursor-pointer transition"
            >
              + Add Variant
            </button>
          </div>
          <div className="space-y-2">
            {variants.map((v, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-center bg-muted/30 p-3 rounded-xl border border-border"
              >
                <div className="col-span-4">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Size
                  </label>
                  <input
                    className="w-full rounded-lg bg-background border border-input p-2 text-sm text-foreground focus:ring-2 focus:ring-amber-500 outline-none transition"
                    placeholder="250g"
                    value={v.size}
                    onChange={(e) =>
                      updateVariantField(index, 'size', e.target.value)
                    }
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Price (£)
                  </label>
                  <input
                    className="w-full rounded-lg bg-background border border-input p-2 text-sm text-foreground focus:ring-2 focus:ring-amber-500 outline-none transition"
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
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Quantity
                  </label>
                  <input
                    className="w-full rounded-lg bg-background border border-input p-2 text-sm text-foreground focus:ring-2 focus:ring-amber-500 outline-none transition"
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
                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-30 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5 bg-muted/40 p-4 sm:p-5 rounded-2xl border border-border">
          <UploadedImageGallery
            uploadedImages={uploadedImages}
            selectedImageIds={selectedUploadedImageIds}
            loading={loadingUploaded}
            error={uploadedLoadError}
            onToggle={toggleUploadedImageSelection}
          />
          <hr className="border-border" />
          <NewUploadPicker
            imageFiles={imageFiles}
            imageError={imageError}
            onFilesChange={setNewImageFiles}
          />
          <PrimaryImageSelector
            uploadedImages={uploadedImages}
            selectedUploadedImageIds={selectedUploadedImageIds}
            imageFiles={imageFiles}
            primaryImageChoice={primaryImageChoice}
            onChange={setPrimaryImageChoice}
          />
        </div>

        <button
          type="submit"
          disabled={saving || imageUploading}
          className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 text-sm shadow-xs transition cursor-pointer disabled:opacity-50"
        >
          {saving || imageUploading ? 'Saving Changes...' : 'Save Product'}
        </button>
      </form>
    </div>
  )
}
