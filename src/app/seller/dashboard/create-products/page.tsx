'use client'

import { useState } from 'react'
import { api } from '@/api/api'
import axios from 'axios'

type CreateVariantForm = {
  size: string
  price: string
  quantity: string
}

type ApiErrorBody = { message?: string }

export default function AddProductForm() {
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
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    setImageFiles([])
    setPrimaryImageIndex(0)
    setImageError('')
  }

  const uploadSellerImage = async (file: File) => {
    setImageUploading(true)
    setImageError('')

    try {
      const signRes = await api.post('/seller/images/sign')
      const { signature, timestamp, apiKey, cloudName, folder, publicId } =
        signRes.data ?? {}

      if (!signature || !timestamp || !apiKey || !cloudName || !folder) {
        throw new Error('Missing upload signature data.')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', String(timestamp))
      formData.append('signature', signature)
      formData.append('folder', folder)
      if (publicId) formData.append('public_id', publicId)

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData },
      )

      if (!cloudRes.ok) {
        throw new Error('Image upload failed.')
      }

      const cloudData = await cloudRes.json()
      const imageUrl = cloudData?.secure_url
      const uploadedPublicId = cloudData?.public_id

      if (!imageUrl || !uploadedPublicId) {
        throw new Error('Upload response missing image data.')
      }

      const saved = await api.post('/seller/images', {
        imageUrl,
        publicId: uploadedPublicId,
      })
      return saved.data?.id ?? saved.data?.Id ?? null
    } catch (err: unknown) {
      setImageError(err instanceof Error ? err.message : 'Image upload failed.')
      return null
    } finally {
      setImageUploading(false)
    }
  }

  const uploadSellerImages = async (files: File[]) => {
    if (files.length === 0) return []
    const ids: number[] = []
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index]
      const id = await uploadSellerImage(file)
      if (id) ids.push(Number(id))
    }
    return ids
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
    if (imageFiles.length > 0) {
      imageIds = await uploadSellerImages(imageFiles)
      if (imageIds.length === 0) {
        setError('Image upload failed.')
        return
      }
    }

    const primaryImageId =
      imageIds.length > 0 ? imageIds[primaryImageIndex] : null

    const payload = {
      Product_Name: form.productName.trim(),
      Product_Description: form.productDescription.trim(),
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
      const res = await api.post('/Product/addproduct', payload)
      const createdId =
        res?.data?.Id ?? res?.data?.id ?? res?.data?.productId ?? null
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
    <div className="border p-4 rounded bg-white/10">
      <h1 className="font-semibold mb-2">Add Products</h1>
      <p className="mb-4">Add a product to your shopfront.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Product Name</span>
            <input
              className="rounded bg-white/10 p-2"
              value={form.productName}
              onChange={(e) =>
                setForm((f) => ({ ...f, productName: e.target.value }))
              }
              placeholder="Ethiopia Yirgacheffe"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Category</span>
            <input
              className="rounded bg-white/10 p-2"
              list="category-options"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
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

        <label className="flex flex-col gap-1">
          <span className="text-sm">Product Description</span>
          <textarea
            className="rounded bg-white/10 p-2"
            rows={3}
            value={form.productDescription}
            onChange={(e) =>
              setForm((f) => ({ ...f, productDescription: e.target.value }))
            }
            placeholder="Tasting notes, origin, and roast profile..."
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Roast Level</span>
            <input
              className="rounded bg-white/10 p-2"
              value={form.roastLevel}
              onChange={(e) =>
                setForm((f) => ({ ...f, roastLevel: e.target.value }))
              }
              placeholder="Light"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Coffee Process</span>
            <input
              className="rounded bg-white/10 p-2"
              value={form.coffeeProcess}
              onChange={(e) =>
                setForm((f) => ({ ...f, coffeeProcess: e.target.value }))
              }
              placeholder="Washed"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Origin</span>
            <input
              className="rounded bg-white/10 p-2"
              value={form.origin}
              onChange={(e) =>
                setForm((f) => ({ ...f, origin: e.target.value }))
              }
              placeholder="Ethiopia"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Region</span>
            <input
              className="rounded bg-white/10 p-2"
              value={form.region}
              onChange={(e) =>
                setForm((f) => ({ ...f, region: e.target.value }))
              }
              placeholder="Sidamo"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Producer</span>
            <input
              className="rounded bg-white/10 p-2"
              value={form.producer}
              onChange={(e) =>
                setForm((f) => ({ ...f, producer: e.target.value }))
              }
              placeholder="Bekele Estate"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Varietal</span>
            <input
              className="rounded bg-white/10 p-2"
              value={form.varietal}
              onChange={(e) =>
                setForm((f) => ({ ...f, varietal: e.target.value }))
              }
              placeholder="Heirloom"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Altitude (MASL)</span>
            <input
              className="rounded bg-white/10 p-2"
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

        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Tasting Notes</span>
            <input
              className="rounded bg-white/10 p-2"
              value={form.tastingNotes}
              onChange={(e) =>
                setForm((f) => ({ ...f, tastingNotes: e.target.value }))
              }
              placeholder="Citrus, floral, honey"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Roast Date</span>
            <input
              className="rounded bg-white/10 p-2"
              type="date"
              value={form.roastDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, roastDate: e.target.value }))
              }
              required
            />
          </label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Variants</h4>
            <button
              type="button"
              className="rounded bg-white/20 px-3 py-1 text-sm"
              onClick={addVariant}
              disabled={variants.length >= 6}
            >
              Add Variant
            </button>
          </div>

          {variants.map((variant, index) => (
            <div key={index} className="grid gap-2 md:grid-cols-4">
              <input
                className="rounded bg-white/10 p-2"
                placeholder="Size (250g)"
                value={variant.size}
                onChange={(e) => updateVariant(index, 'size', e.target.value)}
              />
              <input
                className="rounded bg-white/10 p-2"
                type="number"
                step="0.01"
                placeholder="Price"
                value={variant.price}
                onChange={(e) => updateVariant(index, 'price', e.target.value)}
              />
              <input
                className="rounded bg-white/10 p-2"
                type="number"
                placeholder="Quantity"
                value={variant.quantity}
                onChange={(e) =>
                  updateVariant(index, 'quantity', e.target.value)
                }
              />
              <button
                type="button"
                className="rounded bg-red-500/60 px-3 py-2 text-sm"
                onClick={() => removeVariant(index)}
                disabled={variants.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Product Images</h4>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center rounded bg-white/20 px-3 py-2 text-sm">
              Browse images
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? [])
                  setImageFiles(files)
                  setPrimaryImageIndex(0)
                }}
              />
            </label>
            <span className="text-xs text-white/70">
              {imageFiles.length > 0
                ? `${imageFiles.length} file${imageFiles.length > 1 ? 's' : ''} selected`
                : 'No files selected'}
            </span>
          </div>
          {imageFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-white/70">
                Select a primary image:
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {imageFiles.map((file, index) => (
                  <label
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 rounded bg-white/5 p-2 text-xs"
                  >
                    <input
                      type="radio"
                      name="primary-image"
                      checked={primaryImageIndex === index}
                      onChange={() => setPrimaryImageIndex(index)}
                    />
                    <span className="truncate">{file.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {imageError && <div className="text-sm text-red-300">{imageError}</div>}
        </div>

        {error && <div className="text-sm text-red-300">{error}</div>}
        {success && <div className="text-sm text-green-300">{success}</div>}

        <button
          type="submit"
          className="rounded bg-white/30 px-4 py-2"
          disabled={saving || imageUploading}
        >
          {saving || imageUploading ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </div>
  )
}
