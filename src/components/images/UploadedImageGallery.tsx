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
      <h4 className="font-semibold">Previously Uploaded Images</h4>
      {loading && <p className="text-xs text-white/70">Loading previous uploads...</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}
      {!loading && !error && uploadedImages.length === 0 && (
        <p className="text-xs text-white/70">No previous uploads yet. Upload new files below.</p>
      )}
      {!loading && uploadedImages.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 md:w-150">
          {uploadedImages.map((img) => {
            const selected = selectedImageIds.includes(img.id)
            return (
              <label
                key={img.id}
                className={`flex cursor-pointer flex-col gap-2 rounded border p-2 text-xs ${
                  selected ? 'border-green-300 bg-green-500/10' : 'border-white/20 bg-white/5'
                }`}
              >
                <img
                  src={img.imageUrl}
                  alt={`Uploaded image ${img.id}`}
                  className="w-50 h-50 rounded object-cover"
                />
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggle(img.id)}
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
