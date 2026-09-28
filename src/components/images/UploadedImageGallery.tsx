import Image from 'next/image'
import { type ExistingSellerImage } from '@/types/images'

type UploadedImageGalleryProps = {
  uploadedImages: ExistingSellerImage[]
  selectedImageIds: number[]
  loading: boolean
  error: string
  onToggle: (imageId: number) => void
}

export function UploadedImageGallery({
  uploadedImages,
  selectedImageIds,
  loading,
  error,
  onToggle,
}: UploadedImageGalleryProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-foreground text-sm">Previously Uploaded Images</h4>
      {loading && <p className="text-xs text-muted-foreground">Loading previous uploads...</p>}
      {error && <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>}
      {!loading && !error && uploadedImages.length === 0 && (
        <p className="text-xs text-muted-foreground">No previous uploads yet. Upload new files below.</p>
      )}
      {!loading && uploadedImages.length > 0 && (
        <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 max-w-2xl w-full">
          {uploadedImages.map((img) => {
            const selected = selectedImageIds.includes(img.id)
            return (
              <label
                key={img.id}
                className={`flex cursor-pointer flex-col gap-2 rounded-xl border p-2.5 text-xs transition ${
                  selected
                    ? 'border-amber-600 dark:border-amber-400 bg-amber-500/15 text-foreground ring-1 ring-amber-500/40 shadow-xs'
                    : 'border-border bg-card hover:bg-muted/60 text-foreground shadow-2xs'
                }`}
              >
                <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={img.imageUrl}
                    alt={`Uploaded image ${img.id}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 200px, 50vw"
                  />
                </div>
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggle(img.id)}
                    className="rounded border-input text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  Use this image
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
