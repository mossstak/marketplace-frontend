'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import axios from 'axios'
import { Camera, Trash2, Loader2, CheckCircle2, AlertCircle, UploadCloud } from 'lucide-react'
import { api } from '@/api/api'

interface ProfileImageUploaderProps {
  currentImageUrl?: string | null
  firstName?: string
  lastName?: string
  onImageUpdated?: (newUrl: string | null) => void
}

export default function ProfileImageUploader({
  currentImageUrl,
  firstName = '',
  lastName = '',
  onImageUpdated,
}: ProfileImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Sync state if prop changes
  React.useEffect(() => {
    setImageUrl(currentImageUrl ?? null)
  }, [currentImageUrl])

  const initials = `${firstName?.[0]?.toUpperCase() || ''}${lastName?.[0]?.toUpperCase() || ''}` || 'U'

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5MB limit. Please choose a smaller photo.')
      return
    }

    // Validate image format
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, WEBP).')
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)

    // Show temporary local preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    try {
      setUploading(true)

      // 1. Get Cloudinary signed credentials from backend
      const signRes = await api.post('/User/profile-image/sign')
      const { signature, timestamp, apiKey, cloudName, folder } = signRes.data ?? {}

      if (!signature || !timestamp || !apiKey || !cloudName || !folder) {
        throw new Error('Failed to retrieve upload signature from server.')
      }

      // 2. Upload directly to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', String(timestamp))
      formData.append('signature', signature)
      formData.append('folder', folder)

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })

      const cloudData = await cloudRes.json().catch(() => null)

      if (!cloudRes.ok) {
        const msg = cloudData?.error?.message || cloudData?.error || 'Cloudinary upload failed.'
        throw new Error(msg)
      }

      const uploadedUrl: string = cloudData.secure_url || cloudData.url

      // 3. Save the new image URL to the user record in database
      await api.post('/User/profile-image', { imageUrl: uploadedUrl })

      setImageUrl(uploadedUrl)
      setPreviewUrl(null)
      setSuccessMessage('Profile photo updated successfully!')
      onImageUpdated?.(uploadedUrl)
    } catch (err: unknown) {
      setPreviewUrl(null)
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message || err.response?.data || 'Failed to save profile picture.')
      } else if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('An unexpected error occurred while uploading.')
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return

    try {
      setDeleting(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      await api.delete('/User/profile-image')

      setImageUrl(null)
      setPreviewUrl(null)
      setSuccessMessage('Profile photo removed.')
      onImageUpdated?.(null)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message || err.response?.data || 'Failed to remove image.')
      } else if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('An unexpected error occurred.')
      }
    } finally {
      setDeleting(false)
    }
  }

  const activeDisplayUrl = previewUrl || imageUrl

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar Display */}
        <div className="relative group shrink-0">
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-md ring-2 ring-amber-500/30 bg-stone-100 dark:bg-zinc-800 flex items-center justify-center">
            {activeDisplayUrl ? (
              <Image
                src={activeDisplayUrl}
                alt={`${firstName}'s avatar`}
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-600 via-amber-700 to-[#441a1a] text-white flex items-center justify-center font-bold text-3xl">
                {initials}
              </div>
            )}

            {/* Uploading Overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                <Loader2 className="h-6 w-6 animate-spin text-amber-400 mb-1" />
                <span className="text-[10px] font-semibold">Uploading...</span>
              </div>
            )}
          </div>

          {/* Quick upload button floating on avatar */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || deleting}
            className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-md border-2 border-white dark:border-zinc-900 transition hover:scale-105 cursor-pointer disabled:opacity-50"
            title="Upload new image"
            aria-label="Upload new image"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        {/* Info & Action Controls */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div>
            <h3 className="text-base font-bold text-foreground">Profile Picture</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Upload a clear photo to personalize your account across the marketplace.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={handleFileSelect}
              className="hidden"
              id="profile-image-input"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || deleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#582424] hover:bg-[#441a1a] dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-zinc-950 text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" />
                  Choose New Photo
                </>
              )}
            </button>

            {imageUrl && (
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={uploading || deleting}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-medium transition cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Remove
              </button>
            )}
          </div>

          <p className="text-[11px] text-stone-400 dark:text-stone-500">
            JPG, PNG, or WEBP up to 5MB. Square aspect ratio recommended.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-700 dark:text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-700 dark:text-red-400 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}
