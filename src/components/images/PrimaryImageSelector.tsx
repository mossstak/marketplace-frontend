import { type ExistingSellerImage, type PrimaryImageChoice } from '@/types/images'

type PrimaryImageSelectorProps = {
  uploadedImages: ExistingSellerImage[]
  selectedUploadedImageIds: number[]
  imageFiles: File[]
  primaryImageChoice: PrimaryImageChoice
  onChange: (choice: PrimaryImageChoice) => void
}

export function PrimaryImageSelector({
  uploadedImages,
  selectedUploadedImageIds,
  imageFiles,
  primaryImageChoice,
  onChange,
}: PrimaryImageSelectorProps) {
  if (selectedUploadedImageIds.length === 0 && imageFiles.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h4 className="font-semibold">Primary Image</h4>
      <p className="text-xs text-white/70">Choose which selected image should be shown first.</p>
      <div className="grid gap-2 md:grid-cols-2">
        {uploadedImages
          .filter((img) => selectedUploadedImageIds.includes(img.id))
          .map((img) => (
            <label
              key={`existing:${img.id}`}
              className="flex items-center gap-2 rounded bg-white/5 p-2 text-xs"
            >
              <input
                type="radio"
                name="primary-image"
                checked={primaryImageChoice === `existing:${img.id}`}
                onChange={() => onChange(`existing:${img.id}`)}
              />
              <span className="truncate">Saved image #{img.id}</span>
            </label>
          ))}

        {imageFiles.map((file, index) => (
          <label
            key={`new:${file.name}-${index}`}
            className="flex items-center gap-2 rounded bg-white/5 p-2 text-xs"
          >
            <input
              type="radio"
              name="primary-image"
              checked={primaryImageChoice === `new:${index}`}
              onChange={() => onChange(`new:${index}`)}
            />
            <span className="truncate">New: {file.name}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
