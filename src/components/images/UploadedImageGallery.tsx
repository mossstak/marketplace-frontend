'use client'

import Image from 'next/image'
import { type ExistingSellerImage } from '@/types/images'

type UploadedImageGalleryProps = {
  uploadedImages: ExistingSellerImage[]
  selectedImageIds: number[]
  loading: boolean
  error: string
  deletingImageId?: number | null
  onToggle: (imageId: number) => void
  onDelete?: (id: number) => void
}

export function UploadedImageGallery({
  uploadedImages,
  selectedImageIds,
  loading,
  error,
  deletingImageId,
  onToggle,
  onDelete,
}: UploadedImageGalleryProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-foreground text-sm">
        Previously Uploaded Images
      </h4>
      {loading && (
        <p className="text-xs text-muted-foreground">
          Loading previous uploads...
        </p>
      )}
      {error && (
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
      {!loading && !error && uploadedImages.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No previous uploads yet. Upload new files below.
        </p>
      )}
      {!loading && uploadedImages.length > 0 && (
        <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 max-w-2xl w-full">
          {uploadedImages.map((img) => {
            const selected = selectedImageIds.includes(img.id)
            const isDeleting = deletingImageId === img.id
            return (
              /* CHANGED: div instead of label */
              <div
                key={img.id}
                role="button"
                tabIndex={0}
                className={`group flex cursor-pointer flex-col gap-2 rounded-xl border p-2.5 text-xs transition select-none ${
                  selected
                    ? 'border-amber-600 dark:border-amber-400 bg-amber-500/15 text-foreground ring-1 ring-amber-500/40 shadow-xs'
                    : 'border-border bg-card hover:bg-muted/60 text-foreground shadow-2xs'
                } ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}
                onClick={() => onToggle(img.id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    onToggle(img.id)
                  }
                }}
              >
                <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={img.imageUrl}
                    alt={`Uploaded image ${img.id}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 200px, 50vw"
                  />

                  {onDelete && (
                    <button
                      type="button"
                      aria-label="Delete image"
                      /* Added pointer-events-none when invisible so clicks on the image corner don't hit it */
                      className="absolute top-1 right-1 z-10 p-1.5 rounded-md bg-black/70 hover:bg-red-600 text-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition focus:opacity-100 focus:pointer-events-auto cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation() // Prevents triggering card onToggle
                        onDelete(img.id)
                      }}
                      disabled={isDeleting}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={selected}
                    readOnly
                    tabIndex={-1}
                    className="rounded border-input text-amber-600 focus:ring-amber-500 accent-amber-600 pointer-events-none"
                  />
                  <span>Use this image</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}