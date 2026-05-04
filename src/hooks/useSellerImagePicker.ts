'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { api } from '@/api/api'
import { type ExistingSellerImage, type PrimaryImageChoice } from '@/types/images'

type ApiErrorBody = { message?: string }

export function useSellerImagePicker() {
  const [uploadedImages, setUploadedImages] = useState<ExistingSellerImage[]>([])
  const [selectedUploadedImageIds, setSelectedUploadedImageIds] = useState<number[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [loadingUploaded, setLoadingUploaded] = useState(true)
  const [uploadedLoadError, setUploadedLoadError] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState('')
  const [primaryImageChoice, setPrimaryImageChoice] = useState<PrimaryImageChoice>('')

  useEffect(() => {
    const loadUploadedImages = async () => {
      try {
        setLoadingUploaded(true)
        setUploadedLoadError('')
        const res = await api.get<ExistingSellerImage[]>('/seller/images')
        setUploadedImages(res.data ?? [])
      } catch (e: unknown) {
        const msg = axios.isAxiosError<ApiErrorBody>(e)
          ? (e.response?.data?.message ?? e.message)
          : e instanceof Error
            ? e.message
            : 'Failed to load uploaded images.'
        setUploadedLoadError(msg)
      } finally {
        setLoadingUploaded(false)
      }
    }

    loadUploadedImages()
  }, [])

  const setNewImageFiles = (files: File[]) => {
    setImageFiles(files)

    if (files.length === 0 && primaryImageChoice.startsWith('new:')) {
      setPrimaryImageChoice(selectedUploadedImageIds.length > 0 ? `existing:${selectedUploadedImageIds[0]}` : '')
      return
    }

    if (!primaryImageChoice && files.length > 0) {
      setPrimaryImageChoice('new:0')
    }
  }

  const toggleUploadedImageSelection = (imageId: number) => {
    setSelectedUploadedImageIds((prev) => {
      const wasSelected = prev.includes(imageId)

      if (wasSelected && primaryImageChoice === `existing:${imageId}`) {
        setPrimaryImageChoice('')
      }

      if (!wasSelected && !primaryImageChoice) {
        setPrimaryImageChoice(`existing:${imageId}`)
      }

      return wasSelected ? prev.filter((id) => id !== imageId) : [...prev, imageId]
    })
  }

  const uploadSellerImage = async (file: File) => {
    setImageUploading(true)
    setImageError('')

    try {
      const signRes = await api.post('/seller/images/sign')
      const { signature, timestamp, apiKey, cloudName, folder, publicId } = signRes.data ?? {}

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

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })

      const cloudData = await cloudRes.json().catch(() => null)

      if (!cloudRes.ok) {
        const msg = cloudData?.error?.message || cloudData?.error || `Cloudinary upload failed (${cloudRes.status})`
        throw new Error(msg)
      }

      const imageUrl = cloudData?.secure_url
      const uploadedPublicId = cloudData?.public_id

      if (!imageUrl || !uploadedPublicId) {
        throw new Error('Upload response missing image data.')
      }

      const saved = await api.post('/seller/images', {
        imageUrl,
        publicId: uploadedPublicId,
      })

      return Number(saved.data?.id ?? saved.data?.Id ?? 0)
    } catch (err: unknown) {
      setImageError(err instanceof Error ? err.message : 'Image upload failed.')
      return 0
    } finally {
      setImageUploading(false)
    }
  }

  const uploadSellerImages = async (files: File[]) => {
    if (files.length === 0) return []

    const ids: number[] = []
    for (let index = 0; index < files.length; index += 1) {
      const id = await uploadSellerImage(files[index])
      if (id) ids.push(id)
    }

    return ids
  }

  const prepareSubmissionImages = async () => {
    let imageIds: number[] = [...selectedUploadedImageIds]
    let newImageIds: number[] = []

    if (imageFiles.length > 0) {
      newImageIds = await uploadSellerImages(imageFiles)
      if (newImageIds.length === 0 && imageIds.length === 0) {
        throw new Error('Image upload failed.')
      }
    }

    imageIds = [...new Set([...imageIds, ...newImageIds])]

    let primaryImageId: number | null = null

    if (primaryImageChoice.startsWith('existing:')) {
      const existingId = Number(primaryImageChoice.replace('existing:', ''))
      if (Number.isFinite(existingId) && imageIds.includes(existingId)) {
        primaryImageId = existingId
      }
    } else if (primaryImageChoice.startsWith('new:')) {
      const newImageIndex = Number(primaryImageChoice.replace('new:', ''))
      if (Number.isFinite(newImageIndex) && newImageIds[newImageIndex]) {
        primaryImageId = newImageIds[newImageIndex]
      }
    }

    if (!primaryImageId && imageIds.length > 0) {
      primaryImageId = imageIds[0]
    }

    return { imageIds, primaryImageId }
  }

  const resetImagePicker = () => {
    setImageFiles([])
    setSelectedUploadedImageIds([])
    setPrimaryImageChoice('')
    setImageError('')
  }

  return {
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
  }
}
