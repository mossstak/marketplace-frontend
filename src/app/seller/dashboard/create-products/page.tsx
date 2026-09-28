'use client'

import { useState } from 'react'
import axios from 'axios'
import { api } from '@/api/api'
import { useSellerImagePicker } from '@/hooks/useSellerImagePicker'
import { UploadedImageGallery } from '@/components/images/UploadedImageGallery'
import { NewUploadPicker } from '@/components/images/NewUploadPicker'
import { PrimaryImageSelector } from '@/components/images/PrimaryImageSelector'

type CreateVariantForm = {
  size: string
  price: string
  quantity: string
}

type ApiErrorBody = { message?: string }

export default function Page () {
  const categoryOptions = [
    { label: 'Coffee Beans', key: 'CoffeeBeans', value: 1 },
    { label: 'Grinder', key: 'Grinder', value: 2 },
    { label: 'Espresso Machine', key: 'EspressoMachine', value: 3 },
    { label: 'Barista Tools', key: 'BaristaTools', value: 4 },
    { label: 'Misc', key: 'Misc', value: 5 },
  ]

  const [form, setForm] = useState({
    productName: '',
    productDescription: '',
    category: '',
    roastLevel: '',
    coffeeProcess: '',
    origin: '',
    region: '',
    producer: '',
    varietal: '',
    altitudeValue: '',
    tastingNotes: '',
    roastDate: '',
  })

  const [variants, setVariants] = useState<CreateVariantForm[]>([
    { size: '', price: '', quantity: '' },
  ])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  const normalizeCategory = (value: string) =>
    value.toLowerCase().replace(/[^a-z]/g, '')

  const resolveCategory = (value: string) => {
    const normalized = normalizeCategory(value)
    const match = categoryOptions.find(
      (c) =>
        normalizeCategory(c.label) === normalized ||
        normalizeCategory(c.key) === normalized,
    )
    return match?.value ?? null
  }

  const updateVariant = (
    index: number,
    key: keyof CreateVariantForm,
    value: string,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [key]: value } : v)),
    )
  }

  const addVariant = () => {
    if (variants.length >= 6) return
    setVariants((prev) => [...prev, { size: '', price: '', quantity: '' }])
  }

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setForm({
      productName: '',
      productDescription: '',
      category: '',
      roastLevel: '',
      coffeeProcess: '',
      origin: '',
      region: '',
      producer: '',
      varietal: '',
      altitudeValue: '',
      tastingNotes: '',
      roastDate: '',
    })
    setVariants([{ size: '', price: '', quantity: '' }])
    resetImagePicker()
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const resolvedCategory = resolveCategory(form.category)
    const altitudeValue = Number(form.altitudeValue)

    if (!form.productName.trim()) {
      setError('Product name is required.')
      return
    }

    if (!resolvedCategory) {
      setError(
        'Category must match: CoffeeBeans, Grinder, EspressoMachine, BaristaTools, Misc.',
      )
      return
    }

    if (
      !form.roastLevel.trim() ||
      !form.coffeeProcess.trim() ||
      !form.origin.trim() ||
      !form.region.trim()
    ) {
      setError('Roast level, coffee process, and region are required.')
      return
    }

    if (!form.producer.trim() || !form.varietal.trim()) {
      setError('Producer and varietal are required.')
      return
    }

    if (!form.roastDate) {
      setError('Roast date is required.')
      return
    }

    if (!Number.isFinite(altitudeValue) || altitudeValue <= 0) {
      setError('Altitude must be a positive number.')
      return
    }

    if (variants.length === 0) {
      setError('At least one variant is required.')
      return
    }

    const mappedVariants = variants.map((v) => ({
      Size: v.size.trim(),
      Price: Number(v.price),
      Quantity: Number(v.quantity),
    }))

    if (mappedVariants.some((v) => !v.Size)) {
      setError('Each variant needs a size.')
      return
    }

    if (mappedVariants.some((v) => !Number.isFinite(v.Price) || v.Price < 0)) {
      setError('Each variant needs a valid price.')
      return
    }

    if (
      mappedVariants.some((v) => !Number.isFinite(v.Quantity) || v.Quantity < 0)
    ) {
      setError('Each variant needs a valid quantity.')
      return
    }

    const roastDateUtc = new Date(`${form.roastDate}T00:00:00Z`).toISOString()

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
      return
    }

    const payload = {
      ProductName: form.productName.trim(),
      ProductDescription: form.productDescription.trim(),
      Category: resolvedCategory,
      RoastLevelName: form.roastLevel.trim(),
      CoffeeProcessName: form.coffeeProcess.trim(),
      OriginName: form.origin.trim(),
      RegionName: form.region.trim(),
      ProducerName: form.producer.trim(),
      VarietalName: form.varietal.trim(),
      AltitudeValue: altitudeValue,
      TastingNotes: form.tastingNotes.trim(),
      RoastDate: roastDateUtc,
      Variants: mappedVariants,
      ImageIds: imageIds,
      PrimaryImageId: primaryImageId,
    }

    try {
      setSaving(true)
      await api.post('/Product/addproduct', payload)
      setSuccess('Product created.')
      resetForm()
    } catch (e: unknown) {
      const msg = axios.isAxiosError<ApiErrorBody>(e)
        ? (e.response?.data?.message ?? e.message)
        : e instanceof Error
          ? e.message
          : 'Failed to create product.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border border-border p-4 sm:p-6 rounded-2xl bg-card text-card-foreground shadow-xs max-w-4xl space-y-6">
      <div>
        <h1 className="font-bold text-xl sm:text-2xl text-foreground mb-1">Add Products</h1>
        <p className="text-sm text-muted-foreground">Add a product to your shopfront.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground">Product Name</span>
            <input
              className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              value={form.productName}
              onChange={(e) =>
                setForm((f) => ({ ...f, productName: e.target.value }))
              }
              placeholder="Ethiopia Yirgacheffe"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground">Category</span>
            <input
              className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              list="category-options"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="CoffeeBeans"
              required
            />
            <datalist id="category-options">
              {categoryOptions.map((c) => (
                <option key={c.value} value={c.key}>
                  {c.label}
                </option>
              ))}
            </datalist>
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-foreground">Product Description</span>
          <textarea
            className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            rows={3}
            value={form.productDescription}
            onChange={(e) =>
              setForm((f) => ({ ...f, productDescription: e.target.value }))
            }
            placeholder="Tasting notes, origin, and roast profile..."
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground">Roast Level</span>
            <input
              className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              value={form.roastLevel}
              onChange={(e) => setForm((f) => ({ ...f, roastLevel: e.target.value }))}
              placeholder="Light"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground">Coffee Process</span>
            <input
              className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              value={form.coffeeProcess}
              onChange={(e) =>
                setForm((f) => ({ ...f, coffeeProcess: e.target.value }))
              }
              placeholder="Washed"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground">Origin</span>
            <input
              className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              value={form.origin}
              onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
              placeholder="Ethiopia"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground">Region</span>
            <input
              className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              placeholder="Sidamo"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground">Producer</span>
            <input
              className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              value={form.producer}
              onChange={(e) => setForm((f) => ({ ...f, producer: e.target.value }))}
              placeholder="Bekele Estate"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground">Varietal</span>
            <input
              className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              value={form.varietal}
              onChange={(e) => setForm((f) => ({ ...f, varietal: e.target.value }))}
              placeholder="Heirloom"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground">Altitude (MASL)</span>
            <input
              className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              type="number"
              value={form.altitudeValue}
              onChange={(e) =>
                setForm((f) => ({ ...f, altitudeValue: e.target.value }))
              }
              placeholder="2000"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground">Tasting Notes</span>
            <input
              className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              value={form.tastingNotes}
              onChange={(e) =>
                setForm((f) => ({ ...f, tastingNotes: e.target.value }))
              }
              placeholder="Citrus, floral, honey"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground">Roast Date</span>
            <input
              className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              type="date"
              value={form.roastDate}
              onChange={(e) => setForm((f) => ({ ...f, roastDate: e.target.value }))}
              required
            />
          </label>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-base text-foreground">Variants</h4>
            <button
              type="button"
              className="rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              onClick={addVariant}
              disabled={variants.length >= 6}
            >
              + Add Variant
            </button>
          </div>

          <div className="space-y-2">
            {variants.map((variant, index) => (
              <div key={index} className="grid gap-2 md:grid-cols-4 items-center">
                <input
                  className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                  placeholder="Size (250g)"
                  value={variant.size}
                  onChange={(e) => updateVariant(index, 'size', e.target.value)}
                />
                <input
                  className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={variant.price}
                  onChange={(e) => updateVariant(index, 'price', e.target.value)}
                />
                <input
                  className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                  type="number"
                  placeholder="Quantity"
                  value={variant.quantity}
                  onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                />
                <button
                  type="button"
                  className="rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30 px-3 py-2 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  onClick={() => removeVariant(index)}
                  disabled={variants.length === 1}
                >
                  Remove
                </button>
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

          <hr className="border-border" />
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

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 text-sm shadow-xs transition cursor-pointer disabled:opacity-50"
            disabled={saving || imageUploading}
          >
            {saving || imageUploading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
